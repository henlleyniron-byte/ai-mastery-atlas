// Source: owner-approved 11 October 2026 curriculum brief; these are course briefs, not verified full lessons.
// The source document contains sixteen outlines per track. Keep these clearly labelled outlines until
// worked demonstrations, independently tested labs, rubrics and references are authored for every lesson.
export type AcademyTrack = "Notion" | "RemNote" | "Claude Code";
export type AcademyLesson = { id: string; track: AcademyTrack; title: string; brief: string };
export const academyLessons: AcademyLesson[] = [
  {
    "id": "N01",
    "track": "Notion",
    "title": "Workspace orientation",
    "brief": "sidebar, page, block, navigation and search. Guided task: open existing Command Centre and find the paper database without changing it. Pass: explain where plans, sources and results belong."
  },
  {
    "id": "N02",
    "track": "Notion",
    "title": "Pages and blocks",
    "brief": "text, headings, lists, toggles and links. Task: create a clearly labeled sandbox page and a short source-linked note. Pass: edit/reorder blocks independently."
  },
  {
    "id": "N03",
    "track": "Notion",
    "title": "Databases and entries",
    "brief": "explain how a row is a page and a property is a field. Task: inspect existing Paper & Marks Engine properties. Pass: distinguish a view from a separate database."
  },
  {
    "id": "N04",
    "track": "Notion",
    "title": "Property types",
    "brief": "text, number, date, select, checkbox, URL and files. Task: use a sandbox record with synthetic data. Pass: choose appropriate types and explain actual versus planned dates."
  },
  {
    "id": "N05",
    "track": "Notion",
    "title": "Views, filters, sorts and grouping. Task",
    "brief": "find unmarked attempts and overdue retests using existing views; sandbox practice where editing would affect others. Pass: retrieve the right records without cloning the database."
  },
  {
    "id": "N06",
    "track": "Notion",
    "title": "Templates",
    "brief": "use an existing attempt template. Pass: record an actual independently attempted paper accurately; demonstrations must remain labeled synthetic."
  },
  {
    "id": "N07",
    "track": "Notion",
    "title": "Paper Engine workflow",
    "brief": "source -> actual attempted date/time -> raw score -> marking source -> uncertainty -> next action. Pass: no scheduled paper marked complete merely because time passed."
  },
  {
    "id": "N08",
    "track": "Notion",
    "title": "Academic Error Bank",
    "brief": "one verified error linked to its attempt, diagnosis, narrow repair and review. Pass: search for duplicates first; uncertain marking keys receive a verification hold."
  },
  {
    "id": "N09",
    "track": "Notion",
    "title": "Mistake Vault",
    "brief": "distinguish behavioral/workflow mistakes from verifiable subject errors. Pass: record cause, risk, correction and prevention trigger in the existing appropriate storage unit."
  },
  {
    "id": "N10",
    "track": "Notion",
    "title": "Relations and rollups",
    "brief": "explain with linked attempts/errors, using sandbox examples before changes to canonical schemas. Pass: follow a relation and distinguish source values from aggregate displays."
  },
  {
    "id": "N11",
    "track": "Notion",
    "title": "Formulas",
    "brief": "read a simple conditional and date formula after prerequisites. Pass: explain assumptions and handle empty inputs. Do not introduce fragile formulas merely for aesthetics."
  },
  {
    "id": "N12",
    "track": "Notion",
    "title": "Calendar and Drive links",
    "brief": "intentions versus evidence, attaching canonical source URLs, file permissions. Pass: locate a source and log an outcome without copying the whole document into several apps."
  },
  {
    "id": "N13",
    "track": "Notion",
    "title": "Sharing and privacy",
    "brief": "private page, public page, guests and inheritance. Pass: inspect permissions and identify private information; no real public-sharing change needed for the exercise."
  },
  {
    "id": "N14",
    "track": "Notion",
    "title": "Export, version history and recovery",
    "brief": "demonstrate a sample export and restore in a sandbox. Pass: locate the exported file and state limits; a link is not a backup."
  },
  {
    "id": "N15",
    "track": "Notion",
    "title": "Notion AI",
    "brief": "source-grounded assistance, review generated claims, distinguish draft from verified record. Pass: catch an intentionally incorrect synthetic summary before updating a record."
  },
  {
    "id": "N16",
    "track": "Notion",
    "title": "Capstone and delayed check",
    "brief": "retrieve a paper, log an actual marked attempt, link a verified error, define repair/transfer/retest, and locate it again later without step-by-step assistance. Rubric checks factual accuracy, deduplication, correct database and recoverability; no speed requirement."
  },
  {
    "id": "R01",
    "track": "RemNote",
    "title": "RemNote versus Notion/Anki",
    "brief": "notes plus retrieval, with deliberate role boundaries."
  },
  {
    "id": "R02",
    "track": "RemNote",
    "title": "Navigation, documents and folders",
    "brief": "create one sandbox document and find it again."
  },
  {
    "id": "R03",
    "track": "RemNote",
    "title": "Rems, indentation and hierarchy",
    "brief": "explain the mental model using one Biology concept."
  },
  {
    "id": "R04",
    "track": "RemNote",
    "title": "Atomic basic cards",
    "brief": "one answerable question with one verified answer; teach current supported syntax from official docs."
  },
  {
    "id": "R05",
    "track": "RemNote",
    "title": "Concepts/descriptors and reverse cards",
    "brief": "use only where the retrieval direction is meaningful."
  },
  {
    "id": "R06",
    "track": "RemNote",
    "title": "Cloze cards",
    "brief": "choose a meaningful missing fact and avoid guessing from grammar/context."
  },
  {
    "id": "R07",
    "track": "RemNote",
    "title": "Image occlusion",
    "brief": "use a permitted cell diagram; avoid hiding unrelated regions or ambiguous labels."
  },
  {
    "id": "R08",
    "track": "RemNote",
    "title": "Linking/backlinks",
    "brief": "connect related ideas without building a decorative knowledge graph."
  },
  {
    "id": "R09",
    "track": "RemNote",
    "title": "PDFs, annotations and sources",
    "brief": "keep page/source links and respect material rights."
  },
  {
    "id": "R10",
    "track": "RemNote",
    "title": "Due queue and honest rating",
    "brief": "recall before reveal; incorrect or guessed answers must not be scored as secure."
  },
  {
    "id": "R11",
    "track": "RemNote",
    "title": "Review load",
    "brief": "select a manageable active deck, avoid indiscriminate card generation, and handle missed days without punitive catch-up."
  },
  {
    "id": "R12",
    "track": "RemNote",
    "title": "Duplicate and ambiguous-card repair",
    "brief": "merge duplication without blindly destroying scheduling history."
  },
  {
    "id": "R13",
    "track": "RemNote",
    "title": "AI-generated cards",
    "brief": "draft from a trusted source, verify every answer and edit weak prompts before activation."
  },
  {
    "id": "R14",
    "track": "RemNote",
    "title": "Import/export, sync and recovery",
    "brief": "distinguish a local export from a synchronized account; test a small sample."
  },
  {
    "id": "R15",
    "track": "RemNote",
    "title": "Bridge from paper errors",
    "brief": "convert only recurring unstable facts suitable for flashcards; multi-step exam reasoning still needs exam questions."
  },
  {
    "id": "R16",
    "track": "RemNote",
    "title": "Capstone and delayed check",
    "brief": "create 5-10 high-quality source-verified cards from actual diagnosed weaknesses, perform a due review, correct weak cards and answer an unseen related exam question. Retention is measured from real recall, not deck size."
  },
  {
    "id": "C01",
    "track": "Claude Code",
    "title": "Claude chat versus Claude Code versus API",
    "brief": "show capabilities, permissions and billing boundaries; possession of an app/subscription is not proof of access to every model."
  },
  {
    "id": "C02",
    "track": "Claude Code",
    "title": "Files, folders, paths and terminal",
    "brief": "read a small directory, identify working directory; explain commands before execution."
  },
  {
    "id": "C03",
    "track": "Claude Code",
    "title": "Installation and authentication",
    "brief": "provide currently verified Windows-native PowerShell instructions and a clearly separate WSL route. Use official docs; do not mix shells. Never display or request passwords/API secrets."
  },
  {
    "id": "C04",
    "track": "Claude Code",
    "title": "Repository and Git basics",
    "brief": "clone/open, branch, status, diff and commit. Pass: explain tracked versus untracked files and recover a harmless sample edit."
  },
  {
    "id": "C05",
    "track": "Claude Code",
    "title": "First read-only session",
    "brief": "ask Claude Code to explain a toy repository with file references. Pass: independently verify one explanation in source."
  },
  {
    "id": "C06",
    "track": "Claude Code",
    "title": "Project instructions and context",
    "brief": "CLAUDE.md, repository rules, session scope and avoiding irrelevant/private files."
  },
  {
    "id": "C07",
    "track": "Claude Code",
    "title": "Safe permissions",
    "brief": "distinguish reading, editing, command execution, external writes and publishing. Inspect changes; do not teach blanket permission bypass as a beginner default."
  },
  {
    "id": "C08",
    "track": "Claude Code",
    "title": "First bounded change",
    "brief": "change one label in a disposable toy page, inspect the diff and verify the result."
  },
  {
    "id": "C09",
    "track": "Claude Code",
    "title": "Tests and acceptance criteria",
    "brief": "write behavior-based requirements; run relevant existing tests; understand a failing test without assuming model success claims."
  },
  {
    "id": "C10",
    "track": "Claude Code",
    "title": "Debugging",
    "brief": "reproduce, inspect evidence, isolate cause, fix minimally, verify; do not repeatedly replace whole files."
  },
  {
    "id": "C11",
    "track": "Claude Code",
    "title": "Context/session management",
    "brief": "concise handoffs, resume where available, model/version differences and explicit unresolved items."
  },
  {
    "id": "C12",
    "track": "Claude Code",
    "title": "Models and cost",
    "brief": "choose a supported model for the actual task, read current model controls, monitor usage; subscription and API expenditure are separate."
  },
  {
    "id": "C13",
    "track": "Claude Code",
    "title": "MCP/connectors",
    "brief": "what external access enables, authentication, untrusted retrieved content, read versus write and verification."
  },
  {
    "id": "C14",
    "track": "Claude Code",
    "title": "Optional advanced features",
    "brief": "skills, hooks, subagents and plugins only after basic competence. No prerequisite explosion and no unnecessary parallel agents."
  },
  {
    "id": "C15",
    "track": "Claude Code",
    "title": "Release and rollback",
    "brief": "commit, build, deployment, production verification, archived evidence and actual recoverable source snapshot. A preview is not production."
  },
  {
    "id": "C16",
    "track": "Claude Code",
    "title": "Capstone and delayed check",
    "brief": "make one small improvement to a sandbox site, inspect every changed file, run meaningful checks, publish only to the authorized sandbox and explain rollback. Later reproduce a similar change independently."
  }
];
export const academyResources: Record<AcademyTrack,{title:string;url:string;verified:string}> = {
  Notion:{title:"Notion — start here (official)",url:"https://www.notion.com/help/start-here",verified:"2026-10-12"},
  RemNote:{title:"RemNote in 5 minutes (official)",url:"https://help.remnote.com/en/articles/6044066-remnote-in-5-minutes",verified:"2026-10-12"},
  "Claude Code":{title:"Claude Code documentation (official)",url:"https://code.claude.com/docs/en/overview",verified:"2026-10-12"}
};
