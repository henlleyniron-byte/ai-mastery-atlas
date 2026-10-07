"use client";

import { type ReactNode, type SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OperatorCore } from "@/components/operator-core";
import { KnowledgeSystemsStudio } from "@/components/knowledge-systems-studio";
import { SkillsPassport } from "@/components/skills-passport";
import { V4CommandCentre, type UnitDetail } from "@/components/v4-command-centre";
import { lessonData, type LessonContent } from "@/lib/lesson-data";
import { expansionTracks } from "@/lib/expansion-track-data";
import { astraLessons, astraTrackTitle } from "@/lib/astra-track";
import {
  defineCurriculum, importLearningState, newLearningState, progressMinutes, sanitizeLegacyRecord, validDate,
  type LearningState,
} from "@/lib/learning-state";
import { domainsFor, levelFor, levels, levelTargets } from "@/lib/programme";
import { newStudioState, sanitizeStudioState, type StudioState } from "@/lib/astra-studio";
import { migrateLegacyPublicLabs, type BenchmarkRun, type ClaudeLabState, type GeminiLabState } from "@/lib/v5-state";
import {
  AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, ChevronRight, Clock3, Compass, Download, ExternalLink,
  FlaskConical, Layers3, ListChecks, Orbit, RotateCcw, Search, ShieldCheck, Sparkles, Trophy, Upload, Zap,
} from "lucide-react";

const ClaudeMastery = dynamic(() => import("@/components/claude-mastery").then(module => module.ClaudeMastery), { loading: () => <p className="section-intro">Loading Claude practice lab…</p> });
const GeminiMastery = dynamic(() => import("@/components/gemini-mastery").then(module => module.GeminiMastery), { loading: () => <p className="section-intro">Loading Gemini practice lab…</p> });
const V5SystemsLab = dynamic(() => import("@/components/v5-systems-lab").then(module => module.V5SystemsLab), { loading: () => <p className="section-intro">Loading systems intelligence lab…</p> });

type RouteName = "Essential" | "Builder" | "Advanced";
type NeedLevel = "Essential" | "Useful" | "Specialist" | "Optional" | "Curiosity";
type Depth = "Simple" | "Practical" | "Technical";
type Status = "Unseen" | "Learned" | "Practised" | "Demonstrated" | "Transferred" | "Retest Due" | "Mastered" | "Needs Repair" | "Later" | "Skipped with reason";

type TrackProgress = {
  status: Status;
  demonstratedEvidence?: string;
  demonstratedAt?: string;
  transferContext?: string;
  transferEvidence?: string;
  transferredAt?: string;
  retestDue?: string;
  retestEvidence?: string;
  retestPassedAt?: string;
  repairNote?: string;
  skipReason?: string;
  migrationNote?: string;
};

type QueueItem = {
  trackId: string;
  kind: "Repair" | "Retest now" | "Retest scheduled" | "Continue";
  detail: string;
  priority: number;
  due?: string;
};

type Module = {
  title: string; learn: number; lab: number; assessment: number; tier: "Core" | "Deep dive" | "Optional";
  objective: string; explanation: string; activity: string; check: string; failureMode: string;
  passCriterion: string; transfer: string; resourceIds: string[]; example?: string;
  reviewStatus?: "REVIEWED" | "NEEDS REVIEW";
};
type Lab = {
  scenario: string; materials: string; constraints: string; guided: string; partial: string;
  independent: string; evidence: string; rubric: string[]; repair: string; transfer: string;
  retest: string;
};
type Track = {
  id: string; code: string; route: RouteName; hours: number; title: string; need: NeedLevel;
  prerequisites: string[]; simple: string; outcome: string; whenNot: string;
  primary: string; freeAlternative: string; agnostic: string; modules: Module[];
  proof: string; labBrief: string; lab: Lab; resourceIds: string[];
};
type Resource = {
  id: string; title: string; creator: string; url: string;
  format: "Official docs" | "Video" | "Course" | "Standard" | "Reference";
  duration: string; level: "Beginner" | "Intermediate" | "Advanced"; route: RouteName;
  tier: "Core" | "Deep dive" | "Optional" | "Reference"; topic: string; tool: string;
  free: boolean; why: string; evergreen: boolean; lastVerified: string;
  status: "Active" | "Rolling out" | "Changing" | "Review needed" | "Deprecated"; verification: "Fetched" | "Search-confirmed" | "User-supplied";
  qualityTier: "A · Canonical" | "B · Expert" | "C · Supplemental" | "D · Discovery / unverified";
  versionRelevance: string;
};
type ToolRole = {
  name: string; need: NeedLevel; role: string; best: string; poor: string;
  tradeoff: string; privacy: string; alternative: string; depth: string;
};

const supplementalResourcesByTrack: Record<string, string[]> = {
  e1: ["r10"], e4: ["r98"], e5: ["r99"], e7: ["r85", "r107", "r108"],
  b0: ["r100"], b1: ["r101"], b3: ["r109", "r111"], b6: ["r102", "r103", "r117"],
  a1: ["r104", "r106", "r115", "r116", "r119"], a3: ["r105", "r112"],
  a4: ["r118", "r120"], a5: ["r113", "r114"], a7: ["r110"],
};


const authoredLessons: Record<string, LessonContent[]> = { ...lessonData, ...Object.fromEntries(expansionTracks.map(track => [track.id, track.lessons])), astra: astraLessons };

const splitModules = (hours: number, names: string[], trackId: string): Module[] => {
  const authored = authoredLessons[trackId];
  if (!authored || authored.length !== names.length) throw new Error(`Missing authored lessons: ${trackId}`);
  const totalMinutes = hours * 60;
  const baseMinutes = Math.floor(totalMinutes / names.length);
  const remainder = totalMinutes % names.length;
  return names.map((title, index) => {
    const lesson = authored[index];
    if (lesson.title !== title) throw new Error(`Lesson identity mismatch: ${trackId}/${title}`);
    const minutes = baseMinutes + (index < remainder ? 1 : 0);
    // Floor instruction minutes so integer rounding never pushes authored active work below 65%.
    const instructionMinutes = Math.floor(minutes * 0.35);
    const practiceMinutes = Math.round(minutes * 0.45);
    return {
      ...lesson, learn: instructionMinutes / 60, lab: practiceMinutes / 60,
      assessment: (minutes - instructionMinutes - practiceMinutes) / 60,
      tier: index === names.length - 1 && hours >= 8 ? "Deep dive" : "Core",
      reviewStatus: "REVIEWED",
    };
  });
};

const buildTrackLab = (title: string, whenNot: string, agnostic: string, proof: string, modules: Module[]): Lab => {
  const first = modules[0];
  const middle = modules[Math.floor(modules.length / 2)];
  const last = modules[modules.length - 1];
  return {
    scenario: `Use this track's opening case as the starting constraint, then produce the final track artifact: ${first.example}`,
    materials: `Start with the public-safe or synthetic inputs required here: ${first.activity} Keep a blank decision log and apply this tool-neutral sequence: ${agnostic}`,
    constraints: `${whenNot} Also treat this authored failure as a required boundary test: ${middle.failureMode}`,
    guided: `${first.activity} Compare the result against this criterion before correcting it: ${first.passCriterion}`,
    partial: `${middle.activity} Keep the checklist, hide all worked outputs, preserve the first failed attempt and explain the repair before continuing.`,
    independent: `${last.check} No worked answer may be visible; disclose assistance and submit the requested artifact plus one independently verified check.`,
    evidence: `Retain the initial input and result, correction trace, independent artifact and completion date. Show how the evidence meets “${last.passCriterion}” Evidence is self-reported; this Site does not inspect external artifacts.`,
    rubric: [first.passCriterion, middle.passCriterion, last.passCriterion, proof],
    repair: `If the attempt exhibits “${middle.failureMode}”, mark Needs Repair, revisit only that decision and rerun the independent task on unseen material. Preserve rather than overwrite the failed evidence.`,
    transfer: `${last.transfer} Record the changed constraint, preserved principle, result and supporting evidence; changing only names or presentation does not count.`,
    retest: `At least seven days after a passed transfer, repeat this independent task with prior outputs hidden: ${last.check} Record the actual result and assistance; a scheduled date alone is not mastery.`,
  };
};

const makeTrack = (
  id: string, code: string, route: RouteName, hours: number, title: string, need: NeedLevel,
  prerequisites: string[], simple: string, outcome: string, whenNot: string,
  primary: string, freeAlternative: string, agnostic: string, moduleNames: string[],
  proof: string, resourceIds: string[],
): Track => {
  const integratedResourceIds = Array.from(new Set([...resourceIds, ...(supplementalResourcesByTrack[id] || [])]));
  const modules = splitModules(hours, moduleNames, id);
  return {
    id, code, route, hours, title, need, prerequisites, simple, outcome, whenNot,
    primary, freeAlternative, agnostic, modules,
    proof,
    labBrief: `Produce the track artifact under a fresh constraint: ${proof}`,
    lab: buildTrackLab(title, whenNot, agnostic, proof, modules),
    resourceIds: integratedResourceIds,
  };
};

