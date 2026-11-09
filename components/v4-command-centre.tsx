"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { openAssessmentDraft } from "@/lib/assessment-draft";
import { unitAccess, stageBrief } from "@/lib/learning-workspace";
import {
  capstonePaths, deriveProgress, graduation, localDate, planSession, progressMinutes, recordEvidence,
  evaluatorTypes, failureCategories, type Competency, type Curriculum, type EvaluatorType, type EvidenceEvent, type FailureCategory, type LearningState,
} from "@/lib/learning-state";
import { competencies, competencyScale, learnerRoutes, levels } from "@/lib/programme";

export type UnitDetail = {
  trackCode: string; trackTitle: string; objective: string; activity: string; check: string;
  transfer: string; passCriterion: string;
};

const evidenceActions: EvidenceEvent["action"][] = ["learn", "practise", "demonstrate", "challenge", "transfer", "retest", "maintain", "fail"];
const advancedActions = new Set<EvidenceEvent["action"]>(["demonstrate", "challenge", "transfer", "retest", "maintain"]);
const allowedActions = (stage: string, maintenanceDue: boolean): EvidenceEvent["action"][] => stage === "Unseen" ? ["learn", "challenge"]
  : stage === "Learned" ? ["practise"] : stage === "Practised" ? ["demonstrate", "fail"]
    : stage === "Demonstrated" ? ["transfer", "fail"] : stage === "Retest Due" ? ["retest", "fail"]
      : stage === "Mastered" ? maintenanceDue ? ["maintain", "fail"] : ["fail"]
      : stage === "Needs Repair" ? ["practise", "challenge"] : [];

