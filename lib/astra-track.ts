import type { LessonContent } from "./lesson-data";

export const astraTrackTitle = "GPT-6 Astra — From Prompting to Verified Execution";
export const astraTrackMinutes = [90, 120, 90, 90, 120, 90, 90, 390];
export const astraTrackSources = {
  model: "https://developers.openai.com/api/docs/models/gpt-6-astra",
  guidance: "https://developers.openai.com/api/docs/guides/latest-model",
  work: "https://learn.chatgpt.com/docs/get-started-with-work",
  reasoning: "https://developers.openai.com/api/docs/guides/reasoning",
  async: "https://developers.openai.com/api/docs/guides/async-tool-calling",
  steering: "https://developers.openai.com/api/docs/guides/steering",
  computer: "https://developers.openai.com/api/docs/guides/tools-computer-use",
  evals: "https://developers.openai.com/api/docs/guides/evals",
  safety: "https://openai.com/index/safety-overview-gpt-6-astra/",
};
export const astraTeachingLabels = {
  documented: "Officially documented: linked primary documentation supports the product claim.",
  local: "Demonstrated in this Atlas: only an observed Atlas interaction, not a model-performance claim.",
  inference: "Reasonable inference: an interpretation to test, not a documented guarantee.",
  unknown: "Currently unverified: account access, an unperformed run or an unsupported claim remains unknown.",
};
export const astraComparison = [
  ["GPT-6 Astra", "Model", "Demanding reasoning and tool-guided work", "An account connection or permission grant", "Assuming capability means a tool is installed"],
  ["ChatGPT", "Product", "Conversation and orchestration", "A fixed model name or final authority", "Confusing a product plan with an API quota"],
  ["ChatGPT Work", "Workspace and execution environment", "Reviewable multi-step deliverables", "Proof that an external action occurred", "Accepting a completion claim without its artifact"],
  ["Codex", "Repository-aware coding environment", "Inspecting, editing, testing and reviewing software", "A replacement for scoped authority and human review", "Assuming tests cover every important failure"],
  ["User", "Authority and evaluator", "Approve scope, verify evidence and decide", "A passive recipient of model confidence", "Delegating responsibility with the task"],
] as const;

