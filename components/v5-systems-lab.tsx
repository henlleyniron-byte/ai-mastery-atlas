"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { Calculator, CircleAlert, ExternalLink, Gauge, LibraryBig, Plus, Trash2 } from "lucide-react";
import type { BenchmarkRun } from "@/lib/v5-state";

const modelRoles = [
  ["Frontier reasoner", "Hard, consequential synthesis and planning", "Use only when the task and verification justify added latency or cost."],
  ["Fast everyday model", "Drafting, extraction, classification and iteration", "Escalate measured failures instead of routing everything upward."],
  ["High-compute variant", "A bounded task where extra inference may improve success", "Compare cost per successful result; more compute is not proof of correctness."],
  ["Coding specialist", "Repository inspection, edits, tests and review", "The execution environment, permissions and repository evidence matter as much as the model."],
  ["Open/local model", "Privacy-sensitive, offline or controllable deployment", "Local operation transfers patching, licensing, hardware and security responsibility to you."],
  ["Multimodal specialist", "Image, audio, video or document understanding", "Measure the needed modality; text benchmark rank cannot establish visual reliability."],
] as const;

const modelLandscape = [
  ["OpenAI", "ChatGPT · GPT family · Codex", "Frontier reasoning, research, tool execution and software work", "https://developers.openai.com/api/docs/models"],
  ["Anthropic", "Claude · Claude Code", "Long-context work, coding supervision and constrained delegation", "https://platform.claude.com/docs/en/about-claude/models/overview"],
  ["Google", "Gemini · NotebookLM · AI Studio", "Multimodal, source-grounded and Workspace-connected workflows", "https://ai.google.dev/gemini-api/docs/models"],
  ["xAI", "Grok", "A comparison candidate whose current access and tool surface must be tested", "https://docs.x.ai/docs/models"],
  ["DeepSeek", "DeepSeek models/API", "Open and hosted comparison candidate; check current terms and limits", "https://api-docs.deepseek.com/"],
  ["Qwen", "Qwen model family", "Open-weight and hosted comparison candidate; inspect model cards and licences", "https://qwenlm.github.io/"],
  ["Moonshot AI", "Kimi", "Long-context and agent-workflow comparison candidate; verify regional access", "https://platform.moonshot.ai/docs"],
  ["Perplexity", "Answer engine and API", "Search-grounded research comparison candidate; audit source coverage", "https://docs.perplexity.ai/"],
  ["Local ecosystem", "Hugging Face · Ollama", "Privacy, offline control and open-model experimentation", "https://huggingface.co/models"],
] as const;

const benchmarkFamilies = [
  ["Knowledge / reasoning", "MMLU-style, GPQA-style", "Coverage, contamination, answer format and whether the task resembles your work."],
  ["Mathematics", "GSM-style, competition problems", "Exact-match can hide method quality; tool access changes the comparison."],
  ["Coding", "HumanEval-style, SWE-bench-style", "Repository, tests, scaffolding and compute budget must be held constant."],
  ["Agents / tools", "Browser, computer-use and tool suites", "Environment reliability and permission failures can dominate model ability."],
  ["Long context", "Needle and retrieval suites", "Capacity is not recall; test placement, distractors, citation and actual corpus shape."],
  ["Safety", "Refusal, misuse and prompt-injection suites", "A single aggregate score can conceal harmful false accepts or needless false refusals."],
] as const;