export const tracks: Track[] = [
  makeTrack(
    "e0", "E0", "Essential", 5, "Zero to One: your first useful result", "Essential", [],
    "Meet the territory without jargon, complete a useful task in 30 minutes, and learn why the answer still needs checking.",
    "Distinguish AI, model, app, chatbot, prompt, context, web access, files, privacy and hallucination.",
    "Do not explore dozens of products yet. One general chatbot is enough for the first session.",
    "Any capable free chatbot", "ChatGPT, Gemini, Claude, Kimi, DeepSeek or Qwen free access",
    "Ask → improve → request evidence → open evidence → compare → explain.",
    ["First useful task in 30 minutes", "Model vs app vs chatbot vs tool", "Prompts, context, web and files", "Hallucinations, disagreement, privacy and verification"],
    "A one-page before/after prompt, opened evidence, correction and model comparison.", ["r01", "r03", "r11", "r19"],
  ),
  makeTrack(
    "e1", "E1", "Essential", 10, "AI foundations without the magic", "Essential", ["e0"],
    "Learn what modern AI can and cannot do before trusting product claims or confident answers.",
    "Explain ML, neural networks, tokens, context, embeddings, transformers, training, inference and multimodality.",
    "Do not begin with advanced mathematics unless it improves your ability to diagnose or build.",
    "Visual, university and official foundation courses", "Elements of AI, 3Blue1Brown and Google ML material",
    "Explain each mechanism intuitively, connect it to observable behavior, then test that behavior.",
    ["AI → ML → deep learning → generative AI", "Neural networks, loss and learning", "Tokens, context and embeddings", "Attention and transformers", "Training, post-training, inference and multimodality"],
    "A ten-minute closed-book teach-back with five correctly diagnosed model failures.", ["r01", "r02", "r03", "r04", "r05", "r06", "r08"],
  ),
  makeTrack(
    "e2", "E2", "Essential", 10, "Prompting, verification and evaluations", "Essential", ["e0"],
    "Turn vague requests into clear jobs, then test whether the output is actually good.",
    "Define objective, context, constraints, examples, output, rubric, evidence rules and done-when criteria.",
    "Stop rewriting prompts when the real problem is missing data, the wrong tool or no verification method.",
    "OpenAI and Anthropic prompting guidance", "The method works in any general chatbot",
    "Specify → run → score → diagnose → repair → rerun unchanged tests.",
    ["Clear asks: objective, context and format", "Constraints, examples and decomposition", "Citations, uncertainty and claim checks", "Rubrics, test sets and adversarial cases"],
    "A reproducible prompt specification and 10-case evaluation report another learner can rerun.", ["r11", "r12", "r13", "r14", "r72"],
  ),
  makeTrack(
    "e3", "E3", "Essential", 8, "ChatGPT strategic operating system", "Essential", ["e0", "e2"],
    "Separate product, model, execution and user authority; then route each job to Chat, Search, Deep Research, Projects, Work, Codex or no AI.",
    "Use ChatGPT as a strategic orchestration environment across files, images, research, projects and tools while preserving evidence checks and human authority.",
    "Do not confuse the ChatGPT product, its selected model and its action tools—or use a powerful model where a simpler method is safer.",
    "ChatGPT", "A free chatbot plus ordinary documents and a manual evidence loop",
    "Choose conversation for thinking and an agentic workspace for multi-source outcomes.",
    ["Product, model, context, files and multimodality", "Chat, Search, Deep Research, Projects and memory", "Work, Codex, plugins and scheduled execution", "Strategic Judge, privacy and model-change survival"],
    "A routed, reviewable outcome whose claims are traceable, authority boundaries are explicit and model changes are evaluated with a frozen rubric.", ["r19", "r20", "r21", "r22", "r23", "r121", "r122", "r123"],
  ),
  makeTrack(
    "e4", "E4", "Essential", 8, "Gemini and NotebookLM", "Essential", ["e0", "e2"],
    "Use Gemini broadly and NotebookLM when answers must stay grounded in a chosen source set.",
    "Build a high-quality notebook, audit citations and compare source-exclusive Gemini Notebook answers with Gemini interactions that may also use web search or other tools.",
    "Source grounding does not prove that the selected sources are accurate, current or complete.",
    "Gemini + NotebookLM", "Any chatbot plus a manually maintained claim-to-source table",
    "Separate source discovery from bounded synthesis; judge the sources before the generated answer.",
    ["Gemini fundamentals and multimodal work", "Gemini research and Google integration", "Gemini Notebook sources, citations and Studio outputs", "Notebook-only grounding vs Gemini tools and web"],
    "A five-source notebook with source-quality notes, citation audit and discrepancy report.", ["r24", "r25", "r26", "r27", "r28", "r29"],
  ),
  makeTrack(
    "e5", "E5", "Essential", 6, "Claude and the wider model landscape", "Useful", ["e0", "e2"],
    "Learn Claude, then evaluate Kimi, Grok, DeepSeek, Qwen and Perplexity without model-shopping.",
    "Compare reasoning, research, citations, coding, context, speed, cost, privacy and instruction-following.",
    "Do not add a model unless it wins a distinct role in your own repeatable test set.",
    "Claude plus two available comparison models", "Use any two free systems and score outputs blind",
    "Hold task, prompt and rubric constant; change only the model.",
    ["Claude chat, projects, artifacts and long documents", "Cowork and careful delegation", "Kimi, Grok, DeepSeek, Qwen and Perplexity"],
    "A blind five-task benchmark and routing policy with no universal winner.", ["r30", "r31", "r32", "r33", "r34", "r35", "r36", "r37", "r38", "r39"],
  ),
  makeTrack(
    "e6", "E6", "Essential", 7, "Research, academic AI and epistemology", "Essential", ["e1", "e2"],
    "Learn how to decide what is true, not merely what sounds plausible.",
    "Decompose claims, rank sources, triangulate disagreements, verify quotations and calibrate confidence.",
    "Do not let AI replace first attempts, original reasoning, assigned work or expert review in high-stakes settings.",
    "Primary sources + source-grounded AI", "Browser search, library databases and a spreadsheet claim map",
    "Question → subclaims → source hierarchy → triangulation → contradiction pass → confidence statement.",
    ["Primary, secondary, peer-reviewed and current sources", "Claim decomposition and citation audits", "Socratic tutoring, recall and error analysis", "Conflicts, uncertainty and correction"],
    "A corrected 1,000-word brief separating evidence, inference, disagreement and uncertainty.", ["r15", "r16", "r17", "r26", "r84"],
  ),
  makeTrack(
    "e7", "E7", "Essential", 6, "Knowledge systems, browsers and privacy", "Useful", ["e0"],
    "Give storage, projects, thinking, recall and spatial organisation different jobs without duplicating everything.",
    "Choose among Notion, Anki, RemNote and xTiles; use Chrome and Brave safely; export your work.",
    "Do not adopt every tool. Start with one canonical home and add a recall system only when needed.",
    "One notes/operations tool + one recall tool", "Folders, a spreadsheet, paper cards and browser bookmarks",
    "Capture → canonical home → deliberate retrieval → review → archive/export.",
    ["Storage, operations, thinking, retrieval and space", "Anki and RemNote: recall before buttons", "Notion and xTiles: operations vs maps", "Chrome, Brave, permissions, passwords and export"],
    "A one-page architecture, 20 audited cards, one useful map and an export/restore check.", ["r40", "r41", "r42", "r43", "r44", "r45", "r46", "r47", "r48"],
  ),

  makeTrack(
    "b0", "B0", "Builder", 15, "Zero to Code: computer and programming foundations", "Essential", ["e0"],
    "Learn what files, commands and programs are before supervising a coding agent.",
    "Navigate a terminal, read errors and write small Python programs with variables, conditions, loops and functions.",
    "Do not begin agentic coding until you can explain the changed files and run the project yourself.",
    "Python + terminal", "Browser-based Python environments and CS50P",
    "Input → state → logic → output → error → debug → test.",
    ["Files, folders, paths, terminals and commands", "Values, variables, types and collections", "Diagnostic Checkpoint", "Conditions, loops and functions", "Errors, debugging and testing", "Packages, environments and a small project"],
    "A working program you can explain line by line, deliberately break and repair.", ["r49", "r50", "r58", "r59"],
  ),
  makeTrack(
    "b1", "B1", "Builder", 10, "Git and GitHub mental models", "Essential", ["b0"],
    "Git keeps recoverable snapshots; GitHub hosts collaboration around repositories.",
    "Commit, branch, merge, push, pull, review a diff, open a pull request and recover a mistake.",
    "Do not commit secrets, generated junk or changes you have not inspected.",
    "Git + GitHub", "Local Git or another Git host teaches the same mental model",
    "Working tree → staged change → commit → branch → remote → review → merge → recovery.",
    ["Repository, working tree, staging and commits", "Branches, merges and recovery", "GitHub remotes, issues and pull requests", "README, .gitignore, secrets and collaboration"],
    "A reproducible repository with clean history, pull request and recovery demonstration.", ["r51", "r52", "r53", "r54", "r84"],
  ),
  makeTrack(
    "b2", "B2", "Builder", 10, "Web foundations: HTML, CSS and JavaScript", "Useful", ["b0"],
    "HTML gives a page meaning, CSS controls presentation and JavaScript adds behavior.",
    "Build and inspect a responsive accessible page, understand DOM events and use developer tools.",
    "Do not chase frameworks before you can read the page structure and basic browser errors.",
    "MDN + browser developer tools", "Any text editor and modern browser",
    "Structure → style → behavior → inspect → test → deploy.",
    ["Semantic HTML and accessibility", "CSS layout, responsive design and states", "JavaScript, DOM events and data", "Developer tools, debugging and deployment"],
    "An accessible page that works on phone and desktop with no unexplained console errors.", ["r55", "r56", "r57"],
  ),
  makeTrack(
    "b3", "B3", "Builder", 8, "JSON, HTTP and APIs from zero", "Essential", ["b0"],
    "An API is a documented way for software to request data or actions from other software.",
    "Explain endpoint, request, response, HTTP, JSON, key, authentication, SDK, rate limit and webhook.",
    "Never paste API keys into chat, client code, screenshots or repositories.",
    "A harmless public API", "Mock JSON files and local test servers",
    "Validate input → authenticate → request → inspect status → validate output → handle failure.",
    ["JSON and structured data", "HTTP, endpoints, requests and responses", "Keys, auth, rate limits, cost and privacy", "Beginner API project and error handling"],
    "A small API app with clear failure states and no exposed secrets.", ["r58", "r59", "r60", "r71"],
  ),
  makeTrack(
    "b4", "B4", "Builder", 15, "AI coding agents: Codex, Cursor and Claude Code", "Essential", ["b0", "b1"],
    "A coding agent can inspect, change and run a repository; you remain responsible for scope, review and recovery.",
    "Choose a surface, provide context, request a plan, review diffs, run tests and recover safely.",
    "Do not approve code or commands you cannot explain, especially in sensitive repositories.",
    "Codex, Cursor or Claude Code", "One available coding assistant or manual pair-programming",
    "Goal + context + constraints + done-when → plan → diff → tests → review → checkpoint.",
    ["Agent loop, permissions and repository context", "Codex app, CLI and IDE workflows", "Diagnostic Checkpoint", "Cursor Agent, Plan and Rules", "Claude Code and terminal-native work", "Tests, diffs, review and rollback"],
    "A tested pull request, reviewed diff, reproducible README and architecture explanation.", ["r21", "r23", "r61", "r62", "r63", "r64", "r65"],
  ),
  makeTrack(
    "b5", "B5", "Builder", 7, "Automation that fails safely", "Useful", ["b3"],
    "Automation repeats a defined process when a trigger, schedule or condition occurs.",
    "Design triggers, conditions, actions, state, retries, logging, notifications and approval gates.",
    "Do not automate unstable, rare, high-consequence or poorly observed work.",
    "Any scheduler or workflow tool", "A checklist plus calendar reminder",
    "Manual proof → stable inputs → failure states → bounded retries → logs → owner → stop switch.",
    ["Triggers, schedules, conditions and actions", "State, retries, logging and notifications", "Approval, monitoring, failures and recovery", "A bounded scheduled workflow"],
    "An automation with logs, stop conditions, fallback instructions and a named human owner.", ["r20", "r69", "r70"],
  ),
  makeTrack(
    "b6", "B6", "Builder", 10, "MCP, tools and agents", "Specialist", ["b3", "b4"],
    "An agent combines a model, instructions, tools, environment and feedback; MCP can expose tools and context.",
    "Distinguish chatbot, workflow, automation, agent and multi-agent system; build one safe tool-using loop.",
    "Do not install unknown MCP servers or grant broad file, email, browser or shell permissions.",
    "MCP documentation + local synthetic server", "A mocked tool function with JSON input/output",
    "Plan → validate tool request → authorize → execute → observe → update state → stop.",
    ["Chatbot vs workflow vs automation vs agent", "MCP clients, servers, tools, resources and prompts", "Authentication, permissions and trust boundaries", "State, memory, retries and monitoring"],
    "A small agent with validated input, least privilege, bounded retries, logs and approval.", ["r66", "r67", "r68", "r69", "r70", "r71", "r72"],
  ),
  makeTrack(
    "b7", "B7", "Builder", 5, "Builder portfolio and deployment", "Useful", ["b1", "b2", "b3", "b4"],
    "Turn exercises into one clear, reproducible project another person can inspect and use.",
    "Deploy a small app, document setup, disclose limitations and gather evidence of correct behavior.",
    "Do not deploy secrets, private data, unreviewed dependencies or an app without failure states.",
    "GitHub + a deployment platform", "Local demo with screenshots and recorded walkthrough",
    "Problem → acceptance criteria → build → test → document → deploy → observe → maintain.",
    ["Scope, README and acceptance criteria", "Deployment, observability and rollback", "Portfolio narrative and peer reproduction", "Maintenance and teach-back"],
    "A deployed project, reproducible README, tests, issue log and rollback proof.", ["r51", "r52", "r55", "r84"],
  ),

  makeTrack(
    "a0", "A0", "Advanced", 10, "Transformers and inference deep dive", "Specialist", ["e1", "b0"],
    "Trace how tokens move through a transformer during generation.",
    "Reason about tokenisation, attention, residual streams, MLPs, position, sampling and inference cost.",
    "Do not pursue technical depth merely to sound technical; it should improve design or diagnosis.",
    "Visual transformer material + implementation notebook", "Karpathy and 3Blue1Brown materials",
    "Trace tensors and transformations, then connect each to observable generation behavior.",
    ["Tokenisation, embeddings and position", "Attention, residual stream and MLP", "Training, post-training and alignment", "Inference, sampling, context and cost"],
    "An annotated tiny transformer and a closed-book forward-pass explanation.", ["r04", "r05", "r06", "r07", "r75"],
  ),
  makeTrack(
    "a1", "A1", "Advanced", 8, "Embeddings, retrieval and RAG", "Specialist", ["a0", "b3"],
    "Retrieve relevant source chunks before generation so answers can use information outside model memory.",
    "Design chunking, embeddings, vector search, metadata, reranking and citation evaluation.",
    "Do not use RAG when the corpus fits directly in context or retrieval cannot be measured.",
    "Small public corpus + vector store", "Keyword search and direct context injection",
    "Ingest → clean → chunk → embed → retrieve → rerank → generate → cite → evaluate.",
    ["Embeddings and similarity search", "Chunking, metadata and vector databases", "RAG architecture and citation design", "Retrieval evaluation and poisoned sources"],
    "A RAG demo with retrieval metrics, citation checks and a documented no-RAG baseline.", ["r76", "r77", "r78"],
  ),
  makeTrack(
    "a2", "A2", "Advanced", 6, "Context engineering and structured systems", "Specialist", ["e2", "e3"],
    "Design the full information environment around a model, not only the last user prompt.",
    "Assemble, prioritise, compress and validate instructions, examples, data, tools, memory and schemas.",
    "Do not add context that is irrelevant, conflicting, stale or untrusted.",
    "Structured-output and tool-use docs", "A manual context packet and JSON schema",
    "Select → order → delimit → label trust → compress → validate → observe failures.",
    ["System, developer, user and data layers", "Schemas, examples, tools and memory", "Context budgets, conflicts and compression"],
    "A context specification documenting source, trust, priority, budget and evaluation evidence.", ["r11", "r12", "r71", "r72"],
  ),
  makeTrack(
    "a3", "A3", "Advanced", 8, "Evaluations and benchmarking", "Essential", ["e2", "b0"],
    "Create realistic tests that reveal improvement or quiet regression.",
    "Build datasets, rubrics, deterministic checks, human review, model judges and regression reports.",
    "Do not optimise a benchmark that is contaminated, unrepresentative or disconnected from outcomes.",
    "Official eval guidance + human-labelled cases", "A spreadsheet test set and blinded scoring",
    "Define behavior → collect cases → label → run → inspect slices → repair → rerun unchanged tests.",
    ["Success criteria, datasets and slices", "Rubrics, deterministic checks and human eval", "Model judges, bias and calibration", "Regression, cost-quality and contamination"],
    "A versioned 30-case suite with labels, slices, regression history and limitations.", ["r73", "r74", "r75", "r79", "r80"],
  ),
  makeTrack(
    "a4", "A4", "Advanced", 8, "Advanced agents, memory and orchestration", "Specialist", ["b6", "a3"],
    "Coordinate longer agent loops while keeping state, tools, errors, cost and authority observable.",
    "Design planning, routing, memory, retries, handoffs, approval and multi-agent evaluation.",
    "Do not use multiple agents when one deterministic workflow or one agent performs as well.",
    "A single-agent baseline before orchestration", "A deterministic workflow with manual handoffs",
    "Baseline → decompose → assign authority → share state → observe → evaluate → stop.",
    ["Planning, routing and handoffs", "Memory, state and long-running work", "Retries, monitoring, cost and stop rules", "Multi-agent evaluation against baseline"],
    "An orchestrated system that measurably beats a simpler baseline and remains stoppable.", ["r69", "r70", "r72", "r75"],
  ),
  makeTrack(
    "a5", "A5", "Advanced", 10, "Prompt injection, jailbreaks and AI security", "Essential", ["b6", "a3"],
    "Treat untrusted text as data, limit what AI can do and assume defenses may fail.",
    "Distinguish injection from jailbreaks, threat-model tools and apply layered defenses in synthetic labs.",
    "Do not test real systems without authorisation or turn defensive lessons into bypass recipes.",
    "OWASP, NIST, OpenAI, Anthropic and Google guidance", "Mock documents, fake credentials and disposable local environments",
    "Identify assets → map trust → minimise authority → validate → approve → monitor → recover.",
    ["Direct and indirect prompt injection", "Jailbreaks and responsible red teaming", "Tool abuse, exfiltration and poisoned retrieval", "Least privilege, sandboxing and approvals", "Incident response and recovery"],
    "A threat model, harmless attack simulation, mitigation evidence and clean-state restore.", ["r78", "r81", "r82", "r83", "r86", "r87"],
  ),
  makeTrack(
    "a6", "A6", "Advanced", 4, "Privacy, governance and responsible deployment", "Useful", ["a5"],
    "Decide what data, authority and risk a system should be allowed before deployment.",
    "Classify data, document intended use, assign accountability and run a lightweight risk review.",
    "Do not treat a policy document as proof that technical controls work.",
    "NIST AI RMF and Privacy Framework", "A risk register, data map and review checklist",
    "Purpose → data → stakeholders → harms → controls → evidence → owner → review.",
    ["Data classification, consent and retention", "Risk registers and ownership", "Model/system cards and governance", "Deployment review and evidence"],
    "A model card, data map, risk register, named owner and review date.", ["r18", "r83", "r88"],
  ),
  makeTrack(
    "a7", "A7", "Advanced", 6, "Capstone: trustworthy AI research and study system", "Essential", ["a1", "a3", "a5"],
    "Integrate research, building, evaluation, security and recovery into one useful public-safe project.",
    "Ship, evaluate, defend, document, recover and teach a complete AI system.",
    "Do not add features that fail to improve a defined user outcome or evaluation score.",
    "Your selected stack", "A local-only implementation with recorded demonstration",
    "Trusted sources → retrieval → answer → learning task → error log → eval → defenses → deployment.",
    ["Architecture, scope and acceptance criteria", "Build, source grounding and evaluation", "Security, documentation and deployment", "Teach-back and delayed retest plan"],
    "A deployed or recorded system, repository, eval suite, threat model, recovery proof and teach-back.", ["r18", "r51", "r73", "r78", "r84"],
  ),

  makeTrack(
    "s0", "S0", "Essential", 12, "Advanced research and scientific evidence", "Specialist", ["e6", "e2"],
    "Move from competent source checking to research-grade evidence synthesis and reproducibility.",
    "Design review protocols, search strategies, evidence tables, uncertainty analyses and reproducible research packages.",
    "Do not present a literature map as expert consensus when coverage, methods or domain review are incomplete.",
    "University databases, primary papers and research tools", "Open indexes, browser search and a spreadsheet evidence ledger",
    "Protocol → search → screen → extract → appraise → synthesise → reproduce → update.",
    ["Research protocols and search strategies", "Paper screening and evidence extraction", "Statistics, uncertainty and causal claims", "Systematic synthesis and contradiction maps"],
    "A reproducible mini-review with protocol, exclusions, evidence table, limitations and update procedure.", ["r09", "r16", "r18", "r89"],
  ),
  makeTrack(
    "s1", "S1", "Builder", 16, "Production AI coding agents", "Specialist", ["b4", "b7", "e2"],
    "Supervise larger agentic changes across architecture, tests, reviews and release workflows.",
    "Run plan-driven repository work, parallel reviews, CI checks, migrations and failure recovery without surrendering code ownership.",
    "Do not grant broad autonomy in unfamiliar, sensitive or poorly tested repositories.",
    "Codex, Cursor and Claude Code", "One coding agent plus manual Git and review",
    "Issue → plan → checkpoints → implementation → tests → review → release → retrospective.",
    ["Repository instructions and execution plans", "Large-change decomposition and checkpoints", "Test strategy, CI and code review", "Release, rollback and agent retrospectives"],
    "A production-style feature release with plan, tests, review evidence, rollback and post-task retrospective.", ["r21", "r23", "r61", "r64", "r90"],
  ),
  makeTrack(
    "s2", "S2", "Builder", 14, "AI product engineering", "Specialist", ["b3", "b7", "a2", "e2"],
    "Turn a model demo into a reliable product with users, data contracts, evaluation and operational limits.",
    "Design model routing, streaming, persistence, cost controls, observability, fallbacks and human review.",
    "Do not ship a clever demo as a product without real user requirements and failure handling.",
    "Provider APIs + web stack", "Mock models and deterministic local fixtures",
    "User need → contract → baseline → model call → eval → fallback → observe → iterate.",
    ["Product requirements and model contracts", "Streaming, persistence and structured output", "Routing, budgets, latency and fallbacks", "Observability, feedback and safe launch"],
    "A small AI product with acceptance tests, cost ceiling, fallback path and documented monitoring.", ["r59", "r71", "r72", "r75", "r91"],
  ),
  makeTrack(
    "s3", "S3", "Builder", 10, "Open and local model laboratory", "Optional", ["e1", "b3"],
    "Evaluate open-weight and locally served models with the same discipline used for hosted systems.",
    "Compare model size, quantisation, hardware, privacy, latency, licensing and task quality.",
    "Do not assume local means secure, cheap or suitable; deployment moves responsibility to you.",
    "Qwen, DeepSeek and other open models", "Hosted free playgrounds and published model cards",
    "Requirements → candidate models → controlled serving → benchmark → risk review → keep or retire.",
    ["Open weights, licences and model cards", "Hardware, quantisation and local serving", "Benchmarking quality, latency and cost", "Privacy, updates and operational security"],
    "A model-selection report with reproducible benchmark, hardware assumptions, risks and retirement rule.", ["r37", "r38", "r92", "r93"],
  ),
  makeTrack(
    "s4", "S4", "Essential", 8, "Multimodal AI and creative systems", "Optional", ["e1", "e2"],
    "Work deliberately across text, images, audio and video while preserving provenance and human authorship.",
    "Design multimodal prompts, evaluate outputs, manage rights and create a coherent production workflow.",
    "Do not generate or publish deceptive, private, copyrighted or identity-sensitive material carelessly.",
    "Available multimodal models", "Open media tools plus manual editing",
    "Brief → references → generate → inspect → edit → disclose → archive sources and rights.",
    ["Multimodal inputs and representation", "Image, audio and video prompting", "Evaluation, editing and provenance", "Rights, disclosure and responsible publishing"],
    "A small multimodal project with source log, evaluation rubric, human edits and disclosure note.", ["r22", "r24", "r30", "r94"],
  ),
  makeTrack(
    "s5", "S5", "Essential", 10, "Learning engineering and knowledge architecture", "Specialist", ["e7", "e2"],
    "Design learning systems around retrieval, feedback and transfer rather than notes and dashboards.",
    "Measure card quality, error repair, delayed retests, knowledge transfer and tool friction.",
    "Do not optimise study software when examination output, sleep or health deteriorates.",
    "One canonical knowledge system + one recall system", "Paper, folders and a spreadsheet retest ledger",
    "Attempt → feedback → error model → repair → retrieval → transfer → delayed retest.",
    ["Retrieval, spacing and interleaving", "Card and question engineering", "Error taxonomies and transfer tests", "Knowledge-system audits and simplification"],
    "A four-week measured learning experiment showing retention, transfer, workload and tool decisions.", ["r40", "r42", "r44", "r84", "r95"],
  ),
  makeTrack(
    "s6", "S6", "Advanced", 14, "Defensive red-team laboratory", "Specialist", ["a5", "a6"],
    "Run authorised, harmless security evaluations against synthetic agent and retrieval systems.",
    "Create threat cases for injection, tool abuse, data leakage, malicious files, supply chains and recovery.",
    "Never test systems, accounts or data you do not own or have explicit permission to assess.",
    "Disposable local labs and synthetic data", "Paper threat models and mocked tool calls",
    "Scope → authorise → isolate → test → record → mitigate → retest → disclose responsibly.",
    ["Lab isolation, authorisation and rules of engagement", "Injection and malicious-content test suites", "Tool, credential and supply-chain scenarios", "Mitigation validation and incident exercises"],
    "A safe red-team report with scope, cases, evidence, mitigations, retests and responsible-disclosure plan.", ["r78", "r81", "r82", "r83", "r86", "r96"],
  ),
  makeTrack(
    "s7", "S7", "Advanced", 16, "Independent practice, teaching and community leadership", "Specialist", ["a7", "s0"],
    "Consolidate mastery by teaching, maintaining resources and leading evidence-based community improvements.",
    "Create lessons, mentor beginners, review contributions, maintain a changelog and repeat the full capstone under new constraints.",
    "Do not confuse public visibility, badges or follower counts with technical or educational competence.",
    "Community Edition + public-safe portfolio", "A local study group and offline teaching pack",
    "Teach → observe confusion → repair explanation → assess transfer → publish evidence → maintain.",
    ["Curriculum design and beginner explanations", "Teaching labs and assessment design", "Contribution review, accessibility and translation", "Second capstone, maintenance and public portfolio"],
    "A taught workshop, assessed learner artifacts, contribution guide, changelog and second transfer capstone.", ["r16", "r50", "r56", "r84", "r97"],
  ),
  makeTrack(
    "astra", "ASTRA", "Essential", 18, astraTrackTitle, "Useful", ["e3", "f1"],
    "Use Astra as a current case study in model-aware, tool-aware and evidence-aware execution.",
    "Specify, steer, verify and evaluate bounded Astra work while separating product, model, execution and user authority.",
    "Do not assume rollout access, copy unsupported API settings or choose frontier compute for every task.",
    "ChatGPT with GPT-6 Astra where available", "Use any available model and mark Astra execution Not run",
    "Release detected → verify → test → route → preserve stable principles.", astraLessons.map(lesson => lesson.title),
    "A controlled eight-task comparison and Mission Control artifact with failures, corrections, transfer and delayed retest.",
    Array.from(new Set(astraLessons.flatMap(lesson => lesson.resourceIds))),
  ),
  ...expansionTracks.map(track => makeTrack(
    track.id, track.code, track.route, track.hours, track.title, track.need, track.prerequisites,
    track.simple, track.outcome, track.whenNot, track.primary, track.freeAlternative, track.agnostic,
    track.lessons.map(lesson => lesson.title), track.proof,
    Array.from(new Set(track.lessons.flatMap(lesson => lesson.resourceIds))),
  )),
];

const terminalUnitIds = new Map(tracks.map(track => [track.id, `${track.id}-m${track.modules.length}`]));
const retentionPolicyFor = (trackId: string) => {
  const foundational = new Set(["e0", "e1", "e2", "e3", "f0", "f1"]);
  const systemsCritical = new Set(["a3", "a5", "r0", "g0", "c0"]);
  if (foundational.has(trackId)) return { minimumRetestDays: 21, maintenanceRetestDays: 90 };
  if (systemsCritical.has(trackId)) return { minimumRetestDays: 14, maintenanceRetestDays: 60 };
  if (["pr0", "a7", "s7"].includes(trackId)) return { minimumRetestDays: 21, maintenanceRetestDays: 120 };
  return { minimumRetestDays: 7, maintenanceRetestDays: 30 };
};
export const runtimeCurriculum = defineCurriculum(tracks.flatMap(track => track.modules.map((module, index) => ({
  id: `${track.id}-m${index + 1}`,
  trackId: track.id,
  title: module.title,
  minutes: Math.round((module.learn + module.lab + module.assessment) * 60),
  instructionMinutes: Math.round(module.learn * 60),
  kind: track.id === "c0" ? "capstone" as const : track.id === "pr0" ? "project" as const : "module" as const,
  prerequisites: index ? [`${track.id}-m${index}`] : track.prerequisites.map(id => terminalUnitIds.get(id) || `${id}-missing`),
  domains: [...domainsFor(track.id), track.route, levelFor(track.id), track.id],
  ...retentionPolicyFor(track.id),
}))));

export const runtimeUnitDetails: Record<string, UnitDetail> = Object.fromEntries(tracks.flatMap(track => track.modules.map((module, index) => [
  `${track.id}-m${index + 1}`,
  {
    trackCode: track.code,
    trackTitle: track.title,
    objective: module.objective,
    activity: module.activity,
    check: module.check,
    transfer: module.transfer,
    passCriterion: module.passCriterion,
  },
])));

const searchConfirmedResourceIds = new Set([
  "r01", "r02", "r10", "r13", "r27", "r29", "r33", "r34", "r40", "r43", "r59", "r67",
  "r76", "r77", "r79", "r91", "r98", "r99", "r104", "r105", "r106", "r108", "r109", "r110",
  "r111", "r112", "r113", "r114", "r115", "r116", "r117", "r119", "r120",
]);

const resource = (
  id: string, title: string, creator: string, url: string,
  format: Resource["format"], duration: string, level: Resource["level"], route: RouteName,
  tier: Resource["tier"], topic: string, tool: string, why: string,
  evergreen = false, free = true, lastVerified = "2026-09-01", status: Resource["status"] = "Active",
  qualityTier?: Resource["qualityTier"], verification?: Resource["verification"], versionRelevance?: string,
): Resource => ({
  id, title, creator, url, format, duration, level, route, tier, topic, tool, why, evergreen, free,
  lastVerified, status,
  verification: verification || (searchConfirmedResourceIds.has(id) ? "Search-confirmed" : "Fetched"),
  qualityTier: qualityTier || (format === "Official docs" || format === "Standard" ? "A · Canonical" : format === "Course" ? "B · Expert" : "C · Supplemental"),
  versionRelevance: versionRelevance || (evergreen ? "Durable concept" : `Recheck after product changes · ${lastVerified}`),
});

