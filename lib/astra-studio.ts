import { addDays, localDate, validDate } from "./learning-state";

export const studioFields = [
  ["objective", "Objective", "What useful result should exist?"],
  ["context", "Relevant context", "Approved source pack, current state and missing information."],
  ["authority", "Scope and authority", "Allowed actions, exact targets and what needs separate approval."],
  ["constraints", "Constraints", "Audience, format, privacy, time and cost boundaries."],
  ["tools", "Tools and environment", "Only tools actually available; say when access is unverified."],
  ["evidence", "Evidence and verification", "Sources, expected behaviour, acceptance checks and independent review."],
  ["done", "Definition of done", "Deliverables and the observations that demonstrate completion."],
  ["stop", "Stopping conditions", "Missing authority, contradictory evidence, spending limit or unsafe target."],
] as const;
export type StudioField = typeof studioFields[number][0];
export const studioRubric = ["Goal and scope", "Factual accuracy", "Source discipline", "Instruction following", "Tool and permission discipline", "Deliverable verification"] as const;
export type StudioState = {
  version: 1; preset: string; fields: Record<StudioField, string>;
  result: string; productModel: string; runDate: string; repair: string; transfer: string;
  transferDate: string; retestDate: string; scores: Record<string, number | null>;
};
export const studioPresets = [
  { id: "research", title: "Evidence-backed research", objective: "Compare three approaches to reducing water waste in a fictional school garden.", context: "Use public sources. The garden size and local prices are unknown; label their effects as assumptions.", authority: "Read public sources and prepare a report. Do not contact vendors or make purchases.", evidence: "A claim-to-source table, opened primary sources, contrary evidence and uncertainty for each option.", done: "A concise comparison with a recommendation, a no-change option and a reversal condition.", transfer: "Investigate a different public infrastructure problem where the most recent source contradicts an older report." },
  { id: "forensic", title: "Forensic document analysis", objective: "Audit a synthetic meeting transcript for decisions, unresolved questions and unsupported conclusions.", context: "Fictional transcript: Mira proposes Friday; Dev says availability is unknown; Mira asks for a draft only. No final date or sending approval is recorded.", authority: "Analyse the supplied text only. Do not infer emotions or contact participants.", evidence: "For each conclusion, quote the short supporting passage or label the conclusion as an inference.", done: "A decision log that does not invent agreement, dates, intentions or completed actions.", transfer: "Audit a different transcript in which a later correction explicitly cancels an earlier decision." },
  { id: "website", title: "Website creation and verification", objective: "Build a public-safe workshop page with registration instructions and an accessible schedule.", context: "Use a disposable repository, synthetic event data and an existing design. Registration is a link, not a new data collection system.", authority: "Inspect and edit the named repository and test a local preview. Stop before public deployment.", evidence: "Review the diff; test links, keyboard use, 320px layout and the built page; record untested limits.", done: "Working local page, reproducible checks and a recoverable source revision, ready for publication review.", transfer: "Adapt the page for an event with long titles, no photographs and a changed registration route." },
  { id: "science", title: "Scientific learning and misconception repair", objective: "Help a learner distinguish amount of substance from concentration using a supplied syllabus extract.", context: "Use synthetic learner answers and the approved source. Require an unaided attempt before showing a solution.", authority: "Explain and generate practice. Do not award official examination marks or invent a marking scheme.", evidence: "Check terminology, units and calculations against the supplied source; diagnose the specific error.", done: "One marked attempt, a concise repair, an unseen transfer question and a delayed-retest prompt.", transfer: "Test the concept with a different solution volume and a dilution step without revealing the formula first." },
  { id: "accomplishments", title: "Study evidence to an accomplishments log", objective: "Turn synthetic study records into a factual weekly accomplishments log.", context: "Records: one paper scheduled, one script marked 12/20, one correction attempted and no delayed retest recorded.", authority: "Summarise only the supplied records; do not access calendars, email or private notebooks.", evidence: "Separate scheduled, attempted, marked, repaired and retained; cite the record supporting each status.", done: "A short log with verified outputs, one unresolved error and explicit unverified completion claims.", transfer: "Process records where a planned session was cancelled and a later fresh test shows the earlier repair did not hold." },
  { id: "connected", title: "Connected-application work", objective: "Prepare a plan for reconciling two synthetic project lists and drafting an update.", context: "One list has an older deadline and the other has a newer but unconfirmed edit. Account access is not assumed.", authority: "Read only explicitly supplied data. Draft proposed changes; do not write to connected accounts or send messages.", evidence: "Show conflicts, proposed targets, reversibility and the exact approval needed before each write.", done: "A reviewable reconciliation preview and draft message; actual account changes remain unperformed.", transfer: "Handle a duplicate trigger after the first approved write succeeds but its confirmation is lost." },
  { id: "debug", title: "Debugging a failing workflow", objective: "Repair a synthetic CSV summariser that treats missing readings as zero.", context: "Start from a reproducible failure in a disposable repository. Expected results must be calculated independently.", authority: "Inspect, edit the relevant parser and tests, and run local checks. Do not change dependencies or deploy without justification and authority.", evidence: "A failing-before/passing-after test, missing-versus-zero cases, inspected diff and rollback reference.", done: "The original defect is fixed, related regression checks pass and remaining uncertainty is documented.", transfer: "Repair a second parser with a different field name and decimal values without copying the first complete solution." },
  { id: "steering", title: "Mid-turn steering", objective: "Continue a fictional report task after its audience changes, preserving verified research.", context: "Completed: source inventory and checked calculations. Pending: narrative and layout. New requirement: an accessible one-page handout for beginners.", authority: "Preserve accepted sources and calculations; revise only the pending narrative and layout. No external publication.", evidence: "Show retained work, superseded requirements, remaining checks and why no completed action was repeated.", done: "A revised handout and change log tied to the original evidence; no restart or duplicate external action.", transfer: "Handle a replacement request rather than an additive change, explicitly identifying which earlier work is now out of scope." },
] as const;

