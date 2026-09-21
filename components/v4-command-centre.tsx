"use client";

import { useMemo, useState } from "react";
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

export function V4CommandCentre({ curriculum, details, state, onChange }: {
  curriculum: Curriculum; details: Record<string, UnitDetail>; state: LearningState; onChange: (state: LearningState) => void;
}) {
  const today = localDate();
  const recommendation = useMemo(() => planSession(state, curriculum, today), [state, curriculum, today]);
  const credits = useMemo(() => progressMinutes(state, curriculum, today), [state, curriculum, today]);
  const graduate = useMemo(() => graduation(state, curriculum, today), [state, curriculum, today]);
  const unit = recommendation ? curriculum.byId.get(recommendation.unitId) : undefined;
  const detail = unit ? details[unit.id] : undefined;
  const derived = unit ? deriveProgress(state.units[unit.id], unit, today) : undefined;
  const actions = derived ? allowedActions(derived.stage, Boolean(derived.maintenanceDue && derived.maintenanceDue <= today)) : [];
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

  const submit = () => {
    if (!unit || !selectedAction) return;
    const event: EvidenceEvent = { action: selectedAction, date, note };
    if (needsEvidence) Object.assign(event, { artifact, independent, scores, evaluator, ...(selectedAction === "transfer" ? { context } : {}) });
    if (selectedAction === "fail") Object.assign(event, { evaluator, failureCategory });
    const result = recordEvidence(state, unit.id, event, curriculum, today);
    if (result.error) { setMessage(result.error); return; }
    onChange(result.state); setNote(""); setArtifact(""); setContext(""); setIndependent(false); setScores({});
    setMessage(`${unit.title}: ${selectedAction} evidence saved locally. ${evaluator === "SELF" ? "This is self-reported; Atlas has not inspected the external artifact." : `Evaluator type recorded: ${evaluator}. Atlas has not independently confirmed the claim.`}`);
  };

  const saveDiagnostic = () => {
    if (!diagnosticNote.trim()) { setMessage("Describe the diagnostic task and observed result. A score alone is not placement evidence."); return; }
    onChange({ ...state, diagnostic: [...state.diagnostic.filter(item => item.domain !== diagnosticDomain), { domain: diagnosticDomain, score: diagnosticScore, note: diagnosticNote.trim(), date: today }] });
    setMessage("Diagnostic placement saved. It changes recommendations only; it awards no progress or mastery.");
  };

  return <section id="command-centre" className="page-section command-centre" aria-labelledby="command-centre-title">
    <div className="section-kicker">v4 learner command centre · browser-local</div>
    <h2 id="command-centre-title" className="section-title">What should I do next?</h2>
    <p className="section-intro">Recommendations use prerequisites, repair, transfer, due retests, your selected route and available session time. Diagnostics may shorten instruction, but only recorded independent evidence can advance competence.</p>

    <div className="command-settings">
      <label>Learning route<select value={state.route} onChange={event => onChange({ ...state, route: event.target.value as LearningState["route"] })}>{learnerRoutes.map(route => <option key={route}>{route}</option>)}</select></label>
      <label>Session length<select value={state.preferences.sessionMinutes} onChange={event => onChange({ ...state, preferences: { ...state.preferences, sessionMinutes: Number(event.target.value) as 30 | 60 | 90 | 120 } })}><option value="30">30 minutes</option><option value="60">60 minutes</option><option value="90">90 minutes</option><option value="120">Deep session · 120 minutes</option></select></label>
      <label>Capstone pathway<select value={state.preferences.capstonePath || ""} onChange={event => onChange({ ...state, preferences: { ...state.preferences, capstonePath: event.target.value || undefined } })}><option value="">Choose later</option>{capstonePaths.map(path => <option key={path}>{path}</option>)}</select></label>
    </div>

    <div className="level-progress" aria-label="Five-level demonstrated and mastered progress">{levels.map(level => <article key={level}><span>{level}</span><strong>{Math.round(credits.byLevel[level].demonstrated / 60)}h demonstrated</strong><small>{Math.round(credits.byLevel[level].mastered / 60)}h mastered</small></article>)}</div>

    {unit && detail && recommendation && derived ? <div className="next-unit">
      <div className="next-unit-heading"><div><small>{detail.trackCode} · {detail.trackTitle}</small><h3>{unit.title}</h3></div><strong>{recommendation.minutes} min</strong></div>
      <p><b>Current evidence:</b> {derived.stage}. <b>Next:</b> {recommendation.action}</p>
      <p>{recommendation.reason}</p>
      <details><summary>Open the task and pass criterion</summary><p><b>Objective:</b> {detail.objective}</p><p><b>Guided work:</b> {detail.activity}</p><p><b>Independent check:</b> {detail.check}</p><p><b>Transfer:</b> {detail.transfer}</p><p><b>Pass only when:</b> {detail.passCriterion}</p></details>

      {actions.length ? <div className="unit-evidence" aria-labelledby="unit-evidence-title"><h4 id="unit-evidence-title">Record actual work</h4>
        <div className="evidence-form-row"><label>Evidence action<select value={selectedAction} onChange={event => setAction(event.target.value as EvidenceEvent["action"])}>{actions.filter(item => evidenceActions.includes(item)).map(item => <option key={item}>{item}</option>)}</select></label><label>Completion date<input type="date" max={today} value={date} onChange={event => setDate(event.target.value)} /></label></div>
        <label>What did you complete or what failed?<textarea value={note} onChange={event => setNote(event.target.value)} placeholder="Describe the observable result; planned work is not completion evidence." /></label>
        {needsEvidence ? <><label>Artifact reference<textarea value={artifact} onChange={event => setArtifact(event.target.value)} placeholder="Local filename, repository revision, document title or other inspectable reference—never a secret." /></label>
          {selectedAction === "transfer" ? <label>Materially different context<textarea value={context} onChange={event => setContext(event.target.value)} placeholder="What changed beyond names or presentation?" /></label> : null}
          <label className="independent-check"><input type="checkbox" checked={independent} onChange={event => setIndependent(event.target.checked)} /> I completed this assessment independently; any assistance is disclosed in the note.</label>
          <label>Evaluator type<select value={evaluator} onChange={event => setEvaluator(event.target.value as EvaluatorType)}>{evaluatorTypes.map(item => <option key={item}>{item}</option>)}</select></label>
          <div className="rubric-scores">{competencies.map(dimension => <label key={dimension}>{dimension}<select value={scores[dimension] ?? ""} onChange={event => setScores(current => ({ ...current, [dimension]: event.target.value === "" ? undefined : Number(event.target.value) }))}><option value="">Not scored</option>{competencyScale.map((label, score) => <option key={label} value={score}>{score} · {label}</option>)}</select></label>)}</div></> : null}
        {selectedAction === "fail" ? <label>Failure category<select value={failureCategory} onChange={event => setFailureCategory(event.target.value as FailureCategory)}>{failureCategories.map(item => <option key={item}>{item}</option>)}</select><small>Atlas will preserve this category so the next repair can stay narrow. It does not diagnose the artifact automatically.</small></label> : null}
        <button type="button" onClick={submit}>Save evidence step</button>
      </div> : <p className="waiting-note">No evidence action is currently due. A passed transfer becomes Retest Due only after its full delay.</p>}
    </div> : <div className="next-unit"><h3>All available units are waiting on evidence or prerequisites.</h3><p>Inspect Needs Repair, due retention work and prerequisite demonstrations before starting more content.</p></div>}

    <details className="diagnostic-panel"><summary>Experienced learner diagnostic placement</summary><p>Record a real challenge result. This affects instruction routing only and never marks a unit Demonstrated or Mastered.</p><div className="evidence-form-row"><label>Domain<select value={diagnosticDomain} onChange={event => setDiagnosticDomain(event.target.value)}>{domainOptions.map(domain => <option key={domain}>{domain}</option>)}</select></label><label>Observed score<select value={diagnosticScore} onChange={event => setDiagnosticScore(Number(event.target.value))}>{competencyScale.map((label, score) => <option key={label} value={score}>{score} · {label}</option>)}</select></label></div><label>Challenge and observed result<textarea value={diagnosticNote} onChange={event => setDiagnosticNote(event.target.value)} /></label><button type="button" onClick={saveDiagnostic}>Save placement only</button></details>
    <p className="command-message" role="status" aria-live="polite">{message}</p>
    <p className="graduation-note"><b>Graduation:</b> {graduate.achieved ? "Evidence requirements met in this browser." : `${graduate.unmet.length} units still require delayed mastery${graduate.capstonePathRequired ? "; choose one capstone path" : ""}.`} {graduate.note}</p>
  </section>;
}