export const resources: Resource[] = [
  resource("r01", "Elements of AI", "University of Helsinki", "https://www.elementsofai.com/", "Course", "15h selected", "Beginner", "Essential", "Core", "AI literacy", "Tool-neutral", "Calm, nontechnical foundations with real exercises.", true),
  resource("r02", "AI for Everyone", "DeepLearning.AI", "https://www.deeplearning.ai/courses/ai-for-everyone", "Course", "6h", "Beginner", "Essential", "Deep dive", "AI literacy", "Tool-neutral", "A realistic map of AI capabilities, projects and limitations.", true),
  resource("r03", "But what is a neural network?", "3Blue1Brown", "https://www.youtube.com/watch?v=aircAruvnKk", "Video", "19m", "Beginner", "Essential", "Core", "Neural networks", "Tool-neutral", "The clearest visual first contact with neural networks.", true),
  resource("r04", "Transformers, the tech behind LLMs", "3Blue1Brown", "https://www.youtube.com/watch?v=wjZofJX0v4M", "Video", "27m", "Intermediate", "Advanced", "Core", "Transformers", "Tool-neutral", "A rigorous visual bridge from language to transformer computation.", true),
  resource("r05", "Attention in transformers, step by step", "3Blue1Brown", "https://www.youtube.com/watch?v=eMlx5fFNoYc", "Video", "26m", "Intermediate", "Advanced", "Core", "Attention", "Tool-neutral", "Makes attention mechanics inspectable without hand-waving.", true),
  resource("r06", "Intro to Large Language Models", "Andrej Karpathy", "https://www.youtube.com/watch?v=zjkBMFhNj_g", "Video", "1h", "Beginner", "Essential", "Core", "LLMs", "Tool-neutral", "Broad, technically honest map from a leading educator.", true),
  resource("r07", "Let's build GPT", "Andrej Karpathy", "https://www.youtube.com/watch?v=kCc8FmEb1nY", "Video", "2h", "Advanced", "Advanced", "Deep dive", "Transformers", "Python", "Connects transformer ideas to working code.", true),
  resource("r08", "Machine Learning Crash Course", "Google", "https://developers.google.com/machine-learning/crash-course", "Course", "15h selected", "Intermediate", "Essential", "Deep dive", "Machine learning", "Tool-neutral", "Official exercises and practical ML foundations.", true),
  resource("r09", "Foundational AI courses", "MIT Open Learning", "https://openlearning.mit.edu/news/13-foundational-ai-courses-resources-mit", "Course", "Choose 1", "Intermediate", "Essential", "Reference", "AI foundations", "Tool-neutral", "University-curated routes for serious depth.", true),
  resource("r10", "Generative AI for Everyone", "DeepLearning.AI", "https://www.deeplearning.ai/courses/generative-ai-for-everyone", "Course", "3h", "Beginner", "Essential", "Optional", "Generative AI", "Tool-neutral", "Concise capabilities, lifecycle and limitations.", true),
  resource("r11", "Prompting", "OpenAI", "https://learn.chatgpt.com/docs/prompting", "Official docs", "30m", "Beginner", "Essential", "Core", "Prompting", "ChatGPT", "Current official framework for goals, context, outputs and checks."),
  resource("r12", "Prompt engineering overview", "Anthropic", "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview", "Official docs", "30m", "Intermediate", "Essential", "Core", "Prompting", "Claude", "Begins with success criteria and empirical evaluation."),
  resource("r13", "ChatGPT Prompt Engineering for Developers", "DeepLearning.AI + OpenAI", "https://www.deeplearning.ai/courses/chatgpt-prompt-eng", "Course", "1.5h", "Beginner", "Essential", "Core", "Prompting", "ChatGPT", "Practical prompt iteration with hands-on notebooks.", true),
  resource("r14", "Google Prompting Essentials", "Google", "https://www.coursera.org/specializations/prompting-essentials-google", "Course", "10h selected", "Beginner", "Essential", "Optional", "Prompting", "Gemini", "A structured beginner sequence when access is available.", false, false),
  resource("r15", "SIFT: the four moves", "Mike Caulfield", "https://hapgood.us/2019/06/19/sift-the-four-moves/", "Reference", "25m", "Beginner", "Essential", "Core", "Verification", "Browser", "Memorable lateral-reading method for online claims.", true),
  resource("r16", "Civic Online Reasoning", "Digital Inquiry Group", "https://cor.inquirygroup.org/", "Course", "3h selected", "Beginner", "Essential", "Core", "Verification", "Browser", "Evidence-based practice for evaluating digital sources.", true),
  resource("r17", "Fact Check Explorer", "Google", "https://toolbox.google.com/factcheck/explorer", "Reference", "15m", "Beginner", "Essential", "Reference", "Verification", "Browser", "Useful lead generator; never a substitute for source inspection."),
  resource("r18", "AI Risk Management Framework", "NIST", "https://www.nist.gov/itl/ai-risk-management-framework", "Standard", "2h selected", "Advanced", "Advanced", "Core", "Governance", "Tool-neutral", "Durable vocabulary for mapping and managing AI risk.", true),
  resource("r19", "ChatGPT quickstart", "OpenAI", "https://learn.chatgpt.com/docs/quickstart", "Official docs", "20m", "Beginner", "Essential", "Core", "General AI", "ChatGPT", "Current first-party starting point."),
  resource("r20", "Get started with ChatGPT Work", "OpenAI", "https://learn.chatgpt.com/docs/get-started-with-work", "Official docs", "35m", "Beginner", "Essential", "Core", "Delegation", "ChatGPT Work", "Explains task choice, local/cloud work and reviewable outcomes."),
  resource("r21", "Codex best practices", "OpenAI", "https://learn.chatgpt.com/guides/best-practices", "Official docs", "45m", "Intermediate", "Builder", "Core", "AI coding", "Codex", "Context, planning, permissions, testing and review."),
  resource("r22", "ChatGPT and Codex video library", "OpenAI", "https://learn.chatgpt.com/videos", "Video", "Choose 4", "Beginner", "Essential", "Reference", "Product workflows", "ChatGPT", "Frequently updated official demonstrations."),
  resource("r23", "Codex CLI quickstart", "OpenAI", "https://learn.chatgpt.com/docs/codex/cli", "Official docs", "30m", "Intermediate", "Builder", "Core", "AI coding", "Codex", "Current installation, control and first-task guidance."),
  resource("r24", "Notebooks in Gemini Apps", "Google", "https://support.google.com/notebooklm/answer/17003757", "Official docs", "25m", "Beginner", "Essential", "Core", "Grounded research", "Gemini", "Defines the critical grounding and Studio differences between Gemini Notebook and Gemini interactions."),
  resource("r25", "Learn Gemini", "Google", "https://gemini.google/explore/", "Course", "1h selected", "Beginner", "Essential", "Core", "General AI", "Gemini", "Beginner-oriented official use cases."),
  resource("r26", "Learn about Gemini Notebook", "Google", "https://support.google.com/gemininotebook/answer/16164461", "Official docs", "45m selected", "Beginner", "Essential", "Core", "Grounded research", "NotebookLM", "Current first-party overview of supported source types, source-grounded chat, citations and generated study outputs."),
  resource("r27", "How to Use Google NotebookLM", "Jeff Su", "https://www.youtube.com/watch?v=uSVBfyHBiDU", "Video", "31m", "Beginner", "Essential", "Core", "Grounded research", "NotebookLM", "Clear full workflow with practical source choices."),
  resource("r28", "Learn 80% of NotebookLM", "Teacher's Tech", "https://www.youtube.com/watch?v=EOmgC3-hznM", "Video", "13m", "Beginner", "Essential", "Optional", "Grounded research", "NotebookLM", "Fast interface orientation before the source-quality lab."),
  resource("r29", "Gemini Deep Research walkthrough", "Google", "https://www.youtube.com/watch?v=hbeBoAgX_DI", "Video", "Selected", "Beginner", "Essential", "Optional", "Research", "Gemini", "A visual starting point for inspecting research plans and sources."),
  resource("r30", "Claude Academy", "Anthropic", "https://academy.claude.com/", "Course", "4h selected", "Beginner", "Essential", "Core", "General AI", "Claude", "Official structured learning rather than scattered interface tours."),
  resource("r31", "Claude course catalog", "Anthropic", "https://academy.claude.com/courses", "Course", "Choose 2", "Intermediate", "Builder", "Reference", "Claude ecosystem", "Claude", "Routes to prompting, API, Claude Code and MCP material."),
  resource("r32", "Introduction to Claude Cowork", "Anthropic", "https://academy.claude.com/courses/introduction-to-claude-cowork", "Course", "1h", "Beginner", "Essential", "Optional", "Delegation", "Claude Cowork", "Official framing for bounded work delegation."),
  resource("r33", "Claude tutorial for beginners", "Kevin Stratvert", "https://www.youtube.com/watch?v=-xEF5WrdIWs", "Video", "30m", "Beginner", "Essential", "Optional", "General AI", "Claude", "A practical orientation before official deeper work."),
  resource("r34", "Claude official video channel", "Anthropic", "https://www.youtube.com/@claude", "Video", "Choose 3", "Beginner", "Essential", "Reference", "Claude ecosystem", "Claude", "Current first-party demonstrations; select only videos tied to a lab."),
  resource("r35", "Kimi new-user guide", "Moonshot AI", "https://www.kimi.com/en/help/new-user-guide/overview", "Official docs", "25m", "Beginner", "Essential", "Optional", "Model comparison", "Kimi", "First-party overview for controlled comparisons."),
  resource("r36", "Grok overview", "xAI", "https://docs.x.ai/grok/overview", "Official docs", "Reference", "Intermediate", "Essential", "Optional", "Model comparison", "Grok", "Direct first-party overview for controlled Grok comparisons."),
  resource("r37", "DeepSeek API documentation", "DeepSeek", "https://api-docs.deepseek.com/", "Official docs", "Reference", "Intermediate", "Essential", "Optional", "Model comparison", "DeepSeek", "Primary source for controlled technical evaluation."),
  resource("r38", "QwenLM official repositories", "Qwen", "https://github.com/QwenLM", "Official docs", "Reference", "Intermediate", "Essential", "Optional", "Model comparison", "Qwen", "Current first-party index for active Qwen model families, repositories and model documentation."),
  resource("r39", "Perplexity Help Center", "Perplexity", "https://www.perplexity.ai/help-center/en/", "Official docs", "Reference", "Beginner", "Essential", "Optional", "Research", "Perplexity", "Current source for answer-engine behavior and settings."),
  resource("r40", "Notion Academy", "Notion", "https://academy.notion.com/", "Course", "3h selected", "Beginner", "Essential", "Core", "Knowledge systems", "Notion", "Official progressive instruction for pages and databases."),
  resource("r41", "Notion for Beginners", "Thomas Frank Explains", "https://www.youtube.com/watch?v=j06RIbbWA7Y", "Video", "35m", "Beginner", "Essential", "Optional", "Knowledge systems", "Notion", "A restrained beginner path before complex databases."),
  resource("r42", "Anki manual", "Anki", "https://docs.ankiweb.net/", "Official docs", "Reference", "Beginner", "Essential", "Core", "Spaced repetition", "Anki", "Authoritative scheduling, card, FSRS and export reference."),
  resource("r43", "Anki FSRS overview and setup", "AnKing", "https://www.youtube.com/watch?v=NMLxc06l-Co", "Video", "22m", "Intermediate", "Essential", "Optional", "Spaced repetition", "Anki", "Practical setup after learning retrieval principles."),
  resource("r44", "How to use Anki in medical school", "Zach Highley", "https://www.youtube.com/watch?v=xLIKnumRXD0", "Video", "30m", "Beginner", "Essential", "Optional", "Spaced repetition", "Anki", "Connects active recall and spacing to real study work."),
  resource("r45", "RemNote Help Center", "RemNote", "https://help.remnote.com/en/", "Official docs", "Reference", "Beginner", "Essential", "Optional", "Knowledge systems", "RemNote", "Use for a bounded pilot rather than immediate migration."),
  resource("r46", "xTiles Help Center", "xTiles", "https://help.xtiles.app/en/", "Official docs", "Reference", "Beginner", "Essential", "Optional", "Visual organisation", "xTiles", "Official help for purposeful spatial maps."),
  resource("r47", "Chrome Help", "Google", "https://support.google.com/chrome/", "Official docs", "45m selected", "Beginner", "Essential", "Core", "Browser literacy", "Chrome", "Profiles, permissions, passwords and security in one current source."),
  resource("r48", "Brave quickstart", "Brave", "https://support.brave.app/hc/en-us/articles/360035410812-Quickstart-guide-New-to-Brave-Start-here", "Official docs", "20m", "Beginner", "Essential", "Optional", "Browser privacy", "Brave", "Neutral operational starting point for a separate privacy lane."),
  resource("r49", "Learn Python — full course", "freeCodeCamp", "https://www.youtube.com/watch?v=rfscVS0vtbw", "Video", "4.5h", "Beginner", "Builder", "Core", "Programming", "Python", "A complete beginner sequence; pause for exercises.", true),
  resource("r50", "CS50's Introduction to Python", "Harvard", "https://cs50.harvard.edu/python/", "Course", "20h selected", "Beginner", "Builder", "Deep dive", "Programming", "Python", "Rigorous assignments and feedback for serious depth.", true),
  resource("r51", "GitHub Skills", "GitHub", "https://skills.github.com/", "Course", "3h selected", "Beginner", "Builder", "Core", "Version control", "GitHub", "Hands-on official repositories for authentic workflows."),
  resource("r52", "GitHub Hello World", "GitHub", "https://docs.github.com/en/get-started/using-github/hello-world", "Official docs", "30m", "Beginner", "Builder", "Core", "Version control", "GitHub", "Repository, branch, commit and pull request in one lab."),
  resource("r53", "Pro Git", "Git", "https://git-scm.com/book/en/v2", "Reference", "4h selected", "Intermediate", "Builder", "Deep dive", "Version control", "Git", "Durable reference for Git's data model."),
  resource("r54", "Git and GitHub for Beginners", "freeCodeCamp", "https://www.youtube.com/watch?v=RGOj5yH7evk", "Video", "1h", "Beginner", "Builder", "Core", "Version control", "GitHub", "Coherent first walkthrough before repeated practice.", true),
  resource("r55", "Learn web development", "MDN", "https://developer.mozilla.org/en-US/docs/Learn_web_development", "Course", "15h selected", "Beginner", "Builder", "Core", "Web development", "Browser", "Standards-oriented HTML, CSS and JavaScript.", true),
  resource("r56", "JavaScript full course", "freeCodeCamp", "https://www.youtube.com/watch?v=PkZNo7MFNFg", "Video", "3.5h", "Beginner", "Builder", "Optional", "Programming", "JavaScript", "Broad syntax tour paired with MDN reference.", true),
  resource("r57", "Accessibility fundamentals", "web.dev", "https://web.dev/learn/accessibility/", "Course", "4h selected", "Intermediate", "Builder", "Core", "Accessibility", "Web", "Accessibility is part of correctness, not polish.", true),
  resource("r58", "APIs for Beginners", "freeCodeCamp", "https://www.youtube.com/watch?v=GZvSYJDk-us", "Video", "2h", "Beginner", "Builder", "Core", "APIs", "Tool-neutral", "Explains why APIs exist before implementation details.", true),
  resource("r59", "Learn JSON", "Web Dev Simplified", "https://www.youtube.com/watch?v=GpOO5iKzOmY", "Video", "12m", "Beginner", "Builder", "Core", "Structured data", "JSON", "Short orientation before real API payloads.", true),
  resource("r60", "OpenAI API quickstart", "OpenAI", "https://developers.openai.com/api/docs/quickstart", "Official docs", "45m", "Intermediate", "Builder", "Optional", "APIs", "OpenAI API", "Use after API fundamentals and secret handling."),
  resource("r61", "Cursor Agent security", "Cursor", "https://cursor.com/docs/agent/security", "Official docs", "30m", "Intermediate", "Builder", "Core", "AI coding security", "Cursor", "First-party guardrails, approval boundaries, network controls and recovery guidance for agent use."),
  resource("r62", "Cursor Agent overview", "Cursor", "https://cursor.com/docs/agent/overview", "Official docs", "30m", "Intermediate", "Builder", "Core", "AI coding", "Cursor", "Defines agent behavior, modes and controls."),
  resource("r63", "Cursor Rules", "Cursor", "https://cursor.com/docs/rules", "Official docs", "25m", "Intermediate", "Builder", "Core", "Context engineering", "Cursor", "Makes repository guidance durable."),
  resource("r64", "Claude Code overview", "Anthropic", "https://code.claude.com/docs/en/overview", "Official docs", "45m", "Intermediate", "Builder", "Core", "AI coding", "Claude Code", "Authoritative setup and operating model."),
  resource("r65", "Claude Code security", "Anthropic", "https://code.claude.com/docs/en/security", "Official docs", "35m", "Intermediate", "Builder", "Core", "AI coding security", "Claude Code", "First-party safeguards, permission boundaries and safe-use guidance."),
  resource("r66", "Model Context Protocol introduction", "MCP", "https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro", "Official docs", "45m", "Intermediate", "Builder", "Core", "MCP", "MCP", "Protocol-first model of clients, servers and capabilities."),
  resource("r67", "MCP: Build Rich-Context AI Apps", "DeepLearning.AI + Anthropic", "https://www.deeplearning.ai/courses/mcp-build-rich-context-ai-apps-with-anthropic", "Course", "2h", "Intermediate", "Builder", "Core", "MCP", "MCP", "Guided implementation after trust boundaries are understood."),
  resource("r68", "Building Agents with MCP", "AI Engineer", "https://www.youtube.com/watch?v=kQmXtrmQ5Zg", "Video", "1h", "Intermediate", "Builder", "Deep dive", "MCP", "MCP", "Workshop view of agent/tool integration."),
  resource("r69", "AI Agents for Beginners", "Microsoft", "https://github.com/microsoft/ai-agents-for-beginners", "Course", "8h selected", "Intermediate", "Builder", "Core", "Agents", "Tool-neutral", "Structured lessons, code and diagrams from a primary source."),
  resource("r70", "Agentic AI", "Andrew Ng", "https://www.youtube.com/watch?v=w7vqXL4PWEE", "Video", "5h course", "Intermediate", "Builder", "Deep dive", "Agents", "Python", "Builds core agentic patterns without hiding them behind a framework."),
  resource("r71", "Function calling", "OpenAI", "https://developers.openai.com/api/docs/guides/function-calling", "Official docs", "45m", "Intermediate", "Builder", "Core", "Tools", "OpenAI API", "Primary source for schema-constrained tool requests."),
  resource("r72", "Agents guide", "OpenAI", "https://developers.openai.com/api/docs/guides/agents", "Official docs", "1h", "Intermediate", "Builder", "Deep dive", "Agents", "OpenAI API", "Current first-party agent architecture guidance."),
  resource("r73", "Working with evals", "OpenAI", "https://developers.openai.com/api/docs/guides/evals", "Official docs", "1h", "Intermediate", "Advanced", "Core", "Evaluations", "Tool-neutral", "Practical lifecycle for datasets, graders and iteration."),
  resource("r74", "How to Build AI Evals", "Hamel Husain + Shreya Shankar", "https://www.youtube.com/watch?v=J7N9FMouSKg", "Video", "1h", "Advanced", "Advanced", "Core", "Evaluations", "Tool-neutral", "Production-minded evaluation practice without benchmark theatre."),
  resource("r75", "LLM Bootcamp", "Full Stack Deep Learning", "https://fullstackdeeplearning.com/llm-bootcamp/", "Course", "12h selected", "Advanced", "Advanced", "Deep dive", "LLM systems", "Tool-neutral", "Rigorous bridge from model ideas to production systems.", true),
  resource("r76", "RAG fundamentals and advanced techniques", "freeCodeCamp", "https://www.youtube.com/watch?v=ea2W8IogX80", "Video", "2h", "Advanced", "Advanced", "Core", "RAG", "Tool-neutral", "Broad practical sequence paired with a no-RAG baseline."),
  resource("r77", "Vector Databases: Embeddings to Applications", "DeepLearning.AI", "https://www.deeplearning.ai/courses/vector-databases-embeddings-applications", "Course", "1h", "Intermediate", "Advanced", "Core", "Retrieval", "Tool-neutral", "Concise bridge from semantic vectors to retrieval."),
  resource("r78", "OWASP LLM01: Prompt Injection", "OWASP", "https://genai.owasp.org/llmrisk/llm01-prompt-injection/", "Standard", "45m", "Intermediate", "Advanced", "Core", "AI security", "Tool-neutral", "Threat-oriented definition, examples and mitigations."),
  resource("r79", "A Practical Guide to LLM Evaluation", "Michelle Yi", "https://www.youtube.com/watch?v=_K77Mx3GOjc", "Video", "40m", "Advanced", "Advanced", "Deep dive", "Evaluations", "Tool-neutral", "Adds real-world evaluation nuance."),
  resource("r80", "Testing Agent Skills with Evals", "OpenAI", "https://developers.openai.com/blog/eval-skills", "Official docs", "40m", "Advanced", "Advanced", "Optional", "Evaluations", "Codex", "Deterministic and rubric-based checks for agent capabilities."),
  resource("r81", "Prompt Injection Prevention Cheat Sheet", "OWASP", "https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html", "Standard", "1h", "Advanced", "Advanced", "Core", "AI security", "Tool-neutral", "Layered defensive engineering patterns."),
  resource("r82", "Prompt injection defenses", "Anthropic", "https://www.anthropic.com/news/prompt-injection-defenses", "Official docs", "30m", "Advanced", "Advanced", "Core", "AI security", "Claude", "First-party discussion of defenses and residual risk."),
  resource("r83", "Secure AI Framework", "Google", "https://saif.google/secure-ai-framework/risks", "Standard", "1h selected", "Advanced", "Advanced", "Core", "AI security", "Tool-neutral", "System-level risk categories beyond prompt-only defenses."),
  resource("r84", "Secret scanning and push protection", "GitHub", "https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning", "Official docs", "30m", "Intermediate", "Builder", "Core", "Secrets", "GitHub", "Concrete protection for a common deployment failure."),
  resource("r85", "Retrieval Practice", "Agarwal + Bain", "https://www.retrievalpractice.org/", "Course", "1h selected", "Beginner", "Essential", "Core", "Learning science", "Tool-neutral", "Evidence-based methods before flashcard software.", true),
  resource("r86", "Codex Security overview", "OpenAI", "https://learn.chatgpt.com/docs/security", "Official docs", "45m", "Advanced", "Advanced", "Core", "AI security", "Codex Security", "Current first-party boundary between general Codex work and authorised vulnerability discovery and remediation."),
  resource("r87", "GenAI Red Teaming Guide", "OWASP", "https://genai.owasp.org/resource/genai-red-teaming-guide/", "Standard", "2h selected", "Advanced", "Advanced", "Deep dive", "Red teaming", "Tool-neutral", "Risk-based defensive testing guidance covering model, implementation, infrastructure and runtime behavior without becoming a bypass cookbook."),
  resource("r88", "Privacy Framework", "NIST", "https://www.nist.gov/privacy-framework", "Standard", "1h selected", "Advanced", "Advanced", "Core", "Privacy", "Tool-neutral", "Connects data processing to privacy risk management.", true),
  resource("r89", "Cochrane Interactive Learning", "Cochrane", "https://www.cochrane.org/learn/courses-and-resources/interactive-learning", "Course", "10h selected", "Advanced", "Essential", "Deep dive", "Evidence synthesis", "Research", "Rigorous research-review methods for scientific evidence.", true, false),
  resource("r90", "Agent approvals and security", "OpenAI", "https://learn.chatgpt.com/docs/agent-approvals-security", "Official docs", "45m", "Intermediate", "Builder", "Core", "AI coding security", "Codex", "Current sandboxing, approval, network and least-privilege guidance for Codex."),
  resource("r91", "AI SDK documentation", "Vercel", "https://ai-sdk.dev/docs/introduction", "Official docs", "4h selected", "Intermediate", "Builder", "Deep dive", "AI product", "Web", "Structured path from model call to product interface."),
  resource("r92", "Hugging Face course", "Hugging Face", "https://huggingface.co/learn/llm-course/chapter1/1", "Course", "12h selected", "Intermediate", "Builder", "Deep dive", "Open models", "Hugging Face", "Practical open-model ecosystem and transformer tooling."),
  resource("r93", "Ollama documentation", "Ollama", "https://docs.ollama.com/", "Official docs", "2h selected", "Intermediate", "Builder", "Optional", "Local models", "Ollama", "Current primary source for local model serving."),
  resource("r94", "Generative AI learning path", "Google Cloud Skills Boost", "https://www.cloudskillsboost.google/paths/118", "Course", "8h selected", "Intermediate", "Essential", "Optional", "Multimodal AI", "Gemini", "Official modular route across generative and multimodal concepts."),
  resource("r95", "The Learning Scientists", "Learning Scientists", "https://www.learningscientists.org/", "Course", "2h selected", "Beginner", "Essential", "Core", "Learning science", "Tool-neutral", "Evidence-informed retrieval, spacing and interleaving.", true),
  resource("r96", "Prompt injection guidance", "UK NCSC", "https://www.ncsc.gov.uk/blog-post/prompt-injection-is-not-sql-injection", "Standard", "30m", "Advanced", "Advanced", "Core", "AI security", "Tool-neutral", "Important system-level framing of injection risk.", true),
  resource("r97", "Digital accessibility foundations", "W3C", "https://www.w3.org/WAI/fundamentals/", "Standard", "3h selected", "Beginner", "Advanced", "Core", "Accessibility", "Community", "Primary accessibility principles for public educational products.", true),

  resource("r98", "Master Google Gemini", "Jeff Su", "https://www.youtube.com/watch?v=-_FizlRlfYs", "Video", "1h", "Beginner", "Essential", "Optional", "General AI", "Gemini", "A current long-form Gemini workflow tutorial."),
  resource("r99", "Complete Claude tutorial", "Skill Leap AI", "https://www.youtube.com/watch?v=kyB68hS-vco", "Video", "1h", "Beginner", "Essential", "Optional", "General AI", "Claude", "Feature orientation paired with official Academy lessons."),
  resource("r100", "Python for Beginners with projects", "freeCodeCamp", "https://www.youtube.com/watch?v=eWRfhZUzrAc", "Video", "4.5h", "Beginner", "Builder", "Optional", "Programming", "Python", "A second project-led route when the primary Python course does not click.", true),
  resource("r101", "Visualized Git course", "The Modern Coder", "https://www.youtube.com/watch?v=S7XpTAnSDL4", "Video", "1.5h", "Beginner", "Builder", "Optional", "Version control", "Git", "Visual mental models for commits, branches and merges."),
  resource("r102", "MCP course introduction", "DeepLearning.AI", "https://www.youtube.com/watch?v=IkBslShH5to", "Video", "7m", "Beginner", "Builder", "Optional", "MCP", "MCP", "Concise orientation before the full implementation course."),
  resource("r103", "AI Agents for Beginners — full course", "Microsoft", "https://www.youtube.com/watch?v=OhI005_aJkA", "Video", "3h", "Intermediate", "Builder", "Deep dive", "Agents", "Tool-neutral", "Video companion to a structured agent curriculum."),
  resource("r104", "Production RAG full course", "freeCodeCamp", "https://www.youtube.com/watch?v=mHxLXzYjQRE", "Video", "3h", "Advanced", "Advanced", "Deep dive", "RAG", "Tool-neutral", "Production concerns after the smaller RAG lab."),
  resource("r105", "Introduction to Arize AX Evals", "Arize AI", "https://www.youtube.com/watch?v=qkMmJFh-Oog", "Video", "Selected", "Intermediate", "Advanced", "Optional", "Evaluations", "Tool-neutral", "A current, worked introduction to evaluation signals and code-based checks."),
  resource("r106", "Vector databases from embeddings", "DeepLearning.AI", "https://www.youtube.com/watch?v=AlQCf2iYWCg", "Video", "8m", "Intermediate", "Advanced", "Optional", "Retrieval", "Vector databases", "Quick conceptual bridge before hands-on work."),
  resource("r107", "Notion full course for beginners", "Thomas Frank Explains", "https://www.youtube.com/watch?v=e0bB45W1YKs", "Video", "1h", "Beginner", "Essential", "Deep dive", "Knowledge systems", "Notion", "A longer route for learners who choose Notion as their canonical home."),
  resource("r108", "Anki tips and spaced repetition", "Ali Abdaal", "https://www.youtube.com/watch?v=20kgOhyK72g", "Video", "15m", "Beginner", "Essential", "Optional", "Spaced repetition", "Anki", "A concise principles-to-practice supplement."),
  resource("r109", "HTTP networking course", "Boot.dev", "https://www.youtube.com/watch?v=2JYT5f2isg4", "Video", "5h", "Intermediate", "Builder", "Deep dive", "HTTP", "Web", "Deeper networking practice after the API overview."),
  resource("r110", "AI Engineering full course", "freeCodeCamp", "https://www.youtube.com/watch?v=BdENgqS7u5k", "Video", "10h", "Advanced", "Advanced", "Reference", "AI engineering", "Tool-neutral", "A capstone-scale survey; use chapters selectively, not passively."),

  resource("r111", "Building Systems with the ChatGPT API", "DeepLearning.AI + OpenAI", "https://www.deeplearning.ai/courses/chatgpt-building-system", "Course", "2h", "Intermediate", "Builder", "Core", "AI systems", "OpenAI API", "Moves from single prompts to multi-step systems."),
  resource("r112", "Evaluating and Debugging Generative AI", "DeepLearning.AI", "https://www.deeplearning.ai/courses/evaluating-debugging-generative-ai", "Course", "1.5h", "Advanced", "Advanced", "Core", "Evaluations", "Tool-neutral", "Hands-on evaluation and debugging patterns."),
  resource("r113", "Safe and Reliable AI via Guardrails", "DeepLearning.AI", "https://www.deeplearning.ai/courses/safe-and-reliable-ai-via-guardrails", "Course", "1.5h", "Advanced", "Advanced", "Core", "AI security", "Tool-neutral", "Practical layered validation after threat modelling."),
  resource("r114", "Quality and Safety for LLM Applications", "DeepLearning.AI", "https://www.deeplearning.ai/courses/quality-safety-llm-applications", "Course", "1h", "Advanced", "Advanced", "Deep dive", "AI security", "Tool-neutral", "Connects test cases to safety and quality checks."),
  resource("r115", "Preprocessing Unstructured Data for LLM Apps", "DeepLearning.AI", "https://www.deeplearning.ai/courses/preprocessing-unstructured-data-for-llm-applications", "Course", "1h", "Advanced", "Advanced", "Optional", "RAG", "Tool-neutral", "Data preparation before retrieval and generation."),
  resource("r116", "Knowledge Graphs for RAG", "DeepLearning.AI", "https://www.deeplearning.ai/courses/knowledge-graphs-rag", "Course", "1.5h", "Advanced", "Advanced", "Optional", "RAG", "Tool-neutral", "A specialist alternative to plain vector retrieval."),
  resource("r117", "Functions, Tools and Agents with LangChain", "DeepLearning.AI", "https://www.deeplearning.ai/courses/functions-tools-agents-langchain", "Course", "1.5h", "Intermediate", "Builder", "Optional", "Agents", "LangChain", "Framework practice after agent fundamentals."),
  resource("r118", "Multi AI Agent Systems with crewAI", "DeepLearning.AI", "https://www.deeplearning.ai/courses/multi-ai-agent-systems-with-crewai", "Course", "2h", "Advanced", "Advanced", "Optional", "Multi-agent", "crewAI", "Compare orchestration against a single-agent baseline."),
  resource("r119", "Retrieval Optimization", "DeepLearning.AI + Qdrant", "https://www.deeplearning.ai/courses/retrieval-optimization-from-tokenization-to-vector-quantization", "Course", "1.5h", "Advanced", "Advanced", "Deep dive", "Retrieval", "Vector databases", "Technical retrieval improvements beyond default embeddings."),
  resource("r120", "AI Agentic Design Patterns with AutoGen", "DeepLearning.AI + Microsoft", "https://www.deeplearning.ai/courses/ai-agentic-design-patterns-with-autogen", "Course", "2h", "Advanced", "Advanced", "Optional", "Agents", "AutoGen", "Use only after tool-neutral agent patterns are understood."),
  resource("r121", "GPT-6 Astra model guidance", "OpenAI", "https://developers.openai.com/api/docs/guides/latest-model", "Official docs", "45m", "Intermediate", "Essential", "Core", "Model selection", "ChatGPT", "Current capabilities, rollout, migration guidance and durable model-choice principles.", false, true, "2026-09-04", "Rolling out"),
  resource("r122", "GPT-6 Astra model page", "OpenAI", "https://developers.openai.com/api/docs/models/gpt-6-astra", "Official docs", "20m", "Intermediate", "Essential", "Core", "Model evaluation", "OpenAI API", "Primary specification for supported tools, context and availability; verify access before planning work.", false, true, "2026-09-04", "Rolling out"),
  resource("r123", "GPT-6 Astra safety overview", "OpenAI", "https://openai.com/index/safety-overview-gpt-6-astra/", "Official docs", "30m", "Intermediate", "Essential", "Core", "AI security", "ChatGPT", "Defensive explanation of the Critical cybersecurity capability threshold and strengthened safeguards.", false, true, "2026-09-04", "Rolling out"),
  resource("r124", "Steering GPT-6 Astra", "OpenAI", "https://developers.openai.com/api/docs/guides/steering", "Official docs", "35m", "Advanced", "Essential", "Core", "Steering", "OpenAI API", "Current first-party rules for same-connection steering, queued updates and continuation behaviour.", false, true, "2026-09-06", "Changing"),
  resource("r125", "Asynchronous tool calling", "OpenAI", "https://developers.openai.com/api/docs/guides/async-tool-calling", "Official docs", "35m", "Advanced", "Advanced", "Core", "Tool use", "OpenAI API", "Current first-party semantics for asynchronous tools and call-result correlation.", false, true, "2026-09-06", "Changing"),
  resource("r126", "Computer use", "OpenAI", "https://developers.openai.com/api/docs/guides/tools-computer-use", "Official docs", "45m", "Advanced", "Advanced", "Core", "Computer use", "OpenAI API", "Current first-party computer-use loop and verification boundaries; capability is not proof of integration.", false, true, "2026-09-06", "Changing"),
  resource("r127", "Reasoning models", "OpenAI", "https://developers.openai.com/api/docs/guides/reasoning", "Official docs", "45m", "Advanced", "Essential", "Core", "Reasoning", "OpenAI API", "Current first-party reasoning-effort and configuration-update constraints for Astra workflows.", false, true, "2026-09-06", "Changing"),
  resource("r128", "Codex and ChatGPT Work pricing", "OpenAI", "https://learn.chatgpt.com/docs/pricing", "Official docs", "20m", "Beginner", "Essential", "Core", "Model availability", "ChatGPT Work + Codex", "Current Astra usage estimates and shared Work/Codex allowance; check the selector and usage dashboard because access and consumption vary by surface.", false, true, "2026-09-07", "Changing"),
  resource("r129", "Claude models overview", "Anthropic", "https://platform.claude.com/docs/en/models/overview", "Official docs", "25m", "Beginner", "Essential", "Core", "Model routing", "Claude", "Current model families, lifecycle links, context limits and cost/latency trade-offs; recheck before consequential routing.", false, true, "2026-09-08", "Changing"),
  resource("r130", "Claude Code best practices", "Anthropic", "https://code.claude.com/docs/en/best-practices", "Official docs", "60m selected", "Intermediate", "Builder", "Core", "AI coding", "Claude Code", "Explore-plan-implement-verify guidance, context control, checkpoints, permissions, skills, hooks and subagents.", false, true, "2026-09-08", "Changing"),
  resource("r131", "Claude Projects", "Anthropic", "https://support.claude.com/en/articles/9517075-what-are-projects", "Official docs", "25m", "Beginner", "Essential", "Core", "Project context", "Claude", "Current first-party explanation of reusable project instructions and knowledge.", false, true, "2026-09-08", "Changing"),
  resource("r132", "Claude Artifacts", "Anthropic", "https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them", "Official docs", "25m", "Beginner", "Essential", "Core", "Artifacts", "Claude", "Current first-party artifact creation and iteration guidance paired with an accuracy and accessibility lab.", false, true, "2026-09-08", "Changing"),
  resource("r133", "Claude Code Skills", "Anthropic", "https://code.claude.com/docs/en/skills", "Official docs", "45m selected", "Intermediate", "Builder", "Core", "Reusable expertise", "Claude Code", "Current SKILL.md structure, invocation, supporting files and scoped disclosure behavior.", false, true, "2026-09-08", "Changing"),
  resource("r134", "Claude Code MCP", "Anthropic", "https://code.claude.com/docs/en/mcp", "Official docs", "45m selected", "Intermediate", "Builder", "Core", "MCP", "Claude Code", "Current MCP and connector configuration, trust boundaries and organization controls.", false, true, "2026-09-08", "Changing"),
  resource("r135", "Claude Code hooks", "Anthropic", "https://code.claude.com/docs/en/hooks", "Official docs", "35m selected", "Advanced", "Builder", "Core", "Deterministic controls", "Claude Code", "Lifecycle hooks for enforced checks; use only after understanding side effects and permission boundaries.", false, true, "2026-09-08", "Changing"),
  resource("r136", "Claude Agent SDK", "Anthropic", "https://code.claude.com/docs/en/agent-sdk/overview", "Official docs", "45m", "Advanced", "Builder", "Core", "Agent building", "Claude", "Builder-only route for custom agent orchestration, tools and permissions.", false, true, "2026-09-08", "Changing"),
  resource("r137", "Structured outputs", "Anthropic", "https://platform.claude.com/docs/en/build-with-claude/structured-outputs", "Official docs", "35m", "Advanced", "Builder", "Core", "Structured output", "Claude API", "Schema-constrained output guidance for bounded applications and evaluation fixtures.", false, true, "2026-09-08", "Changing"),
  resource("r138", "Historical / version-specific Claude playlist", "User-supplied third-party playlist", "https://www.youtube.com/watch?v=Fys4oHlXQmQ&list=PLHmEk7iRj6dszZo_nqcNtYVBGgMw5THsK", "Video", "Select only after review", "Beginner", "Essential", "Reference", "Claude ecosystem", "Claude", "Discovery candidate only. Some model and UI details may have changed; retain transferable workflows only after item-level review against current Anthropic documentation.", false, true, "2026-09-08", "Review needed", "D · Discovery / unverified", "User-supplied", "Historical / version-specific"),
  resource("r139", "Google AI plan comparison", "Google", "https://one.google.com/about/google-ai-plans/", "Official docs", "25m", "Beginner", "Essential", "Core", "Plan access", "Google AI Pro", "Current first-party benefits and plan comparison; verify country and account availability before relying on any item.", false, true, "2026-09-08", "Changing"),
  resource("r140", "Use Google AI Pro benefits", "Google", "https://support.google.com/googleone/answer/14534406", "Official docs", "30m", "Beginner", "Essential", "Core", "Plan access", "Google AI Pro", "Operational help for the subscription benefits and eligibility boundaries attached to Google AI Pro.", false, true, "2026-09-08", "Changing"),
  resource("r141", "Use Deep Research in Gemini Apps", "Google", "https://support.google.com/gemini/answer/15719111", "Official docs", "35m", "Intermediate", "Essential", "Core", "Research", "Gemini", "Current workflow for planning and running Deep Research; pair it with a claim-level source audit.", false, true, "2026-09-08", "Changing"),
  resource("r142", "Connect Google Workspace to Gemini Apps", "Google", "https://support.google.com/gemini/answer/15229592", "Official docs", "30m", "Intermediate", "Essential", "Core", "Workspace", "Gemini", "First-party access and limitation guidance for connected Google Workspace workflows.", false, true, "2026-09-08", "Changing"),
  resource("r143", "Create docs, apps and more with Canvas", "Google", "https://support.google.com/gemini/answer/16047321", "Official docs", "35m", "Beginner", "Essential", "Core", "Artifacts", "Gemini Canvas", "Current Canvas workflow for documents, apps, slides, code and learning outputs, with human review still required.", false, true, "2026-09-08", "Changing"),
  resource("r144", "Gemini API models", "Google", "https://ai.google.dev/gemini-api/docs/models", "Official docs", "30m", "Intermediate", "Builder", "Core", "Model routing", "Gemini API", "Canonical model register for capability, lifecycle and routing decisions; recheck before implementation.", false, true, "2026-09-08", "Changing"),
  resource("r145", "Gemini API structured outputs", "Google", "https://ai.google.dev/gemini-api/docs/structured-output", "Official docs", "40m", "Advanced", "Builder", "Core", "Structured output", "Gemini API", "Schema-constrained output patterns for typed extraction, classification and agent workflows.", false, true, "2026-09-08", "Changing"),
  resource("r146", "Gemini API function calling", "Google", "https://ai.google.dev/gemini-api/docs/function-calling", "Official docs", "45m", "Advanced", "Builder", "Core", "Tool use", "Gemini API", "Current tool declaration, call handling and orchestration guidance for bounded Gemini applications.", false, true, "2026-09-08", "Changing"),
  resource("r147", "Gemini CLI documentation", "Google", "https://geminicli.com/docs/", "Official docs", "60m selected", "Intermediate", "Builder", "Core", "AI coding", "Gemini CLI", "Official terminal-agent documentation covering setup, context, tools, extensions and safe repository work.", false, true, "2026-09-08", "Changing"),
  resource("r148", "Jules getting started", "Google", "https://jules.google/docs/", "Official docs", "35m", "Intermediate", "Builder", "Core", "AI coding", "Jules", "Official starting point for asynchronous repository tasks; verify plan access and review every proposed change.", false, true, "2026-09-08", "Changing"),
  resource("r149", "ChatGPT release notes", "OpenAI", "https://help.openai.com/en/articles/6825453-chatgpt-release-notes", "Official docs", "20m selected", "Intermediate", "Essential", "Core", "Product change survival", "ChatGPT Work + Codex", "Dated release evidence for inspecting what changed, what remains conditional on access, and whether a workflow needs a small routing update rather than a rewrite.", false, true, "2026-09-13", "Changing"),
  resource("r150", "MCP 2026-07-28 specification changes", "Model Context Protocol", "https://blog.modelcontextprotocol.io/posts/2026-07-28/", "Official docs", "25m selected", "Advanced", "Builder", "Core", "MCP protocol", "MCP", "Official change record for verifying protocol version, transport/session assumptions and deprecations before configuring a client or server.", false, true, "2026-09-13", "Changing"),
];

