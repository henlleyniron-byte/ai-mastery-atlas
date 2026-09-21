export type RouteSurface =
  | "Chat"
  | "Search"
  | "Deep Research"
  | "Projects"
  | "Work"
  | "Codex"
  | "Scheduled Task"
  | "Local computer agent"
  | "No AI";

export type TaskSignals = {
  hasMaterialAiAdvantage: boolean;
  needsCurrentInformation: boolean;
  needsMultipleSources: boolean;
  needsPersistentContext: boolean;
  needsConnectedAccounts: boolean;
  changesSoftware: boolean;
  controlsLocalInterface: boolean;
  recursLater: boolean;
  consequence: "Green" | "Amber" | "Red";
};

export type RouteRecommendation = {
  primary: RouteSurface;
  support: RouteSurface[];
  why: string;
  gate: string;
};

export const routeOperatorTask = (task: TaskSignals): RouteRecommendation => {
  const support: RouteSurface[] = [];
  const gate = task.consequence === "Red"
    ? "Stop before money, identity, medical, legal, security, deletion or external-send actions. A human verifies and authorises the exact action."
    : task.consequence === "Amber"
      ? "Inspect sources, assumptions and the proposed action before execution; keep a rollback path."
      : "Run one proportionate check and retain the final decision yourself.";
  if (!task.hasMaterialAiAdvantage) {
    return { primary: "No AI", support, why: "A normal tool or direct human action is simpler and more reliable.", gate };
  }
  if (task.needsCurrentInformation) support.push("Search");
  if (task.needsMultipleSources) support.push("Deep Research");

  let primary: RouteSurface = "Chat";
  let why = "A bounded conversation is enough for thinking, explanation or a first draft.";
  if (task.changesSoftware) {
    primary = "Codex";
    why = "The job needs repository context, diffs, tests and a recoverable software change.";
  } else if (task.controlsLocalInterface) {
    primary = "Local computer agent";
    why = "The task depends on visible browser or desktop state and must be supervised at action boundaries.";
  } else if (task.recursLater) {
    primary = "Scheduled Task";
    why = "The useful result depends on a future trigger or repeated monitoring, not another chat now.";
  } else if (task.needsConnectedAccounts) {
    primary = "Work";
    why = "The outcome needs connected data, tools, checkpoints or a finished professional artifact.";
  } else if (task.needsMultipleSources) {
    primary = "Deep Research";
    why = "The core job is a multi-source investigation with a traceable evidence trail.";
  } else if (task.needsCurrentInformation) {
    primary = "Search";
    why = "The answer depends on information that may have changed since model training.";
  } else if (task.needsPersistentContext) {
    primary = "Projects";
    why = "The work benefits from a stable source set, instructions and continuity across sessions.";
  }

  const uniqueSupport = Array.from(new Set(support.filter((item) => item !== primary)));
  return { primary, support: uniqueSupport, why, gate };
};

export const judgeSteps = [
  ["Objective", "What outcome matters, for whom, and by when?"],
  ["Current state", "What is already true, completed or available?"],
  ["Constraints", "Time, money, policy, privacy, access and quality boundaries."],
  ["Options", "Include a no-AI or do-nothing baseline where it is credible."],
  ["Evidence", "Separate observed facts, credible sources, inference and unknowns."],
  ["Expected value", "What useful change is likely if this works?"],
  ["Costs", "Time, money, opportunity and privacy costs—not just subscription price."],
  ["Risks", "Failure modes, affected people, exposure and worst plausible consequence."],
  ["Reversibility", "Can the decision be tested, rolled back or staged?"],
  ["Recommendation", "Choose one option and explain why it beats the alternatives."],
  ["Confidence", "State calibrated confidence and the largest unresolved uncertainty."],
  ["Reversal condition", "Name the evidence that would change the recommendation."],
  ["Next action", "The smallest concrete step that produces evidence or value."],
] as const;

export const judgeVariants = {
  Compact: "Objective → options → decisive evidence → risk/reversibility → recommendation → next action.",
  "A/L study": "Will this produce marked exam output? Compare timed attempt, marking, repair and delayed retest against more resources or system building.",
  "Software/tool": "Define the user outcome, inspect the current system, compare reuse versus change, then require diff, tests, deployment proof and rollback.",
  "Agent delegation": "State scope, permitted tools, forbidden actions, stop conditions, success evidence, approval gates and recovery behavior before execution.",
} as const;