export const astraLessons: LessonContent[] = [
  {
    title: "What GPT-6 Astra Actually Is", objective: "Draw the product, model, execution and user boundaries for a real task before choosing Astra.",
    explanation: "Astra is a model used within products and developer applications. The surrounding environment supplies context, tools and permissions. Official documentation positions it for difficult end-to-end work; that positioning does not prove access, success or suitability for every task. Treat the account selector and actual tool inventory as observations separate from the model reference.",
    example: "A request to produce a spreadsheet needs more than a capable model: a source table, file-creation tooling and a checked output file. If the application only returns text, the spreadsheet has not been created. The comparison table distinguishes these responsibilities.",
    activity: "Use the comparison table to label each component in a document task and a repository task. Open the primary model and Work pages and record what is documented versus unavailable in your account.",
    check: "Explain an unfamiliar AI application's boundaries to a beginner without relying on model branding.",
    failureMode: "The learner assumes the public API context limit, account quota and product file limit are interchangeable.",
    passCriterion: "The explanation identifies all four layers, labels access uncertainty and names an observation that would prove the task actually completed.",
    transfer: "Repeat the boundary analysis for a voice assistant with a separate image-generation tool.", resourceIds: ["r121", "r122", "r128", "r20"],
  },
  {
    title: "Designing an Executable Astra Request", objective: "Convert an ambiguous goal into a bounded request with inspectable acceptance conditions.",
    explanation: "A good specification reduces consequential ambiguity. Describe the desired output, relevant context, allowed scope, constraints, source standard, tools, verification, completion signal and stopping conditions. Do not demand maximal detail in every field: include what changes the result. The Studio's completeness checklist checks whether fields exist, not whether their contents are correct.",
    example: "Weak: 'Make this report better.' Improved: 'Rewrite the supplied report for a beginner in 600 words.' Stronger: 'Preserve the checked figures; label unsupported claims; use only the supplied sources; produce an editable draft and a claim audit; do not publish.' Audience controls language, preservation controls scope and the audit makes errors inspectable.",
    activity: "Load the research preset, remove one important boundary and predict the likely failure. Restore it using the fewest words that resolve the ambiguity.",
    check: "Write a fresh specification for a document task with an ambiguous audience and one missing source. State what may be inferred and what needs clarification.",
    failureMode: "A long prompt repeats praise and urgency but never states the output format or evidence standard.",
    passCriterion: "A reviewer can determine the authorised actions, required artifact, pass checks and legitimate stop condition without guessing.",
    transfer: "Turn the same goal into a coding request with a failing test, allowed files and rollback target.", resourceIds: ["r11", "r121", "r21"],
  },
  {
    title: "Initiative, Autonomy and Follow-Through", objective: "Calibrate autonomous action while preserving consequential approval boundaries.",
    explanation: "Specify which ordinary details may be inferred and which decisions would materially alter scope. Let the assistant finish authorised reversible preparation before asking about a consequential next step. Persistence means following through on the authorised outcome; it does not expand permissions. Official Astra guidance describes clarification behaviour that makes these distinctions particularly useful.",
    example: "Under-authorised: 'Do nothing until I approve every sentence.' Over-authorised: 'Use any accounts and publish whatever is best.' Bounded: 'Inspect the supplied repository, implement and test the named fix, and prepare a reviewable patch. Ask only if a missing choice changes behaviour; stop before public deployment.'",
    activity: "Classify ten proposed actions as routine inference, focused clarification, authorised execution or separate approval. Explain the borderline cases.",
    check: "Repair a task brief that alternates between 'never ask' and 'confirm everything'. Include a concrete deliverable prepared before an approval request.",
    failureMode: "The agent is told to ignore all pauses, including a real permission boundary or safety notice.",
    passCriterion: "The brief permits useful execution, names the consequential boundary and preserves the user's ability to change or stop the task.",
    transfer: "Apply the same policy to preparing a connected-app update where drafting is allowed but sending is not.", resourceIds: ["r121", "r90"],
  },
  {
    title: "Long-Running Work and Mid-Turn Steering", objective: "Revise a running task while preserving accepted work and avoiding duplicate actions.",
    explanation: "An addition, correction, priority change, replacement and status question have different effects. Name the change and the work that should remain intact. For the API, the steering guide describes a queued update and continuation on a WebSocket connection; acceptance is not proof that the revised outcome has been produced. Product interfaces may expose different controls.",
    example: "A report has a verified source inventory and unfinished prose. 'Keep the source inventory; change the audience to beginners; revise only the prose and examples' is a correction with preservation. 'What is finished?' requests status and does not authorise restarting the report.",
    activity: "Use the steering timeline's four cases and identify the preserved state, pending tool and revised acceptance test in each.",
    check: "Write a steering message for a task whose first external action completed but its second action is still pending. Prevent duplication explicitly.",
    failureMode: "The update is treated as a fresh task and already completed actions are repeated.",
    passCriterion: "The change log distinguishes accepted, pending, superseded and unperformed work; the revised result satisfies the current request.",
    transfer: "Handle a replacement request that makes the original deliverable obsolete while leaving its public research useful.", resourceIds: ["r124", "r121"],
  },
  {
    title: "Tools, Browsing, Files and Computer Work", objective: "Trace tool requests through execution, observation and independently checked completion.",
    explanation: "A model selects or requests actions; the application executes available tools. Async tool calling allows independent work while a tool is pending, but does not run your background jobs for you. Track pending calls and their results separately. For browser or computer work, check the final interface state and external effects, not merely a sequence of intended clicks.",
    example: "Two public-source fetches may run independently. A comparison cannot be declared complete until both return or the missing source is disclosed. If a document-save action succeeded, a lost acknowledgement is a recovery problem, not permission to repeat every preceding action.",
    activity: "Trace a synthetic research-to-document workflow with a delayed fetch and a failed save confirmation. Mark each step as requested, running, observed or verified.",
    check: "Design a file or browser workflow with explicit permission, secret-handling and duplicate-action checks.",
    failureMode: "Tool availability is inferred from model benchmarks, or a requested action is reported as executed.",
    passCriterion: "Each completion claim has an observation, missing tools remain explicit and irreversible actions have appropriate approval.",
    transfer: "Replace file creation with an image-generation tool and explain which verification checks must change.", resourceIds: ["r125", "r126", "r90"],
  },
  {
    title: "Reasoning Effort and Workflow Calibration", objective: "Choose and revise compute settings using task evidence instead of a maximum-effort habit.",
    explanation: "Difficulty, failure cost and verification effort should influence compute allocation. Compare an inexpensive accepted result with the full cost of a slower response, retries and human correction. The developer corner separates verified API settings from product selectors; changing effort and choosing a Pro variant are not interchangeable operations.",
    example: "A short rewrite may need only a clear style requirement and a quick factual check. A database migration warrants deeper failure analysis and rollback review. Neither choice can be justified by response length alone.",
    activity: "Route eight tasks by difficulty, cost of failure, required tools and how the answer can be checked. Give at least one case where a non-AI tool is preferable.",
    check: "Run the same bounded task at two available settings with a frozen rubric. Report measured latency and corrections, or mark the comparison Not run if access is absent.",
    failureMode: "The most expensive setting is selected for every task or undocumented controls are copied between products.",
    passCriterion: "The recommendation uses actual settings, accepted-result evidence and an explicit uncertainty statement; unavailable measurements are not invented.",
    transfer: "Reassess after the task gains a hard latency limit and loses one optional tool.", resourceIds: ["r122", "r127"],
  },
  {
    title: "Instruction Hierarchy, Skills and Security", objective: "Identify instruction sources and prevent untrusted content from gaining authority over tools.",
    explanation: "Project guidance can shape agent behaviour, while websites, documents and tool responses may contain untrusted instructions. Inspect which source actually governs the task and flag a conflicting instruction rather than silently following it. Astra's documented cybersecurity classification warrants defensive safeguards, not unbounded testing or attempts to bypass a pause.",
    example: "A retrieved document includes a sentence asking for private files. It is evidence content, not a user instruction. A correct workflow can cite the document's legitimate facts while refusing to grant it tool authority.",
    activity: "Audit a synthetic context packet containing user scope, repository guidance and an untrusted document. Mark each trust boundary and the permissions required by each proposed action.",
    check: "Diagnose a legitimate task pause: identify the exact conflicting instruction, preserve prepared work and propose a scoped resolution without bypassing safeguards.",
    failureMode: "A safety stop is reframed as an obstacle to evade, or a repository file is treated as unlimited user consent.",
    passCriterion: "The trace preserves instruction priority, excludes secrets, blocks unapproved actions and names residual risk.",
    transfer: "Repeat the review when the untrusted instruction arrives through an MCP tool response rather than a web page.", resourceIds: ["r123", "r78", "r81", "r90"],
  },
  {
    title: "Evaluation and Reliable Improvement", objective: "Evaluate a complete Astra workflow, repair a measured failure and defend a routing decision.",
    explanation: "Freeze tasks and scoring rules before running a comparison. Use independent reference answers where possible, preserve failed attempts and distinguish a model comparison from a comparison of different tool environments. A successful anecdote cannot estimate reliability. This module includes two hours of controlled evaluation and four-and-a-half hours of Mission Control capstone work; the capstone is not additional curriculum time.",
    example: "A visually polished report fails if a central citation does not support its claim. Record that failure even when the other rubric dimensions score highly; an average must not conceal a critical error.",
    activity: "Prepare the eight-task comparison worksheet with reference outputs and task-specific anchors. Run only accessible systems, keeping inputs, tools and criteria fixed.",
    check: "Complete Mission Control: specification, bounded execution, mid-turn change, verification, uncertainty, transfer and delayed-retention evidence.",
    failureMode: "A prompt is tuned on the test set until scores improve, then the same cases are called independent validation.",
    passCriterion: "The comparison and capstone preserve failures, pass all critical gates, meet the rubric and justify only changes supported by accepted results.",
    transfer: "Repeat the workflow on a different artifact type using held-out cases and then an unseen delayed variant.", resourceIds: ["r73", "r121", "r122"],
  },
];