const claudeResourcePlacements: Array<[string, number, string[]]> = [
  ["e5", 0, ["r129", "r131", "r132", "r138"]],
  ["b4", 3, ["r130", "r133", "r135"]],
  ["b6", 1, ["r134", "r136"]],
  ["b3", 3, ["r137"]],
];
for (const [trackId, moduleIndex, ids] of claudeResourcePlacements) {
  const track = tracks.find(item => item.id === trackId);
  const lessonModule = track?.modules[moduleIndex];
  if (!track || !lessonModule) throw new Error(`Missing Claude resource placement: ${trackId}/${moduleIndex}`);
  lessonModule.resourceIds = Array.from(new Set([...lessonModule.resourceIds, ...ids]));
}

const geminiResourcePlacements: Array<[string, number, string[]]> = [
  ["e4", 0, ["r139", "r140", "r143"]],
  ["e4", 1, ["r141", "r142"]],
  ["b3", 3, ["r144", "r145", "r146"]],
  ["b4", 5, ["r147", "r148"]],
];
for (const [trackId, moduleIndex, ids] of geminiResourcePlacements) {
  const track = tracks.find(item => item.id === trackId);
  const lessonModule = track?.modules[moduleIndex];
  if (!track || !lessonModule) throw new Error(`Missing Gemini resource placement: ${trackId}/${moduleIndex}`);
  lessonModule.resourceIds = Array.from(new Set([...lessonModule.resourceIds, ...ids]));
}

