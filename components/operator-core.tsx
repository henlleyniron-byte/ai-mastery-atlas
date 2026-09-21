"use client";

import { useState } from "react";
import { AstraStudio } from "@/components/astra-studio";
import { AstraDeveloperCorner } from "@/components/astra-developer";
import type { StudioState } from "@/lib/astra-studio";
import { ArrowRight, ExternalLink, Gauge, Scale, ShieldCheck, Sparkles } from "lucide-react";
import {
  astraEvaluationMetrics,
  astraEvaluationTasks,
  astraDetails,
  astraLabCases,
  astraLabProtocol,
  astraRelease,
  astraSources,
  judgeSteps,
  judgeVariants,
  modelChangeSteps,
  modelRoles,
  operatorLayers,
  routeOperatorTask,
  type TaskSignals,
} from "@/lib/operator-core";

const defaultSignals: TaskSignals = {
  hasMaterialAiAdvantage: true,
  needsCurrentInformation: false,
  needsMultipleSources: false,
  needsPersistentContext: false,
  needsConnectedAccounts: false,
  changesSoftware: false,
  controlsLocalInterface: false,
  recursLater: false,
  consequence: "Green",
};

const signalQuestions: Array<{ key: Exclude<keyof TaskSignals, "consequence">; label: string; help: string }> = [
  { key: "hasMaterialAiAdvantage", label: "Does AI add material value?", help: "Faster, better or more reliable than a normal tool after verification cost." },
  { key: "needsCurrentInformation", label: "Could the answer have changed?", help: "News, prices, product behavior, plans, rules or other current facts." },
  { key: "needsMultipleSources", label: "Is this a complex multi-source investigation?", help: "The result needs synthesis, contradictions and a traceable evidence trail." },
  { key: "needsPersistentContext", label: "Will context be reused across sessions?", help: "Stable instructions, files or sources should remain together." },
  { key: "needsConnectedAccounts", label: "Does it need connected data or a finished artifact?", help: "Mail, Drive, browser tools, documents, sheets or long execution." },
  { key: "changesSoftware", label: "Will it inspect or change a repository?", help: "Code work needs diffs, tests, review and rollback." },
  { key: "controlsLocalInterface", label: "Must it operate a browser or desktop UI?", help: "The visual state itself matters and actions need supervision." },
  { key: "recursLater", label: "Must it run again in the future?", help: "A time, event or monitoring condition creates the value." },
];

