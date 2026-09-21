"use client";

import { type Dispatch, type SetStateAction, useMemo } from "react";
import { ArrowRight, CheckCircle2, ExternalLink, FlaskConical, GitCompareArrows, ShieldCheck } from "lucide-react";
import type { ClaudeLabState, StageEvidence } from "@/lib/v5-state";


const stages = [
  ["C0", "Ecosystem orientation", "Route a fixed task across the current Claude families using quality, latency, access and cost constraints.", "A dated model-routing decision with an official-source link."],
  ["C1", "Claude.ai fundamentals", "Prompt clearly, manage context, work with files and expose uncertainty rather than polishing guesses.", "A corrected file-based output with a claim check."],
  ["C2", "Prompt & context engineering", "Define success criteria, supply only decisive context and evaluate a frozen test set.", "A reproducible specification and scored cases."],
  ["C3", "Projects & knowledge", "Build reusable instructions and knowledge that another learner can operate consistently.", "A Project Architect handover and reproduction result."],
  ["C4", "Artifacts", "Produce, revise and validate a useful artifact while separating interface polish from correctness.", "An artifact plus accessibility and accuracy checks."],
  ["C5", "Research & long context", "Inventory sources, test omissions, verify citations and state uncertainty across long documents.", "A source ledger, discrepancy report and corrected synthesis."],
  ["C6", "Claude Code foundations", "Inspect a repository, define acceptance criteria, plan, edit narrowly and verify independently.", "A diff, command log and passing test evidence."],
  ["C7", "Claude Code advanced workflows", "Use checkpoints, context control, review, background work and parallelism only when the task earns them.", "A recoverable multi-step change with adversarial review."],
  ["C8", "CLAUDE.md, Skills & hooks", "Separate durable facts, on-demand procedures and deterministic lifecycle controls.", "A tested configuration whose failure behavior is documented."],
  ["C9", "MCP, connectors & access", "Grant the narrowest tool/data access and treat returned content as untrusted input.", "A harmless call trace plus denied over-broad request."],
  ["C10", "Agent operation & delegation", "Turn a prompt into a bounded outcome with acceptance criteria, authority limits, monitoring and proof.", "A delegation map and completion evidence."],
  ["C11", "API & Agent SDK builder lane", "Build a small typed workflow with tool use, structured output, evaluation and budget limits.", "A functioning workflow with fixtures and failure cases."],
  ["C12", "Scientific & research workflows", "Synthesize literature reproducibly, audit citations and preserve expert judgment in consequential domains.", "An auditable synthesis with uncertainty and integrity notes."],
  ["C13", "Tri-frontier comparative mastery", "Run the same task, inputs and rubric through ChatGPT, Claude and Gemini; route from evidence, not loyalty.", "A completed three-system Sparring Arena record and routing rule."],
  ["C14", "Claude capstone", "Complete an unfamiliar bounded outcome spanning configuration, execution, verification and handover.", "A portfolio artifact, failure log, transfer and delayed retest."],
] as const;

const models = [
  ["Fable 5.1", "Demanding reasoning and long-horizon agentic work", "Slower · highest listed API cost", "Current"],
  ["Opus 5", "Complex agentic coding and enterprise work", "Moderate latency · premium cost", "Current"],
  ["Sonnet 5", "Everyday work where speed and capability must balance", "Fast · cost-efficient", "Current"],
  ["Haiku 4.5", "High-volume, latency-sensitive or lower-cost work", "Fastest · smallest current context", "Current"],
] as const;

const sources = [
  ["Models overview", "https://platform.claude.com/docs/en/models/overview", "A · Canonical"],
  ["Claude Code overview", "https://code.claude.com/docs/en/overview", "A · Canonical"],
  ["Claude Code best practices", "https://code.claude.com/docs/en/best-practices", "A · Canonical"],
  ["Projects", "https://support.claude.com/en/articles/9517075-what-are-projects", "A · Canonical"],
  ["Artifacts", "https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them", "A · Canonical"],
  ["Skills", "https://code.claude.com/docs/en/skills", "A · Canonical"],
  ["MCP", "https://code.claude.com/docs/en/mcp", "A · Canonical"],
  ["Agent SDK", "https://code.claude.com/docs/en/agent-sdk/overview", "A · Canonical"],
] as const;
const criteria = ["Accuracy", "Instruction adherence", "Citation integrity", "Context handling", "Writing", "Tool use", "Coding", "Speed", "Low correction", "Reproducibility"];

