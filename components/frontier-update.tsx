"use client";

import { useState } from "react";
import { experiments } from "@/lib/evaluation-workbench";
import { claudeFable, flagshipRelease, flagshipSources } from "@/lib/flagship-models";

type Task = "study" | "research" | "software" | "computer" | "draft";
type Priority = "quality" | "speed" | "cost";

const tasks: { id: Task; label: string }[] = [
  { id: "study", label: "A/L marking and error repair" },
  { id: "research", label: "Multi-source research" },
  { id: "software", label: "Codebase change" },
  { id: "computer", label: "Browser or computer task" },
  { id: "draft", label: "Everyday writing and extraction" },
];

const routes: Record<Task, Record<Priority, { start: string; escalate: string; evidence: string }>> = {
  study: {
    quality: { start: "GPT-6.1 Sol", escalate: "GPT-6 Astra for disputed, multi-step answers", evidence: "Use the official question and scheme. Compare item-level marks, deductions, misconception diagnosis and a fresh transfer question." },
    speed: { start: "GPT-6.1 Sol", escalate: "Claude Sonnet 5.5 for an independent check", evidence: "Check the same marked script against the scheme; record time and corrections." },
    cost: { start: "GPT-6 Luna or another available efficient model", escalate: "GPT-6.1 Sol when it misses a criterion", evidence: "Count accepted answers per unit of time or API cost, including human correction." },
  },
  research: {
    quality: { start: `GPT-6 Astra or ${claudeFable.name}`, escalate: "Cross-check with the other model", evidence: "Freeze the source pack and question. Audit every citation, missing source, contradiction and unsupported inference." },
    speed: { start: "GPT-6.1 Sol", escalate: "GPT-6 Astra if synthesis fails", evidence: "Record source coverage and correction time, not just a polished summary." },
    cost: { start: "GPT-6.1 Sol", escalate: "Claude Opus 5.5 if its measured output wins", evidence: "Compare total cost per accepted synthesis, including retries and review." },
  },
  software: {
    quality: { start: `GPT-6 Astra or ${claudeFable.name}`, escalate: "Use the other on a frozen failing case", evidence: "Hold the repository, tests, permissions and acceptance criteria constant; inspect diffs and regressions." },
    speed: { start: "GPT-6.1 Sol", escalate: "GPT-6 Astra for a stubborn failure", evidence: "Measure end-to-end completion, test pass rate and review effort." },
    cost: { start: "GPT-6.1 Sol", escalate: "Claude Opus 5.5 if fewer retries justify it", evidence: "Count the whole repair loop rather than the first answer's token price." },
  },
  computer: {
    quality: { start: "GPT-6 Astra", escalate: "Human review at consequential actions", evidence: "Check the final UI state, duplicate actions and recovery from a missing control." },
    speed: { start: "GPT-6 Astra", escalate: "A simpler direct tool where possible", evidence: "Measure task completion and latency in the same interface." },
    cost: { start: "The direct app or automation", escalate: "GPT-6.1 Sol if agentic control is needed", evidence: "Include setup, supervision and recovery time." },
  },
  draft: {
    quality: { start: "GPT-6.1 Sol or Claude Opus 5.5", escalate: `${claudeFable.name} for a hard, source-heavy deliverable`, evidence: "Score factual fidelity, audience fit, clarity and edits to acceptance." },
    speed: { start: "Claude Sonnet 5.5 or GPT-6.1 Sol", escalate: "Use a stronger model only after a specific miss", evidence: "Time the complete draft and correction, not just first-token speed." },
    cost: { start: "GPT-6 Luna or another available efficient model", escalate: "GPT-6.1 Sol when quality misses", evidence: "Keep a no-AI baseline for very short edits." },
  },
};