const freshnessResourcePlacements: Array<[string, number, string[]]> = [
  ["e3", 2, ["r149"]],
  ["e3", 3, ["r149"]],
  ["b6", 1, ["r150"]],
];
for (const [trackId, moduleIndex, ids] of freshnessResourcePlacements) {
  const track = tracks.find(item => item.id === trackId);
  const lessonModule = track?.modules[moduleIndex];
  if (!track || !lessonModule) throw new Error(`Missing freshness resource placement: ${trackId}/${moduleIndex}`);
  lessonModule.resourceIds = Array.from(new Set([...lessonModule.resourceIds, ...ids]));
}

// Source mappings are authored with each lesson, never chosen by index or keyword score.
const knownResourceIds = new Set(resources.map(item => item.id));
for (const track of tracks) {
  for (const lesson of track.modules) {
    if (!lesson.resourceIds.length || lesson.resourceIds.some(id => !knownResourceIds.has(id))) {
      throw new Error(`Invalid lesson source mapping: ${track.id}/${lesson.title}`);
    }
  }
  track.resourceIds = Array.from(new Set([...track.resourceIds, ...track.modules.flatMap(lesson => lesson.resourceIds)]));
}
const tools: ToolRole[] = [
  { name: "ChatGPT", need: "Essential", role: "General AI workspace", best: "Explaining, drafting, research, files and multimodal work", poor: "Being treated as an unquestionable source", tradeoff: "Broad capability; quality still depends on evidence and review.", privacy: "Review data controls and avoid unnecessary sensitive data.", alternative: "Gemini, Claude, Kimi, DeepSeek or Qwen", depth: "Learn in E0–E3" },
  { name: "ChatGPT Work", need: "Useful", role: "Agentic project workspace", best: "Multi-step outcomes with inspectable artifacts", poor: "Tiny questions or unreviewed consequential actions", tradeoff: "More autonomy; requires clearer scope and approval gates.", privacy: "Use least privilege and inspect outputs before external action.", alternative: "Manual chat plus a checklist", depth: "Learn in E3" },
  { name: "Codex", need: "Essential", role: "Repository-aware coding agent", best: "Planning, editing, testing and reviewing code", poor: "Blind approval in an unfamiliar or sensitive repository", tradeoff: "Strong execution; you still own diffs, tests and recovery.", privacy: "Protect secrets, review permissions and keep repositories scoped.", alternative: "Cursor, Claude Code or manual pair programming", depth: "Learn in B4" },
  { name: "Gemini", need: "Useful", role: "General and multimodal assistant", best: "Google-connected workflows and multimodal tasks", poor: "Replacing source verification", tradeoff: "Useful ecosystem integration; availability varies by account and region.", privacy: "Check activity and workspace controls.", alternative: "ChatGPT or Claude", depth: "Learn in E4" },
  { name: "NotebookLM", need: "Essential", role: "Source-grounded notebook", best: "Synthesis, questions and outputs tied to a chosen corpus", poor: "Discovering whether the corpus itself is complete or correct", tradeoff: "Excellent grounding; bounded by source quality.", privacy: "Use material you are permitted to upload.", alternative: "A chatbot plus a claim-to-source table", depth: "Learn in E4" },
  { name: "Claude", need: "Useful", role: "General assistant and long-document collaborator", best: "Writing, analysis, artifacts and long-context work", poor: "Unverified factual authority", tradeoff: "Strong document work; compare on your own tasks.", privacy: "Review project sharing and data controls.", alternative: "ChatGPT or Gemini", depth: "Learn in E5" },
  { name: "Claude Cowork", need: "Optional", role: "Delegated multi-step work", best: "Bounded projects with reviewable deliverables", poor: "Broad action without clear limits", tradeoff: "Convenient delegation; requires supervision.", privacy: "Grant only the folders and services needed.", alternative: "Claude chat plus a manual workflow", depth: "Orientation in E5" },
  { name: "Claude Code", need: "Useful", role: "Terminal-native coding agent", best: "Repository tasks close to the shell", poor: "Unscoped commands or secret-heavy environments", tradeoff: "Direct and powerful; terminal permissions raise the stakes.", privacy: "Keep credentials out of prompts and review commands.", alternative: "Codex or Cursor", depth: "Learn in B4" },
  { name: "Cursor", need: "Useful", role: "AI-first code editor", best: "Inline edits, codebase questions and agent plans", poor: "Using generated code without understanding it", tradeoff: "Fast editor loop; can encourage premature implementation.", privacy: "Check indexing and privacy settings for each codebase.", alternative: "VS Code with an assistant, Codex or Claude Code", depth: "Learn in B4" },
  { name: "Kimi", need: "Optional", role: "General model and research option", best: "A comparison model for long-context and research tasks", poor: "Being added without a distinct tested role", tradeoff: "Useful alternative; access and behavior may change.", privacy: "Read current data terms before sensitive use.", alternative: "Any second general model", depth: "Compare in E5" },
  { name: "Grok", need: "Optional", role: "General model with current-information workflows", best: "A comparison point for timely public information", poor: "Treating social signals as verified evidence", tradeoff: "Current-information emphasis; source quality still varies.", privacy: "Check platform data settings.", alternative: "Perplexity or a browser research workflow", depth: "Compare in E5" },
  { name: "DeepSeek", need: "Optional", role: "General and reasoning model", best: "Cost/capability comparison on non-sensitive test tasks", poor: "Assuming benchmark performance predicts your workflow", tradeoff: "Competitive capability; assess privacy and availability.", privacy: "Avoid sensitive data until terms meet your requirements.", alternative: "Qwen or another comparison model", depth: "Compare in E5 and S3" },
  { name: "Qwen", need: "Optional", role: "General and open-model family", best: "Multilingual and open-model experimentation", poor: "Replacing evaluation with reputation", tradeoff: "Broad model family; deployment quality varies.", privacy: "Local deployment can help, but configuration matters.", alternative: "DeepSeek, Llama-family or a hosted model", depth: "Compare in E5 and S3" },
  { name: "Perplexity", need: "Useful", role: "Citation-oriented web research", best: "Rapid source discovery and query expansion", poor: "Assuming a citation proves the adjacent claim", tradeoff: "Fast discovery; every cited passage still needs opening.", privacy: "Do not search sensitive identifiers unnecessarily.", alternative: "Browser search plus a source table", depth: "Compare in E5–E6" },
  { name: "Notion", need: "Useful", role: "Operations and canonical knowledge home", best: "Projects, databases, documentation and collaboration", poor: "Spaced-repetition practice without extra design", tradeoff: "Flexible structure; easy to overbuild.", privacy: "Separate public, shared and private spaces.", alternative: "Folders, docs or a plain-text notes system", depth: "Learn in E7" },
  { name: "Anki", need: "Useful", role: "Spaced-repetition scheduler", best: "Durable factual recall with well-designed cards", poor: "Project management or unedited AI-generated cards", tradeoff: "Powerful memory engine; card quality determines value.", privacy: "Keep private material out of shared decks.", alternative: "RemNote or paper flashcards", depth: "Learn in E7 and S5" },
  { name: "RemNote", need: "Optional", role: "Notes plus spaced repetition", best: "Connecting notes directly to retrieval practice", poor: "Simple storage when the learning features go unused", tradeoff: "Integrated learning; more concepts to learn upfront.", privacy: "Review sync and sharing settings.", alternative: "Anki plus a notes app", depth: "Learn in E7" },
  { name: "xTiles", need: "Optional", role: "Spatial planning and visual knowledge maps", best: "Boards, visual organisation and lightweight planning", poor: "Long-term recall by itself", tradeoff: "Inviting visual surface; can become decorative rather than operational.", privacy: "Check page sharing before adding personal material.", alternative: "A whiteboard, canvas or simple document", depth: "Learn in E7" },
  { name: "Chrome", need: "Essential", role: "Browser and developer surface", best: "Web apps, extensions, profiles and developer tools", poor: "Installing extensions without permission review", tradeoff: "Excellent compatibility; extension and account hygiene matter.", privacy: "Use profiles, permission reviews and a password manager.", alternative: "Brave, Firefox or Edge", depth: "Learn in E7 and B2" },
  { name: "Brave", need: "Useful", role: "Privacy-oriented browser", best: "Reduced tracking with Chromium compatibility", poor: "Assuming browser privacy removes all account or site tracking", tradeoff: "Stronger defaults; shields can occasionally break sites.", privacy: "Still review extensions, logins and site permissions.", alternative: "Hardened Chrome or Firefox", depth: "Learn in E7" },
  { name: "Git", need: "Essential", role: "Local version control", best: "Recoverable snapshots, branches and change history", poor: "Cloud collaboration by itself", tradeoff: "Universal mental model; commands feel abstract at first.", privacy: "Never commit secrets.", alternative: "Another version-control system", depth: "Learn in B1" },
  { name: "GitHub", need: "Essential", role: "Repository hosting and collaboration", best: "Pull requests, issues, review and public portfolios", poor: "Replacing local Git knowledge", tradeoff: "Rich collaboration; public/private visibility needs care.", privacy: "Check repository visibility and secret scanning.", alternative: "GitLab, Codeberg or another Git host", depth: "Learn in B1 and B7" },
];

const glossary = [
  ["AI", "Software that performs tasks associated with human intelligence.", "A wide field; today’s chatbots are one part of it.", "Systems that perceive, predict, generate or act using learned or programmed methods."],
  ["Machine learning", "Systems that learn patterns from examples.", "The developer supplies data and an objective instead of every rule.", "Statistical optimisation of parameters to generalise from training data."],
  ["Model", "The learned engine that produces predictions or outputs.", "GPT, Claude and Gemini models sit underneath apps.", "A parameterised function fitted to data and objectives."],
  ["App", "The product interface around one or more models.", "ChatGPT is an app; its model, tools and settings can change.", "An application layer combining models, tools, policies, storage and UI."],
  ["Prompt", "The instruction or information you give an AI.", "A good prompt defines the job, context, limits and output.", "Input tokens and messages that condition model generation."],
  ["Context", "The information available for the current response.", "It can include instructions, chat, files, retrieved text and tool results.", "The active token sequence and structured state supplied at inference."],
  ["Token", "A small piece of text a model processes.", "Words may be split into several tokens; token limits affect context and cost.", "A discrete vocabulary ID produced by a tokenizer."],
  ["Embedding", "A numeric representation of meaning or similarity.", "Useful for finding related passages even when words differ.", "A learned vector representation positioned in a continuous space."],
  ["Transformer", "The main architecture behind modern language models.", "It uses attention to relate parts of the context while generating.", "A residual neural architecture built from attention and feed-forward blocks."],
  ["Attention", "A mechanism for weighing relationships between tokens.", "It helps the model use relevant earlier information.", "Content-dependent weighted aggregation over representations."],
  ["Training", "The process that teaches a model from data and feedback.", "Training changes model parameters; prompting usually does not.", "Optimisation of parameters against pretraining and post-training objectives."],
  ["Inference", "Using a trained model to produce an answer.", "Every chat response is an inference run.", "Forward computation and decoding from a fixed parameter set."],
  ["Hallucination", "A plausible-sounding output that is unsupported or false.", "Fluency is not evidence; open important sources.", "Generation not adequately grounded in task truth or provided evidence."],
  ["Multimodal", "Able to work with more than one kind of media.", "A system may understand text, images, audio or video.", "Joint or coordinated representation and generation across modalities."],
  ["Grounding", "Tying an answer to supplied or retrieved evidence.", "NotebookLM grounds answers in selected sources; those sources still need review.", "Conditioning and attribution against an external evidence set."],
  ["Evaluation", "A repeatable test of whether an AI output is good.", "Use cases, rubrics and pass thresholds—not vibes.", "Measurement over a representative dataset with defined metrics and graders."],
  ["API", "A documented way for software to request data or actions.", "Your program sends a request and handles the response or error.", "A contract over endpoints, schemas, authentication and transport semantics."],
  ["JSON", "A common text format for structured data.", "It stores named fields, lists, numbers and true/false values.", "A language-independent data-interchange grammar."],
  ["Agent", "A model-driven system that can choose and use tools.", "It observes, plans, acts and stops within rules you define.", "A policy operating over state, tools, observations and termination conditions."],
  ["Workflow", "A defined sequence of steps.", "The route is mostly predetermined, even if AI helps inside steps.", "An orchestrated process graph with inputs, transitions and outputs."],
  ["Automation", "A process that runs from a trigger with little manual effort.", "Good automation has logs, failure handling and a stop switch.", "Event- or schedule-driven execution with state and control policies."],
  ["MCP", "A standard for connecting AI applications to tools and context.", "Treat every server as a permission boundary.", "Model Context Protocol defines interoperable clients, servers, tools and resources."],
  ["RAG", "Retrieving relevant sources before generating an answer.", "It can improve freshness and grounding if retrieval is measured.", "Retrieval-augmented generation couples search with conditioned generation."],
  ["Vector database", "A store designed to search numeric embeddings.", "It retrieves similar chunks for semantic search or RAG.", "An index supporting approximate nearest-neighbour queries over vectors."],
  ["Fine-tuning", "Additional training that changes a model for a task or style.", "Use it when prompting and retrieval cannot provide stable behaviour.", "Parameter adaptation using a task-specific training dataset."],
  ["Prompt injection", "Untrusted content that tries to redirect an AI system.", "A webpage or document can contain instructions aimed at the agent, not you.", "An instruction-confusion attack across trust boundaries in model context."],
  ["Jailbreak", "An attempt to bypass a model’s safety rules.", "Study it defensively: test controls and report weaknesses responsibly.", "Adversarial prompting intended to elicit policy-disallowed behaviour."],
  ["Least privilege", "Give only the access needed for the task.", "A research agent rarely needs your whole drive or email account.", "Minimising identities, scopes, resources and duration of authorisation."],
  ["Rate limit", "A cap on how many requests can be made in a period.", "Apps should slow down, retry carefully and show useful errors.", "A service quota enforced by request, token, concurrency or cost windows."],
  ["Webhook", "A message sent automatically when an event occurs.", "A service can notify your app instead of being repeatedly checked.", "An event-triggered HTTP callback with authenticity and replay concerns."],
] as const;

const firstTen = [
  ["0:00–0:30", "One useful task", "Ask one chatbot to improve a real note, plan or explanation. Save before and after."],
  ["0:30–1:30", "Verification loop", "Mark factual claims, open two strong sources and correct the answer."],
  ["1:30–3:00", "Prompt anatomy", "Add objective, context, constraints, output format and done-when criteria."],
  ["3:00–5:00", "AI foundations", "Learn model, app, token, context, training, inference and hallucination."],
  ["5:00–7:00", "Compare two systems", "Run the same prompt and rubric in two available assistants."],
  ["7:00–9:00", "Grounded research", "Build a small source set and audit every citation-to-claim match."],
  ["9:00–10:00", "Teach it back", "Explain your method without notes and repair whatever you cannot explain."],
] as const;

const decisionQuestions = [
  ["Is the task important enough to verify?", "If no, keep it lightweight. If yes, define evidence before prompting."],
  ["Do you have the necessary source material?", "If no, research first. If yes, decide whether a bounded notebook is safer."],
  ["Is the output factual, creative or operational?", "Factual work needs sources; creative work needs taste; actions need approvals."],
  ["Does the task contain sensitive data?", "Remove it, minimise it or use an approved environment."],
  ["Could one ordinary tool solve this more reliably?", "Use search, a calculator or a spreadsheet when that is the better fit."],
  ["Is the task repeatable?", "If yes, capture a prompt specification and test set."],
  ["Is the process stable enough to automate?", "Prove it manually before adding triggers and retries."],
  ["Can the system take actions?", "Add least privilege, logs, approval gates and a stop condition."],
  ["What would failure look like?", "Name false claims, leaks, cost overruns and harmful actions before running."],
  ["What counts as done?", "Write a pass criterion another person could inspect."],
] as const;

const confusionPairs = [
  ["Model", "App", "The learned engine", "The interface, tools, storage and policies around it"],
  ["Chatbot", "Agent", "Responds in conversation", "Can choose tools and act inside a bounded environment"],
  ["Workflow", "Agent", "Mostly predefined steps", "Can select actions from observations"],
  ["Search", "RAG", "Finds sources", "Retrieves sources and supplies them to generation"],
  ["Prompting", "Fine-tuning", "Changes current instructions", "Changes model parameters through training"],
  ["Grounded", "True", "Connected to a source", "Correct in the real world; the source may still be wrong"],
] as const;