const failureModes = [
  ["Hallucination", "Plausible unsupported claim", "Generation optimises continuation, not truth", "Open decisive evidence and trace each claim", "Require sources and bounded uncertainty", "Retract, correct and rerun the frozen case"],
  ["Citation fabrication", "A citation does not support or does not exist", "Citation form was generated without source validation", "Open every decisive citation", "Use source-grounded workflows and claim ledgers", "Replace the claim or cite a supporting primary source"],
  ["Instruction loss", "A constraint disappears late in the output", "Long or conflicting context diluted the requirement", "Score every explicit constraint", "Prioritise, delimit and regression-test instructions", "Shorten context and rerun unchanged tests"],
  ["Context omission", "Relevant supplied evidence is ignored", "Retrieval, attention or context construction failed", "Plant known answer-bearing evidence and inspect coverage", "Audit ingestion, retrieval and context assembly", "Repair the failed stage rather than rewriting the conclusion"],
  ["False confidence", "Certainty exceeds available evidence", "Fluency is mistaken for calibrated probability", "Ask what observation would falsify the claim", "Require confidence basis and abstention conditions", "Downgrade the claim and gather missing evidence"],
  ["Premature action", "A tool changes state before confirmation", "The workflow lacked an approval boundary", "Review action logs and state diffs", "Separate propose, approve and execute", "Stop, restore from checkpoint and document impact"],
  ["Tool misuse", "Wrong tool, parameters or target", "Poor schemas, routing or validation", "Inspect the exact call and returned status", "Validate inputs, constrain tools and use least privilege", "Reverse safely and add the failed call to regression tests"],
  ["Coding regression", "A change passes locally but breaks another behavior", "Coverage or change scope was incomplete", "Run targeted and full tests plus diff review", "Freeze acceptance criteria and preserve rollback", "Revert or repair narrowly, then add a regression test"],
  ["Stale knowledge", "A once-correct product fact is outdated", "Volatile claims lacked verification metadata", "Check dated primary documentation", "Store source, source date, verification date and volatility", "Update the routing rule while preserving stable principles"],
  ["Bad retrieval", "Grounded answer uses irrelevant or incomplete chunks", "Chunking, query, metadata or reranking failed", "Measure retrieval before judging generation", "Maintain a no-RAG baseline and retrieval test set", "Repair ingestion/retrieval and rerun identical questions"],
  ["Prompt injection", "Untrusted content attempts to redirect authority", "Instructions and data crossed a trust boundary", "Trace instruction provenance and attempted actions", "Treat retrieved content as data; restrict tools", "Stop execution, revoke exposed access and retest defenses"],
  ["Sycophancy", "The system mirrors a preferred answer", "Agreement was rewarded more than correction", "Use blind alternatives and request disconfirming evidence", "Precommit decision criteria", "Rescore without identity or preferred conclusion"],
  ["Automation loop", "Repeated retries create cost or duplicate effects", "No idempotency, retry ceiling or stop rule", "Inspect duplicate calls and retry logs", "Use idempotency keys, backoff and budgets", "Disable trigger, reconcile state and repair the boundary"],
  ["State loss", "A workflow forgets prior evidence or resumes incorrectly", "Persistence or migration failed", "Export, reload and compare exact records", "Version state and test migrations", "Restore the last valid export without inventing progress"],
  ["Duplicate execution", "The same external action runs twice", "At-least-once delivery lacked deduplication", "Compare action identifiers and timestamps", "Use idempotency and durable completion records", "Reconcile consequences before retrying"],
] as const;

const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