function downloadAstraWorksheet() {
  const headings = ["task", "run", "date", "product", "model", "mode_effort", "input_reference", "tools_permissions", "rubric_reference", "quality_0_4", "accuracy_0_4", "tool_use", "latency_seconds", "failed_0_1", "source_discipline_0_4", "instruction_following_0_4", "human_corrections", "cost", "artifact_reference", "notes"];
  const rows = astraEvaluationTasks.flatMap((task) => ["Astra", "Baseline"].map((model) => [task, "1", "", "", model, ...Array(headings.length - 5).fill("")]));
  const csv = [headings, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "astra-controlled-evaluation-blank.csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function OperatorCore({ studio, onStudioChange }: { studio: StudioState; onStudioChange: (state: StudioState) => void }) {
  const [signals, setSignals] = useState<TaskSignals>(defaultSignals);
  const [judgeVariant, setJudgeVariant] = useState<keyof typeof judgeVariants>("Compact");
  const recommendation = routeOperatorTask(signals);

  return (
    <section id="operator-core" className="page-section operator-core" aria-labelledby="operator-core-title">
      <div className="section-kicker">v4.0 · Strategic AI Operator core</div>
      <h2 id="operator-core-title" className="section-title">Choose the job, evidence and authority before the model.</h2>
      <p className="section-intro">ChatGPT is the default orchestration environment in this pathway—not an infallible authority. It proposes; evidence is checked; uncertainty is exposed; alternatives are compared; consequential claims are verified; the user decides.</p>

      <div className="operator-doctrine" role="list" aria-label="Strategic Judge doctrine">
        {["ChatGPT proposes", "Evidence is checked", "Uncertainty is exposed", "Alternatives are compared", "User retains authority"].map((item, index) => (
          <div role="listitem" key={item}><span>{index + 1}</span><strong>{item}</strong>{index < 4 ? <ArrowRight aria-hidden="true" /> : null}</div>
        ))}
      </div>

      <article className="operator-block judge-block">
        <div className="operator-heading"><Scale aria-hidden="true" /><div><span>Flagship protocol</span><h3>Strategic Judge</h3><p>Use the full version for meaningful decisions; use a compact variant for routine work.</p></div></div>
        <div className="judge-layout">
          <ol className="judge-steps">{judgeSteps.map(([name, prompt]) => <li key={name}><strong>{name}</strong><span>{prompt}</span></li>)}</ol>
          <div className="judge-variants">
            <div className="variant-tabs" role="group" aria-label="Strategic Judge variant">
              {(Object.keys(judgeVariants) as Array<keyof typeof judgeVariants>).map((variant) => <button type="button" className={judgeVariant === variant ? "active" : ""} aria-pressed={judgeVariant === variant} key={variant} onClick={() => setJudgeVariant(variant)}>{variant}</button>)}
            </div>
            <div className="variant-output" aria-live="polite"><small>{judgeVariant} protocol</small><p>{judgeVariants[judgeVariant]}</p></div>
            <div className="judge-warning"><ShieldCheck aria-hidden="true" /><p>Consequential actions require exact-source verification and human approval. Recommendation confidence never transfers authority to the model.</p></div>
          </div>
        </div>
      </article>

      <article className="operator-block router-block">
        <div className="operator-heading"><Gauge aria-hidden="true" /><div><span>Interactive task router</span><h3>Which surface should do the work?</h3><p>Change the signals. The routing rule is deterministic and shows its approval gate.</p></div></div>
        <div className="router-layout">
          <form className="router-form" onSubmit={(event) => event.preventDefault()}>
            {signalQuestions.map((question) => <label className="router-question" key={question.key}><span><strong>{question.label}</strong><small>{question.help}</small></span><input type="checkbox" checked={signals[question.key]} onChange={(event) => setSignals((current) => ({ ...current, [question.key]: event.target.checked }))} /></label>)}
            <fieldset className="risk-choice"><legend>Consequence class</legend>{(["Green", "Amber", "Red"] as const).map((risk) => <label key={risk}><input type="radio" name="consequence" value={risk} checked={signals.consequence === risk} onChange={() => setSignals((current) => ({ ...current, consequence: risk }))} /><span>{risk}</span></label>)}</fieldset>
          </form>
          <div className={`router-result risk-${signals.consequence.toLowerCase()}`} aria-live="polite">
            <small>Primary route</small><h4>{recommendation.primary}</h4><p>{recommendation.why}</p>
            <dl><dt>Supporting surfaces</dt><dd>{recommendation.support.length ? recommendation.support.join(" + ") : "None required"}</dd><dt>Control gate</dt><dd>{recommendation.gate}</dd></dl>
            <button type="button" onClick={() => setSignals(defaultSignals)}>Reset router</button>
          </div>
        </div>
      </article>

      <article className="operator-block model-block">
        <div className="operator-heading"><Sparkles aria-hidden="true" /><div><span>Current model landscape · rechecked {astraRelease.reviewedAt}</span><h3>GPT-6 Astra without model-name dependency</h3><p>Official guidance describes Astra as OpenAI’s most capable model for hard end-to-end work. Initial access is rolling out; availability depends on product, plan, workspace policy and rollout stage.</p></div></div>
        <div className="astra-status"><span>{astraRelease.status}</span><p>Initial limited-organisation rollout began 3 September. {astraRelease.planAvailability} Verification baseline: {astraRelease.lastVerified}; source review: {astraRelease.reviewedAt}.</p></div>
        <div className="layer-stack">{operatorLayers.map(([layer, value, explanation]) => <div key={layer}><span>{layer}</span><strong>{value}</strong><p>{explanation}</p></div>)}</div>
        <div className="model-role-grid">{modelRoles.map(([role, value, use]) => <div key={role}><span>{role}</span><strong>{value}</strong><p>{use}</p></div>)}</div>
        <p className="pro-distinction"><strong>Astra and Astra Pro.</strong> {astraRelease.proDistinction} <a href={astraSources[0].url} target="_blank" rel="noreferrer">Official launch and availability</a>.</p>
        <div className="astra-detail-list" aria-label="GPT-6 Astra operator reference">{astraDetails.map((detail) => <details className="astra-detail" key={detail.title}><summary>{detail.title}</summary><ul>{detail.points.map((point) => <li key={point}>{point}</li>)}</ul><a href={detail.source.url} target="_blank" rel="noreferrer">{detail.source.label} <ExternalLink aria-hidden="true" /></a><small>CHANGING · reviewed {astraRelease.reviewedAt}</small></details>)}</div>
        <div className="astra-security"><ShieldCheck aria-hidden="true" /><div><strong>Defensive security note</strong><p>OpenAI reports Astra as its first model to reach the Critical cybersecurity capability threshold and documents stronger safeguards and monitoring. That is a reason for tighter authorisation and oversight—not an invitation to test systems without permission.</p></div></div>
      </article>

      <article className="operator-block survival-block">
        <div className="operator-heading"><ArrowRight aria-hidden="true" /><div><span>Model change survival</span><h3>Update routing, not your identity.</h3><p>A frontier launch is an evidence update. Stable methods survive model churn.</p></div></div>
        <ol className="survival-flow">{modelChangeSteps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></li>)}</ol>
      </article>

      <article className="operator-block evaluation-block">
        <div className="operator-heading"><Gauge aria-hidden="true" /><div><span>Controlled evaluation lab</span><h3>GPT-6 Astra versus the current model</h3><p>Run only when Astra is actually accessible. Hold input, files, tool access, rubric and success criteria constant; newer is not automatically better for every task.</p></div></div>
        <div className="evaluation-layout"><div><h4>Frozen tasks</h4><ul>{astraEvaluationTasks.map((task) => <li key={task}>{task}</li>)}</ul></div><div><h4>Record for both models</h4><ul>{astraEvaluationMetrics.map((metric) => <li key={metric}>{metric}</li>)}</ul></div></div>
        <details className="astra-detail"><summary>Run the lab: fixtures, rubric and comparison rules</summary><ol>{astraLabProtocol.map((step) => <li key={step}>{step}</li>)}</ol><div className="astra-case-grid">{astraLabCases.map(([task, fixture, pass]) => <div key={task}><h4>{task}</h4><p><strong>Prepare:</strong> {fixture}</p><p><strong>Accept when:</strong> {pass}</p></div>)}</div><button type="button" className="astra-download" onClick={downloadAstraWorksheet}>Download blank comparison worksheet (CSV)</button><p className="astra-lab-note">Blank template only. Your results stay in your own file; downloading or reading this lesson does not count as demonstrated mastery. Attach the completed artifact to the relevant track’s evidence record.</p></details>
        <div className="evaluation-pass"><strong>Pass criterion</strong><p>A dated comparison contains identical inputs, a precommitted rubric, task-level scores, failures, corrections and a routing change only where the evidence supports one.</p></div>
      </article>

      <AstraStudio value={studio} onChange={onStudioChange} />
      <AstraDeveloperCorner />
      <div className="al-guardrail"><strong>A/L &gt; Atlas.</strong><p>AI input is not exam output. For study, the governing loop remains timed attempt → strict marking → diagnosis → repair → closed-book reattempt → fresh transfer → delayed retest. If Atlas work competes with that loop or sleep, Atlas loses.</p></div>

      <div className="operator-sources"><span>Primary sources · baseline {astraRelease.lastVerified} · rechecked {astraRelease.reviewedAt}</span>{astraSources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><strong>{source.label}</strong><small>{source.scope}</small><ExternalLink aria-hidden="true" /></a>)}</div>
    </section>
  );
}