export const operatorLayers = [
  ["Product layer", "ChatGPT", "The interface and orchestration environment. Product features, storage and tools can change independently of the model."],
  ["Model layer", "GPT-6 Astra or another available model", "Choose capability and cost for the task; do not confuse a plan name, product surface or mode with the model itself."],
  ["Execution layer", "Work, Codex, plugins, browser and scheduled tasks", "Tools act on data or systems. Their permissions and verification requirements determine the real risk."],
  ["User layer", "Final authority", "The user owns objectives, permissions, consequential decisions and acceptance of the final result."],
] as const;

export const modelRoles = [
  ["Current frontier", "GPT-6 Astra", "Hard end-to-end reasoning, coding, computer use, research and polished professional work when available."],
  ["Fast / everyday", "Available balanced or low-cost model", "Routine drafting, extraction, classification and quick iteration where frontier depth is unnecessary."],
  ["Specialist / legacy", "Task-specific or older model", "Keep it only when controlled evaluation shows a distinct advantage, compatibility need or lower cost."],
  ["Pro / high compute", "GPT-6 Astra Pro / documented pro mode", "The launch names Astra Pro for Pro, Business and Enterprise. Evaluate whether extra computation improves your task enough to justify its time and usage."],
  ["Agent / tool environment", "Work, Codex or another bounded agent", "Execution surface, not a synonym for the underlying model. Inspect access, tools, checkpoints and approvals."],
] as const;

export const modelChangeSteps = [
  "Release detected",
  "Verify primary source",
  "Identify capability change",
  "Identify availability",
  "Freeze comparison tasks and rubric",
  "Test when access arrives",
  "Update routing only where evidence changes",
  "Update curriculum and preserve stable principles",
] as const;

export const astraEvaluationTasks = [
  "Difficult reasoning",
  "Deep-research planning",
  "Computer or browser task",
  "Coding and debugging",
  "Document creation",
  "A/L explanation",
  "A/L marking and diagnosis",
  "Strategic decision analysis",
] as const;

export const astraEvaluationMetrics = [
  "Quality", "Accuracy", "Tool use", "Latency", "Failure rate", "Source discipline", "Instruction following", "Human corrections required",
] as const;

export const astraSources = [
  { label: "GPT-6 Astra official announcement", url: "https://openai.com/index/gpt-6-astra/", scope: "Launch, Astra Pro, plan access and capability evidence" },
  { label: "GPT-6 Astra model guidance", url: "https://developers.openai.com/api/docs/guides/latest-model", scope: "Capabilities, migration, prompting and rollout" },
  { label: "GPT-6 Astra model page", url: "https://developers.openai.com/api/docs/models/gpt-6-astra", scope: "Model features, supported tools and API availability" },
  { label: "Codex and Work pricing", url: "https://learn.chatgpt.com/docs/pricing", scope: "Current Astra plan estimates, shared Work/Codex usage and rollout-dependent access" },
  { label: "ChatGPT Work getting started", url: "https://learn.chatgpt.com/docs/get-started-with-work", scope: "Verified Work routing and model guidance" },
  { label: "GPT-6 Astra safety overview", url: "https://openai.com/index/safety-overview-gpt-6-astra/", scope: "Critical cyber threshold and strengthened safeguards" },
  { label: "Codex configuration reference", url: "https://learn.chatgpt.com/docs/config-file/config-reference", scope: "Experimental context management and eligibility" },
  { label: "Reasoning modes and token budgets", url: "https://developers.openai.com/api/docs/guides/reasoning", scope: "Compute modes, reasoning tokens and incomplete responses" },
] as const;