const routeOrder: RouteName[] = ["Essential", "Builder", "Advanced"];
const routeHours = routeOrder.reduce((totals, route) => {
  totals[route] = tracks.filter((track) => track.route === route).reduce((sum, track) => sum + track.hours, 0);
  return totals;
}, { Essential: 0, Builder: 0, Advanced: 0 } as Record<RouteName, number>);
const levelDescriptions = {
  Foundations: "Zero knowledge to competent, verifiable AI use.",
  Practitioner: "Research, documents, data and professional workflows.",
  Builder: "Coding, Git, APIs, databases and supervised AI development.",
  "Advanced Systems": "RAG, agents, evaluation, security and reliability.",
  "Mastery + Portfolio": "Integrated projects, one capstone and delayed defence.",
} as const;
const totalHours = tracks.reduce((sum, track) => sum + track.hours, 0);
export const statusOptions: Status[] = ["Unseen", "Learned", "Practised", "Demonstrated", "Transferred", "Retest Due", "Mastered", "Needs Repair", "Later", "Skipped with reason"];
const orderedStatuses: Status[] = ["Unseen", "Learned", "Practised", "Demonstrated", "Transferred", "Retest Due", "Mastered"];
const demonstratedStatuses: Status[] = ["Demonstrated", "Transferred", "Retest Due", "Mastered"];
const courseStatuses: Status[] = ["Learned", "Practised", "Demonstrated", "Transferred", "Retest Due", "Mastered", "Needs Repair"];
const availableCategories = ["General chatbot", "Source-grounded research", "Coding assistant", "Notes/knowledge tool", "Spaced repetition", "Browser only"];

const isOnOrBeyond = (status: Status, threshold: Status) => {
  if (status === "Needs Repair") return threshold !== "Mastered";
  return orderedStatuses.indexOf(status) >= orderedStatuses.indexOf(threshold);
};

export const calculateProgressHours = (progress: Record<string, TrackProgress>, date = todayIso()) => {
  const validated = sanitizeProgressRecords(progress, date).progress;
  const sum = (predicate: (record: TrackProgress) => boolean) => Math.min(totalHours, tracks.reduce((hours, track) => {
    const record = validated[track.id] || { status: "Unseen" as Status };
    return hours + (predicate(record) ? track.hours : 0);
  }, 0));
  return {
    courseHours: sum((record) => courseStatuses.includes(record.status)),
    practisedHours: sum((record) => isOnOrBeyond(record.status, "Practised")),
    demonstratedHours: sum((record) => Boolean(record.demonstratedEvidence?.trim() && record.demonstratedAt && demonstratedStatuses.includes(record.status))),
    masteredHours: sum((record) => record.status === "Mastered" && Boolean(record.retestEvidence?.trim() && record.retestPassedAt)),
  };
};

export const todayIso = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

const evidenceTextFields = ["demonstratedEvidence", "transferContext", "transferEvidence", "retestEvidence", "repairNote", "skipReason", "migrationNote"] as const;
const evidenceDateFields = ["demonstratedAt", "transferredAt", "retestDue", "retestPassedAt"] as const;
const cleanEvidenceText = (value: unknown) => typeof value === "string" ? value.trim().slice(0, 2_000) : undefined;
const cleanEvidenceDate = (value: unknown) => validDate(value) ? value : undefined;

export const sanitizeProgressRecords = (input: unknown, date = todayIso()): { progress: Record<string, TrackProgress>; changed: boolean } => {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { progress: {}, changed: Boolean(input) };
  const rawProgress = input as Record<string, unknown>;
  const progress: Record<string, TrackProgress> = {};
  let changed = Object.keys(rawProgress).some((id) => !tracks.some((track) => track.id === id));

  for (const track of tracks) {
    const value = rawProgress[track.id];
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const raw = value as Record<string, unknown>;
    if (typeof raw.status !== "string" || !statusOptions.includes(raw.status as Status)) { changed = true; continue; }

    const rawStatus = raw.status as Status;
    const record: TrackProgress = { status: rawStatus };
    for (const field of evidenceTextFields) {
      const cleaned = cleanEvidenceText(raw[field]);
      if (cleaned) Object.assign(record, { [field]: cleaned });
      if (typeof raw[field] === "string" && raw[field] !== cleaned) changed = true;
    }
    for (const field of evidenceDateFields) {
      const cleaned = cleanEvidenceDate(raw[field]);
      if (cleaned) Object.assign(record, { [field]: cleaned });
      if (raw[field] !== undefined && raw[field] !== cleaned) changed = true;
    }
    const demonstrated = Boolean(record.demonstratedEvidence && record.demonstratedAt && record.demonstratedAt <= date);
    const transferred = Boolean(demonstrated && record.transferContext && record.transferEvidence && record.transferredAt && record.transferredAt >= record.demonstratedAt! && record.transferredAt <= date);
    const retestScheduled = Boolean(transferred && record.retestDue && record.retestDue > record.transferredAt!);
    const retestPassed = Boolean(retestScheduled && record.retestDue! <= date && record.retestEvidence && record.retestPassedAt && record.retestPassedAt >= record.retestDue! && record.retestPassedAt <= date);

    let defensible = rawStatus;
    if (rawStatus === "Needs Repair" && !record.repairNote) defensible = "Practised";
    if (rawStatus === "Skipped with reason" && !record.skipReason) defensible = "Later";
    if (["Demonstrated", "Transferred", "Retest Due", "Mastered"].includes(rawStatus)) {
      defensible = demonstrated ? "Demonstrated" : "Practised";
      if (["Transferred", "Retest Due", "Mastered"].includes(rawStatus) && transferred) defensible = "Transferred";
      if (["Retest Due", "Mastered"].includes(rawStatus) && retestScheduled) defensible = "Retest Due";
      if (rawStatus === "Mastered" && retestPassed) defensible = "Mastered";
    }
    if (defensible !== rawStatus) {
      record.status = defensible;
      record.migrationNote = `Imported ${rawStatus} was adjusted to ${defensible} because its evidence or date sequence was incomplete.`;
      changed = true;
    }
    progress[track.id] = record;
  }
  return { progress, changed };
};

export const buildLearningQueue = (progress: Record<string, TrackProgress>, date = todayIso()): QueueItem[] => tracks.flatMap((track): QueueItem[] => {
  const record = progress[track.id];
  if (!record) return [];
  if (record.status === "Needs Repair") return [{ trackId: track.id, kind: "Repair" as const, detail: record.repairNote || "Repair the failed transfer or retest before advancing.", priority: 0 }];
  if (record.status === "Retest Due" && record.retestDue) {
    if (record.retestDue <= date) return [{ trackId: track.id, kind: "Retest now" as const, detail: record.retestDue === date ? "Delayed retest is due today." : `Delayed retest has been due since ${record.retestDue}.`, priority: 1, due: record.retestDue }];
    return [{ trackId: track.id, kind: "Retest scheduled" as const, detail: `Delayed retest is scheduled for ${record.retestDue}.`, priority: 3, due: record.retestDue }];
  }
  if (["Learned", "Practised", "Demonstrated", "Transferred"].includes(record.status)) return [{ trackId: track.id, kind: "Continue" as const, detail: `Current stage: ${record.status}. Complete the next evidence step.`, priority: 2 }];
  return [];
}).sort((left, right) => left.priority - right.priority || (left.due || "").localeCompare(right.due || "") || tracks.findIndex((track) => track.id === left.trackId) - tracks.findIndex((track) => track.id === right.trackId));

export const migrateLegacyStatuses = (statuses: Record<string, unknown> = {}): { progress: Record<string, TrackProgress>; changed: boolean } => {
  let changed = false;
  const progress: Record<string, TrackProgress> = {};
  for (const track of tracks) {
    const raw = statuses[track.id];
    if (typeof raw !== "string") continue;
    const normalised = raw === "Needs repair" ? "Needs Repair" : raw === "Retest due" ? "Retest Due" : raw;
    if (![...statusOptions, "Needs repair", "Retest due"].includes(raw as Status)) continue;
    if (["Demonstrated", "Transferred", "Retest Due", "Mastered"].includes(normalised)) {
      progress[track.id] = { status: "Practised", migrationNote: `Imported v3.1 "${raw}" claim. Add dated, self-reported evidence before advancing.` };
      changed = true;
    } else {
      progress[track.id] = { status: normalised as Status };
      if (normalised !== raw) changed = true;
    }
  }
  return { progress, changed };
};

export const validateStatusTransition = (record: TrackProgress, next: Status, date = todayIso()): string | undefined => {
  if (["Unseen", "Later"].includes(next)) return undefined;
  if (next === "Skipped with reason") return record.skipReason?.trim() ? undefined : "Add a reason before marking this track as skipped.";
  if (record.status === "Needs Repair" && next === "Practised") return undefined;
  if (next === "Needs Repair") {
    if (!isOnOrBeyond(record.status, "Practised") || !record.repairNote?.trim()) return "Record the failed independent attempt, transfer or retest in the repair note first.";
    return undefined;
  }
  const currentStage = orderedStatuses.indexOf(record.status);
  const nextStage = orderedStatuses.indexOf(next);
  if (nextStage > currentStage + 1) return `Advance one stage at a time; complete ${orderedStatuses[currentStage + 1]} first.`;
  if (next === "Demonstrated" && (!record.demonstratedEvidence?.trim() || !record.demonstratedAt)) return "Add an independent evidence note and completion date before Demonstrated.";
  if (next === "Demonstrated" && record.demonstratedAt! > date) return "The independent completion date cannot be in the future.";
  if (next === "Transferred" && (!record.transferContext?.trim() || !record.transferEvidence?.trim() || !record.transferredAt)) return "Describe the different-context task, evidence and completion date before Transferred.";
  if (next === "Transferred" && (record.transferredAt! > date || (record.demonstratedAt && record.transferredAt! < record.demonstratedAt))) return "The transfer date must be on or after demonstration and cannot be in the future.";
  if (next === "Retest Due" && !record.retestDue) return "Schedule a delayed-retest date before Retest Due.";
  if (next === "Retest Due" && record.transferredAt && record.retestDue! <= record.transferredAt) return "Schedule the delayed retest after the transfer date.";
  if (next === "Mastered") {
    if (!record.retestDue || record.retestDue > date) return "Mastered remains locked until the scheduled retest date.";
    if (!record.retestEvidence?.trim() || !record.retestPassedAt) return "Record the retest pass date and evidence before Mastered.";
    if (record.retestPassedAt < record.retestDue || record.retestPassedAt > date) return "The retest pass date must be on or after the due date and cannot be in the future.";
  }
  if (demonstratedStatuses.includes(next) && sanitizeLegacyRecord({ ...record, status: next }, date)?.status !== next) return "Complete the prior dated evidence sequence before advancing; impossible calendar dates are not accepted.";
  return undefined;
};

const productBoundaries = [
  ["ChatGPT", "Conversation and quick thinking", "Questions, explanations, brainstorming, a first draft or a comparison.", "A large multi-source deliverable that needs files, tools and checkpoints."],
  ["ChatGPT Work", "Reviewable knowledge-work outcome", "A bounded document, spreadsheet, Site or research artifact assembled across sources and tools.", "A one-line answer or an external action without an approval gate."],
  ["Codex", "Repository-aware software work", "Inspecting code, planning changes, editing files, running tests and reviewing diffs.", "Treating generated code as correct without tests, review or a recovery point."],
  ["Codex Security", "Authorised application-security review", "Finding, confirming and helping remediate vulnerabilities in code you own or may assess.", "Scanning third-party systems or confusing a security product with the general Codex coding agent."],
] as const;

export function ExternalResourceLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return <a className={className} href={href} target="_blank" rel="noreferrer">{children}<span className="sr-only"> (opens in a new tab)</span></a>;
}

function ResourceLink({ item, compact = false }: { item: Resource; compact?: boolean }) {
  return (
    <ExternalResourceLink className={`resource-link ${compact ? "resource-link-compact" : ""}`} href={item.url}>
      <span className="resource-format">{item.format}</span>
      <span className="min-w-0 flex-1">
        <strong>{item.title}</strong>
        <small>{item.creator} · {item.duration} · {item.level}</small>
      </span>
      <ExternalLink aria-hidden="true" className="h-4 w-4 shrink-0" />
    </ExternalResourceLink>
  );
}

