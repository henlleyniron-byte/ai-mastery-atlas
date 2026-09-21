"use client";

import { useRef, useState } from "react";
import { applyStudioPreset, composeStudioPrompt, newStudioState, steeringExamples, studioFields, studioPresets, studioReadiness, studioRubric, type StudioState } from "@/lib/astra-studio";
import { localDate } from "@/lib/learning-state";

export function AstraStudio({ value, onChange }: { value: StudioState; onChange: (state: StudioState) => void }) {
  const [message, setMessage] = useState("");
  const [steer, setSteer] = useState<keyof typeof steeringExamples>("Add");
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const prompt = composeStudioPrompt(value);
  const readiness = studioReadiness(value);
  const selected = studioPresets.find(preset => preset.id === value.preset) || studioPresets[0];
  const patch = (changes: Partial<StudioState>) => onChange({ ...value, ...changes });
  const copy = async () => {
    try { await navigator.clipboard.writeText(prompt); setMessage("Prompt copied. Run it in an authorised interface; this Studio has not executed it."); }
    catch { promptRef.current?.focus(); promptRef.current?.select(); setMessage("Clipboard access was unavailable. The prompt is selected; use your device's Copy command."); }
  };
  const download = () => {
    const payload = { kind: "atlas-astra-studio", exportedAt: new Date().toISOString(), evidence: "Self-reported; no model execution or artifact inspection occurs in this Studio.", studio: value, prompt };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "astra-practice-studio.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Studio draft and self-reported results exported. The Atlas progress export also includes these notes.");
  };
  const loadPreset = () => {
    if ((prompt || value.result) && !window.confirm("Replace this Studio draft and its result notes with the selected synthetic example? Export first if you want to keep them.")) return;
    onChange(applyStudioPreset(value.preset)); setMessage("Synthetic example loaded. Adapt it to your actual task and authority before use.");
  };

  return <article className="operator-block astra-studio" id="astra-studio" aria-labelledby="astra-studio-title">
    <div className="section-kicker">Practice workspace · runs entirely in this browser</div>
    <h3 id="astra-studio-title">Astra Practice Studio</h3>
    <p>Compose a request, run it in an authorised interface, then record what actually happened. No API key is needed here; this page does not call Astra, inspect your artifacts or award mastery. Use synthetic or redacted data. Browser storage and exported files are not a secure vault.</p>
    <div className="studio-toolbar">
      <label htmlFor="studio-preset">Task type<select id="studio-preset" value={value.preset} onChange={event => patch({ preset: event.target.value })}>{studioPresets.map(preset => <option value={preset.id} key={preset.id}>{preset.title}</option>)}</select></label>
      <button type="button" className="astra-download" onClick={loadPreset}>Load synthetic example</button>
    </div>
    <div className="studio-fields">{studioFields.map(([id, label, help]) => <label htmlFor={`studio-${id}`} key={id}>{label}<small>{help}</small><textarea id={`studio-${id}`} maxLength={6000} rows={3} value={value.fields[id]} onChange={event => patch({ fields: { ...value.fields, [id]: event.target.value } })} /></label>)}</div>
    <div className="studio-checklist" aria-live="polite"><strong>Draft completeness</strong><p>{readiness.missing.length ? `Still unspecified: ${readiness.missing.join(", ")}.` : "All eight request fields are present."} {readiness.notice}</p></div>
    <label className="studio-output" htmlFor="studio-prompt">Composed prompt<textarea ref={promptRef} id="studio-prompt" value={prompt} readOnly rows={8} /></label>
    <div className="studio-toolbar"><button type="button" className="astra-download" onClick={copy} disabled={!prompt}>Copy prompt</button><button type="button" className="astra-download" onClick={download}>Export Studio draft and results</button><button type="button" className="astra-download" onClick={() => { if (window.confirm("Clear this Studio draft and result notes? This does not reset curriculum progress.")) { onChange(newStudioState()); setMessage("Studio cleared. Curriculum evidence was not changed."); } }}>Clear Studio</button></div>
    <p className="studio-message" role="status">{message}</p>
    <details className="astra-detail"><summary>Record the external result, assess it and plan repair</summary>
      <div className="studio-fields">
        <label htmlFor="studio-product">Product, model and mode actually used<input id="studio-product" value={value.productModel} maxLength={6000} onChange={event => patch({ productModel: event.target.value })} placeholder="Copy the observed selector label; do not guess" /></label>
        <label htmlFor="studio-run-date">Actual run date<input id="studio-run-date" type="date" max={localDate()} value={value.runDate} onChange={event => patch({ runDate: event.target.value })} /></label>
        <label className="studio-wide" htmlFor="studio-result">Observed result and artifact reference<textarea id="studio-result" rows={4} maxLength={6000} value={value.result} onChange={event => patch({ result: event.target.value })} placeholder="What ran, what passed, what failed, and where you kept the artifact. Do not paste sensitive content." /></label>
      </div>
      <fieldset className="studio-rubric"><legend>Self-evaluation · 0 unable · 1 heavily assisted · 2 partly independent · 3 independent · 4 robust and transferable</legend>{studioRubric.map((label, index) => <label key={label} htmlFor={`studio-score-${index}`}>{label}<select id={`studio-score-${index}`} value={value.scores[label] ?? ""} onChange={event => patch({ scores: { ...value.scores, [label]: event.target.value === "" ? null : Number(event.target.value) } })}><option value="">Not assessed</option>{[0, 1, 2, 3, 4].map(score => <option value={score} key={score}>{score}</option>)}</select></label>)}</fieldset>
      <p>{!readiness.validRun ? "No complete run record yet. Missing evidence stays unverified." : readiness.assessed ? "Your reported rubric meets the independent threshold. Verify the artifact and record the relevant curriculum assessment separately." : "Some criteria are unassessed or below the independent threshold. Repair the specific failure before claiming success."}</p>
      <div className="studio-fields"><label className="studio-wide" htmlFor="studio-repair">Smallest corrective action<textarea id="studio-repair" rows={3} maxLength={6000} value={value.repair} onChange={event => patch({ repair: event.target.value })} placeholder="Failure → cause supported by evidence → one change → fresh verification" /></label>
        <div className="studio-wide"><strong>Fresh transfer challenge</strong><p>{selected.transfer}</p></div>
        <label className="studio-wide" htmlFor="studio-transfer">Transfer result and what materially changed<textarea id="studio-transfer" rows={3} maxLength={6000} value={value.transfer} onChange={event => patch({ transfer: event.target.value })} /></label>
        <label htmlFor="studio-transfer-date">Transfer completion date<input id="studio-transfer-date" type="date" max={localDate()} value={value.transferDate} onChange={event => patch({ transferDate: event.target.value })} /></label>
        <label htmlFor="studio-retest-date">Planned delayed retest<input id="studio-retest-date" type="date" min={readiness.earliestRetest} value={value.retestDate} onChange={event => patch({ retestDate: event.target.value })} /></label>
      </div>
      <p>{readiness.earliestRetest ? `Use an unseen task on or after ${readiness.earliestRetest}, without the previous output. ${value.retestDate && !readiness.validRetest ? "The selected date is too early for the seven-day retention check." : "A planned date is not a passed retest."}` : "Record a completed transfer before scheduling its delayed-retention check."}</p>
    </details>
    <details className="astra-detail"><summary>Steering timeline: preserve work while the request changes</summary>
      <p>Explanatory interaction only. Selecting a case changes this diagram; it does not steer a running model.</p>
      <div className="variant-tabs" role="group" aria-label="Steering example">{(Object.keys(steeringExamples) as (keyof typeof steeringExamples)[]).map(key => <button key={key} type="button" aria-pressed={steer === key} className={steer === key ? "active" : ""} onClick={() => setSteer(key)}>{key}</button>)}</div>
      <ol className="studio-timeline">{steeringExamples[steer].map(step => <li key={step}>{step}</li>)}</ol>
      <p>For a priority override, say what now takes precedence; for a scope reduction, identify work to stop and evidence to keep. A status question alone should not silently replace the task.</p>
    </details>
  </article>;
}
