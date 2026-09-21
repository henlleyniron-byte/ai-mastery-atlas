"use client";

import { type Dispatch, type SetStateAction, useMemo } from "react";
import { ArrowRight, CheckCircle2, ExternalLink, FlaskConical, HardDrive, ShieldCheck, Sparkles } from "lucide-react";
import type { GeminiLabState, StageEvidence } from "@/lib/v5-state";


const stages = [
  ["G0", "Plan & access audit", "Confirm what Google AI Pro actually exposes in your account and region before designing a workflow around it.", "A dated benefit inventory with available, unavailable and region-limited items."],
  ["G1", "Gemini fundamentals", "Use the Gemini app deliberately: define the outcome, provide decisive context, select an appropriate mode and inspect uncertainty.", "A corrected output with the original prompt, critique and revision."],
  ["G2", "Prompt & context engineering", "Freeze success criteria, structure large context and compare model or mode choices on the same test cases.", "A reusable specification and scored test set."],
  ["G3", "Files, images, audio & video", "Reason across mixed media while separating observation, inference and unsupported detail.", "A multimodal analysis with claim-level verification."],
  ["G4", "Gems", "Create a focused custom expert with bounded instructions, examples and explicit failure behaviour.", "A Gem specification, adversarial cases and revised instructions."],
  ["G5", "Deep Research", "Edit the research plan, inspect source coverage, audit citations and repair omissions before trusting the synthesis.", "A source ledger, contradiction pass and corrected report."],
  ["G6", "Gemini in Workspace", "Use Gemini in Gmail, Docs, Sheets and Drive without surrendering authorship, privacy or final review.", "A completed workflow with before/after evidence and a privacy note."],
  ["G7", "Gemini Notebook", "Build a source-grounded notebook, test corpus gaps and distinguish evidence from fluent extrapolation.", "A notebook source map, citation audit and transfer quiz."],
  ["G8", "Learning & examination support", "Convert syllabus material into explanations, retrieval prompts, error diagnosis and transfer questions without replacing first attempts.", "An attempt-to-retest learning cycle with score change."],
  ["G9", "Creative media", "Direct image, audio or video work through a clear brief, references, evaluation, editing and provenance record.", "A refined asset plus prompt log, human edits and disclosure."],
  ["G10", "Google AI Studio", "Prototype prompts and model settings with fixtures, structured evaluation and explicit cost or quota assumptions.", "A reproducible AI Studio experiment with failure cases."],
  ["G11", "Gemini API builder lane", "Build a typed workflow using structured output or tools, input validation, bounded retries and observability.", "A functioning workflow with tests, budget ceiling and fallback."],
  ["G12", "Gemini CLI, Jules & Antigravity", "Route repository work to the available Google coding surface, constrain authority and verify every change independently.", "A reviewed diff, passing tests, recovery point and access note."],
  ["G13", "Tri-frontier comparative mastery", "Run one frozen task through ChatGPT, Claude and Gemini, then route future work from evidence rather than provider loyalty.", "A completed three-system Sparring Arena and conditional routing rule."],
  ["G14", "Gemini capstone", "Complete one unfamiliar outcome spanning research, Workspace or building, verification, handover and delayed transfer.", "A portfolio artifact, failure log, transfer result and delayed retest."],
] as const;

const benefits = [
  ["pro_models", "Gemini Pro + Deep Research", "Expanded access; use for genuinely demanding reasoning and research, then audit sources."],
  ["context", "One-million-token context", "Available according to the current plan table; test retrieval quality rather than equating capacity with recall."],
  ["workspace", "Gemini in Google apps", "Use Docs and Sheets for production workflows; Gmail and other features can vary by country."],
  ["notebook", "Gemini Notebook", "Expanded limits for source-grounded notebooks, study outputs and audio overviews."],
  ["studio", "AI Studio, Antigravity & Jules", "Expanded limits for prototyping and coding; availability and quotas remain product-specific."],
  ["creative", "Flow + media generation", "The current plan table lists 1,000 Flow credits monthly plus expanded media access."],
  ["storage", "5 TB cloud storage", "Use a governed archive structure; storage capacity is not an information architecture."],
  ["cloud", "$10 monthly Cloud credits", "A current listed developer benefit; verify enrolment and expiry before relying on it."],
] as const;