export default function Home() {
  const [depth, setDepth] = useState<Depth>("Simple");
  const [experience, setExperience] = useState("Complete beginner");
  const [goal, setGoal] = useState("Use AI well");
  const [studentSafe, setStudentSafe] = useState(true);
  const [available, setAvailable] = useState<string[]>([]);
  const [progressRecords, setProgressRecords] = useState<Record<string, TrackProgress>>({});
  const [learningState, setLearningState] = useState<LearningState>(newLearningState);
  const [studio, setStudio] = useState<StudioState>(newStudioState);
  const [query, setQuery] = useState("");
  const [routeFilter, setRouteFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const [needFilter, setNeedFilter] = useState("All");
  const [progressFilter, setProgressFilter] = useState("All");
  const [resourceQuery, setResourceQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState("All");
  const [topicFilter, setTopicFilter] = useState("All");
  const [freshnessFilter, setFreshnessFilter] = useState("All");
  const [showAllResources, setShowAllResources] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [stateMessage, setStateMessage] = useState("");
  const importRef = useRef<HTMLInputElement>(null);
  const statuses = useMemo(() => Object.fromEntries(Object.entries(progressRecords).map(([id, record]) => [id, record.status])) as Record<string, Status>, [progressRecords]);
  const effectiveLearningState = useMemo<LearningState>(() => ({
    ...learningState,
    legacyTracks: {
      ...learningState.legacyTracks,
      ...Object.fromEntries(Object.entries(progressRecords).filter(([id]) => /^[ebas][0-7]$/.test(id))),
    },
  }), [learningState, progressRecords]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const current = localStorage.getItem("atlas-v4-state");
        const saved = JSON.parse(current || localStorage.getItem("atlas-v33-state") || localStorage.getItem("atlas-v32-state") || localStorage.getItem("atlas-v31-state") || localStorage.getItem("atlas-v3-state") || "{}");
        const learning = importLearningState(saved, runtimeCurriculum);
        if (learning.state) {
          const readLegacyLab = (key: string) => {
            try { return JSON.parse(localStorage.getItem(key) || "null"); }
            catch { return null; }
          };
          const publicLabs = String(saved.schemaVersion || saved.version) === "5.0"
            ? learning.state.publicLabs
            : migrateLegacyPublicLabs(
              readLegacyLab("atlas-v41-claude"),
              readLegacyLab("atlas-v42-gemini"),
            );
          setLearningState({ ...learning.state, publicLabs });
        }
        const interfacePreferences = saved.atlasPreferences || saved.preferences || saved;
        if (saved.studio) setStudio(sanitizeStudioState(saved.studio));
        if (["Simple", "Practical", "Technical"].includes(interfacePreferences.depth)) setDepth(interfacePreferences.depth);
        if (["Complete beginner", "Confident user", "Beginner coder", "Working developer"].includes(interfacePreferences.experience)) setExperience(interfacePreferences.experience);
        if (["Use AI well", "Study and research", "Build software", "Secure AI systems", "Understand advanced systems"].includes(interfacePreferences.goal)) setGoal(interfacePreferences.goal);
        if (typeof interfacePreferences.studentSafe === "boolean") setStudentSafe(interfacePreferences.studentSafe);
        if (Array.isArray(interfacePreferences.available)) setAvailable(interfacePreferences.available.filter((item: unknown) => typeof item === "string" && availableCategories.includes(item)));
        const savedTrackProgress = saved.trackProgress || saved.progress || saved.legacyTracks;
        if (savedTrackProgress && typeof savedTrackProgress === "object") {
          const sanitized = sanitizeProgressRecords(savedTrackProgress);
          setProgressRecords(sanitized.progress);
          if (sanitized.changed) setStateMessage("Imported browser state was adjusted where evidence or date order did not support the saved status.");
        } else if (saved.statuses) {
          const migrated = migrateLegacyStatuses(saved.statuses);
          setProgressRecords(migrated.progress);
          if (migrated.changed) setStateMessage("v3.1 advanced claims were imported as Practised; add dated evidence to advance safely.");
        }
      } catch { /* A damaged local preference should never block the public curriculum. */ }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    let noticeTimer: number | undefined;
    try {
      localStorage.setItem("atlas-v4-state", JSON.stringify({
        ...effectiveLearningState,
        version: "5.0",
        schemaVersion: "5.0",
        atlasPreferences: { depth, experience, goal, studentSafe, available },
        trackProgress: progressRecords,
        studio,
      }));
    } catch {
      noticeTimer = window.setTimeout(() => setStateMessage("Browser storage is unavailable or full. Changes remain in this tab; export them before leaving."), 0);
    }
    return () => { if (noticeTimer !== undefined) window.clearTimeout(noticeTimer); };
  }, [depth, experience, goal, studentSafe, available, progressRecords, studio, effectiveLearningState, hydrated]);

  const setClaudeState = (update: SetStateAction<ClaudeLabState>) => setLearningState((current) => ({
    ...current,
    publicLabs: { ...current.publicLabs, claude: typeof update === "function" ? update(current.publicLabs.claude) : update },
  }));
  const setGeminiState = (update: SetStateAction<GeminiLabState>) => setLearningState((current) => ({
    ...current,
    publicLabs: { ...current.publicLabs, gemini: typeof update === "function" ? update(current.publicLabs.gemini) : update },
  }));
  const setBenchmarkRuns = (update: SetStateAction<BenchmarkRun[]>) => setLearningState((current) => ({
    ...current,
    publicLabs: { ...current.publicLabs, benchmarks: typeof update === "function" ? update(current.publicLabs.benchmarks) : update },
  }));

  const v4Credits = useMemo(() => progressMinutes(effectiveLearningState, runtimeCurriculum), [effectiveLearningState]);
  const courseHours = Math.round(v4Credits.programme.exposure / 6) / 10;
  const practisedHours = Math.round(v4Credits.programme.practice / 6) / 10;
  const demonstratedHours = Math.round(v4Credits.programme.demonstrated / 6) / 10;
  const masteredHours = Math.round(v4Credits.programme.mastered / 6) / 10;
  const courseCompletion = Math.round((courseHours / totalHours) * 100);
  const evidenceCompletion = Math.round((demonstratedHours / totalHours) * 100);
  const officialCount = resources.filter((item) => item.format === "Official docs" || item.format === "Standard").length;
  const videoCount = resources.filter((item) => item.format === "Video").length;
  const youtubeCount = resources.filter((item) => item.url.includes("youtube.com/")).length;
  const courseCount = resources.filter((item) => item.format === "Course").length;
  const moduleCount = tracks.reduce((sum, track) => sum + track.modules.length, 0);
  const labCount = tracks.length;
  const learningQueue = useMemo(() => buildLearningQueue(progressRecords), [progressRecords]);

  const eligible = tracks.filter((track) => track.prerequisites.every((id) => demonstratedStatuses.includes(statuses[id] || "Unseen")));
  const goalRoute: RouteName = goal === "Build software" ? "Builder" : ["Understand advanced systems", "Secure AI systems"].includes(goal) ? "Advanced" : "Essential";
  const directEntryId = experience === "Working developer"
    ? (goal === "Secure AI systems" ? "a5" : goal === "Understand advanced systems" ? "a3" : goal === "Build software" ? "b4" : "e2")
    : experience === "Beginner coder" && goal === "Build software" ? "b0"
      : experience === "Confident user" ? (goal === "Study and research" ? "e6" : "e2") : undefined;
  const directEntry = directEntryId ? tracks.find((track) => track.id === directEntryId && !demonstratedStatuses.includes(statuses[track.id] || "Unseen")) : undefined;
  const urgentQueueItem = learningQueue.find((item) => item.priority <= 1);
  const urgentTrack = tracks.find((track) => track.id === urgentQueueItem?.trackId);
  const recommended = urgentTrack || directEntry || ((studentSafe && experience === "Complete beginner") ? eligible.filter((track) => track.route === "Essential") : eligible.filter((track) => track.route === goalRoute))
    .find((track) => !demonstratedStatuses.includes(statuses[track.id] || "Unseen"))
    || eligible.find((track) => !demonstratedStatuses.includes(statuses[track.id] || "Unseen"))
    || tracks.find((track) => !demonstratedStatuses.includes(statuses[track.id] || "Unseen"))
    || tracks[0];

  const filteredTracks = useMemo(() => tracks.filter((track) => {
    const haystack = `${track.code} ${track.title} ${track.simple} ${track.outcome}`.toLowerCase();
    const status = progressRecords[track.id]?.status || "Unseen";
    const matchesProgress = progressFilter === "All"
      || (progressFilter === "Active" && ["Learned", "Practised", "Demonstrated", "Transferred"].includes(status))
      || status === progressFilter;
    return haystack.includes(query.toLowerCase())
      && (routeFilter === "All" || track.route === routeFilter)
      && (levelFilter === "All" || levelFor(track.id) === levelFilter)
      && (needFilter === "All" || track.need === needFilter)
      && matchesProgress;
  }), [query, routeFilter, levelFilter, needFilter, progressFilter, progressRecords]);

  const resourceTopics = Array.from(new Set(resources.map((item) => item.topic))).sort();
  const filteredResources = useMemo(() => resources.filter((item) => {
    const haystack = `${item.title} ${item.creator} ${item.topic} ${item.tool}`.toLowerCase();
    return haystack.includes(resourceQuery.toLowerCase())
      && (formatFilter === "All" || item.format === formatFilter)
      && (topicFilter === "All" || item.topic === topicFilter)
      && (freshnessFilter === "All" || item.status === freshnessFilter);
  }), [resourceQuery, formatFilter, topicFilter, freshnessFilter]);
  const visibleResources = showAllResources ? filteredResources : filteredResources.slice(0, 18);
  const resourceStatusCounts = useMemo(() => Object.fromEntries(["Active", "Rolling out", "Changing", "Review needed"].map(status => [status, resources.filter(item => item.status === status).length])), []);
  const featuredVideos = resources.filter((item) => item.format === "Video" && (item.tier === "Core" || item.level === "Beginner")).slice(0, 12);

  const openVideoLibrary = () => {
    setResourceQuery("");
    setFormatFilter("Video");
    setTopicFilter("All");
    setFreshnessFilter("All");
    setShowAllResources(true);
  };

  const openTrackInRoadmap = () => {
    setQuery("");
    setRouteFilter("All");
    setLevelFilter("All");
    setNeedFilter("All");
    setProgressFilter("All");
  };

  const updateRecord = (id: string, patch: Partial<TrackProgress>) => setProgressRecords((current) => {
    const updated = { ...(current[id] || { status: "Unseen" as Status }), ...patch };
    const validated = sanitizeProgressRecords({ [id]: updated }).progress[id] || updated;
    return { ...current, [id]: validated };
  });
  const updateStatus = (id: string, status: Status) => {
    const record = progressRecords[id] || { status: "Unseen" as Status };
    const problem = validateStatusTransition(record, status);
    if (problem) { setStateMessage(`${tracks.find((track) => track.id === id)?.code}: ${problem}`); return; }
    updateRecord(id, { status });
    setStateMessage(`${tracks.find((track) => track.id === id)?.code} saved as ${status}. Evidence is self-reported.`);
  };
  const resetLocalState = () => {
    if (!window.confirm("Reset the progress and preferences stored in this browser?")) return;
    setProgressRecords({}); setAvailable([]); setDepth("Simple"); setExperience("Complete beginner"); setGoal("Use AI well"); setStudentSafe(true);
    setLearningState(newLearningState());
    setStudio(newStudioState());
    try { localStorage.removeItem("atlas-v4-state"); localStorage.removeItem("atlas-v41-claude"); localStorage.removeItem("atlas-v42-gemini"); localStorage.removeItem("atlas-v33-state"); localStorage.removeItem("atlas-v32-state"); localStorage.removeItem("atlas-v31-state"); localStorage.removeItem("atlas-v3-state"); }
    catch { setStateMessage("This tab was reset, but browser storage could not be cleared. Check site storage before leaving."); return; }
    setStateMessage("Browser progress reset.");
  };
  const exportLocalState = () => {
    const payload = { ...effectiveLearningState, version: "5.0", schemaVersion: "5.0", exportedAt: new Date().toISOString(), privacy: "Self-reported evidence stored locally in the exporting browser.", atlasPreferences: { depth, experience, goal, studentSafe, available }, trackProgress: progressRecords, studio };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "ai-mastery-atlas-progress.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); setStateMessage("Progress and Studio notes exported as a local JSON file.");
  };
  const importLocalState = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > 2_000_000) throw new Error("Import too large");
      const payload = JSON.parse(await file.text());
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid object");
      const learning = importLearningState(payload, runtimeCurriculum);
      if (!learning.state || learning.error) throw new Error(learning.error || "Invalid learning state");
      const records = payload.trackProgress ?? payload.progress ?? payload.statuses ?? payload.legacyTracks ?? {};
      if (typeof records !== "object" || Array.isArray(records)) throw new Error("Invalid progress data");
      const interfacePreferences = payload.atlasPreferences || (["4.0", "5.0"].includes(String(payload.schemaVersion)) ? {} : payload.preferences) || {};
      if (!interfacePreferences || typeof interfacePreferences !== "object" || Array.isArray(interfacePreferences)) throw new Error("Invalid preferences");
      // Validate all structural fields before applying any preference or evidence update.
      const importedStudio = sanitizeStudioState(payload.studio);
      const sanitized = payload.statuses && !payload.progress && !payload.trackProgress
        ? migrateLegacyStatuses(payload.statuses)
        : sanitizeProgressRecords(records);
      setLearningState(learning.state);
      if (["Simple", "Practical", "Technical"].includes(interfacePreferences.depth)) setDepth(interfacePreferences.depth);
      if (["Complete beginner", "Confident user", "Beginner coder", "Working developer"].includes(interfacePreferences.experience)) setExperience(interfacePreferences.experience);
      if (["Use AI well", "Study and research", "Build software", "Secure AI systems", "Understand advanced systems"].includes(interfacePreferences.goal)) setGoal(interfacePreferences.goal);
      if (typeof interfacePreferences.studentSafe === "boolean") setStudentSafe(interfacePreferences.studentSafe);
      if (Array.isArray(interfacePreferences.available)) setAvailable(interfacePreferences.available.filter((item: unknown) => typeof item === "string" && availableCategories.includes(item)));
      setStudio(importedStudio);
      setProgressRecords(sanitized.progress);
      setStateMessage([...learning.warnings, ...(sanitized.changed ? ["Unsupported track claims were adjusted to their highest evidence-backed stage."] : [])].length
        ? "Progress imported safely with migration notes. Review the Command Centre before continuing."
        : `${payload.version === "5.0" ? "v5.0" : payload.version === "4.0" ? "v4.0" : payload.version === "3.3" ? "v3.3" : "v3.2"} progress imported into this browser.`);
    } catch { setStateMessage("That file is not a valid Atlas progress export."); }
    if (importRef.current) importRef.current.value = "";
  };

  return (
    <main id="main-content" className="atlas-shell min-h-screen">
      <a className="skip-link" href="#start">Skip to start</a>
      <header className="site-header">
        <a href="#top" className="brand"><Orbit className="h-5 w-5" /><span>AI Mastery Atlas</span><Badge variant="outline">v5.1</Badge></a>
        <nav aria-label="Primary navigation">
          <a href="#start">Start</a><a href="#command-centre">Command centre</a><a href="#knowledge-studio">Knowledge studio</a><a href="#operator-core">Operator core</a><a href="#systems-lab">Systems lab</a><a href="#roadmap">Roadmap</a><a href="#library">Library</a>
        </nav>
        <details className="mobile-nav" onClick={(event) => {
          if (event.target instanceof HTMLAnchorElement) event.currentTarget.removeAttribute("open");
        }}>
          <summary aria-label="Open section navigation">Explore</summary>
          <nav aria-label="Section navigation">
            <a href="#start">Start</a><a href="#command-centre">Command centre</a><a href="#knowledge-studio">Knowledge studio</a><a href="#operator-core">Operator core</a><a href="#systems-lab">Systems lab</a><a href="#roadmap">Roadmap</a><a href="#library">Library</a>
          </nav>
        </details>
        <div className="header-progress" aria-label={`${courseCompletion}% course progress; ${evidenceCompletion}% independently demonstrated`} title={`${demonstratedHours}h demonstrated · ${masteredHours}h mastered after retest`}><span>Course {courseHours}/{totalHours}h</span><Progress value={courseCompletion} /></div>
      </header>

      <section id="top" className="hero-section course-grid">
        <div className="hero-copy">
          <div className="section-kicker">v5.1 Universal AI Systems Mastery · public Community Edition</div>
          <h1>Choose well. Execute safely. <span>Prove what works.</span></h1>
          <p className="hero-lead">A public, tool-neutral curriculum for understanding AI, using it responsibly, building with it and defending AI systems. It contains exactly <strong>{totalHours} structured hours</strong> across five levels, with 65% allocated to guided work, independent practice and assessment. Time completed is not the same as mastery.</p>
          <div className="hero-actions"><Button asChild size="lg"><a href={`#track-${recommended.id}`}>{courseHours ? "Continue your next track" : "Start your first 30 minutes"} <ArrowRight /></a></Button><Button asChild variant="outline" size="lg"><a href="#roadmap">See the full roadmap</a></Button></div>
          <div className="hero-facts">
            <div><strong>{totalHours}</strong><span>structured hours</span></div><div><strong>{moduleCount}</strong><span>authored modules</span></div><div><strong>{resources.length}</strong><span>integrated resources</span></div><div><strong>{youtubeCount}</strong><span>YouTube links</span></div>
          </div>
        </div>
        <aside className="hero-panel">
          <div className="eyebrow"><Compass className="h-4 w-4" /> I’m lost—what next?</div>
          <h2>{recommended.code} · {recommended.title}</h2>
          <p>{recommended.simple}</p>
          <div className="recommendation-meta"><Badge>{recommended.route}</Badge><span><Clock3 className="h-4 w-4" /> {recommended.hours}h</span><span>{recommended.need}</span></div>
          <Button asChild className="w-full"><a href={`#track-${recommended.id}`}>Open recommended track</a></Button>
          <small>{recommended.id === directEntry?.id && recommended.prerequisites.length ? "This is an experienced-learner diagnostic entry; audit the listed prerequisites before attempting the lab." : urgentTrack ? "Repair and due-retest work takes priority over starting another track." : "Recommendation uses prerequisites, your goal and Beginner Safe Mode. It never hides advanced material."}</small>
        </aside>
      </section>

      <section id="start" className="page-section">
        <div className="section-kicker">Start here</div>
        <h2 className="section-title">Choose a route without locking yourself into a product.</h2>
        <p className="section-intro">Your selections and progress stay in this browser’s local storage. There is no account sync or analytics payload: clearing site data removes them, and anyone using this browser profile can see them.</p>
        <div className="setup-grid">
          <div className="setup-card">
            <label htmlFor="experience">Starting point</label>
            <Select value={experience} onValueChange={setExperience}><SelectTrigger id="experience"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Complete beginner">Complete beginner</SelectItem><SelectItem value="Confident user">Confident user</SelectItem><SelectItem value="Beginner coder">Beginner coder</SelectItem><SelectItem value="Working developer">Working developer</SelectItem></SelectContent></Select>
          </div>
          <div className="setup-card">
            <label htmlFor="goal">Primary goal</label>
            <Select value={goal} onValueChange={setGoal}><SelectTrigger id="goal"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Use AI well">Use AI well</SelectItem><SelectItem value="Study and research">Study and research</SelectItem><SelectItem value="Build software">Build software</SelectItem><SelectItem value="Secure AI systems">Secure AI systems</SelectItem><SelectItem value="Understand advanced systems">Understand advanced systems</SelectItem></SelectContent></Select>
          </div>
          <div className="setup-card switch-card"><div><label htmlFor="student-safe">Beginner Safe Mode</label><p>Keeps complete beginners in foundations until evidence and study habits are demonstrated; experienced learners receive a diagnostic entry.</p></div><Switch id="student-safe" checked={studentSafe} onCheckedChange={setStudentSafe} /></div>
          <div className="setup-card"><label>Explanation depth</label><div className="segmented" role="group" aria-label="Explanation depth">{(["Simple", "Practical", "Technical"] as Depth[]).map((item) => <button key={item} className={depth === item ? "active" : ""} onClick={() => setDepth(item)}>{item}</button>)}</div></div>
        </div>
        <div className="availability-card"><div><h3>What kind of access do you have?</h3><p>Choose categories, not brands. Nothing is preselected.</p></div><div className="check-grid">{availableCategories.map((item) => <label key={item}><Checkbox checked={available.includes(item)} onCheckedChange={(checked) => setAvailable((current) => checked ? [...current, item] : current.filter((entry) => entry !== item))} /> {item}</label>)}</div></div>
        <div className="progress-data-card">
          <div><ShieldCheck /><div><h3>Private learner state</h3><p>Export a portable JSON backup before clearing browser data or moving devices. Import changes only this browser; it never changes the public curriculum.</p></div></div>
          <div className="progress-data-actions"><Button variant="outline" onClick={exportLocalState}><Download /> Export progress</Button><Button variant="outline" onClick={() => importRef.current?.click()}><Upload /> Import progress</Button><input ref={importRef} className="sr-only" aria-label="Import Atlas progress file" type="file" accept="application/json,.json" onChange={(event) => importLocalState(event.target.files?.[0])} /><span aria-live="polite">{stateMessage}</span></div>
        </div>
      </section>

      <V4CommandCentre curriculum={runtimeCurriculum} details={runtimeUnitDetails} state={effectiveLearningState} onChange={setLearningState} />
      <SkillsPassport curriculum={runtimeCurriculum} state={effectiveLearningState} today={todayIso()} />
      <KnowledgeSystemsStudio />

      <section className="page-section proof-sprint" aria-labelledby="proof-sprint-title">
        <div><div className="section-kicker">Start in 20 minutes</div><h2 id="proof-sprint-title" className="section-title">Turn the Atlas into evidence immediately.</h2><p className="section-intro">Choose one small task, keep the original input, check the result against a short rubric and save the corrected artifact. This sprint is deliberately tool-neutral and belongs to the public curriculum.</p></div>
        <ol><li><strong>State the job.</strong> Write the exact result you need and one thing the tool must not do.</li><li><strong>Run once.</strong> Use one available assistant or a manual method; preserve the first output.</li><li><strong>Verify.</strong> Open evidence or inspect the work against a two-point rubric.</li><li><strong>Transfer.</strong> Repeat on a changed input and record what survived.</li></ol>
      </section>

      <section id="queue" className="page-section compact-section" aria-labelledby="queue-title">
        <div className="queue-heading"><div><div className="section-kicker">Imported v3 track queue</div><h2 id="queue-title" className="section-title">Repair first. Retest when due. Then continue.</h2><p className="section-intro">This compatibility queue preserves the original 300-hour track records. New v4 module evidence and recommendations live in the Command Centre above. Neither is an external reminder service.</p></div><ListChecks aria-hidden="true" /></div>
        <div className="learning-queue">
          {learningQueue.slice(0, 4).map((item) => { const track = tracks.find((entry) => entry.id === item.trackId)!; return <article key={`${item.trackId}-${item.kind}`} className={`queue-card queue-${item.priority}`}><div>{item.kind === "Repair" ? <AlertTriangle /> : item.kind.startsWith("Retest") ? <CalendarClock /> : <ChevronRight />}<Badge variant={item.priority <= 1 ? "destructive" : "outline"}>{item.kind}</Badge></div><h3>{track.code} · {track.title}</h3><p>{item.detail}</p><a href={`#track-${track.id}`} onClick={openTrackInRoadmap}>Open track <ArrowRight /></a></article>; })}
          {!learningQueue.length && <article className="queue-card queue-empty"><div><CheckCircle2 /><Badge variant="outline">Clear</Badge></div><h3>No repair or retest work is waiting.</h3><p>Start or continue {recommended.code}; it is the next eligible track for your selected route.</p><a href={`#track-${recommended.id}`} onClick={openTrackInRoadmap}>Open {recommended.code} <ArrowRight /></a></article>}
        </div>
        {learningQueue.length > 4 && <p className="queue-overflow">Showing the four highest-priority items. Use the learning-status filter below to inspect the remaining {learningQueue.length - 4}.</p>}
      </section>

      <section className="page-section compact-section" aria-labelledby="product-boundaries-title">
        <div className="section-kicker">Choose the right OpenAI surface</div><h2 id="product-boundaries-title" className="section-title">Chat, Work, Codex and Codex Security are different jobs.</h2>
        <div className="boundary-grid">{productBoundaries.map(([name, job, use, avoid]) => <article key={name}><h3>{name}</h3><strong>{job}</strong><p><span>Use:</span> {use}</p><p><span>Avoid:</span> {avoid}</p></article>)}</div>
      </section>

      <OperatorCore studio={studio} onStudioChange={setStudio} />

      <div id="claude-mastery"><ClaudeMastery state={learningState.publicLabs.claude} setState={setClaudeState} /></div>
      <div id="gemini-mastery"><GeminiMastery state={learningState.publicLabs.gemini} setState={setGeminiState} /></div>
      <div id="systems-lab"><V5SystemsLab runs={learningState.publicLabs.benchmarks} setRuns={setBenchmarkRuns} /></div>

      <section className="page-section compact-section">
        <div className="principle-grid">
          <article className="principle-card leverage"><Zap /><h3>High-leverage AI</h3><p>Clarifies thinking, verifies claims, creates reusable systems, compresses routine work and leaves an inspectable artifact.</p></article>
          <article className="principle-card novelty"><Sparkles /><h3>Low-leverage or novelty-driven use</h3><p>Collects tools, endlessly rewrites prompts, accepts confident outputs and produces nothing that can be tested or reused.</p></article>
        </div>
      </section>

      <section className="page-section">
        <div className="section-kicker">Decision engine</div><h2 className="section-title">Before you open an AI tool, answer ten questions.</h2>
        <div className="decision-grid">{decisionQuestions.map(([question, response], index) => <article key={question}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{question}</h3><p>{response}</p></div></article>)}</div>
      </section>

      <section className="page-section">
        <div className="section-kicker">Zero to one</div><h2 className="section-title">Your first ten hours, already sequenced.</h2>
        <div className="first-ten-grid">{firstTen.map(([time, title, description], index) => <article className="first-ten-card" key={time}><span>{index + 1}</span><small>{time}</small><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>

      <section id="roadmap" className="page-section">
        <div className="section-kicker">The roadmap</div><h2 className="section-title">Five levels. Three discovery lanes. Exactly {totalHours} structured hours.</h2>
        <p className="section-intro">Levels describe progression; Essential, Builder and Advanced are discovery lanes retained for filtering. Every module has integer-minute instruction, practice and assessment allocations. Hours measure planned effort, not competence.</p>
        <div className="level-summary">{levels.map((level, index) => <article key={level}><small>Level {index + 1}</small><strong>{level}</strong><span>{levelTargets[level]}h</span><p>{levelDescriptions[level]}</p></article>)}</div>
        <div className="route-summary">{routeOrder.map((route) => { const routeTracks = tracks.filter((track) => track.route === route); const studied = routeTracks.filter((track) => courseStatuses.includes(progressRecords[track.id]?.status || "Unseen")).reduce((sum, track) => sum + track.hours, 0); const shown = routeTracks.filter((track) => { const record = progressRecords[track.id]; return Boolean(record?.demonstratedEvidence?.trim() && record.demonstratedAt && isOnOrBeyond(record.status, "Demonstrated")); }).reduce((sum, track) => sum + track.hours, 0); const mastered = routeTracks.filter((track) => { const record = progressRecords[track.id]; return record?.status === "Mastered" && Boolean(record.retestEvidence?.trim() && record.retestPassedAt); }).reduce((sum, track) => sum + track.hours, 0); return <article key={route} className={`route-card route-${route.toLowerCase()}`}><div><span>{route}</span><strong>{routeHours[route]}h</strong></div><p>{route === "Essential" ? "Literacy, prompting, product judgment, research and learning systems." : route === "Builder" ? "Programming, Git, web, APIs, coding agents, automation and deployment." : "Transformers, RAG, evals, security, governance and system leadership."}</p><Progress value={(studied / routeHours[route]) * 100} /><small>{studied}h studied · {shown}h demonstrated · {mastered}h mastered</small></article>; })}</div>
        <div className="metrics-row"><span><CheckCircle2 /> Course progress: <strong>{courseHours}h</strong></span><span><FlaskConical /> Practised+: <strong>{practisedHours}h</strong></span><span><Trophy /> Demonstrated: <strong>{demonstratedHours}h</strong></span><span><ShieldCheck /> Retest mastery: <strong>{masteredHours}h</strong></span><span><Layers3 /> Authored modules: <strong>{moduleCount}</strong></span><span><Trophy /> Track assessments: <strong>{labCount}</strong></span></div>

        <div className="filter-bar curriculum-filters">
          <div className="search-wrap"><Search /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tracks, outcomes or concepts…" aria-label="Search curriculum" /></div>
          <Select value={levelFilter} onValueChange={setLevelFilter}><SelectTrigger aria-label="Filter by level"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All levels</SelectItem>{levels.map((level) => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent></Select>
          <Select value={routeFilter} onValueChange={setRouteFilter}><SelectTrigger aria-label="Filter by route"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All routes</SelectItem>{routeOrder.map((route) => <SelectItem key={route} value={route}>{route}</SelectItem>)}</SelectContent></Select>
          <Select value={needFilter} onValueChange={setNeedFilter}><SelectTrigger aria-label="Filter by priority"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All priorities</SelectItem>{(["Essential", "Useful", "Specialist", "Optional", "Curiosity"] as NeedLevel[]).map((need) => <SelectItem key={need} value={need}>{need}</SelectItem>)}</SelectContent></Select>
          <Select value={progressFilter} onValueChange={setProgressFilter}><SelectTrigger aria-label="Filter by learning status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All learning statuses</SelectItem><SelectItem value="Active">Active learning</SelectItem><SelectItem value="Needs Repair">Needs Repair</SelectItem><SelectItem value="Retest Due">Retest Due</SelectItem><SelectItem value="Mastered">Mastered</SelectItem><SelectItem value="Unseen">Not started</SelectItem></SelectContent></Select>
        </div>

        <div className="track-list"><Accordion type="multiple" className="space-y-3">{filteredTracks.map((track) => {
          const trackResources = track.resourceIds.map((id) => resources.find((item) => item.id === id)).filter(Boolean) as Resource[];
          const currentStatus = statuses[track.id] || "Unseen";
          const currentRecord = progressRecords[track.id] || { status: "Unseen" as Status };
          const prereqsMet = track.prerequisites.every((id) => demonstratedStatuses.includes(statuses[id] || "Unseen"));
          return <AccordionItem id={`track-${track.id}`} key={track.id} value={track.id} className="track-card">
            <AccordionTrigger className="track-trigger"><div className="track-code">{track.code}</div><div className="track-heading"><div><Badge>{levelFor(track.id)}</Badge><Badge variant="outline">{track.route}</Badge><Badge variant="secondary">{track.need}</Badge>{!prereqsMet && <Badge variant="destructive">Prerequisites open</Badge>}</div><div className="track-title">{track.title}</div><p>{track.simple}</p></div><div className="track-hours"><strong>{track.hours}h</strong><small>{currentStatus}</small></div></AccordionTrigger>
            <AccordionContent className="track-content">
              <div className="track-overview"><article><span>Why this matters</span><p>{track.outcome}</p></article><article><span>When not to use it</span><p>{track.whenNot}</p></article><article><span>Before you begin</span><p>{track.prerequisites.length ? track.prerequisites.map((id) => tracks.find((entry) => entry.id === id)?.code).join(", ") : "No prerequisite. Start here."}</p></article></div>
              <div className="method-grid"><article><span>Primary route</span><p>{track.primary}</p></article><article><span>Free alternative</span><p>{track.freeAlternative}</p></article><article><span>Tool-neutral method</span><p>{track.agnostic}</p></article></div>
              <h4>Lessons, integrated resources and time budget</h4>
              <p>REVIEWED identifies an authored lesson checked within this project, not external expert review. NEEDS REVIEW identifies a retained outline awaiting substantive revision.</p>
              <div className="module-list">{track.modules.map((module, index) => {
                const moduleResources = module.resourceIds.map((id) => resources.find((item) => item.id === id)).filter(Boolean) as Resource[];
                return <details className="module-card" key={module.title}>
                  <summary><span className="module-number">{index + 1}</span><span><strong>{module.title}</strong><small>{module.tier} · Learn {module.learn}h · Practise {module.lab}h · Assess {module.assessment}h · {module.reviewStatus}</small></span><ChevronRight /></summary>
                  <div className="module-detail">
                    <p><strong>Objective.</strong> {module.objective}</p>
                    <p><strong>Mental model.</strong> {module.explanation}</p>
                    {module.example && <p><strong>Worked example.</strong> {module.example}</p>}
                    <p><strong>Guided task.</strong> {module.activity}</p>
                    <p><strong>Independent assessment.</strong> {module.check}</p>
                    <p><strong>Failure mode.</strong> {module.failureMode}</p>
                    <p><strong>Pass criterion.</strong> {module.passCriterion}</p>
                    <p><strong>Transfer.</strong> {module.transfer}</p>
                    <div className="module-resources"><span>Study inside this lesson</span>{moduleResources.map((item) => <ResourceLink key={item.id} item={item} compact />)}</div>
                  </div>
                </details>;
              })}</div>
              <div className="lab-ladder"><h4>One assessed track lab · five-stage mastery framework</h4><p>{track.lab.scenario}</p><div className="lab-brief-grid"><p><strong>Starting materials.</strong> {track.lab.materials}</p><p><strong>Constraints and safety.</strong> {track.lab.constraints}</p><p><strong>Required evidence.</strong> {track.lab.evidence}</p><p><strong>Failure and repair.</strong> {track.lab.repair}</p></div><ol><li><strong>Guided:</strong> {track.lab.guided}</li><li><strong>Partial:</strong> {track.lab.partial}</li><li><strong>Independent:</strong> {track.lab.independent}</li><li><strong>Transfer:</strong> {track.lab.transfer}</li><li><strong>Delayed retest:</strong> {track.lab.retest}</li></ol><div className="lab-rubric"><strong>Four-point rubric</strong><ul>{track.lab.rubric.map((item) => <li key={item}>{item}</li>)}</ul></div></div>
              <div className="proof-box"><Trophy /><div><span>Lab pass criterion</span><p>{track.proof}</p></div></div>
              <div className="track-resources"><h4>Selected resources</h4>{trackResources.map((item) => <ResourceLink key={item.id} item={item} compact />)}</div>
              {/^[ebas][0-7]$/.test(track.id) ? <div className="evidence-panel" aria-labelledby={`evidence-title-${track.id}`}>
                <div><h4 id={`evidence-title-${track.id}`}>Self-reported mastery evidence</h4><p>This Site stores these notes only in this browser. It does not inspect or verify the artifact.</p></div>
                {currentRecord.migrationNote && <p className="migration-note">{currentRecord.migrationNote}</p>}
                <div className="evidence-grid">
                  <label htmlFor={`demo-evidence-${track.id}`}>Independent evidence note<input id={`demo-evidence-${track.id}`} value={currentRecord.demonstratedEvidence || ""} onChange={(event) => updateRecord(track.id, { demonstratedEvidence: event.target.value })} placeholder="Artifact name, result and pass evidence" /></label>
                  <label htmlFor={`demo-date-${track.id}`}>Independent completion date<input id={`demo-date-${track.id}`} type="date" value={currentRecord.demonstratedAt || ""} onChange={(event) => updateRecord(track.id, { demonstratedAt: event.target.value })} /></label>
                  <label htmlFor={`transfer-context-${track.id}`}>Different-context transfer task<input id={`transfer-context-${track.id}`} value={currentRecord.transferContext || ""} onChange={(event) => updateRecord(track.id, { transferContext: event.target.value })} placeholder="What was genuinely different?" /></label>
                  <label htmlFor={`transfer-evidence-${track.id}`}>Transfer evidence<input id={`transfer-evidence-${track.id}`} value={currentRecord.transferEvidence || ""} onChange={(event) => updateRecord(track.id, { transferEvidence: event.target.value })} placeholder="Result and criterion met" /></label>
                  <label htmlFor={`transfer-date-${track.id}`}>Transfer completion date<input id={`transfer-date-${track.id}`} type="date" value={currentRecord.transferredAt || ""} onChange={(event) => updateRecord(track.id, { transferredAt: event.target.value })} /></label>
                  <label htmlFor={`retest-due-${track.id}`}>Delayed retest due<input id={`retest-due-${track.id}`} type="date" value={currentRecord.retestDue || ""} onChange={(event) => updateRecord(track.id, { retestDue: event.target.value })} /></label>
                  <label htmlFor={`retest-evidence-${track.id}`}>Retest pass evidence<input id={`retest-evidence-${track.id}`} value={currentRecord.retestEvidence || ""} onChange={(event) => updateRecord(track.id, { retestEvidence: event.target.value })} placeholder="Fresh variant and result" /></label>
                  <label htmlFor={`retest-date-${track.id}`}>Retest pass date<input id={`retest-date-${track.id}`} type="date" value={currentRecord.retestPassedAt || ""} onChange={(event) => updateRecord(track.id, { retestPassedAt: event.target.value })} /></label>
                  <label className="wide-field" htmlFor={`repair-note-${track.id}`}>Failed transfer/retest repair note<input id={`repair-note-${track.id}`} value={currentRecord.repairNote || ""} onChange={(event) => updateRecord(track.id, { repairNote: event.target.value })} placeholder="What failed and what will be repaired?" /></label>
                  <label className="wide-field" htmlFor={`skip-reason-${track.id}`}>Reason for intentionally skipping<input id={`skip-reason-${track.id}`} value={currentRecord.skipReason || ""} onChange={(event) => updateRecord(track.id, { skipReason: event.target.value })} placeholder="Why is this track unnecessary for your goal or already covered elsewhere?" /></label>
                </div>
                <div className="status-row"><label htmlFor={`status-${track.id}`}>Learning status</label><select id={`status-${track.id}`} value={currentStatus} onChange={(event) => updateStatus(track.id, event.target.value as Status)}>{statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select><small>Advance one stage at a time. Demonstrated needs dated evidence; Transferred needs a different-context record; Mastered unlocks only after a due retest and recorded pass.</small></div>
              </div> : <div className="evidence-panel v4-evidence-route"><div><h4>Record this track module by module</h4><p>v4 does not award this track as one click. Use the Command Centre to record each lesson, independent result, transfer and delayed retest.</p></div><a href="#command-centre">Open the v4 evidence workflow <ArrowRight /></a></div>}
            </AccordionContent>
          </AccordionItem>;
        })}</Accordion>{!filteredTracks.length && <div className="empty-state">No tracks match those filters.</div>}</div>
      </section>

      <section id="videos" className="page-section feature-section">
        <div className="section-kicker">Watch with a purpose</div><h2 className="section-title">YouTube & courses—visible, searchable and click-to-open.</h2>
        <p className="section-intro">Videos are demonstrations, not mastery. Before watching, write one question. After watching, produce one artifact or closed-book explanation.</p>
        <div className="video-grid">{featuredVideos.map((item) => <ResourceLink key={item.id} item={item} />)}</div>
        <div className="center-action"><Button asChild variant="outline" size="lg"><a href="#library" onClick={openVideoLibrary}>Browse all {videoCount} videos <ArrowRight /></a></Button></div>
      </section>

      <section id="tools" className="page-section">
        <div className="section-kicker">Tool role matrix</div><h2 className="section-title">Every tool gets one job—or no job.</h2>
        <p className="section-intro">Product access changes. The curriculum always supplies a free or tool-neutral route, so learning does not depend on a subscription.</p>
        <div className="tool-grid">{tools.map((tool) => <article className="tool-card" key={tool.name}><div><h3>{tool.name}</h3><Badge variant="outline">{tool.need}</Badge></div><strong>{tool.role}</strong><dl><dt>Best for</dt><dd>{tool.best}</dd><dt>Poor fit</dt><dd>{tool.poor}</dd>{depth !== "Simple" && <><dt>Trade-off</dt><dd>{tool.tradeoff}</dd><dt>Privacy</dt><dd>{tool.privacy}</dd></>}{depth === "Technical" && <><dt>Alternative</dt><dd>{tool.alternative}</dd><dt>Depth</dt><dd>{tool.depth}</dd></>}</dl></article>)}</div>
      </section>

      <section className="page-section">
        <div className="section-kicker">Confusion prevention</div><h2 className="section-title">Pairs beginners are often asked to distinguish.</h2>
        <div className="comparison-table" role="table" aria-label="Commonly confused AI terms">{confusionPairs.map(([left, right, leftMeaning, rightMeaning]) => <div className="comparison-row" role="row" key={`${left}-${right}`}><div role="cell"><strong>{left}</strong><p>{leftMeaning}</p></div><ChevronRight /><div role="cell"><strong>{right}</strong><p>{rightMeaning}</p></div></div>)}</div>
      </section>

      <section id="library" className="page-section">
        <div className="section-kicker">Resource library</div><h2 className="section-title">{resources.length} sources, each connected to a lesson.</h2>
        <p className="section-intro">Core register checked 1 September 2026; frontier product documentation and plan guidance rechecked through 8 September 2026. Official documentation and standards are preferred for changing product behaviour. “Search-confirmed” means a host blocked direct fetching but the exact title, creator and destination were confirmed in search.</p>
        <div className="library-stats"><div><strong>{resources.length}</strong><span>integrated sources</span></div><div><strong>{officialCount}</strong><span>official docs & standards</span></div><div><strong>{youtubeCount}</strong><span>YouTube links</span></div><div><strong>{courseCount}</strong><span>courses</span></div></div>
        <p className="section-intro" aria-label="Resource freshness summary">Freshness register: {resourceStatusCounts.Active} active · {resourceStatusCounts["Changing"]} changing · {resourceStatusCounts["Rolling out"]} rolling out · {resourceStatusCounts["Review needed"]} review needed. Filter changing or review-needed sources before relying on volatile product guidance.</p>
        <div className="filter-bar">
          <div className="search-wrap"><Search /><Input value={resourceQuery} onChange={(event) => setResourceQuery(event.target.value)} placeholder="Search title, creator, topic or tool…" aria-label="Search resources" /></div>
          <Select value={formatFilter} onValueChange={setFormatFilter}><SelectTrigger aria-label="Filter resources by format"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All formats</SelectItem>{(["Official docs", "Video", "Course", "Standard", "Reference"] as Resource["format"][]).map((format) => <SelectItem key={format} value={format}>{format}</SelectItem>)}</SelectContent></Select>
          <Select value={topicFilter} onValueChange={setTopicFilter}><SelectTrigger aria-label="Filter resources by topic"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All topics</SelectItem>{resourceTopics.map((topic) => <SelectItem key={topic} value={topic}>{topic}</SelectItem>)}</SelectContent></Select>
          <Select value={freshnessFilter} onValueChange={setFreshnessFilter}><SelectTrigger aria-label="Filter resources by freshness status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All freshness states</SelectItem>{(["Active", "Rolling out", "Changing", "Review needed"] as Resource["status"][]).map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select>
        </div>
        <p id="resource-results" className="section-intro" role="status" aria-live="polite" aria-atomic="true">
          {filteredResources.length === 0
            ? "No resources match this search and filter combination. Try another search or choose All formats and All topics."
            : `Showing ${visibleResources.length} of ${filteredResources.length} matching resources.`}
        </p>
        <div className="resource-grid">{visibleResources.map((item) => <article className="resource-card" key={item.id}><div><Badge variant="outline">{item.route}</Badge><Badge variant="secondary">{item.qualityTier}</Badge>{item.free && <Badge>Free</Badge>}<Badge variant="outline">{item.status}</Badge></div><h3><ExternalResourceLink href={item.url}>{item.title} <ExternalLink aria-hidden="true" /></ExternalResourceLink></h3><p>{item.creator} · {item.duration} · {item.level}</p><p>{item.why}</p><small>{item.format} · {item.topic} · {item.tool} · Verified {item.lastVerified} ({item.verification}) · {item.versionRelevance}</small></article>)}</div>
        {filteredResources.length > 18 && <div className="center-action"><Button variant="outline" onClick={() => setShowAllResources((value) => !value)}>{showAllResources ? "Show first 18" : `Show all ${filteredResources.length}`}</Button></div>}
      </section>

      <section className="page-section">
        <Tabs defaultValue="mastery" className="wide-tabs">
          <TabsList><TabsTrigger value="mastery">Mastery</TabsTrigger><TabsTrigger value="security">Security</TabsTrigger><TabsTrigger value="portfolio">Portfolio</TabsTrigger><TabsTrigger value="community">Community</TabsTrigger></TabsList>
          <TabsContent value="mastery" className="tab-panel"><div><div className="section-kicker">Mastery loop</div><h2>Learn → practise → demonstrate → transfer → retest.</h2><p><strong>Course progress</strong> records exposure from Learned onward. <strong>Practised+</strong> credits the full hours of tracks at Practised or beyond—never more than the track’s stated hours. <strong>Demonstrated</strong> requires a dated self-reported artifact note. <strong>Mastered</strong> is reserved for successful transfer and a due delayed retest. These measures are not merged.</p></div><ol className="mastery-steps"><li><span>0</span>Unseen</li><li><span>1</span>Learned / explain</li><li><span>2</span>Practised with help</li><li><span>3</span>Demonstrated independently</li><li><span>4</span>Transferred to a new context</li><li><span>5</span>Retest Due on a scheduled date</li><li><span>6</span>Mastered after a passed retest</li></ol></TabsContent>
          <TabsContent value="security" className="tab-panel"><div><div className="section-kicker">Defensive security</div><h2>Treat instructions, data and tools as separate trust boundaries.</h2><p>Prompt injection and jailbreaks are taught to improve defence: synthetic environments, least privilege, input/output validation, logs, approval gates and responsible disclosure.</p></div><ul><li>Never test on systems you do not own or have permission to assess.</li><li>Never include real secrets, private files or live accounts in a red-team lab.</li><li>Record the attack path, consequence, control and remaining risk.</li></ul></TabsContent>
          <TabsContent value="portfolio" className="tab-panel"><div><div className="section-kicker">Proof of work</div><h2>Build evidence, not a certificate collection.</h2><p>The capstone is a public, reproducible AI system with an evaluation set, source trail, threat model, accessibility review, deployment notes and a five-minute teach-back.</p></div><ul><li>Essential: corrected research brief and learning workflow.</li><li>Builder: tested repository, useful interface and recovery path.</li><li>Advanced: evaluation report, threat model and governance memo.</li></ul></TabsContent>
          <TabsContent value="community" className="tab-panel"><div><div className="section-kicker">Community safety</div><h2>A public curriculum; browser-local learner state.</h2><p>The Community Edition contains no personal subscription list, account details or biographical assumptions. Progress is stored under this Site’s local-storage key, is readable to this browser profile, does not sync automatically and disappears when site data is cleared.</p></div><ul><li>Use Export progress before changing devices or clearing data.</li><li>Avoid shared-browser profiles for private learning notes.</li><li>Share the curriculum, not another learner’s progress.</li><li>This edition contains no affiliate links or sponsorships.</li></ul></TabsContent>
        </Tabs>
      </section>

      <section className="page-section">
        <div className="section-kicker">Glossary</div><h2 className="section-title">{glossary.length} terms, three depths.</h2>
        <div className="glossary-grid">{glossary.map(([term, simple, practical, technical]) => <article className="glossary-card" key={term}><h3>{term}</h3><p>{depth === "Simple" ? simple : depth === "Practical" ? practical : technical}</p></article>)}</div>
      </section>

      <section id="changelog" className="page-section compact-section" aria-labelledby="changelog-title">
        <div className="section-kicker">Release candidate · 9 September 2026</div><h2 id="changelog-title" className="section-title">v5.0 — Universal AI Systems Mastery</h2>
        <div className="boundary-grid"><article><h3>Durable model roles</h3><p>Model selection now begins with capability classes and task evidence, while volatile product names remain a dated application layer.</p></article><article><h3>Benchmark intelligence</h3><p>The new explorer distinguishes benchmark families, scope limits and fair-comparison controls; a local lab records the learner’s own frozen-task evidence.</p></article><article><h3>Failure + economics</h3><p>Fifteen operational failure modes now teach symptom, cause, detection, prevention and recovery, alongside cost-per-success routing.</p></article><article><h3>Unified state</h3><p>Claude, Gemini and personal benchmark records now migrate into one sanitised V5 export. No private entitlement or billing values are present in the public bundle.</p></article></div>
      </section>

      <section className="page-section final-section">
        <div><div className="section-kicker">Version 5.1 · Community Edition · October 2026</div><h2>Understand systems. Test claims. Route from evidence.</h2><p>Curriculum: exactly {totalHours} structured hours across {tracks.length} tracks, {moduleCount} authored modules and {labCount} track assessments. Resource register: {resources.length} integrated entries. The v5.1 interface adds guided next-step routing, Beginner Safe Mode, freshness-aware filtering and evidence-gated progression on top of the V5 curriculum—without padding hours or exposing private entitlements.</p></div>
        <div className="final-actions"><Button asChild size="lg"><a href="#start">Return to start</a></Button><Button variant="ghost" onClick={resetLocalState}><RotateCcw /> Reset browser progress</Button></div>
      </section>

      <footer><div><Orbit /> <strong>AI Mastery Atlas</strong></div><p>Independent educational curriculum. Product names belong to their respective owners.</p><div><a href="#top">Top</a><a href="#library">Sources</a><a href="#tools">Tool matrix</a><a href="#changelog">Changelog</a></div></footer>
    </main>
  );
}