export const astraRelease = {
  lastVerified: "2026-09-04",
  reviewedAt: "2026-09-07",
  status: "ROLLING_OUT",
  planAvailability: "The launch announces phased access for Plus, Pro, Business and Enterprise and the API. Current Work/Codex pricing lists Astra usage estimates for Plus, Pro and Business, while Enterprise access depends on rollout eligibility, seat, role and administrator policy. API-key access follows the API organization and project, not a ChatGPT workspace setting. Check the selector in each product; eligibility is not proof of account access.",
  proDistinction: "The launch calls the high-compute variant GPT-6 Astra Pro for Pro, Business and Enterprise. The API guide separately documents pro mode, but the public API model ID is gpt-6-astra. A product label, subscription plan, API model ID, processing mode and reasoning setting are different things; do not invent a gpt-6-astra-pro identifier or assume identical limits across surfaces.",
  primarySources: astraSources.map((source) => source.url),
} as const;

// Volatile claims live together, with a source beside each disclosure.
export const astraDetails = [
  {
    title: "What changed, and when Astra earns its place",
    source: astraSources[0],
    points: [
      "Launched 3 September 2026. OpenAI reports advances in visual computer use, browsing, software engineering, science and multistep professional work, including template-aware documents, spreadsheets and presentations.",
      "Launch benchmarks compare against GPT-5.6 Sol and other models under specified harnesses and effort settings. They measure particular tasks, not guaranteed performance in your account. Keep a proven older-model route until your own comparison supports switching.",
      "The announced distribution includes OpenAI API, Azure and AWS Bedrock. Subscription allowances include Astra usage, with additional credits available; provider access and billing must be checked separately.",
    ],
  },
  {
    title: "API reference: limits, modalities, tools and cost",
    source: astraSources[2],
    points: [
      "API model: gpt-6-astra. Context: 1,050,000 tokens; maximum output: 128,000 tokens; knowledge cutoff: 30 April 2026. These are API specifications, not promised ChatGPT limits. Recent facts still require retrieval.",
      "Text input/output and image input are supported; native audio/video and fine-tuning are not. Image generation is a separate supported tool. Streaming, function calling and structured outputs are supported.",
      "Responses tools include web/file search, image generation, code interpreter, hosted shell, apply patch, skills, computer use, MCP and tool search. Your application must enable tools and enforce permissions.",
      "Standard USD per million tokens: input $10; cached input $1; cache writes $12.50; output $50. Above 272K input, the whole request uses 2× input/cache and 1.5× output rates. Batch/Flex are half Standard; Fast is twice applicable rates. Tool charges may add cost. API Free tier is unsupported; paid-tier rate limits vary. Recheck the model page before budgeting.",
    ],
  },
  {
    title: "New API behavior and better prompting",
    source: astraSources[1],
    points: [
      "Async tools can run while independent reasoning continues; the application still executes them and matches results to call IDs. WebSocket mid-turn steering preserves completed work while incorporating updated instructions.",
      "Reasoning effort can change through configuration_update while retaining the cached prefix. Astra accepts low, medium, high, xhigh and max; none is unsupported. Fast mode is unavailable with EU data residency.",
      "Official guidance flags more clarification, sensitivity to skills/AGENTS.md, detailed formatting, less delegation than some workflows expect, and potentially excessive testing. Specify autonomy, instruction precedence, output style, delegation boundaries and proportionate verification.",
      "Operator exercise: give the intended deliverable, available inputs, authorised actions, genuine stop conditions and acceptance evidence. If work pauses, request the exact blocking instruction and the concrete result prepared so far. Never interpret persistence as permission to bypass a control.",
    ],
  },
  {
    title: "Work and Codex: confirmed integration",
    source: astraSources[4],
    points: [
      "Current Work/Codex pricing lists rollout-dependent Astra usage estimates for Plus, Pro and Business, and states that Work and Codex share their usage allowance. Enterprise access additionally depends on eligibility and administrator enablement. Inspect the actual selector and usage dashboard before a large task.",
      "For repository work, keep Codex’s inspect → edit → test → review workflow. A model upgrade does not install plugins, grant account access, enable browser control or authorise publication. Verify the execution environment separately.",
      "When a safety review pauses Work, inspect the notice and findings. Resume only through the supported review flow and within the authorised task.",
    ],
  },
  {
    title: "Codex context continuity: experimental, not unlimited memory",
    source: astraSources[6],
    points: [
      "The documented features.context_management.experimental_mode setting enables notes and searchable history across context windows. It is off by default and requires ChatGPT sign-in on Plus, Pro or Pro Lite. Feature eligibility does not itself grant Astra access.",
      "Keep requirements, decisions, failures and acceptance evidence in durable project records. Check the installed version and current configuration reference before enabling an experiment; this Atlas does not change your settings.",
    ],
  },
  {
    title: "Compute budgets and limits that can interrupt work",
    source: astraSources[7],
    points: [
      "Reasoning mode and effort control different aspects of computation. Pro mode can increase latency and token use. Reasoning tokens occupy context and incur output charges even though they are not the visible answer.",
      "A response can reach max_output_tokens and become incomplete before producing a useful visible result. Inspect status, usage and partial artifacts before retrying; cap spending and avoid replaying completed external actions.",
      "Compare total cost per accepted result, including retries, tools and human correction. Do not estimate cost from visible answer length alone.",
    ],
  },
  {
    title: "Critical cyber capability: defensive operation and failure handling",
    source: astraSources[5],
    points: [
      "OpenAI classifies Astra at the Critical cybersecurity capability threshold. Stronger safeguards and monitoring address the associated misuse and misalignment risks. This is a capability classification, not permission or a guarantee of safe behavior.",
      "Use authorised secure-code review, patching and bounded defensive labs. Treat webpages, repositories, retrieved text and tool output as untrusted data when they contain instructions. Keep secrets out of prompts and grant only the access needed.",
      "Monitoring can interrupt legitimate work. Preserve the partial result, inspect the notice, confirm scope and use the supported review process. Never rephrase a blocked action to evade controls. Record the interruption in the evaluation instead of scoring an unexecuted task as successful.",
    ],
  },
] as const;