export function V4CommandCentre({ curriculum, details, state, onChange, selectedUnitId, onSelectUnit, writable = true, shareSafe = false }: {
  curriculum: Curriculum; details: Record<string, UnitDetail>; state: LearningState; onChange: (state: LearningState) => void;
  selectedUnitId?: string; onSelectUnit: (id?: string) => void; writable?: boolean; shareSafe?: boolean;
}) {
  const today = localDate();
  const recommendation = useMemo(() => planSession(state, curriculum, today), [state, curriculum, today]);
  const credits = useMemo(() => progressMinutes(state, curriculum, today), [state, curriculum, today]);
  const graduate = useMemo(() => graduation(state, curriculum, today), [state, curriculum, today]);
  const unit = curriculum.byId.get(selectedUnitId || recommendation?.unitId || "");
  const detail = unit ? details[unit.id] : undefined;
  const derived = unit ? deriveProgress(state.units[unit.id], unit, today) : undefined;
  const access = unit ? unitAccess(state, unit, curriculum, today) : undefined;
  const taskBrief=derived&&detail?stageBrief(derived,detail,today):undefined;
  const actions = derived && access?.canRecord ? allowedActions(derived.stage, Boolean(derived.maintenanceDue && derived.maintenanceDue <= today)) : [];
  const [taskQuery, setTaskQuery] = useState("");
  const matchingUnits = useMemo(() => curriculum.units.filter(item => `${item.title} ${details[item.id]?.trackCode} ${details[item.id]?.trackTitle}`.toLowerCase().includes(taskQuery.toLowerCase().trim())), [curriculum, details, taskQuery]);
  const [action, setAction] = useState<EvidenceEvent["action"]>("learn");
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");
  const [artifact, setArtifact] = useState("");
  const [context, setContext] = useState("");
  const [independent, setIndependent] = useState(false);
  const [scores, setScores] = useState<Partial<Record<Competency, number>>>({});
  const [evaluator, setEvaluator] = useState<EvaluatorType>("SELF");
  const [failureCategory, setFailureCategory] = useState<FailureCategory>(failureCategories[0]);
  const [message, setMessage] = useState("");
  const [diagnosticDomain, setDiagnosticDomain] = useState("fundamentals");
  const [diagnosticScore, setDiagnosticScore] = useState(0);
  const [diagnosticNote, setDiagnosticNote] = useState("");
  const selectedAction = actions.includes(action) ? action : actions[0];
  const needsEvidence = selectedAction ? advancedActions.has(selectedAction) : false;
  const domainOptions = useMemo(() => Array.from(new Set(curriculum.units.flatMap(item => item.domains).filter(item => item === item.toLowerCase()))).sort(), [curriculum]);
  const draftSlot=useRef<ReturnType<typeof openAssessmentDraft> | null>(null);
  const loadedTask=useRef<string|null>(null),privacy=useRef({mounted:false,shared:shareSafe});
  useEffect(()=>{privacy.current={mounted:true,shared:shareSafe};return()=>{privacy.current.mounted=false;};},[shareSafe]);
  const privateNow=useCallback(()=>privacy.current.mounted&&!privacy.current.shared&&new URLSearchParams(location.search).get('share')!=='1',[]);
  useEffect(() => {
    let cancelled=false;queueMicrotask(()=>{if(cancelled)return;
    // Privacy/storage pauses must not erase fields which could not be saved.
    // Hydrate once per actual task selection, never from an empty public view.
    if(shareSafe||!writable||!unit||loadedTask.current===unit.id||!privateNow())return;
    loadedTask.current=unit.id;
    setAction('learn');setDate(today);setNote('');setArtifact('');setContext('');setIndependent(false);setScores({});setMessage('');draftSlot.current=null;
    try{const opened=openAssessmentDraft(localStorage,unit.id);draftSlot.current=opened;if(opened.problem){setMessage(opened.problem);return;}const fields=opened.value?.fields;if(!fields)return;
      const alreadyRecorded=state.units[unit.id]?.events.some(event=>event.note===fields.note&&event.date===fields.date&&(!fields.artifact||event.artifact===fields.artifact));
      if(alreadyRecorded){setMessage('A retained draft matches an existing evidence step. Check history before recording another result.');return;}
      if(typeof fields.action==='string')setAction(fields.action as EvidenceEvent['action']);if(typeof fields.date==='string')setDate(fields.date);if(typeof fields.note==='string')setNote(fields.note);if(typeof fields.artifact==='string')setArtifact(fields.artifact);if(typeof fields.context==='string')setContext(fields.context);setIndependent(fields.independent===true);if(typeof fields.evaluator==='string')setEvaluator(fields.evaluator as EvaluatorType);
      const restored:Partial<Record<Competency,number>>={};for(const dimension of competencies){const score=fields['score-'+dimension];if(typeof score==='string'&&score!=='')restored[dimension]=Number(score);}setScores(restored);setMessage('Unsubmitted task fields restored. This draft is not evidence credit.');
    }catch{setMessage('Task draft storage is unavailable. Export the visible fields before leaving.');}
    });return ()=>{cancelled=true;};
  }, [unit,today,writable,shareSafe,state.units,privateNow]);
  const captureDraft=(fieldset:HTMLFieldSetElement)=>{if(!privateNow()||!writable||!draftSlot.current)return;const fields:Record<string,string|boolean>={};for(const input of fieldset.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('[data-draft-field]')){fields[input.dataset.draftField!]=input instanceof HTMLInputElement&&input.type==='checkbox'?input.checked:input.value;}try{draftSlot.current.save(fields);}catch(error){setMessage(error instanceof Error?error.message:'Draft saving failed.');}};
  const exportDraft=()=>{if(!privateNow())return;const payload={schema:'atlas-assessment-draft-recovery-v1',unitId:unit?.id,storedOriginal:draftSlot.current?.raw,visibleDraft:{action:selectedAction,date,note,artifact,context,independent,evaluator,scores}};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='atlas-unsubmitted-task-draft.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};

  const submit = () => {
    if (!privateNow() || !unit || !selectedAction || !writable || !access?.canRecord) return;
    const event: EvidenceEvent = { action: selectedAction, date, note };
    if (needsEvidence) Object.assign(event, { artifact, independent, scores, evaluator, ...(selectedAction === "transfer" ? { context } : {}) });
    if (selectedAction === "fail") Object.assign(event, { evaluator, failureCategory });
    const result = recordEvidence(state, unit.id, event, curriculum, today);
    if (result.error) { setMessage(result.error); return; }
    onChange(result.state); setNote(""); setArtifact(""); setContext(""); setIndependent(false); setScores({});
    setMessage(`${unit.title}: ${selectedAction} evidence accepted in this tab. Check browser-save status above before leaving. ${evaluator === "SELF" ? "This is self-reported; Atlas has not inspected the external artifact." : `Evaluator type recorded: ${evaluator}. Atlas has not independently confirmed the claim.`}`);
  };

  const saveDiagnostic = () => {
    if (!privateNow() || !writable) return;
    if (!diagnosticNote.trim()) { setMessage("Describe the diagnostic task and observed result. A score alone is not placement evidence."); return; }
    onChange({ ...state, diagnostic: [...state.diagnostic.filter(item => item.domain !== diagnosticDomain), { domain: diagnosticDomain, score: diagnosticScore, note: diagnosticNote.trim(), date: today }] });
    setMessage("Diagnostic placement saved. It changes recommendations only; it awards no progress or mastery.");
  };

  if(shareSafe)return <section id="command-centre" className="page-section command-centre" aria-labelledby="command-centre-title"><h2 id="command-centre-title">Task & evidence desk</h2><p>Public method; private task fields and recorded evidence are hidden. Your working fields remain in this tab.</p></section>;
  return <section id="command-centre" className="page-section command-centre" aria-labelledby="command-centre-title" data-selected-unit={unit?.id}>
    <div className="section-kicker">TASK & EVIDENCE DESK · browser-local</div>
    <h2 id="command-centre-title" className="section-title" tabIndex={-1}>Work on the exact task.</h2>
    <p className="section-intro">Recommendations use prerequisites, repair, transfer, due retests, your selected route and available session time. Diagnostics may shorten instruction, but only recorded independent evidence can advance competence.</p>

    {!writable ? <p className="lw-storage-notice" role="status">Evidence editing is paused while storage needs recovery, during loading, or in Share-safe mode. Your original record is preserved.</p> : null}
    <div className="task-picker"><label>Find a module or project<input type="search" value={taskQuery} onChange={event => setTaskQuery(event.target.value)} placeholder="Search task, track code or track title" /></label><label>Inspect task<select value={unit?.id || ""} onChange={event => onSelectUnit(event.target.value)}><option value="" disabled>Choose a task</option>{unit && !matchingUnits.some(item=>item.id===unit.id) ? <option value={unit.id}>{details[unit.id]?.trackCode} · {unit.title} (current task)</option> : null}{matchingUnits.map(item=><option key={item.id} value={item.id}>{details[item.id]?.trackCode} · {item.title}</option>)}</select></label><button type="button" onClick={()=>{setTaskQuery("");onSelectUnit(undefined);}}>Use recommended task</button><p role="status">{matchingUnits.length} tasks match. Inspecting a task does not award progress.</p></div>
    <fieldset className="task-settings-fieldset" disabled={!writable}><legend className="sr-only">Learning preferences</legend><div className="command-settings">
      <label>Learning route<select value={state.route} onChange={event => {if(privateNow()&&writable)onChange({ ...state, route: event.target.value as LearningState["route"] });}}>{learnerRoutes.map(route => <option key={route}>{route}</option>)}</select></label>
      <label>Session length<select value={state.preferences.sessionMinutes} onChange={event => {if(privateNow()&&writable)onChange({ ...state, preferences: { ...state.preferences, sessionMinutes: Number(event.target.value) as 30 | 60 | 90 | 120 } });}}><option value="30">30 minutes</option><option value="60">60 minutes</option><option value="90">90 minutes</option><option value="120">Deep session · 120 minutes</option></select></label>
      <label>Capstone pathway<select value={state.preferences.capstonePath || ""} onChange={event => {if(privateNow()&&writable)onChange({ ...state, preferences: { ...state.preferences, capstonePath: event.target.value || undefined } });}}><option value="">Choose later</option>{capstonePaths.map(path => <option key={path}>{path}</option>)}</select></label>
    </div></fieldset>

    <div className="level-progress" aria-label="Five-level demonstrated and mastered progress">{levels.map(level => <article key={level}><span>{level}</span><strong>{Math.round(credits.byLevel[level].demonstrated / 60)}h demonstrated</strong><small>{Math.round(credits.byLevel[level].mastered / 60)}h mastered</small></article>)}</div>

    {unit && detail && derived ? <div className="next-unit">
      <div className="next-unit-heading"><div><small>{detail.trackCode} · {detail.trackTitle}</small><h3>{unit.title}</h3></div><strong>{Math.min(state.preferences.sessionMinutes,unit.minutes)} min scope</strong></div>
      <p><b>Current evidence:</b> {derived.stage}. {selectedUnitId ? "You selected this task for inspection." : recommendation?.action}</p>
      {!selectedUnitId ? <p>{recommendation?.reason}</p> : null}
      {access?.unmet.length ? <p className="task-prerequisites"><b>Prerequisites to inspect:</b> {access.unmet.map((id,index)=><span key={id}>{index ? ", " : ""}<button type="button" onClick={()=>onSelectUnit(id)}>{curriculum.byId.get(id)?.title || id}</button></span>)}{!access.canRecord ? ". New task evidence is locked until prerequisites are demonstrated." : ". Existing repair and review work remains available."}</p> : null}
      <div className="task-active-brief"><p className="section-kicker">{taskBrief?.label || "THE TASK FOR THIS STAGE"}</p><p>{taskBrief?.task}</p><p><b>Acceptance criterion:</b> {detail.passCriterion}</p><p>{taskBrief?.boundary}</p>{["Retest Due","Mastered"].includes(derived.stage)?<p>Use a fresh task and close earlier answers before attempting the check.</p>:null}</div>
      <details><summary>Open the task and pass criterion</summary><p><b>Objective:</b> {detail.objective}</p><p><b>Guided work:</b> {detail.activity}</p><p><b>Independent check:</b> {detail.check}</p><p><b>Transfer:</b> {detail.transfer}</p><p><b>Pass only when:</b> {detail.passCriterion}</p></details>

      {actions.length ? <fieldset className="unit-evidence" aria-labelledby="unit-evidence-title" disabled={!writable} onInput={event=>captureDraft(event.currentTarget)}><legend id="unit-evidence-title">Record actual work</legend>
        <div className="evidence-form-row"><label>Evidence action<select data-draft-field="action" value={selectedAction} onChange={event => setAction(event.target.value as EvidenceEvent["action"])}>{actions.filter(item => evidenceActions.includes(item)).map(item => <option key={item}>{item}</option>)}</select></label><label>Completion date<input data-draft-field="date" type="date" max={today} value={date} onChange={event => setDate(event.target.value)} /></label></div>
        <label>What did you complete or what failed?<textarea data-draft-field="note" value={note} onChange={event => setNote(event.target.value)} placeholder="Describe the observable result; planned work is not completion evidence." /></label>
        {needsEvidence ? <><label>Artifact reference<textarea data-draft-field="artifact" value={artifact} onChange={event => setArtifact(event.target.value)} placeholder="Local filename, repository revision, document title or other inspectable reference—never a secret." /></label>
          {selectedAction === "transfer" ? <label>Materially different context<textarea data-draft-field="context" value={context} onChange={event => setContext(event.target.value)} placeholder="What changed beyond names or presentation?" /></label> : null}
          <label className="independent-check"><input data-draft-field="independent" type="checkbox" checked={independent} onChange={event => setIndependent(event.target.checked)} /> I completed this assessment independently; any assistance is disclosed in the note.</label>
          <label>Evaluator type<select data-draft-field="evaluator" value={evaluator} onChange={event => setEvaluator(event.target.value as EvaluatorType)}>{evaluatorTypes.map(item => <option key={item}>{item}</option>)}</select></label>
          <div className="rubric-scores">{competencies.map(dimension => <label key={dimension}>{dimension}<select data-draft-field={"score-"+dimension} value={scores[dimension] ?? ""} onChange={event => setScores(current => ({ ...current, [dimension]: event.target.value === "" ? undefined : Number(event.target.value) }))}><option value="">Not scored</option>{competencyScale.map((label, score) => <option key={label} value={score}>{score} · {label}</option>)}</select></label>)}</div></> : null}
        {selectedAction === "fail" ? <label>Failure category<select value={failureCategory} onChange={event => setFailureCategory(event.target.value as FailureCategory)}>{failureCategories.map(item => <option key={item}>{item}</option>)}</select><small>Atlas will preserve this category so the next repair can stay narrow. It does not diagnose the artifact automatically.</small></label> : null}
        <button type="button" onClick={submit}>Save evidence step</button>
      </fieldset> : <p className="waiting-note">{access?.unmet.length && !access.canRecord ? "Read the prerequisite tasks first. Selecting a task never bypasses the evidence requirements." : derived.due && derived.due > today ? `Retention is not due before ${derived.due}. No retest credit can be recorded early.` : "No evidence action is currently due. A passed transfer becomes Retest Due only after its full delay."}</p>}
      <div className="assessment-draft-tools"><button type="button" disabled={shareSafe} onClick={exportDraft}>Export unsubmitted task fields</button><p>Task drafts survive reloads in this browser. They award no progress and remain separate from the learner backup.</p><a href={"?unit="+encodeURIComponent(unit.id)+"#command-centre"}>Bookmark this exact task</a></div><details className="task-evidence-history"><summary>Recorded evidence history · {state.units[unit.id]?.events.length || 0} steps</summary>{state.units[unit.id]?.events.length ? <ol>{state.units[unit.id].events.slice(-12).map((event,index)=><li key={`${event.date}-${index}`}><strong>{event.action} · <time>{event.date}</time></strong><p>{event.note}</p>{event.artifact?<p>Artifact reference: {event.artifact}</p>:null}<small>{event.evaluator || "SELF"} · self-reported record, not independently inspected by Atlas</small></li>)}</ol> : <p>No evidence steps recorded for this task.</p>}{(state.units[unit.id]?.events.length || 0)>12?<p>Showing the latest twelve. Export the existing learner backup for the full record.</p>:null}</details>
    </div> : <div className="next-unit"><h3>All available units are waiting on evidence or prerequisites.</h3><p>Inspect Needs Repair, due retention work and prerequisite demonstrations before starting more content.</p></div>}

    <details className="diagnostic-panel"><summary>Experienced learner diagnostic placement</summary><p>Record a real challenge result. This affects instruction routing only and never marks a unit Demonstrated or Mastered.</p><div className="evidence-form-row"><label>Domain<select value={diagnosticDomain} disabled={!writable} onChange={event => setDiagnosticDomain(event.target.value)}>{domainOptions.map(domain => <option key={domain}>{domain}</option>)}</select></label><label>Observed score<select value={diagnosticScore} disabled={!writable} onChange={event => setDiagnosticScore(Number(event.target.value))}>{competencyScale.map((label, score) => <option key={label} value={score}>{score} · {label}</option>)}</select></label></div><label>Challenge and observed result<textarea value={diagnosticNote} disabled={!writable} onChange={event => setDiagnosticNote(event.target.value)} /></label><button type="button" disabled={!writable} onClick={saveDiagnostic}>Save placement only</button></details>
    <p className="command-message" role="status" aria-live="polite">{message}</p>
    <p className="graduation-note"><b>Graduation:</b> {graduate.achieved ? "Evidence requirements met in this browser." : `${graduate.unmet.length} units still require delayed mastery${graduate.capstonePathRequired ? "; choose one capstone path" : ""}.`} {graduate.note}</p>
  </section>;
}
