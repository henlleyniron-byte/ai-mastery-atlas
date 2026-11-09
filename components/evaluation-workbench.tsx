"use client";

import {useCallback, useLayoutEffect, useRef, useState, type FormEvent} from "react";
import {
  criteria, experiments, importEvaluations, learningEvidence, validateEvaluation, verdict,
  EVALUATION_KEY, EVALUATION_SCHEMA, MAX_EVALUATION_BYTES, evaluationReviewers,
  comparisonKey, mergeEvaluations, legacyEvaluationBackup, type Evaluation,
} from "@/lib/evaluation-workbench";

import {openEvaluationLedger,readEvaluationBackup} from '@/lib/protected-specialist';
import { EvaluationPair } from "@/components/evaluation-pair";
import {EvaluationFormDraft} from '@/components/evaluation-form-draft';

const day = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {timeZone:"Asia/Colombo",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
  const get = (type:string) => parts.find(part => part.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
};
function download(name:string, value:unknown, raw = false) {
  if(new URLSearchParams(location.search).get('share')==='1')return;
  const content = raw ? String(value) : JSON.stringify(value, null, 2);
  const url = URL.createObjectURL(new Blob([content], {type:"application/json"}));
  const link = document.createElement("a");
  link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function captureForm(form:HTMLFormElement){return Object.fromEntries([...form.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('[name]')].map(element=>[element.name,(element as HTMLInputElement).type==='checkbox'?(element as HTMLInputElement).checked:element.value]));}

export function EvaluationWorkbench({shared:sharedView=false}:{shared?:boolean}={}) {
  const [runs, setRuns] = useState<Evaluation[]>([]);
  const [scenario, setScenario] = useState("research");
  const [message, setMessage] = useState("Results stay in this browser. Export before changing devices.");
  const [blind, setBlind] = useState(true), [ready, setReady] = useState(false);
  const ledger=useRef<ReturnType<typeof openEvaluationLedger>|null>(null),storageReadable=useRef(false),formDraft=useRef<HTMLFormElement>(null);
  const [urlShared,setUrlShared]=useState(true),[viewEpoch,setViewEpoch]=useState(0);
  const shared=sharedView||urlShared||(typeof location!=='undefined'&&new URLSearchParams(location.search).get('share')==='1');
  const privacy=useRef({active:false,hidden:true,epoch:0,read:0}),retainedForm=useRef<{scope:string;fields:Record<string,string|boolean>}|null>(null);
  const latestRuns = useRef<Evaluation[]>([]);
  const file = useRef<HTMLInputElement>(null), importMode = useRef<"merge"|"restore">("merge");
  const attachImport=useCallback((node:HTMLInputElement|null)=>{file.current=node;if(!node)return;const cancel=()=>{privacy.current.read++;};node.addEventListener('cancel',cancel);return()=>{node.removeEventListener('cancel',cancel);if(file.current===node)file.current=null;};},[]);
  const current = experiments.find(experiment => experiment.id === scenario)!;

  function privateView(){const current=privacy.current;return shared||!current.active||current.hidden||current.epoch!==viewEpoch||new URLSearchParams(location.search).get('share')==='1';}
  const fieldsChanged=useCallback(()=>{privacy.current.read++;},[]);
  const attachForm=useCallback((node:HTMLFormElement|null)=>{const prior=formDraft.current;if(prior){retainedForm.current={scope:scenario,fields:captureForm(prior)};prior.removeEventListener('input',fieldsChanged);prior.removeEventListener('change',fieldsChanged);}formDraft.current=node;if(!node)return;const retained=retainedForm.current;if(retained?.scope===scenario)for(const element of node.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('[name]')){if(!Object.hasOwn(retained.fields,element.name))continue;const value=retained.fields[element.name];if((element as HTMLInputElement).type==='checkbox')(element as HTMLInputElement).checked=Boolean(value);else element.value=String(value);}node.addEventListener('input',fieldsChanged);node.addEventListener('change',fieldsChanged);},[scenario,fieldsChanged]);
  useLayoutEffect(() => {
    let cancelled=false;
    const sync=()=>{const urlHidden=new URLSearchParams(location.search).get('share')==='1',hidden=sharedView||urlHidden,current=privacy.current;current.active=true;if(current.hidden!==hidden){current.hidden=hidden;current.epoch++;current.read++;}const epoch=current.epoch;
      queueMicrotask(()=>{if(cancelled||privacy.current.epoch!==epoch)return;setUrlShared(urlHidden);setViewEpoch(epoch);if(hidden||ledger.current)return;const requested=new URLSearchParams(location.search).get('experiment');if(experiments.some(item=>item.id===requested))setScenario(requested!);try{const opened=openEvaluationLedger(localStorage,day());ledger.current=opened;storageReadable.current=true;if(opened.problem){setMessage(opened.problem+' Export all recovery copies before deliberate review.');setReady(false);return;}latestRuns.current=opened.value;setRuns(latestRuns.current);setReady(true);}catch{setMessage(storageReadable.current?'Stored evaluations are unreadable. Export the stored original, then use Restore valid backup. No stored bytes were changed.':'Browser storage cannot be read. Saving is blocked; restore access before changing stored evidence.');}});
    };
    const listener = (event:StorageEvent) => {
      if (event.key === EVALUATION_KEY || event.key === ledger.current?.checkpointKey || event.key === null) {
        privacy.current.read++;
        setReady(false);
        setMessage("Another tab changed these records. Export your current view if needed, then reload before editing or restoring.");
      }
    };
    const exit=()=>{privacy.current.active=false;privacy.current.epoch++;privacy.current.read++;};
    sync();window.addEventListener('popstate',sync);window.addEventListener('hashchange',sync);window.addEventListener('pageshow',sync);window.addEventListener('pagehide',exit);window.addEventListener('storage',listener);
    return()=>{cancelled=true;exit();window.removeEventListener('popstate',sync);window.removeEventListener('hashchange',sync);window.removeEventListener('pageshow',sync);window.removeEventListener('pagehide',exit);window.removeEventListener('storage',listener);};
  },[sharedView]);

  function persist(next:Evaluation[], restoring = false) {
    if(privateView())return false;
    privacy.current.read++;
    try {
      if (!storageReadable.current || !restoring && !ready) throw Error("Saving is paused. Reload the current copy or use Restore valid backup for unreadable data.");
      if(!ledger.current)throw Error('The evaluation recovery guard is unavailable.');
      const text=ledger.current.save(next,restoring);
      latestRuns.current = importEvaluations(text, day());
      setRuns(latestRuns.current); setReady(true);
      setMessage(restoring
        ? "Backup restored. The previous stored bytes remain in the recovery copy. Older records keep their original provenance."
        : "Saved in this browser. These self-recorded checks do not establish general model rankings.");
      return true;
    } catch (error) {
      setMessage((error as Error).message + " Current evidence was preserved.");
      return false;
    }
  }
  function exportStored(key:string, name:string) {
    if(privateView())return;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) {setMessage("There is no stored copy at that location."); return;}
      download(name, raw, true);
      setMessage("Original stored bytes exported without alteration. Keep this file before restoring another backup.");
    } catch {setMessage("The stored copy could not be read. No data was changed.");}
  }
  function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(privateView())return;
    const form = event.currentTarget, values = new FormData(form);
    const optionalNumber = (name:string) => values.get(name) === "" ? null : Number(values.get(name));
    try {
      const run = validateEvaluation({
        id:crypto.randomUUID(), scenario, date:day(), system:values.get("system"), evidence:values.get("evidence"),
        scores:criteria.map((_, index) => Number(values.get("score-" + index))),
        criticalFailure:values.has("critical"), minutes:Number(values.get("minutes")), cost:optionalNumber("cost"),
        protocol:{
          fixture:values.get("fixture"), groundTruth:values.get("groundTruth"),
          tools:values.get("tools"), baseline:values.get("baseline"),
          task:current.task + "\nAcceptance: " + current.expected + "\nCritical failure: " + current.critical,
          rubricVersion:"atlas-five-criteria-v1", evaluator:values.get("evaluator"),
          repetition:Number(values.get("repetition")), retries:Number(values.get("retries")),
          latencySeconds:optionalNumber("latencySeconds"), correctionMinutes:optionalNumber("correctionMinutes"),
          failureNotes:values.get("failureNotes"), remediation:values.get("remediation"), verification:values.get("verification"),
        },
      }, day());
      if (persist([...latestRuns.current, run])) form.reset();
    } catch (error) {setMessage((error as Error).message);}
  }
  async function importBackup(input:HTMLInputElement) {
    const selected = input.files?.[0];
    const mode = importMode.current;
    const read=++privacy.current.read,epoch=privacy.current.epoch,current=()=>!privateView()&&privacy.current.read===read&&privacy.current.epoch===epoch;
    if (!selected||!current()) return;
    try {
      if (selected.size > MAX_EVALUATION_BYTES) throw Error("Choose a backup below 2 MB.");
      const text=await selected.text();if(!current())return;
      const incoming = readEvaluationBackup(text, day()).runs;
      if (mode === "restore") {
        if (!current()||!window.confirm(`Replace the evaluation ledger with ${incoming.length} validated records? The current stored bytes will be retained in a recovery copy.`)||!current()) return;
        persist(incoming, true);
      } else {
        if(!current())return;if (!ready) throw Error("Merge is paused. Reload a newer copy, or use Restore valid backup if the stored copy is unreadable.");
        persist(mergeEvaluations(latestRuns.current, incoming));
      }
    } catch (error) {if(current())setMessage((error as Error).message + " Existing records were kept.");}
    finally {if(privacy.current.read===read||input.files?.[0]===selected)input.value = "";}
  }
  function chooseBackup(mode:"merge"|"restore") {if(privateView())return;privacy.current.read++;importMode.current = mode; file.current?.click();}
  function exportAllRecovery(){if(privateView())return;try{download('atlas-private-evaluation-recovery.json',{schema:'atlas-evaluation-recovery-v1',copies:ledger.current?.copies(),legacyRecoveryRaw:localStorage.getItem(EVALUATION_KEY+'-recovery')});}catch{setMessage('Recovery storage could not be read; no data changed.');}}

  const matching = runs.filter(run => run.scenario === scenario);
  const passing = matching.filter(run => verdict(run).pass).length;
  const groups = new Map<string, {fixture:string; count:number; criticalFailures:number; runs:Evaluation[]}>();
  for (const run of matching) {
    const key = comparisonKey(run);
    if (!key) continue;
    const group = groups.get(key) || {fixture:run.protocol!.fixture,count:0,criticalFailures:0,runs:[]};
    group.runs.push(run); group.count += 1; group.criticalFailures += Number(run.criticalFailure); groups.set(key, group);
  }
  const legacyCount = matching.filter(run => !run.protocol).length;

  if(shared)return <><section id="evaluation-workbench" className="page-section eval-section"><div className="section-kicker">Evaluation workbench · public method</div><h2 className="section-title">Compare outputs. Keep the evidence.</h2><p role="status" aria-live="polite">Private runs, protocols, recovery copies and unsubmitted fields are hidden. Return to your private view to continue the retained draft.</p><p>Freeze the input, task, allowed tools and independent scoring source. Preserve failed runs and retries; no private score or result is inferred here.</p></section><section id="learning-science" className="page-section"><h2 className="section-title">Build durable skill with bounded practice.</h2><p>Attempt independently, check against a trustworthy source, repair a specific error, transfer it and return for a delayed check.</p></section></>;

  return <>
    <section id="evaluation-workbench" className="page-section eval-section">
      <div className="section-kicker">V7 · reproducible evaluation workbench</div>
      <h2 className="section-title">Compare outputs. Keep the evidence.</h2>
      <p className="section-intro">Freeze the inputs, task, rubric and allowed tools. Score the artifact before revealing the system label. This desk records your experiments; it does not call models or inspect your artifacts.</p>
      {!shared?<details className="specialist-recovery"><summary>Evaluation data & recovery</summary><p>Current evaluation saves stay separate from the older Atlas copy. Before rollback, export current evidence and all raw recovery copies. This does not back up another browser.</p><button type="button" onClick={exportAllRecovery}>Export all evaluation recovery copies</button><p role="status">{ready?'Protected local evaluation ledger ready.':'Saved evaluations are paused; no empty result is inferred.'}</p></details>:null}<div className="eval-layout"><div>
        <label className="eval-field">Choose an experiment<select value={scenario} onChange={event => setScenario(event.target.value)}>{experiments.map(experiment => <option key={experiment.id} value={experiment.id}>{experiment.title}</option>)}</select></label>
        <article className="eval-brief"><h3>{current.title}</h3><p>{current.task}</p><p><strong>Acceptance:</strong> {current.expected}</p><p><strong>Critical failure:</strong> {current.critical}</p><p><strong>Transfer:</strong> {current.transfer}</p><p>Keep the first output and every failed run. Include retries and correction time in measured effort. Use public, synthetic or authorised sources.</p></article>
        <form key={scenario} ref={attachForm} onSubmit={submit} className="eval-form">
          <h3>Record a completed run</h3>
          <div className="eval-fields">
            <label className="eval-field">System / version / configuration<input name="system" required maxLength={150} placeholder="Exact available model, surface and settings"/></label>
            <label className="eval-field">Total effort, minutes<input name="minutes" type="number" min="0" max="10000" step="0.1" required/></label>
            <label className="eval-field">Measured USD cost, optional<input name="cost" type="number" min="0" max="100000" step="0.0001" placeholder="Unknown"/></label>
            <label className="eval-field">Frozen input pack / fixture version<input name="fixture" required maxLength={500} placeholder="Public-pack-v1, commit, or checksum reference"/></label>
            <label className="eval-field">Ground truth / scoring source<input name="groundTruth" required maxLength={1000} placeholder="Exact checked source or human rubric reference"/></label>
          </div>
          <details><summary>Access, repetitions and failure analysis</summary>
            <div className="eval-fields">
              <label className="eval-field">Allowed tools and access<input name="tools" defaultValue="No tools" required maxLength={1000}/></label>
              <label className="eval-field">No-AI / deterministic baseline<input name="baseline" defaultValue="Not measured" required maxLength={1500}/></label>
              <label className="eval-field">Evaluator provenance<select name="evaluator" defaultValue="SELF">{evaluationReviewers.map(reviewer => <option key={reviewer}>{reviewer}</option>)}</select></label>
              <label className="eval-field">Repetition number<input name="repetition" type="number" min="1" max="10000" step="1" defaultValue="1" required/></label>
              <label className="eval-field">Retries included<input name="retries" type="number" min="0" max="10000" step="1" defaultValue="0" required/></label>
              <label className="eval-field">Measured latency, seconds<input name="latencySeconds" type="number" min="0" max="86400" step="0.1" placeholder="Unknown"/></label>
              <label className="eval-field">Correction effort, minutes<input name="correctionMinutes" type="number" min="0" max="10000" step="0.1" placeholder="Unknown"/></label>
            </div>
            <label className="eval-field">Failures observed, required for a critical failure<textarea name="failureNotes" rows={2} maxLength={2000}/></label>
            <label className="eval-field">Remediation performed<textarea name="remediation" rows={2} maxLength={2000}/></label>
            <label className="eval-field">Identical-test verification result / reference<textarea name="verification" rows={2} maxLength={2000} placeholder="Leave empty if not run; do not replace the original failed result."/></label>
          </details>
          <label className="eval-field">Output reference and independent checks<textarea name="evidence" minLength={20} maxLength={3000} required rows={4} placeholder="Which artifact and source claims were inspected? Omit private source contents."/></label>
          <fieldset><legend>Fixed rubric · 0 fails, 1 partial, 2 meets</legend><div className="eval-fields">{criteria.map((criterion, index) => <label key={criterion} className="eval-field">{criterion}<select name={"score-" + index} required defaultValue=""><option value="" disabled>Choose score</option><option value="0">0 · fails</option><option value="1">1 · partial</option><option value="2">2 · meets</option></select></label>)}</div></fieldset>
          <label className="eval-check"><input name="critical" type="checkbox"/> A critical failure occurred</label>
          <p className="eval-note">Passing requires at least 8/10, no criterion at zero and no critical failure. Evaluator labels are recorded by you; this app does not authenticate a reviewer or certify competence.</p>
          <button className="eval-button" disabled={!ready} type="submit">Save completed evaluation</button>
        </form><EvaluationFormDraft form={formDraft} scope={scenario} shared={shared}/>
      </div><aside className="eval-results">
        <h3>This experiment’s evidence</h3><p>{matching.length} recorded runs · {passing} meet this rubric</p>
        <p className="eval-note">Counts describe these selected runs. Different inputs or conditions must not be pooled into a model ranking.</p>
        <details><summary>Compare matched runs side by side</summary>
          <p>Pairs use the same recorded setup and repetition number. Score with labels hidden first. Opening this view reveals system labels and shows up to ten pairs per fixture.</p>
          {blind ? <p>Turn off blind scoring to reveal matched comparisons.</p> : groups.size === 0 ? <p>Record the full test setup to unlock matched comparisons.</p> : [...groups].map(([key, group]) => <details key={key}>
            <summary>{group.fixture} · {group.count} recorded runs</summary>
            <EvaluationPair runs={group.runs} />
          </details>)}
        </details>
        <details><summary>Comparable evidence groups ({groups.size})</summary>
          <p>Groups require matching stored task, fixture, scoring source, tools, baseline and rubric version. Matching labels do not prove equal conditions or independent scoring.</p>
          {groups.size === 0 ? <p>Insufficient protocol evidence for a comparison.</p> : <ul>{[...groups].map(([key, group]) => <li key={key}>{group.fixture}: {group.count} runs, {group.criticalFailures} critical failures{group.count === 1 ? " · another matching run is needed for comparison" : ""}.</li>)}</ul>}
          {legacyCount > 0 && <p>{legacyCount} legacy records have no captured protocol and remain outside these groups.</p>}
        </details>
        <label className="eval-check"><input type="checkbox" checked={blind} onChange={event => setBlind(event.target.checked)}/> Hide system labels while scoring</label>
        <div className="eval-actions">
          <button className="eval-button" type="button" disabled={shared||!ready && runs.length === 0} onClick={() => {if(!privateView())download("atlas-evaluations.json", {schema:EVALUATION_SCHEMA,runs});}}>Export current view</button>
          <button className="eval-button" type="button" disabled={shared} onClick={() => chooseBackup("merge")}>Merge backup</button>
          <button className="eval-button" type="button" disabled={shared} onClick={() => chooseBackup("restore")}>Restore valid backup</button>
          <button className="eval-button" type="button" disabled={shared} onClick={() => exportStored(EVALUATION_KEY, "atlas-evaluations-original.json")}>Export stored original</button>
          <button className="eval-button" type="button" disabled={shared} onClick={() => exportStored(EVALUATION_KEY + "-recovery", "atlas-evaluations-recovery.json")}>Export recovery copy</button>
        </div>
        <input ref={attachImport} hidden type="file" accept=".json,application/json" onChange={event => {void importBackup(event.currentTarget);}}/>
        <details><summary>Using an older Atlas version?</summary><p>Export the full v2 backup first. The v1 export below retains original scores and evidence but omits the new protocol metadata. Use it only when restoring an older version.</p><button className="eval-button" type="button" disabled={shared||!ready && runs.length === 0} onClick={() => {if(!privateView())download("atlas-evaluations-v1-scores.json", legacyEvaluationBackup(runs));}}>Export v1 scoring records</button></details>
        <p role="status" aria-live="polite" className="eval-notice">{message}</p>
        {matching.length === 0 ? <p className="eval-empty">No sample results are inserted. Run one experiment, then record what you checked.</p> : <div className="eval-run-list">{matching.slice().reverse().map((run, index) => <article key={run.id} className="eval-run">
          <div className="eval-run-head"><strong>{blind ? "Output " + (matching.length - index) : run.system}</strong><span>{verdict(run).points}/10</span></div>
          <p className={verdict(run).pass ? "eval-pass" : "eval-repair"}>{verdict(run).label}</p>
          <p>{run.date} · {run.minutes} min · {run.cost === null ? "cost unknown" : "USD " + run.cost}</p><p>{run.evidence}</p>
          <details><summary>Criterion scores and protocol</summary><ul>{criteria.map((criterion, criterionIndex) => <li key={criterion}>{criterion}: {run.scores[criterionIndex]}/2</li>)}</ul>
            {run.protocol ? <>
              <p><strong>Fixture:</strong> {run.protocol.fixture}</p><p><strong>Scoring source:</strong> {run.protocol.groundTruth}</p>
              <p><strong>Tools:</strong> {run.protocol.tools}</p><p><strong>Baseline:</strong> {run.protocol.baseline}</p>
              <p><strong>Evaluator:</strong> {run.protocol.evaluator} · repetition {run.protocol.repetition} · {run.protocol.retries} retries</p>
              <p>Latency: {run.protocol.latencySeconds === null ? "unknown" : run.protocol.latencySeconds + " seconds"}; correction effort: {run.protocol.correctionMinutes === null ? "unknown" : run.protocol.correctionMinutes + " minutes"}.</p>
              <p><strong>Frozen task:</strong> {run.protocol.task}</p>
              <p><strong>Failures:</strong> {run.protocol.failureNotes || "Not recorded"}</p><p><strong>Remediation:</strong> {run.protocol.remediation || "Not recorded"}</p>
              <p><strong>Identical-test verification:</strong> {run.protocol.verification || "Not recorded"}</p>
            </> : <p>Legacy record: the original protocol was not captured. No missing setup or reviewer is inferred.</p>}
          </details>
        </article>)}</div>}
        <details><summary>How to make a fair comparison</summary><ol><li>Use representative tasks and preserve the same inputs and access.</li><li>Score independently and resolve disagreements against sources.</li><li>Keep failed runs and retries; a successful retry does not erase an earlier failure.</li><li>Report the sample size, baseline, critical failures and repair effort. One task cannot establish a universal winner.</li><li>Take a delayed independent transfer task to check what you retained.</li></ol></details>
      </aside></div>
    </section>
    <section id="learning-science" className="page-section">
      <div className="section-kicker">Learning science · checked 12 October 2026</div><h2 className="section-title">Build durable skill with bounded practice.</h2>
      <p className="section-intro">Behavioral learning evidence guides the workflow. Neuroscience supports protecting sleep; it does not justify a promised brain upgrade or a compulsory 15-hour study day.</p>
      <div className="eval-science-grid">{learningEvidence.map(item => <article key={item.title} className="eval-brief"><h3>{item.title}</h3><p>{item.action}</p><p className="eval-note">{item.limit}</p><a href={item.source} target="_blank" rel="noreferrer">{item.kind} ↗</a></article>)}</div>
      <details className="eval-benchmarks"><summary>Reference products and the specific design response</summary><div className="eval-table-wrap"><table><thead><tr><th>Reference</th><th>Observed strength</th><th>Implemented here</th><th>Scope limit</th></tr></thead><tbody>
        <tr><td><a href="https://www.deeplearning.ai/courses/evaluating-ai-agents" target="_blank" rel="noreferrer">DeepLearning.AI</a></td><td>Component and end-to-end evaluation</td><td>Six experiments, frozen protocols and critical-failure gates</td><td>No hosted notebook or automatic evaluator</td></tr>
        <tr><td><a href="https://huggingface.co/learn/agents-course/en/unit0/introduction" target="_blank" rel="noreferrer">Hugging Face</a></td><td>Hands-on agents and assessed projects</td><td>Independent artifact, hidden check and transfer task</td><td>No replacement for its runnable environments</td></tr>
        <tr><td><a href="https://www.remnote.com/feature/exam-scheduler" target="_blank" rel="noreferrer">RemNote</a></td><td>Exam-focused review planning</td><td>Delayed practice alongside academy evidence</td><td>Use Anki/RemNote for adaptive card scheduling</td></tr>
      </tbody></table></div><p>These dated references describe features, not superiority. Paid tiers and signed-in experiences were not exhaustively tested.</p></details>
    </section>
  </>;
}