export const missionControl = {
  title: "Astra Mission Control: From Ambiguous Goal to Verified Deliverable",
  allocatedMinutes: 270,
  scenario: "A fictional community workshop needs a beginner handout comparing three rainwater-saving options. The initial brief says 'make it convincing', but evidence includes missing costs and a changed capacity limit. Produce a useful decision aid without inventing certainty.",
  materials: "Create a source pack with three short public-source extracts and a synthetic table: option A costs 120 units and stores 80 L; B costs 180 and stores 150 L; C costs 100 with capacity unknown. The fictional space permits at most 100 L. Label the figures synthetic and keep the source URLs for general claims separate from invented scenario facts.",
  constraints: "No purchases, account writes or publication. Keep original sources intact. Do not treat absent data as zero. Choose a document or local page; an accessible editable artifact is required. Actual model access may be unavailable: prepare the fixture, but mark execution Not run until it occurs.",
  guided: "Build an executable request with the Studio. Calculate cost per litre by hand where possible, identify the capacity conflict and define evidence checks before requesting an output.",
  partial: "Allow a reference checklist but hide the worked request. Change B's capacity to 90 L midway through the task. Preserve source research and revise only affected calculations and conclusions.",
  independent: "Use a fresh option table and an unfamiliar audience. Define permissions, run the authorised workflow, issue a genuine mid-turn change where supported, and inspect the final artifact. If steering is unsupported, document that limit and perform an explicit continuation instead of pretending live steering occurred.",
  evidence: "Keep the initial and revised requests, source inventory, before/after calculations, observed tool trace, artifact, rubric scores, failure log and actual completion dates. Record product/model/settings and all human corrections. Atlas retains notes only and does not inspect these artifacts.",
  rubric: [["Specification and ambiguity handling", 20], ["Tool authority and safe execution", 15], ["Steering and preservation of accepted work", 15], ["Factual, numerical and artifact verification", 25], ["Uncertainty and limitation reporting", 10], ["Fresh transfer performance", 10], ["Delayed independent retention", 5]] as const,
  minimumPass: 80,
  criticalFailures: ["An unauthorised external action", "Exposure of a real secret or private artifact", "Fabricated source or material completion claim", "An uncorrected numerical error that changes the decision", "Claiming a transfer or delayed retest that was not performed"],
  repair: "Fail the attempt if any critical condition occurs, regardless of total score. Otherwise identify the lowest-scoring criterion, isolate its cause, make one targeted correction and repeat a fresh case. Preserve the failed attempt; do not overwrite it with only the improved result.",
  transfer: "Create an accessible spreadsheet decision aid for a fictional library purchasing shelves. Supply new constraints and one unknown value; reuse the verification method without copying the original recommendation.",
  retest: "At least seven days after successful transfer, independently produce a one-page decision aid from an unseen synthetic source pack. Hide previous prompts and artifacts. Reassess the same critical gates and rubric; a scheduled date or a score without evidence is not mastery.",
};