export function newStudioState(): StudioState {
  return { version: 1, preset: "research", fields: Object.fromEntries(studioFields.map(([id]) => [id, ""])) as Record<StudioField, string>, result: "", productModel: "", runDate: "", repair: "", transfer: "", transferDate: "", retestDate: "", scores: {} };
}
export function applyStudioPreset(id: string): StudioState {
  const preset = studioPresets.find(item => item.id === id) || studioPresets[0];
  return { ...newStudioState(), preset: preset.id, fields: { objective: preset.objective, context: preset.context, authority: preset.authority, constraints: "Use public or synthetic data. Prefer the smallest useful solution. Keep claims proportionate to evidence.", tools: "Check the chosen product's actual tool access before relying on it.", evidence: preset.evidence, done: preset.done, stop: "Stop before an unapproved consequential action, an unsafe target or a material unresolved source conflict." } };
}
export const composeStudioPrompt = (state: StudioState) => studioFields.filter(([id]) => state.fields[id].trim()).map(([id, title]) => `${title.toUpperCase()}\n${state.fields[id].trim()}`).join("\n\n");
export function studioReadiness(state: StudioState, today = localDate()) {
  const missing = studioFields.filter(([id]) => !state.fields[id].trim()).map(([, title]) => title);
  const assessed = studioRubric.every(label => Number.isInteger(state.scores[label]) && Number(state.scores[label]) >= 3);
  const validRun = Boolean(state.result.trim() && state.productModel.trim() && validDate(state.runDate) && state.runDate <= today);
  const earliestRetest = validRun && state.transfer.trim() && validDate(state.transferDate) && state.transferDate >= state.runDate && state.transferDate <= today ? addDays(state.transferDate, 7) : undefined;
  const validRetest = Boolean(earliestRetest && validDate(state.retestDate) && state.retestDate >= earliestRetest);
  return { missing, assessed, validRun, earliestRetest, validRetest, notice: "Completeness is a writing check, not evidence that this prompt will succeed. Studio notes do not award mastery." };
}
export function sanitizeStudioState(raw: unknown): StudioState {
  const result = newStudioState();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return result;
  const value = raw as Record<string, unknown>;
  const clean = (input: unknown) => typeof input === "string" ? input.slice(0, 6000) : "";
  if (studioPresets.some(item => item.id === value.preset)) result.preset = String(value.preset);
  if (value.fields && typeof value.fields === "object" && !Array.isArray(value.fields)) for (const [id] of studioFields) result.fields[id] = clean((value.fields as Record<string, unknown>)[id]);
  for (const id of ["result", "productModel", "repair", "transfer"] as const) result[id] = clean(value[id]);
  for (const id of ["runDate", "transferDate", "retestDate"] as const) if (validDate(value[id])) result[id] = value[id];
  if (value.scores && typeof value.scores === "object" && !Array.isArray(value.scores)) for (const label of studioRubric) {
    const score = (value.scores as Record<string, unknown>)[label];
    result.scores[label] = typeof score === "number" && Number.isInteger(score) && score >= 0 && score <= 4 ? score : null;
  }
  return result;
}

export const steeringExamples = {
  Add: ["Initial request: prepare a research brief", "Completed: source inventory checked", "Active tool: fetch one remaining report", "User addition: include a limitations paragraph", "Preserve: all accepted sources and calculations", "Revised result: same brief plus limitations"],
  Correct: ["Initial request: analyse a sample dataset", "Completed: raw-file inventory", "Active tool: calculating draft summaries", "User correction: exclude the duplicate batch", "Preserve: raw files; recompute affected summaries", "Revised result: corrected totals with a change log"],
  Replace: ["Initial request: prepare a slide deck", "Completed: public-source research", "Active tool: rendering draft slides", "User replacement: produce a one-page memo instead", "Preserve: reusable evidence; cancel obsolete rendering when safe", "Revised result: memo; no claim that the abandoned deck is complete"],
  Status: ["Initial request: debug a local application", "Completed: failure reproduced", "Active tool: regression test running", "User question: what is the current status?", "Preserve: task scope and completed patch", "Revised result: factual status update, then continued verification"],
} as const;