export function V5SystemsLab({ runs, setRuns }: { runs: BenchmarkRun[]; setRuns: Dispatch<SetStateAction<BenchmarkRun[]>> }) {
  const [failureQuery, setFailureQuery] = useState("");
  const [draft, setDraft] = useState({ task: "", model: "", version: "", tools: "", latency: "", cost: "", score: "", failure: "", correction: "" });
  const [economics, setEconomics] = useState({ runs: 100, inputTokens: 2000, outputTokens: 600, inputRate: 1, outputRate: 4, successRate: 80 });
  const filteredFailures = useMemo(() => failureModes.filter(item => item.join(" ").toLowerCase().includes(failureQuery.toLowerCase())), [failureQuery]);
  const estimatedRunCost = (economics.inputTokens / 1_000_000 * economics.inputRate) + (economics.outputTokens / 1_000_000 * economics.outputRate);
  const totalCost = estimatedRunCost * economics.runs;
  const successful = economics.runs * Math.max(0, Math.min(100, economics.successRate)) / 100;
  const costPerSuccess = successful ? totalCost / successful : null;
  const saveRun = () => {
    if (!draft.task.trim() || !draft.model.trim()) return;
    setRuns(current => [...current, {
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}`,
      date: today(), task: draft.task.trim(), model: draft.model.trim(), version: draft.version.trim(), tools: draft.tools.trim(),
      latencySeconds: draft.latency === "" ? undefined : Math.max(0, Number(draft.latency)),
      estimatedCost: draft.cost === "" ? undefined : Math.max(0, Number(draft.cost)),
      score: draft.score === "" ? undefined : Math.max(0, Math.min(4, Number(draft.score))),
      failure: draft.failure.trim() || undefined, correction: draft.correction.trim() || undefined,
    }].slice(-100));
    setDraft({ task: "", model: "", version: "", tools: "", latency: "", cost: "", score: "", failure: "", correction: "" });
  };
  const setEconomic = (key: keyof typeof economics, value: string) => setEconomics(current => ({ ...current, [key]: Math.max(0, Number(value) || 0) }));

  return <section className="page-section systems-lab" aria-labelledby="systems-lab-title">
    <div className="systems-heading"><div><div className="section-kicker">V5 systems intelligence</div><h2 id="systems-lab-title" className="section-title">Understand the class. Test the instance.</h2><p className="section-intro">Durable concepts determine the architecture; dated product evidence determines today’s route. These labs are already accounted for inside the existing evaluation, product-engineering and capstone hours.</p></div><div className="freshness-card"><CircleAlert /><strong>Volatile claims need dates</strong><span>Provider · model · primary source · source date · verification date · volatility</span></div></div>

    <div className="model-role-grid v5-role-grid">{modelRoles.map(([role, fit, caution]) => <article key={role}><Gauge /><h3>{role}</h3><p>{fit}</p><small>{caution}</small></article>)}</div>

    <article className="v5-panel model-landscape"><div className="panel-title"><LibraryBig /><div><span>Model Explorer</span><h3>Provider surfaces are candidates, not promises.</h3></div></div><div className="landscape-grid">{modelLandscape.map(([provider, surfaces, route, source]) => <article key={provider}><div><strong>{provider}</strong><small>Re-open primary source before routing</small></div><h4>{surfaces}</h4><p>{route}</p><a href={source} target="_blank" rel="noreferrer">Official model/source page <ExternalLink /></a></article>)}</div><p className="panel-note">The foundation teaches architectures, evaluation and trust boundaries. This table is the application layer: names, availability, limits and pricing change. A source link is not proof that the learner has access.</p></article>

    <div className="v5-two-column">
      <article className="v5-panel"><div className="panel-title"><LibraryBig /><div><span>Benchmark Explorer</span><h3>A score is evidence with a scope.</h3></div></div><div className="benchmark-family-list">{benchmarkFamilies.map(([family, examples, inspect]) => <details key={family}><summary><strong>{family}</strong><span>{examples}</span></summary><p>{inspect}</p></details>)}</div><p className="panel-note">Before comparing results, freeze task, prompt, context, tools, reasoning budget, number of attempts, rubric and scorer. Report uncertainty and failed cases—not only the mean.</p></article>

      <article className="v5-panel"><div className="panel-title"><Calculator /><div><span>AI economics</span><h3>Cost per successful task</h3></div></div><div className="economics-grid">{([["runs", "Runs"], ["inputTokens", "Input tokens/run"], ["outputTokens", "Output tokens/run"], ["inputRate", "Input $/1M"], ["outputRate", "Output $/1M"], ["successRate", "Success rate %"]] as const).map(([key, label]) => <label key={key}>{label}<input type="number" min="0" value={economics[key]} onChange={event => setEconomic(key, event.target.value)} /></label>)}</div><dl className="economics-result"><div><dt>Estimated run</dt><dd>${estimatedRunCost.toFixed(4)}</dd></div><div><dt>Batch total</dt><dd>${totalCost.toFixed(2)}</dd></div><div><dt>Cost/success</dt><dd>{costPerSuccess === null ? "No successes" : `$${costPerSuccess.toFixed(4)}`}</dd></div></dl><p className="panel-note">Enter current provider rates yourself. Subscription fees, cached tokens, tools, retries and human correction time are separate costs.</p></article>
    </div>

    <article className="v5-panel personal-benchmark"><div className="panel-title"><Gauge /><div><span>Benchmark your own AI</span><h3>One task, one rubric, dated results.</h3></div></div><div className="benchmark-form"><label>Frozen task<input value={draft.task} onChange={event => setDraft({ ...draft, task: event.target.value })} /></label><label>Model/provider<input value={draft.model} onChange={event => setDraft({ ...draft, model: event.target.value })} /></label><label>Version/date label<input value={draft.version} onChange={event => setDraft({ ...draft, version: event.target.value })} /></label><label>Tools/environment<input value={draft.tools} onChange={event => setDraft({ ...draft, tools: event.target.value })} /></label><label>Latency seconds<input type="number" min="0" value={draft.latency} onChange={event => setDraft({ ...draft, latency: event.target.value })} /></label><label>Estimated cost<input type="number" min="0" step="0.0001" value={draft.cost} onChange={event => setDraft({ ...draft, cost: event.target.value })} /></label><label>Rubric score 0–4<input type="number" min="0" max="4" value={draft.score} onChange={event => setDraft({ ...draft, score: event.target.value })} /></label><label>Observed failure<input value={draft.failure} onChange={event => setDraft({ ...draft, failure: event.target.value })} /></label><label className="wide-field">Human correction required<input value={draft.correction} onChange={event => setDraft({ ...draft, correction: event.target.value })} /></label></div><button type="button" className="v5-action" onClick={saveRun} disabled={!draft.task.trim() || !draft.model.trim()}><Plus /> Save local run</button><div className="run-list" aria-live="polite">{runs.length === 0 ? <p>No runs recorded. Define success before opening a model.</p> : runs.slice().reverse().map(run => <div key={run.id}><span>{run.date}</span><strong>{run.model}</strong><span>{run.task}</span><b>{run.score === undefined ? "Unscored" : `${run.score}/4`}</b><button type="button" aria-label={`Delete ${run.model} benchmark run`} onClick={() => setRuns(current => current.filter(item => item.id !== run.id))}><Trash2 /></button></div>)}</div><p className="panel-note">Records stay in the unified browser-local V5 export. They are observations from your frozen task, not universal model rankings.</p></article>

    <article className="v5-panel failure-atlas"><div className="failure-atlas-heading"><div className="panel-title"><CircleAlert /><div><span>Failure Atlas</span><h3>Detect, prevent, recover.</h3></div></div><label>Search failure modes<input value={failureQuery} onChange={event => setFailureQuery(event.target.value)} placeholder="retrieval, state, injection…" /></label></div><div className="failure-grid">{filteredFailures.map(([name, symptom, cause, detection, prevention, recovery]) => <details key={name}><summary>{name}</summary><dl><div><dt>Symptom</dt><dd>{symptom}</dd></div><div><dt>Cause</dt><dd>{cause}</dd></div><div><dt>Detection</dt><dd>{detection}</dd></div><div><dt>Prevention</dt><dd>{prevention}</dd></div><div><dt>Recovery</dt><dd>{recovery}</dd></div></dl></details>)}</div>{filteredFailures.length === 0 && <p role="status">No failure mode matches that search.</p>}</article>

    <p className="systems-source-note"><ExternalLink /> Current product names and prices are intentionally subordinate to primary-source verification and personal evaluation. The public edition stores no billing, account, hardship or private entitlement data.</p>
  </section>;
}