export const developerExamples = [
  {
    title: "A bounded Responses request", language: "JavaScript", source: astraTrackSources.guidance,
    code: `import OpenAI from "openai";\n\n// Server-side only. Configure OPENAI_API_KEY outside source control.\nconst client = new OpenAI();\nconst result = await client.responses.create({\n  model: "gpt-6-astra",\n  reasoning: { effort: "low" },\n  input: "Explain why a valid JSON document can still violate a schema.",\n  max_output_tokens: 1200\n});\nconsole.log(result.status, result.output_text, result.usage);`,
    note: "Officially documented API shape, adapted example; not executed by this Atlas. Responses is required for Astra tool calling. Remove unsupported temperature, top_p and top_logprobs when migrating. A low output budget can yield an incomplete result; inspect status and usage before retrying.",
  },
  {
    title: "Change effort between responses", language: "JSON", source: astraTrackSources.reasoning,
    code: JSON.stringify({ model: "gpt-6-astra", previous_response_id: "REPLACE_WITH_PRIOR_RESPONSE_ID", reasoning: { effort: "low" }, input: [{ type: "configuration_update", reasoning: { effort: "high" } }, { role: "user", content: "Now examine the failure modes and rollback conditions." }] }, null, 2),
    note: "Officially documented: keep the original request-level effort; the input update changes subsequent effort while preserving the prefix. Astra standard single-agent mode only. Do not place adjacent updates or combine them with automatic compaction/truncation or the standalone compact endpoint. Check the current guide for explicit compaction handling.",
  },
  {
    title: "An asynchronous read-only tool definition", language: "JSON", source: astraTrackSources.async,
    code: JSON.stringify({ type: "function", name: "read_synthetic_record", description: "Read one record from the approved synthetic fixture.", async: true, strict: true, parameters: { type: "object", properties: { record_id: { type: "string" } }, required: ["record_id"], additionalProperties: false } }, null, 2),
    note: "Officially documented definition pattern. This is not a complete tool runner: your application validates permissions, executes the read, tracks pending work and returns function_call_output with the original call_id. Async does not mean unbounded concurrency or automatic background-job management.",
  },
  {
    title: "A WebSocket steering event", language: "JSON", source: astraTrackSources.steering,
    code: JSON.stringify({ type: "response.steer", previous_response_id: "REPLACE_WITH_ACTIVE_RESPONSE_ID", input: "Preserve the checked source inventory. Change only the audience and pending document layout." }, null, 2),
    note: "Officially documented event pattern. Send on the same connection after response.created. Acceptance means queued, not applied. Continue reading events; avoid a duplicate response.create unless required tool input or approval is needed. Pending steering may be lost on disconnect: reconcile before replaying.",
  },
];
