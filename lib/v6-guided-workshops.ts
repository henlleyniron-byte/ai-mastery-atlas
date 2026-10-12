// Compact, author-written guided workshops for Atlas Academy v6 preview.
// Independent completion remains self-reported; current provider documentation can change.
// N01, R01 and C01 contain the longer introductory lessons within the page itself.
export type GuidedWorkshop = { mental:string; guided:string[]; independent:string; rubric:string[]; repair:string; };
export const guidedWorkshops: Record<string, GuidedWorkshop> = {
  "N02": {
    "mental": "A block is a movable unit of content; a page holds blocks. Links connect pages without making extra copies of information.",
    "guided": [
      "Create a sandbox page clearly titled PRACTICE, not a production Paper Engine page.",
      "Add a heading, a short paragraph, a bulleted list and a toggle; reorder one block.",
      "Link to an authorised source without pasting private records into a public page."
    ],
    "independent": "Build a clean source-linked two-section sandbox note from memory, then reopen and edit a block.",
    "rubric": [
      "Blocks can be distinguished from pages.",
      "Changes remain in sandbox and source link resolves.",
      "Can independently reorder and recover a block."
    ],
    "repair": "If content seems lost, inspect page history or the sidebar instead of cloning the original database."
  },
  "N03": {
    "mental": "A database entry is a page with structured properties; filtered views are different lenses on the same underlying database.",
    "guided": [
      "Open the existing Paper & Marks Engine and inspect its property headers without editing entries.",
      "Open one authorised record, note where its title and properties live.",
      "Switch between two existing views and check whether the underlying entry is unchanged."
    ],
    "independent": "Explain an entry, a property and a view using the original database without duplicating it.",
    "rubric": [
      "Correctly identifies one row as an entry page.",
      "States why two views do not imply two data sources.",
      "No production schema modified."
    ],
    "repair": "If a record disappears from a view, first clear filters and search the main database."
  },
  "N04": {
    "mental": "Property types constrain meaning: a date represents time, a number represents a measurable quantity, and select labels categorise.",
    "guided": [
      "In a practice database make fields for question source, raw marks, maximum marks, attempt date and uncertainty.",
      "Enter one SYNTHETIC example, clearly labeled, and leave the canonical database untouched.",
      "Explain why raw mark should be numeric, source URL a link and confidence a distinct label."
    ],
    "independent": "Design a six-property sample entry and justify types, missing values and planned-versus-actual dates.",
    "rubric": [
      "Each property has a justified type.",
      "Null means not recorded, not zero.",
      "Synthetic example is never treated as achieved marks."
    ],
    "repair": "Do not coerce unknown scores to 0 or planned sessions into actual attempt timestamps."
  },
  "N05": {
    "mental": "Views filter, sort and group existing records; they are navigation, not automatic analysis or independent databases.",
    "guided": [
      "Find the built-in filters of an existing view.",
      "Inspect how unmarked attempts are selected and why a record is excluded.",
      "In a sandbox, create a view for delayed checks due before today without modifying canonical entries."
    ],
    "independent": "Retrieve one synthetic overdue retest and one unmarked attempt using filters, without manual scrolling.",
    "rubric": [
      "Uses date/status filters correctly.",
      "Can explain why empty results may reflect active filters.",
      "Does not duplicate entries to improve visibility."
    ],
    "repair": "Before declaring data missing, inspect filter logic, dates and hidden properties."
  },
  "N06": {
    "mental": "Templates are repeatable field defaults; applying a template never proves that the associated activity occurred.",
    "guided": [
      "Inspect the existing attempt-entry template and identify required fields.",
      "On a sandbox record test its default headings and labels.",
      "List fields that must be filled only AFTER independently attempting and marking a question."
    ],
    "independent": "Explain a safe paper-entry template to a peer and demonstrate one blank, explicitly not completed record.",
    "rubric": [
      "Source/score/time conditions remain blank until evidenced.",
      "A template is reused, not rebuilt.",
      "A blank entry is not in completed counts."
    ],
    "repair": "Avoid pre-populating past scores or completion statuses in templates."
  },
  "N07": {
    "mental": "The Paper Engine is evidence infrastructure: record what happened and where the marking came from, not what the plan promised.",
    "guided": [
      "Locate one genuine earlier marked attempt (if you have one); otherwise use a synthetic sandbox.",
      "Trace paper/question ID, actual attempt time, raw numerator/denominator and marking source.",
      "Add or describe uncertainty and exactly one next test action; leave historical facts unaltered."
    ],
    "independent": "Log a new REAL independently attempted and marked question through the existing system.",
    "rubric": [
      "Date and conditions are actual, not planned.",
      "Raw scores have denominators and source references.",
      "Unverified labels remain pending verification."
    ],
    "repair": "If a marking key is missing, pause result claims rather than inventing a denominator."
  },
  "N08": {
    "mental": "An academic error is a verifiable mismatch between an independently attempted answer and an attributable marking source.",
    "guided": [
      "Search the existing Error Bank before adding a record.",
      "On a verified sample, name the precise misconception and link the source and parent attempt.",
      "Write a narrow repair action and next unaided reattempt; do not close it after rereading."
    ],
    "independent": "Find and document one genuinely verified error without duplicating a prior entry.",
    "rubric": [
      "Claim is supported by paper/scheme or teacher.",
      "Duplicate check performed.",
      "Status remains open until independent evidence passes."
    ],
    "repair": "If teacher and published scheme differ, tag verification hold rather than choosing by confidence."
  },
  "N09": {
    "mental": "A behavioral Mistake Vault item concerns decisions/workflow, not an incorrect scientific answer.",
    "guided": [
      "Read a prior behavioral mistake entry if accessible; otherwise create a synthetic example.",
      "Name what happened, why, risk, corrected approach and one prevention trigger.",
      "Compare it with a subject error and explain the correct destination for each."
    ],
    "independent": "Route one meaningful newly evidenced mistake to the existing vault without logging it twice.",
    "rubric": [
      "Identifies type correctly.",
      "Captures cause, consequence and trigger.",
      "Checks for duplicates and preserves private context."
    ],
    "repair": "Do not create a fresh page for a repeated mistake merely because wording differs."
  },
  "N10": {
    "mental": "A relation links records; a rollup aggregates linked values. Neither automatically establishes causation.",
    "guided": [
      "In a sandbox relate one attempt record to two synthetic errors.",
      "Show how a rollup counts linked errors without rewriting their sources.",
      "Remove and restore a test relation and observe how aggregation changes."
    ],
    "independent": "Trace one relation end-to-end and explain a rollup's denominator and empty-case meaning.",
    "rubric": [
      "Understands direction and linked-record IDs.",
      "Does not mistake a rollup for original evidence.",
      "No canonical schema alteration."
    ],
    "repair": "If counts differ, inspect relationship filters and missing links before correcting scores."
  },
  "N11": {
    "mental": "A formula transforms fields according to declared assumptions; it cannot fill missing evidence or validate an unreliable marking key.",
    "guided": [
      "Read one simple existing formula, identifying inputs and result.",
      "In a sandbox calculate percentage only when maximum marks is a positive known number.",
      "Test missing raw score, zero denominator and ordinary score cases."
    ],
    "independent": "Explain the formula's branches without looking and test a missing-data case.",
    "rubric": [
      "Handles missing and zero input safely.",
      "Never treats missing score as zero earned.",
      "Can interpret result in plain English."
    ],
    "repair": "Avoid cosmetic formula complexity that adds fragile academic conclusions."
  },
  "N12": {
    "mental": "Calendar stores intention, Drive stores a source, and Notion stores what actually happened; links do not imply automatic synchronization.",
    "guided": [
      "Locate one authorised Drive question source and check who may open it.",
      "Find a corresponding intended study block in Calendar (or a synthetic example).",
      "Trace the actual Notion attempt only after it has been completed and marked."
    ],
    "independent": "Describe and demonstrate this three-tool handoff with one source and one real evidence entry.",
    "rubric": [
      "Can separate a plan from actual outcome.",
      "Links are permission-appropriate.",
      "No private content copied into public pages."
    ],
    "repair": "A scheduled event must never auto-create a completed attempt."
  },
  "N13": {
    "mental": "Sharing is a permission boundary; a linked page may inherit visibility depending on its parent or database.",
    "guided": [
      "Inspect a harmless sandbox page's share menu and its current audience.",
      "Identify the risk of making a parent page public while child content is sensitive.",
      "Keep current permissions unchanged; explain guest versus anyone-with-link access."
    ],
    "independent": "Audit one sandbox page and explain why it is safe or unsafe to share without clicking Publish.",
    "rubric": [
      "Understands link access and inheritance.",
      "Avoids exposing marks/medical chats.",
      "No real privacy setting changed."
    ],
    "repair": "When in doubt, preserve private status and verify with an independent browser session."
  },
  "N14": {
    "mental": "An export is a point-in-time portable file; an account sync or a link alone is not a restorable backup.",
    "guided": [
      "Export a small synthetic sandbox page or inspect Notion's current official export path.",
      "Check that file actually exists, opens and contains the intended text.",
      "Describe what may be omitted on restore and how version history differs."
    ],
    "independent": "Recover a sandbox entry from a known local copy and explain limits.",
    "rubric": [
      "Can locate exact file and content.",
      "Separates snapshots from links.",
      "Keeps private exports out of public repositories."
    ],
    "repair": "Do not say backed up based solely on a folder or export button click."
  },
  "N15": {
    "mental": "AI assistance makes drafts, not verified ground truth; a summary is trustworthy only after source-by-source reconciliation.",
    "guided": [
      "Ask Notion AI (if available) for a sandbox summary of a harmless note; otherwise use a written simulated output.",
      "Plant one clearly labeled synthetic incorrect claim and trace why it is wrong.",
      "Correct the summary against original evidence before reusing it."
    ],
    "independent": "Review and correct an AI-generated paragraph with at least two source-checked facts.",
    "rubric": [
      "Checks cited originals.",
      "Catches a deliberately inconsistent claim.",
      "Does not change canonical paper records on AI authority alone."
    ],
    "repair": "Treat confident unsourced statements as questions to verify, not data."
  },
  "N16": {
    "mental": "The Notion capstone links question evidence, errors and retests into a recoverable chain rather than a beautiful but empty dashboard.",
    "guided": [
      "Find an existing legitimate source, actual attempt and strict marking result.",
      "Connect one verified academic error to its attempt without duplicating records.",
      "Plan closed-book reattempt, unseen transfer and delayed check in the existing schema."
    ],
    "independent": "Complete one real end-to-end paper/error record and independently retrieve it the next day.",
    "rubric": [
      "Every stage has traceable evidence.",
      "Data belongs in canonical systems.",
      "Failed or pending retest not marked retained."
    ],
    "repair": "If the chain breaks, repair the missing relation or source; never fabricate a passed stage."
  },
  "R02": {
    "mental": "RemNote documents are places to write and retrieve ideas; folder structure is useful only when it improves finding things.",
    "guided": [
      "Open your workspace and distinguish sidebar navigation from document content.",
      "Create a clearly labelled temporary Biology sandbox document.",
      "Move between documents, search for the sandbox and reopen it."
    ],
    "independent": "Independently create and retrieve one practice document, then explain where it belongs.",
    "rubric": [
      "Can find it without following this page.",
      "Has not duplicated an existing production deck.",
      "Can navigate back to the workspace."
    ],
    "repair": "Avoid building a deep folder tree before you have content worth organising."
  },
  "R03": {
    "mental": "A Rem is a knowledge unit; indentation expresses hierarchy, not a guarantee that each bullet makes a good card.",
    "guided": [
      "In a sandbox document add a parent Biological Molecules rem.",
      "Indent two child details, then outdent one and observe structure.",
      "Explain the idea in your own words without treating every bullet as examinable."
    ],
    "independent": "Build an intelligible two-level hierarchy for a simple verified concept.",
    "rubric": [
      "Parent-child relationship is meaningful.",
      "No card created from ambiguous fragments.",
      "Can reorganise without losing an idea."
    ],
    "repair": "If a child answer depends on a hidden parent clue, rewrite it into a stand-alone prompt."
  },
  "R04": {
    "mental": "An atomic flashcard asks one clear question with a single defensible answer anchored to an approved source.",
    "guided": [
      "Read current official RemNote card-format instructions before using keyboard syntax.",
      "Draft one Biology question based on a marked error and source.",
      "Reveal the answer only after attempting recall; edit any ambiguous wording."
    ],
    "independent": "Make and independently answer two clean source-verified cards; describe why each is atomic.",
    "rubric": [
      "Question has one scope.",
      "Answer is factually verified.",
      "Syntax is validated in current RemNote rather than guessed."
    ],
    "repair": "If two facts are crammed into one card, split them or use an exam question instead."
  },
  "R05": {
    "mental": "A concept-descriptor card identifies a term by its property; reverse cards are useful only if recalling in both directions matters.",
    "guided": [
      "Examine an existing small sample of concept/descriptor cards, or a labelled demonstration.",
      "Test forward and reverse questions in a sandbox.",
      "Decide which direction you would need in actual exam writing."
    ],
    "independent": "Explain when reverse recall adds value and discard one misleading reverse card.",
    "rubric": [
      "Recall direction matches exam demand.",
      "Term is not guessable from grammar.",
      "No duplicate reverse cards for no benefit."
    ],
    "repair": "Do not enable two-way cards universally; reverse prompts can become ambiguous."
  },
  "R06": {
    "mental": "A cloze hides one meaningful element in a sentence while keeping enough context for honest recall.",
    "guided": [
      "Choose an accurately sourced sentence with one key conceptual relation.",
      "Create one cloze using the current UI or verified syntax.",
      "Attempt the card without looking at surrounding notes; repair any obvious word-order clue."
    ],
    "independent": "Make two clozes whose answers cannot be guessed by grammar alone.",
    "rubric": [
      "Each omission tests a meaningful fact.",
      "Source remains traceable.",
      "No decorative mass card creation."
    ],
    "repair": "If the clue is simply the number of blanks or grammar, rewrite the prompt."
  },
  "R07": {
    "mental": "Image occlusion tests spatial recall, such as a labelled diagram, but labels must be unambiguous.",
    "guided": [
      "Select a permitted cell diagram with legible labels and citation.",
      "Mask one structure, avoiding unrelated regions.",
      "Review what question the masked region actually asks and test recall."
    ],
    "independent": "Build one source-cited occlusion and identify its limitations.",
    "rubric": [
      "Only one clear structure targeted.",
      "Diagram rights respected.",
      "Correct label is independently checkable."
    ],
    "repair": "If the figure is poor quality or ambiguous, use a text card or the original exam diagram instead."
  },
  "R08": {
    "mental": "Links and backlinks connect concepts; a dense graph is not automatically a better memory.",
    "guided": [
      "Write two related verified ideas in a sandbox.",
      "Use the current supported linking interface to connect them.",
      "Navigate forward and backward, then decide whether the link helps retrieval."
    ],
    "independent": "Explain one useful crosslink and one link you chose not to create.",
    "rubric": [
      "Both notes remain findable.",
      "Link adds genuine navigation value.",
      "No duplicate concept records."
    ],
    "repair": "If graph building replaces recall practice, stop and return to a due card or exam question."
  },
  "R09": {
    "mental": "PDF annotations are references to source evidence, not a licence to import and republish copyrighted questions.",
    "guided": [
      "Open a PDF you are authorised to use and check its page numbering.",
      "Make one short annotation of a fact already verified against the original.",
      "Preserve the source citation and page location; avoid bulk uploading private teacher packs."
    ],
    "independent": "Find the source PDF and annotation again and reproduce the fact unaided.",
    "rubric": [
      "Source and page are attributable.",
      "Annotation does not reveal restricted material publicly.",
      "Knowledge is checked independently."
    ],
    "repair": "If the viewer offsets page numbers, record the original print page and section."
  },
  "R10": {
    "mental": "The due queue is a retrieval exercise: rate your answer based on what you recalled before flipping.",
    "guided": [
      "Attempt three due cards without seeing their answers.",
      "Mark uncertain, guessed and incorrect responses honestly.",
      "Compare due load and outcomes without treating speed as correctness."
    ],
    "independent": "Perform one due review and explain your rating on a missed card.",
    "rubric": [
      "No answer glimpsed before retrieval.",
      "Self-rating matches actual recall.",
      "Weak item receives repair."
    ],
    "repair": "Never mark a card easy merely to clear the queue."
  },
  "R11": {
    "mental": "Scheduling supports memory only when the daily load is manageable alongside real paper practice and recovery.",
    "guided": [
      "Review your due count and estimate how long honest responses take.",
      "Identify an active high-value deck and one low-value backlog.",
      "Plan a sustainable review block, not a punitive catch-up target."
    ],
    "independent": "Choose a feasible due-review policy and demonstrate it on two separate days.",
    "rubric": [
      "No infinite card-generation queue.",
      "Sleep and paper attempts protected.",
      "Missed days trigger prioritisation, not a restart."
    ],
    "repair": "If backlog explodes, freeze new cards and review only essential verified items."
  },
  "R12": {
    "mental": "Two semantically identical cards waste retrieval time; editing and merging must protect scheduling history.",
    "guided": [
      "Search for the same idea in both RemNote and existing Anki if relevant.",
      "Compare prompts and source references to see whether they test the same retrieval.",
      "Choose a single primary record and safely archive or edit the redundant one."
    ],
    "independent": "Repair one deliberately ambiguous duplicate set in a sandbox.",
    "rubric": [
      "No evidence/scheduling history silently erased.",
      "Primary system stated.",
      "Prompt after repair remains independently answerable."
    ],
    "repair": "Never mass-delete duplicates without an export and provenance check."
  },
  "R13": {
    "mental": "AI can draft flashcards quickly but cannot certify that a scientific answer or mark-scheme wording is correct.",
    "guided": [
      "Choose one short allowed source and ask AI for three draft question-answer pairs, if available.",
      "Check each against the original, including units, conditions and wording.",
      "Discard at least one poor or unsupported suggestion before activating the set."
    ],
    "independent": "Produce two verified improved cards and name what AI originally got wrong.",
    "rubric": [
      "Every active answer has a source.",
      "Prompts are atomic and unambiguous.",
      "No model-generated authority claims."
    ],
    "repair": "Reject a plausible but unsourced answer rather than storing it with a high-confidence label."
  },
  "R14": {
    "mental": "A sync state means data appears across authorised devices; a backup export means recoverable bytes independent of that sync.",
    "guided": [
      "Inspect official current RemNote export instructions.",
      "Export a small permitted sandbox deck and confirm the file exists.",
      "Check the exported sample's question and answer without overwriting live records."
    ],
    "independent": "Explain how you would restore from a sample and what card-scheduling information might not transfer.",
    "rubric": [
      "Real file opens.",
      "Restore limits are acknowledged.",
      "Existing live data not overwritten."
    ],
    "repair": "An export button press is not evidence that a valid backup was saved."
  },
  "R15": {
    "mental": "Card practice repairs unstable facts; multi-step A/L reasoning still needs full exam-style practice.",
    "guided": [
      "Take one actual verified error from Notion's academic Error Bank.",
      "Ask whether the issue is an atomic fact or a multi-step concept.",
      "For an atomic fact draft one suitable card; for reasoning, assign an unseen paper question instead."
    ],
    "independent": "Justify why a real error is suited to cards or an independent reattempt.",
    "rubric": [
      "Error genuinely verified.",
      "No card used as substitute for exam transfer.",
      "Primary deck ownership clear."
    ],
    "repair": "Avoid converting every incorrect question into ten overlapping cards."
  },
  "R16": {
    "mental": "RemNote mastery includes independently recalling, correcting weak prompts and transferring knowledge to a new exam item.",
    "guided": [
      "Select a few verified facts from diagnosed weaknesses, not random chapters.",
      "Create five to ten clear source-linked cards; test due recall honestly.",
      "Answer an unseen related Biology, Chemistry or Physics question closed-book."
    ],
    "independent": "On a later day, repeat one recall and transfer check without prompts.",
    "rubric": [
      "Correct source-verified answers.",
      "Due ratings reflect actual recall.",
      "Unseen transfer is separately evidenced."
    ],
    "repair": "If review goes well but transfer fails, reopen the error and prioritise exam reasoning."
  },
  "C02": {
    "mental": "The terminal is a command interpreter; paths name exact files. Commands can read, edit or delete depending on their effect.",
    "guided": [
      "Create a disposable folder for a toy project without private documents.",
      "Use your OS file explorer to locate it and note its full path.",
      "Identify a read-only file listing command in verified documentation before trying it."
    ],
    "independent": "Find a sample file in the correct directory and explain working directory versus file path.",
    "rubric": [
      "No production paths touched.",
      "Can state what a command will do before executing.",
      "No secrets displayed."
    ],
    "repair": "If working directory is uncertain, confirm the path instead of guessing a destructive command."
  },
  "C03": {
    "mental": "Installation establishes software on your machine; authentication grants identity, and billing/plan access are separate.",
    "guided": [
      "Choose either Windows PowerShell or WSL; do not mix installation recipes.",
      "Open the official Claude Code setup guide and review current prerequisites and supported Windows route.",
      "Use a disposable example to identify whether login and API billing are required; do not paste credentials into the lesson."
    ],
    "independent": "Explain the exact environment, required permissions, and non-secret verification command from the current docs.",
    "rubric": [
      "PowerShell/WSL instructions remain distinct.",
      "Authentication secrets private.",
      "Can distinguish code installation from model entitlement."
    ],
    "repair": "If installation fails, collect the error text after removing secrets, confirm the shell, and repair only that step."
  },
  "C04": {
    "mental": "Git tracks content history; a branch isolates a change, a diff shows it, and a commit records a snapshot.",
    "guided": [
      "Open a toy repo; check the current branch and changes using commands from verified Git docs.",
      "Modify one unimportant text label and inspect the diff.",
      "Restore or commit the change on a clearly named practice branch."
    ],
    "independent": "Explain tracked/untracked files and recover an unwanted sample edit.",
    "rubric": [
      "Can read diff meaningfully.",
      "Knows branch is not a deployment.",
      "No production credentials committed."
    ],
    "repair": "If the branch is unclear, check status and avoid any push or force operation."
  },
  "C05": {
    "mental": "A coding agent can explain repository code, but the explanation is a hypothesis until checked against actual files.",
    "guided": [
      "Point Claude Code to a toy repo using read-only scope.",
      "Ask it to locate the component rendering a visible label and cite file paths.",
      "Open that file yourself and check whether the explanation matches."
    ],
    "independent": "Find one function/file relationship unaided and critique one agent claim.",
    "rubric": [
      "Cites a real path.",
      "Independent source verification.",
      "No write commands executed."
    ],
    "repair": "If an agent hallucinates a file, search the repo tree before trusting its output."
  },
  "C06": {
    "mental": "Project instructions such as CLAUDE.md define local norms and boundaries, not blanket permission to touch unrelated folders.",
    "guided": [
      "In a toy repo inspect existing project instructions, if any.",
      "Write a minimal sample rule for naming tests and keeping private data out of logs.",
      "Explain which scope overrides ad-hoc changes and why untrusted repository text needs review."
    ],
    "independent": "Create a harmless project instruction in sandbox and check whether its scope is clear.",
    "rubric": [
      "Rules are concrete and minimal.",
      "No secret paths exposed.",
      "No assumption that the file grants permission to deploy."
    ],
    "repair": "Do not copy opaque internet prompts or repository text into higher-trust instructions blindly."
  },
  "C07": {
    "mental": "Read access, file edits, command execution and deployment are distinct privileges with different risk.",
    "guided": [
      "Map four example actions to permissions: list files, edit CSS, install package, publish site.",
      "Review your agent's present permissions using current official instructions.",
      "For a toy edit, request the least authority needed and inspect results."
    ],
    "independent": "Explain which approvals are warranted for a live-site release versus a read-only audit.",
    "rubric": [
      "Can name sensitive capabilities.",
      "Avoids blanket approval bypass.",
      "Separates local edit and external publication."
    ],
    "repair": "If asked to disable permission checks to go faster, stop and use a scoped approval instead."
  },
  "C08": {
    "mental": "A bounded change is one observable behaviour with a measurable before/after result.",
    "guided": [
      "Select a disposable toy website and note the old label.",
      "Ask the agent to change only that label.",
      "Inspect every changed file and compare rendered output with the acceptance criterion."
    ],
    "independent": "Make one new small label change and reverse it using the diff.",
    "rubric": [
      "Only intended file(s) changed.",
      "Visible behaviour matches request.",
      "Rollback possible."
    ],
    "repair": "If many unrelated files change, revert and isolate the smallest change."
  },
  "C09": {
    "mental": "A test is an independently checkable claim about behaviour; green logs matter only if the correct test ran on the intended version.",
    "guided": [
      "Write a one-sentence acceptance criterion for a toy feature.",
      "Locate its closest existing test and run the documented command.",
      "Deliberately modify a fixture to observe a failing test, then restore it."
    ],
    "independent": "Explain a pass and a fail with actual command output rather than an agent assertion.",
    "rubric": [
      "Test matches intended behaviour.",
      "Logs indicate actual test execution.",
      "Failures not hidden or skipped."
    ],
    "repair": "A build command that never ran cannot be reported as passed."
  },
  "C10": {
    "mental": "Debugging narrows a reproducible failure to a cause; replacing whole files may obscure the source.",
    "guided": [
      "Reproduce a harmless toy bug with exact input.",
      "Record expected versus observed result and inspect the implicated function.",
      "Make one small fix and re-run the same reproduction and a regression check."
    ],
    "independent": "Explain the bug, the minimal code change and which test proves repair.",
    "rubric": [
      "Failure reproduced before fix.",
      "Smallest viable patch.",
      "Regression evidence recorded."
    ],
    "repair": "If the fix changes more than the bug scope, inspect diff and roll back unrelated changes."
  },
  "C11": {
    "mental": "An agent has limited context; preserving facts, commit identifiers and remaining blockers prevents repeated work.",
    "guided": [
      "Identify what an agent session actually observed versus inferred.",
      "Write a short handoff: goal, branch, files, completed checks, failures, next exact step.",
      "Reopen in a fresh toy session and see whether it can continue without redoing everything."
    ],
    "independent": "Create a one-page source-grounded handoff and correct one ambiguous status.",
    "rubric": [
      "Includes exact state and provenance.",
      "No invented testing/publishing claims.",
      "Secret-free notes."
    ],
    "repair": "Avoid treating an AI summary as a verified build log or commit."
  },
  "C12": {
    "mental": "Tool connections and external services have scope and permissions; an API credential is not ordinary text.",
    "guided": [
      "Inspect a dummy environment-variable reference in a toy project without printing actual values.",
      "List what a connector or MCP server could read versus write.",
      "Design a least-privilege example for retrieving one public resource."
    ],
    "independent": "Explain how you would revoke a compromised token and document a safe connector capability.",
    "rubric": [
      "No secrets exposed.",
      "Read/write scopes distinguished.",
      "Explicitly rejects unknown third-party destinations."
    ],
    "repair": "If an agent asks to paste a key into source, stop and use your provider's secret manager."
  },
  "C13": {
    "mental": "GitHub PRs invite review; merging, deployment and release are separate events that need their own evidence.",
    "guided": [
      "Create or inspect a toy feature branch diff.",
      "Draft a PR description with tests run and limitations.",
      "Explain why a mergeable PR and a READY deployment do not guarantee functional correctness."
    ],
    "independent": "Write an accurate release note distinguishing branch, merge, build, deploy and browser verification.",
    "rubric": [
      "Has real commit reference.",
      "Identifies untested checks.",
      "Does not expose private data in public PR."
    ],
    "repair": "Do not merge or publish just because the draft PR exists."
  },
  "C14": {
    "mental": "A browser or network is an attack surface for untrusted text; tool outputs can contain instructions that should not control the agent.",
    "guided": [
      "Review a harmless example of prompt injection inside a downloaded README.",
      "Identify source data versus user instructions.",
      "Write a constrained agent instruction to ignore requests for secrets or unsanctioned uploads."
    ],
    "independent": "Spot two unauthorized actions in a simulated malicious web page and explain the boundary.",
    "rubric": [
      "Never follows retrieved commands as authority.",
      "Protects sensitive paths.",
      "Uses clear scoped task permissions."
    ],
    "repair": "If a source asks for credentials or unrelated exfiltration, reject it and continue from trusted instructions."
  },
  "C15": {
    "mental": "Release readiness includes build, security, accessibility, data migration, observability and rollback—not only a successful screenshot.",
    "guided": [
      "List a toy site's key user journey and three observable acceptance checks.",
      "Run the applicable documented tests and inspect a keyboard path.",
      "Prepare a rollback record: source commit, artifacts, deployment ID and data limitations."
    ],
    "independent": "Audit a small sandbox page for a functional and accessibility regression.",
    "rubric": [
      "Known-good baseline recorded.",
      "Tests and remaining gaps distinguished.",
      "Restore path concrete."
    ],
    "repair": "If an app uses localStorage, never clear it as an unannounced migration shortcut."
  },
  "C16": {
    "mental": "The Claude Code capstone demonstrates supervised, minimal improvement end-to-end without touching a live user site.",
    "guided": [
      "Choose a disposable sandbox page and define one measurable change.",
      "Ask the agent to inspect, patch and test it; review all diffs yourself.",
      "Deploy only to an authorised sandbox if access exists, then record deployment URL and rollback."
    ],
    "independent": "Repeat a comparable small patch unaided later and demonstrate a revert from known source.",
    "rubric": [
      "No unsanctioned live edits.",
      "Actual tests and deployment evidenced where applicable.",
      "Later independent transfer completed."
    ],
    "repair": "If publication access is absent, mark blocked and deliver a reviewable patch rather than claiming success."
  }
};