export const astraLabCases = [
  ["Difficult reasoning", "Freeze a constraint puzzle with an independently checked solution and one impossible variant.", "All constraints satisfied; impossibility recognised; no invented assumptions."],
  ["Deep-research planning", "Give both models the same question, date boundary and permitted sources; request a plan, not a completed investigation.", "Clear subquestions, primary-source strategy, contradiction checks and stopping rule; no pretend research."],
  ["Computer or browser task", "In a sandbox with synthetic records, edit a draft and recover from a missing control. Forbid sending or purchasing.", "Correct final UI state, action log, no duplicate action and no boundary crossing."],
  ["Coding and debugging", "Use two copies of the same broken repository with a reproducible failure and held-out regression cases.", "Original failure fixed, regressions pass, scoped diff and reproducible instructions."],
  ["Document creation", "Provide the same source pack, template and requested output file.", "Source-faithful content, correct tables, usable file and visual inspection against the template."],
  ["A/L explanation", "Supply an authentic syllabus-linked question and prescribed extract, including a known misconception.", "Correct mechanism, units and syllabus language; misconception repaired; uncertainty disclosed."],
  ["A/L marking and diagnosis", "Use an anonymised script, question and official marking scheme; have a human establish the reference marks first.", "Per-item mark agreement, evidence for deductions, correct error family and a targeted retest. AI does not award official marks."],
  ["Strategic decision analysis", "Freeze three plausible options, costs and constraints, including a credible no-change option.", "Evidence versus inference separated, tradeoffs stated, recommendation and reversal condition provided."],
] as const;

export const astraLabProtocol = [
  "Before access: prepare the fixtures and reference answers. Label the lab Not run; no estimated model scores.",
  "Freeze input files, prompts, success rules and time budget before either run. Record product, model label, mode/effort, date, tools, permissions and source cutoff. If environments differ, label this a system comparison.",
  "Run in fresh sessions with identical fixtures. Use a small repeated sample per task (for example three runs); keep failed attempts. Randomise model order and blind human grading where practical.",
  "Score quality, accuracy, source discipline and instruction following from 0 to 4: 0 unusable, 1 major repair, 2 partial, 3 accepted with minor correction, 4 all criteria met. Define task-specific anchors before running.",
  "Record tool outcome, elapsed seconds, human corrections and failed/total runs separately. A fabricated source or unauthorised action fails the run regardless of polish. Mark irrelevant metrics N/A, never zero.",
  "Compare task-level results and total cost; small samples are provisional. Change only a route that improves accepted outcomes without a critical regression. Recheck on a fresh transfer task and a later retest.",
] as const;