const sources = [
  ["Google AI plan comparison", "https://one.google.com/about/google-ai-plans/"],
  ["Google AI Pro benefits", "https://support.google.com/googleone/answer/14534406"],
  ["Gemini Deep Research", "https://support.google.com/gemini/answer/15719111"],
  ["Google Workspace connection", "https://support.google.com/gemini/answer/15229592"],
  ["Gemini Gems", "https://gemini.google/gems/"],
  ["Gemini API models", "https://ai.google.dev/gemini-api/docs/models"],
  ["Structured output", "https://ai.google.dev/gemini-api/docs/structured-output"],
  ["Gemini CLI", "https://geminicli.com/docs/"],
] as const;

const derived = (e: StageEvidence | undefined) => {
  if (!e?.artifact?.trim()) return "Learning";
  if (!e.transfer?.trim()) return "Demonstrated";
  if (!e.retestDue) return "Transferred";
  if (!e.retest?.trim()) return new Date(`${e.retestDue}T00:00:00`) <= new Date() ? "Retest Due" : "Transferred";
  return new Date(`${e.retestDue}T00:00:00`) <= new Date() ? "Retained" : "Transferred";
};

export function GeminiMastery({ state, setState }: { state: GeminiLabState; setState: Dispatch<SetStateAction<GeminiLabState>> }) {
  const updateStage = (id: string, patch: Partial<StageEvidence>) => setState(current => ({ ...current, stages: { ...current.stages, [id]: { ...current.stages[id], ...patch } } }));
  const toggleBenefit = (id: string) => setState(current => ({ ...current, planAudit: { ...current.planAudit, [id]: !current.planAudit[id] } }));
  const demonstrated = useMemo(() => stages.filter(([id]) => ["Demonstrated", "Transferred", "Retest Due", "Retained"].includes(derived(state.stages[id]))).length, [state.stages]);
  const transferred = useMemo(() => stages.filter(([id]) => ["Transferred", "Retest Due", "Retained"].includes(derived(state.stages[id]))).length, [state.stages]);
  const retained = useMemo(() => stages.filter(([id]) => derived(state.stages[id]) === "Retained").length, [state.stages]);
  const verifiedBenefits = benefits.filter(([id]) => state.planAudit[id]).length;

  return <section className="page-section gemini-zone" aria-labelledby="gemini-title">
    <div className="gemini-heading">
      <div><div className="section-kicker">Gemini Mastery · public capability pathway</div><h2 id="gemini-title" className="section-title">Use the ecosystem. Preserve epistemic control.</h2><p className="section-intro">Fifteen evidence stages integrate Gemini into the existing 500-hour programme. Product access can expand options, but it never grants mastery. Progress still requires an artifact, a novel transfer and a delayed retest.</p></div>
      <div className="gemini-passport" aria-label="Gemini capability passport"><span>Capability passport</span><strong>{demonstrated}/15 demonstrated</strong><small>{transferred} transferred · {retained} retained</small><div className="passport-meter"><i style={{ width: `${Math.round(retained / stages.length * 100)}%` }} /></div><small>Retained evidence only; usage, storage and subscription status earn no mastery credit.</small></div>
    </div>

    <div className="pro-plan-console">
      <div className="plan-console-heading"><Sparkles /><div><div className="section-kicker">Public plan-access audit template</div><h3>{verifiedBenefits}/8 capabilities observed locally</h3><p>Tick a capability only after you can open it in your own account; country, language, age, device, plan and rollout restrictions can differ. No plan identity, billing or entitlement value is embedded in the public Atlas.</p></div></div>
      <div className="benefit-grid">{benefits.map(([id, title, detail]) => <label key={id} className={state.planAudit[id] ? "benefit-card verified" : "benefit-card"}><input type="checkbox" checked={Boolean(state.planAudit[id])} onChange={() => toggleBenefit(id)} /><span><strong>{title}</strong><small>{detail}</small></span></label>)}</div>
      <p className="volatile-note"><ShieldCheck /> Benefits and limits were checked against Google’s official plan register on 8 September 2026. Recheck before committing money, quotas or a consequential workflow.</p>
    </div>

    <div className="gemini-route-grid">
      <article><span>Study</span><h3>First attempt → Gemini repair</h3><p>Attempt independently, diagnose the exact error, request a targeted explanation, generate a transfer question and retest later.</p></article>
      <article><span>Research</span><h3>Deep Research → citation audit</h3><p>Edit the plan, inspect source classes, challenge omissions, verify decisive claims and export only after correction.</p></article>
      <article><span>Workspace</span><h3>Drive corpus → Docs/Sheets output</h3><p>Use connected context minimally, keep a canonical file, review every external communication and avoid broad data exposure.</p></article>
      <article><span>Build</span><h3>AI Studio → tested workflow</h3><p>Prototype with fixtures, select the narrowest model, constrain outputs, log failure and graduate to code only when useful.</p></article>
      <article><span>Create</span><h3>Brief → generate → edit</h3><p>Use references and a rubric, preserve provenance, make human edits and disclose synthetic media where appropriate.</p></article>
    </div>

    <div className="gemini-stage-grid">{stages.map(([id, title, objective, evidence]) => { const item = state.stages[id] || {}; const status = derived(item); return <details className="gemini-stage" key={id}><summary><span>{id}</span><div><strong>{title}</strong><small>{status}</small></div><ArrowRight /></summary><div className="gemini-stage-body"><p>{objective}</p><p><b>Pass evidence:</b> {evidence}</p><label>Artifact / result reference<textarea value={item.artifact || ""} onChange={event => updateStage(id, { artifact: event.target.value })} placeholder="What inspectable result met the pass condition?" /></label><label>Novel transfer evidence<textarea value={item.transfer || ""} onChange={event => updateStage(id, { transfer: event.target.value })} placeholder="What materially changed, and what still worked?" /></label><div className="retest-row"><label>Retest due<input type="date" value={item.retestDue || ""} onChange={event => updateStage(id, { retestDue: event.target.value })} /></label><label>Retest result<input value={item.retest || ""} onChange={event => updateStage(id, { retest: event.target.value })} placeholder="Fresh task and observed result" /></label></div></div></details>; })}</div>

    <div className="gemini-labs">
      <article><FlaskConical /><h3>Pro Plan Audit Lab</h3><p>Verify every visible benefit, quota surface, storage amount and regional limitation in your own account. Convert only useful access into a monthly operating plan.</p><b>Evidence: screenshots or references, availability table, quota notes and a cancellation/renewal date.</b></article>
      <article><FlaskConical /><h3>A/L Evidence Tutor Lab</h3><p>Start from one closed-book Biology, Chemistry or Physics attempt. Use Gemini only for diagnosis and repair, then answer a novel transfer question without assistance.</p><b>Evidence: first attempt, error cause, repair, transfer score and delayed retest.</b></article>
      <article><FlaskConical /><h3>Deep Research Tribunal</h3><p>Run a consequential research question, then prosecute the report: missing perspectives, weak source classes, broken claim support, contradictions and temporal drift.</p><b>Evidence: research plan, source ledger, claim audit and corrected conclusion.</b></article>
      <article><HardDrive /><h3>5 TB Knowledge Vault Lab</h3><p>Design Drive around active work, canonical resources, evidence and archive zones. Test naming, deduplication, permissions, retrieval and export before scaling.</p><b>Evidence: architecture map, retrieval test, duplicate policy and restore proof.</b></article>
      <article><FlaskConical /><h3>Google Builder Capstone</h3><p>Use AI Studio, Gemini API, Gemini CLI, Jules or Antigravity—whichever is genuinely available—to build one bounded workflow with tests and recovery.</p><b>Evidence: working artifact, reviewed diff, limits, failures, transfer task and handover.</b></article>
    </div>

    <div className="gemini-sources"><div><div className="section-kicker">Google canonical source shelf</div><h2>Verify access. Then operationalise it.</h2><p>These first-party pages anchor product and plan claims. The capability passport requires observed results, not feature announcements.</p></div><div>{sources.map(([title, url]) => <a href={url} target="_blank" rel="noreferrer" key={url}><span>A · Canonical</span><strong>{title}</strong><ExternalLink /></a>)}</div></div>
    <p className="gemini-close"><CheckCircle2 /> Gemini evidence is included in the unified browser-local V5 export. Legacy V4.2 records migrate without awarding mastery.</p>
  </section>;
}