const models = [
  { name: claudeFable.name, role: "Anthropic flagship for demanding work", fit: "Compare on hard coding, reasoning and source-heavy deliverables with a fixed task and independent checks.", source: claudeFable.source, note: `Base API rates are ${claudeFable.price}. Check the Claude model selector for plan access.` },
  { name: "Gemini 4 Carbon", role: "Google frontier announcement · pre-release", fit: "Google's October update describes testing with the US government and selected Fairwind participants.", source: flagshipSources.carbon, note: "Check for a broader release before planning a run.", limited: true },
  { name: "Gemini 4 Argon", role: "Google frontier model with published access", fit: "Try it on a fixed multi-step reasoning or coding task.", source: flagshipSources.argonApi, note: "Google announced a paid API route and Gemini app access for Google AI Pro and Ultra." },
  { name: "GPT-6.1 Sol", role: "Default for substantial everyday work", fit: "Coding, source-grounded study help, long PDFs and repeatable workflows. Escalate only if a frozen task reveals a shortfall.", source: "https://developers.openai.com/api/docs/models/gpt-6.1-sol", note: "API: $2 input / $10 output per million tokens; not a ChatGPT subscription price." },
  { name: "GPT-6 Astra", role: "OpenAI maximum-depth route", fit: "Reserve for unusually difficult end-to-end reasoning, computer use, scientific analysis and consequential review.", source: flagshipSources.astra, note: "Standard API: $10 input / $50 output per million tokens. Officially named GPT-6 Astra." },
  { name: "GPT-6 Luna", role: "Efficient route for bounded tasks", fit: "Try it for straightforward extraction, short edits and repeated triage. Keep a fixed rubric and escalate when it fails.", source: "https://developers.openai.com/api/docs/models/gpt-6-luna", note: "API access and subscription access differ; check your actual model selector." },
  { name: "Claude Opus 5.5", role: "Strong premium alternative", fit: "Long-running coding and knowledge work when Fable's cost or latency is not justified.", source: "https://platform.claude.com/docs/en/models/opus-5-5/overview", note: "API: $4 input / $20 output per million tokens." },
  { name: "Claude Sonnet 5.5", role: "Fast capable alternative", fit: "A sensible first Claude test for recurring research, drafting and coding.", source: "https://platform.claude.com/docs/en/models/sonnet-5-5/overview", note: "API: $2 input / $10 output per million tokens." },
  { name: "Gemini 3.8 Flash", role: "Current stable Gemini API option", fit: "Google lists it for complex coding and agentic workflows. Test it on the same inputs before changing a working route.", source: "https://ai.google.dev/gemini-api/docs/models", note: "This is an API catalog entry; it does not establish Gemini Apps or Google AI Pro access." },
] as const;

const scenarioForTask = { study: "study", research: "research", software: "code", computer: "agent", draft: "handoff" } as const;
const comparisonModels = models.filter(model => !("limited" in model));