const derived = (e: StageEvidence | undefined) => {
  if (!e?.artifact?.trim()) return "Learning";
  if (!e.transfer?.trim()) return "Demonstrated";
  if (!e.retestDue) return "Transferred";
  if (!e.retest?.trim()) return new Date(`${e.retestDue}T00:00:00`) <= new Date() ? "Retest Due" : "Transferred";
  return new Date(`${e.retestDue}T00:00:00`) <= new Date() ? "Retained" : "Transferred";
};

export function ClaudeMastery({ state, setState }: { state: ClaudeLabState; setState: Dispatch<SetStateAction<ClaudeLabState>> }) {
  const updateStage = (id: string, patch: Partial<StageEvidence>) => setState(current => ({ ...current, stages: { ...current.stages, [id]: { ...current.stages[id], ...patch } } }));
  const setArena = (key: string, value: string | number) => setState(current => ({ ...current, arena: { ...current.arena, [key]: value } }));
  const demonstrated = useMemo(() => stages.filter(([id]) => ["Demonstrated", "Transferred", "Retest Due", "Retained"].includes(derived(state.stages[id]))).length, [state.stages]);
  const transferred = useMemo(() => stages.filter(([id]) => ["Transferred", "Retest Due", "Retained"].includes(derived(state.stages[id]))).length, [state.stages]);
  const retained = useMemo(() => stages.filter(([id]) => derived(state.stages[id]) === "Retained").length, [state.stages]);

  return <section className="page-section claude-zone" aria-labelledby="claude-title">
    <div className="claude-heading"><div><div className="section-kicker">Claude Mastery · first-class pathway</div><h2 id="claude-title" className="section-title">Operate the ecosystem. Prove the capability.</h2><p className="section-intro">Fifteen stages thread through the Atlas’s existing 500 hours; they do not add double-counted time. A stage advances only from an artifact, a materially different transfer, and a due delayed retest.</p></div><div className="claude-passport" aria-label="Claude capability passport"><span>Capability passport</span><strong>{demonstrated}/15 demonstrated</strong><small>{transferred} transferred · {retained} retained</small><div className="passport-meter"><i style={{ width: `${Math.round(retained / stages.length * 100)}%` }} /></div><small>Percentage reflects retained evidence only—not videos, clicks or time.</small></div></div>
    <div className="model-router"><div><span>Current model router</span><small>Official Anthropic model register · verified 8 September 2026</small></div>{models.map(([name, fit, tradeoff, status]) => <article key={name}><div><h3>{name}</h3><b>{status}</b></div><p>{fit}</p><small>{tradeoff}</small></article>)}</div>
    <p className="volatile-note"><ShieldCheck /> Model names, pricing, availability and limits are volatile. Re-open the official model page before a consequential choice; never default to the largest model without task evidence.</p>
    <div className="claude-stage-grid">{stages.map(([id, title, objective, evidence]) => { const item = state.stages[id] || {}; const status = derived(item); return <details className="claude-stage" key={id}><summary><span>{id}</span><div><strong>{title}</strong><small>{status}</small></div><ArrowRight /></summary><div className="claude-stage-body"><p>{objective}</p><p><b>Pass evidence:</b> {evidence}</p><label>Artifact / result reference<textarea value={item.artifact || ""} onChange={event => updateStage(id, { artifact: event.target.value })} placeholder="What inspectable result met the pass condition?" /></label><label>Novel transfer evidence<textarea value={item.transfer || ""} onChange={event => updateStage(id, { transfer: event.target.value })} placeholder="What materially changed, and what still worked?" /></label><div className="retest-row"><label>Retest due<input type="date" value={item.retestDue || ""} onChange={event => updateStage(id, { retestDue: event.target.value })} /></label><label>Retest result<input value={item.retest || ""} onChange={event => updateStage(id, { retest: event.target.value })} placeholder="Fresh task and observed result" /></label></div></div></details>; })}</div>
    <div className="claude-labs"><article><FlaskConical /><h3>Project Architect Lab</h3><p>Configure a Claude Project from messy files, examples and constraints. Another learner must reproduce the intended output without private coaching.</p><b>Evidence: exported instructions, source inventory, reproduction notes and failure repair.</b></article><article><FlaskConical /><h3>Autonomous Repair Lab</h3><p>Inspect a broken repository, freeze acceptance criteria, plan, repair, test, review the diff and document what required human correction.</p><b>Evidence: commit/diff, test output, decision log, transfer repository and delayed retest.</b></article><article><FlaskConical /><h3>Scientific Explanation Skill</h3><p>Create a focused <code>SKILL.md</code> with optional references/scripts for precise explanations, misconceptions, MCQs, marking guidance and transfer questions.</p><b>Score: reusability, reliability, clarity, portability and failure handling.</b></article><article><FlaskConical /><h3>Builder Capstone</h3><p>Build one bounded Claude-powered workflow with typed inputs, structured outputs, tool limits, fixtures, evaluation evidence and a human escalation path.</p><b>Ordinary operators may skip this builder lane without losing operator mastery.</b></article></div>
    <div className="how-access"><div><b>CLAUDE</b><small>reasoning engine</small></div><ArrowRight /><div><b>SKILL = HOW</b><small>on-demand procedure</small></div><ArrowRight /><div><b>MCP / CONNECTOR = ACCESS</b><small>external tools and data</small></div><ArrowRight /><div><b>PLUGIN = PACKAGE</b><small>skills, hooks, agents and MCP together</small></div></div><p className="diagram-note"><code>CLAUDE.md</code> stores concise, always-relevant project instructions. Skills load procedures when relevant. Hooks enforce lifecycle actions. MCP/connectors expose capabilities; none of these grants trust automatically.</p>
    <div className="sparring-arena"><div className="arena-intro"><GitCompareArrows /><div><div className="section-kicker">Tri-Frontier Sparring Arena</div><h2>Same task. Same evidence. No tribalism.</h2></div></div><div className="arena-prompts"><label>Frozen task and inputs<textarea value={String(state.arena.task || "")} onChange={event => setArena("task", event.target.value)} placeholder="Paste the exact task, inputs and constraints used in all three systems." /></label><label>Frozen pass criteria<textarea value={String(state.arena.criteria || "")} onChange={event => setArena("criteria", event.target.value)} placeholder="Define success before seeing any answer." /></label></div><div className="arena-table tri-arena-table" role="table" aria-label="ChatGPT, Claude and Gemini comparison rubric"><div role="row" className="arena-row arena-head"><b>Criterion</b><b>ChatGPT · 0–4</b><b>Claude · 0–4</b><b>Gemini · 0–4</b></div>{criteria.map((criterion, index) => <div role="row" className="arena-row" key={criterion}><span>{criterion}</span><input aria-label={`${criterion} ChatGPT score`} type="number" min="0" max="4" value={state.arena[`g${index}`] ?? ""} onChange={event => setArena(`g${index}`, event.target.value)} /><input aria-label={`${criterion} Claude score`} type="number" min="0" max="4" value={state.arena[`c${index}`] ?? ""} onChange={event => setArena(`c${index}`, event.target.value)} /><input aria-label={`${criterion} Gemini score`} type="number" min="0" max="4" value={state.arena[`m${index}`] ?? ""} onChange={event => setArena(`m${index}`, event.target.value)} /></div>)}</div><label>Which system would you route a similar task to next time, and why?<textarea value={String(state.arena.route || "")} onChange={event => setArena("route", event.target.value)} placeholder="Name the evidence, correction burden, limits and conditions—not a universal winner." /></label><p><CheckCircle2 /> Results remain in this browser. Scores are observations from this frozen task, not claims about every model or future version.</p></div>
    <div className="claude-sources"><div><div className="section-kicker">Canonical source shelf</div><h2>One current source before another tutorial.</h2><p>Tier A sources anchor volatile product claims. Third-party material is admitted only when it adds a distinct practical explanation or lab.</p></div><div>{sources.map(([title, url, tier]) => <a href={url} target="_blank" rel="noreferrer" key={url}><span>{tier}</span><strong>{title}</strong><ExternalLink /></a>)}<a href="https://www.youtube.com/watch?v=Fys4oHlXQmQ&list=PLHmEk7iRj6dszZo_nqcNtYVBGgMw5THsK" target="_blank" rel="noreferrer"><span>D · Discovery / unverified</span><strong>User-supplied historical/version-specific Claude playlist</strong><ExternalLink /><small>Not counted as canonical. Some UI/model details may have changed; use only transferable workflow ideas after item-level review.</small></a></div></div>
  </section>;
}