export function FrontierUpdate() {
  const [task, setTask] = useState<Task>("study");
  const [priority, setPriority] = useState<Priority>("quality");
  const [provider, setProvider] = useState("All");
  const [access, setAccess] = useState("All");
  const [baseline, setBaseline] = useState<string>("GPT-6.1 Sol");
  const [challenger, setChallenger] = useState<string>(claudeFable.name);
  const visibleModels = models.filter(model => {
    const modelProvider = model.name.startsWith("Gemini") ? "Google" : model.name.startsWith("GPT") ? "OpenAI" : "Anthropic";
    const limited = "limited" in model;
    return (provider === "All" || provider === modelProvider) && (access === "All" || (access === "Limited" ? limited : !limited));
  });
  const result = routes[task][priority];
  const scenario = experiments.find(item => item.id === scenarioForTask[task])!;
  const brief = [
    scenario.task,
    "Use the same frozen input pack and allowed tools for each run. Flag any missing evidence.",
    `Acceptance check: ${scenario.expected}`,
    `Critical failure: ${scenario.critical}`,
  ].join("\n\n");
  return <section id="frontier-update" className="page-section frontier-update" aria-labelledby="frontier-title" tabIndex={-1}>
    <div className="section-kicker">Flagship references checked 10 November 2026</div>
    <h2 id="frontier-title" className="section-title">{flagshipRelease}</h2>
    <p className="section-intro">Choose a starting model, challenge it with one fixed task and score both outputs against the same evidence. Check model access in the product you intend to use.</p>
    <div className="frontier-chooser">
      <div className="frontier-controls"><label htmlFor="frontier-task">What are you doing?</label><select id="frontier-task" value={task} onChange={event => setTask(event.target.value as Task)}>{tasks.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
        <fieldset><legend>What matters most?</legend>{(["quality", "speed", "cost"] as Priority[]).map(value => <label key={value}><input type="radio" name="frontier-priority" value={value} checked={priority === value} onChange={() => setPriority(value)} /> {value === "quality" ? "Accepted quality" : value === "speed" ? "Time to finish" : "Total cost"}</label>)}</fieldset></div>
      <div className="frontier-result" aria-live="polite" aria-atomic="true"><span>Starting route · provisional</span><h3>{result.start}</h3><p><strong>Escalate:</strong> {result.escalate}</p><p><strong>Prove it:</strong> {result.evidence}</p><small>Only choose models available in your account. The product, tool access and reasoning setting affect the result.</small></div>
    </div>
    <details className="frontier-comparison">
      <summary>Prepare a head-to-head test</summary>
      <div className="frontier-pair">
        <label>Baseline<select value={baseline} onChange={event => setBaseline(event.target.value)}>{comparisonModels.map(model => <option key={model.name}>{model.name}</option>)}</select></label>
        <label>Challenger<select value={challenger} onChange={event => setChallenger(event.target.value)}>{comparisonModels.map(model => <option key={model.name}>{model.name}</option>)}</select></label>
      </div>
      {baseline === challenger ? <p role="status">Choose two different models for this comparison.</p> : <>
        <p><strong>{scenario.title}.</strong> Run the brief separately in {baseline} and {challenger}. Record the product, model version, settings, tools, total time and any measured cost. Score the outputs before revealing the model labels.</p>
        <label>Shared test brief<textarea readOnly rows={7} value={brief} /></label>
        <p>Attach the same authorised or synthetic inputs to each run. Keep both original outputs and count failed runs, retries and corrections.</p>
        <p><strong>Transfer after scoring.</strong> {scenario.transfer}</p>
        <a href="#evaluation-workbench">Score completed runs in the Evaluation Workbench →</a>
        <p>Choose “{scenario.title}” in the workbench. Give both runs the same fixture, ground truth, allowed tools, baseline and repetition number to unlock the side-by-side scorecard.</p>
      </>}
    </details>
    <div className="frontier-filters">
      <label htmlFor="frontier-provider">Provider<select id="frontier-provider" value={provider} onChange={event => setProvider(event.target.value)}>{["All", "OpenAI", "Anthropic", "Google"].map(value => <option key={value}>{value}</option>)}</select></label>
      <label htmlFor="frontier-access">Publication status<select id="frontier-access" value={access} onChange={event => setAccess(event.target.value)}><option value="All">All models</option><option value="Catalog">Published API models</option><option value="Limited">Pre-release or limited rollout</option></select></label>
      <p role="status">{visibleModels.length} models shown. Catalog listing does not guarantee access in your account.</p>
    </div>
    {!visibleModels.length && <p className="empty-state">No models match both filters. Choose All to broaden the register.</p>}
    <div className="frontier-grid">{visibleModels.map(model => <article key={model.name}>
      <h3>{model.name}</h3><strong>{model.role}</strong><p>{model.fit}</p><small>{model.note}</small>
      <a href={model.source} target="_blank" rel="noopener noreferrer">Official model information<span className="sr-only"> (opens in a new tab)</span></a>
    </article>)}</div>
    <div className="frontier-caveats"><p><strong>Base API prices are only one part of cost.</strong> Caching, context size, speed modes, tools and retries can change the bill. Work and Codex share subscription usage; API billing is separate. <a href="https://learn.chatgpt.com/docs/pricing" target="_blank" rel="noopener noreferrer">Check current plans and usage</a>.</p>
    <p><strong>Measure results on your own task.</strong> A/L marking needs the official scheme and human review; compare models on the same question, sources, permitted tools, effort and scoring rubric. Track correctness, unsupported claims, corrections, time and total cost per accepted answer.</p></div>
  </section>;
}
