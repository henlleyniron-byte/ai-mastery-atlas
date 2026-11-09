export type BeginnerTool = "notion" | "remnote" | "claude";
export type BeginnerLesson = {id:string;tool:BeginnerTool;number:number;title:string;objective:string;explanation:string;example:string;guided:string[];independent:string;transfer:string;pitfall:string;minutes:number;level:string;prerequisite:string|null;rubric:string[];resources:{label:string;url:string;kind:string}[];checked:string};
export const beginnerLessons: BeginnerLesson[] = [
  {
    "id": "notion-01",
    "tool": "notion",
    "number": 1,
    "title": "Find your way",
    "objective": "Locate pages and distinguish source, plan and result.",
    "explanation": "A workspace is the container for pages. The sidebar is navigation, not evidence that a task was completed.",
    "example": "A Physics PDF belongs in Drive; a planned session in Calendar; actual marks in the existing Notion Paper Engine.",
    "guided": [
      "Open the sidebar and find your existing study home.",
      "Use search to find Paper & Marks Engine and open an entry.",
      "Write where the source, scheduled time and actual score belong."
    ],
    "independent": "Find one existing paper and its source without creating another database.",
    "transfer": "Repeat the lookup for Biology.",
    "pitfall": "Cloning a dashboard because you cannot find an entry creates conflicting records. Search first and bookmark the canonical home.",
    "minutes": 20,
    "level": "Orientation",
    "prerequisite": null,
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Notion basics — official written tutorials",
        "url": "https://www.notion.com/help/category/new-to-notion",
        "kind": "Written guide"
      },
      {
        "label": "Notion Academy — structured lessons and videos",
        "url": "https://academy.notion.com/",
        "kind": "Official course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "notion-02",
    "tool": "notion",
    "number": 2,
    "title": "Pages and blocks",
    "objective": "Write a readable, source-linked page.",
    "explanation": "A page holds blocks. Blocks can be text, headings, lists or links; changing their appearance does not change their truth.",
    "example": "A sandbox page can contain a heading 'Physics repair', three steps and a link to the original scheme.",
    "guided": [
      "Create a page explicitly named Sandbox.",
      "Add a heading, three bullet steps and one source URL.",
      "Reorder a block and undo the change."
    ],
    "independent": "Create a short sandbox explanation with a retrievable source.",
    "transfer": "Build a different page with the same structure without copying.",
    "pitfall": "Polishing formatting before understanding the content wastes practice time. Stop when the note is clear enough to use.",
    "minutes": 20,
    "level": "Orientation",
    "prerequisite": "notion-01",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Notion basics — official written tutorials",
        "url": "https://www.notion.com/help/category/new-to-notion",
        "kind": "Written guide"
      },
      {
        "label": "Notion Academy — structured lessons and videos",
        "url": "https://academy.notion.com/",
        "kind": "Official course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "notion-03",
    "tool": "notion",
    "number": 3,
    "title": "Understand databases",
    "objective": "Tell a database, a view and an entry apart.",
    "explanation": "A database is a set of records; an entry is also a page. Several views can show the same records differently.",
    "example": "A table and a calendar view of the Paper Engine are two presentations of one database.",
    "guided": [
      "Open a database row as a page.",
      "Inspect its properties and return to the table.",
      "Switch views and confirm the same row remains present."
    ],
    "independent": "Explain the difference using an existing database.",
    "transfer": "Identify the same structure in the Error Bank.",
    "pitfall": "A new view does not create a new source of truth. Do not rebuild four lists to represent four statuses.",
    "minutes": 20,
    "level": "Orientation",
    "prerequisite": "notion-02",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Notion basics — official written tutorials",
        "url": "https://www.notion.com/help/category/new-to-notion",
        "kind": "Written guide"
      },
      {
        "label": "Notion Academy — structured lessons and videos",
        "url": "https://academy.notion.com/",
        "kind": "Official course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "notion-04",
    "tool": "notion",
    "number": 4,
    "title": "Choose properties",
    "objective": "Use sensible field types without altering canonical schemas.",
    "explanation": "Properties describe records. Number fields hold quantities, dates hold times, selects hold categories and URLs point to sources.",
    "example": "A synthetic attempt can have subject=Physics, marks=6, total=10 and a source URL; the values must remain labeled synthetic.",
    "guided": [
      "Use a sandbox database rather than editing the main schema.",
      "Create text, number, date, select and URL fields.",
      "Enter a synthetic example and label it clearly."
    ],
    "independent": "Choose fields for a sample paper and explain each choice.",
    "transfer": "Choose fields for a nonacademic project.",
    "pitfall": "A checkbox is not suitable for a numeric mark. Repair the sandbox field type instead of guessing with text.",
    "minutes": 20,
    "level": "Orientation",
    "prerequisite": "notion-03",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Notion basics — official written tutorials",
        "url": "https://www.notion.com/help/category/new-to-notion",
        "kind": "Written guide"
      },
      {
        "label": "Notion Academy — structured lessons and videos",
        "url": "https://academy.notion.com/",
        "kind": "Official course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "notion-05",
    "tool": "notion",
    "number": 5,
    "title": "Find useful views",
    "objective": "Retrieve a narrow set of relevant records.",
    "explanation": "Filters select records, sorts order them and grouping displays categories. None of these changes whether an attempt happened.",
    "example": "An overdue retest view helps choose a next check; it does not prove failure.",
    "guided": [
      "Inspect an existing filter before changing it.",
      "Make a sandbox view showing unfinished items.",
      "Sort by due date and explain an empty view."
    ],
    "independent": "Retrieve the next actual open academic task using existing views.",
    "transfer": "Find a different subject's unresolved item.",
    "pitfall": "An empty filtered view may hide records. Check the filter before assuming records were deleted.",
    "minutes": 30,
    "level": "Guided operator",
    "prerequisite": "notion-04",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Notion basics — official written tutorials",
        "url": "https://www.notion.com/help/category/new-to-notion",
        "kind": "Written guide"
      },
      {
        "label": "Notion Academy — structured lessons and videos",
        "url": "https://academy.notion.com/",
        "kind": "Official course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "notion-06",
    "tool": "notion",
    "number": 6,
    "title": "Use templates",
    "objective": "Reuse structure without fabricating completion.",
    "explanation": "A template supplies fields and instructions, not results. You must replace examples with actual evidence.",
    "example": "A paper template may prefill 'Needs marking'; it must not prefill a passing score.",
    "guided": [
      "Open an existing template in a sandbox or preview.",
      "Identify example values and required evidence fields.",
      "Create a sample record and keep it separate from real attempts."
    ],
    "independent": "Use the existing template for one genuine attempt after doing the work.",
    "transfer": "Apply a different existing template to a valid record.",
    "pitfall": "Leaving demonstration marks in a real record misrepresents performance. Clear examples before saving.",
    "minutes": 30,
    "level": "Guided operator",
    "prerequisite": "notion-05",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Notion basics — official written tutorials",
        "url": "https://www.notion.com/help/category/new-to-notion",
        "kind": "Written guide"
      },
      {
        "label": "Notion Academy — structured lessons and videos",
        "url": "https://academy.notion.com/",
        "kind": "Official course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "notion-07",
    "tool": "notion",
    "number": 7,
    "title": "Record marked attempts",
    "objective": "Log what happened accurately.",
    "explanation": "Calendar time is intended; the Paper Engine records actual independent performance. Marks need a source and a denominator.",
    "example": "6/10 from a ten-question set is a measured result; a one-hour Calendar event is not.",
    "guided": [
      "Locate the original questions and marking scheme.",
      "After an independent attempt, record actual date, duration and raw score.",
      "Note guesses, help used and uncertain marking separately."
    ],
    "independent": "Record one actual marked attempt with its source.",
    "transfer": "Log a different question format with an appropriate denominator.",
    "pitfall": "Do not mark a scheduled paper complete automatically. Return to the paper and establish what was actually attempted.",
    "minutes": 30,
    "level": "Guided operator",
    "prerequisite": "notion-06",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Notion basics — official written tutorials",
        "url": "https://www.notion.com/help/category/new-to-notion",
        "kind": "Written guide"
      },
      {
        "label": "Notion Academy — structured lessons and videos",
        "url": "https://academy.notion.com/",
        "kind": "Official course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "notion-08",
    "tool": "notion",
    "number": 8,
    "title": "Use the academic Error Bank",
    "objective": "Trace a verified error to its original attempt.",
    "explanation": "The Error Bank holds academic mistakes with a diagnosis and next check. An unverified answer key is a verification hold, not a settled correction.",
    "example": "An incorrect electric-field direction can be linked to its original question and a narrow diagram repair.",
    "guided": [
      "Search for a matching existing error.",
      "Link the question and the marked attempt.",
      "Record diagnosis, smallest repair and independent reattempt."
    ],
    "independent": "Update one verified error without duplicating it.",
    "transfer": "Locate a similar error in another topic.",
    "pitfall": "Do not memorize a disputed key. Preserve the uncertainty and ask the teacher or consult the authoritative scheme.",
    "minutes": 30,
    "level": "Guided operator",
    "prerequisite": "notion-07",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Notion basics — official written tutorials",
        "url": "https://www.notion.com/help/category/new-to-notion",
        "kind": "Written guide"
      },
      {
        "label": "Notion Academy — structured lessons and videos",
        "url": "https://academy.notion.com/",
        "kind": "Official course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "notion-09",
    "tool": "notion",
    "number": 9,
    "title": "Use the Mistake Vault",
    "objective": "Route workflow mistakes to the right place.",
    "explanation": "A missed source check or duplicated message is behavioral/workflow evidence. It is different from a wrong Chemistry answer.",
    "example": "A copied unsupported score belongs in a workflow mistake record; the underlying verified subject misconception belongs in the Error Bank.",
    "guided": [
      "Find the existing Mistake Vault.",
      "Search for the same pattern before adding a record.",
      "Write what happened, cause, risk, correction and one prevention trigger."
    ],
    "independent": "Document one meaningful real workflow mistake or use a labeled sandbox example.",
    "transfer": "Classify a new academic versus logistical example.",
    "pitfall": "Separate domains so the Error Bank remains useful for exam repair. Merge repeated patterns instead of creating clutter.",
    "minutes": 30,
    "level": "Independent operator",
    "prerequisite": "notion-08",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Notion basics — official written tutorials",
        "url": "https://www.notion.com/help/category/new-to-notion",
        "kind": "Written guide"
      },
      {
        "label": "Notion Academy — structured lessons and videos",
        "url": "https://academy.notion.com/",
        "kind": "Official course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "notion-10",
    "tool": "notion",
    "number": 10,
    "title": "Relations and rollups",
    "objective": "Follow linked records without adding unnecessary complexity.",
    "explanation": "A relation connects records. A rollup summarizes related values. Aggregation can only be as trustworthy as its input.",
    "example": "An attempt linked to two errors lets you inspect the chain; a count of two errors says nothing about their closure.",
    "guided": [
      "Follow an existing attempt-error link.",
      "In a sandbox, connect two records.",
      "Read an aggregate and identify its source records."
    ],
    "independent": "Explain one existing relation and its usefulness.",
    "transfer": "Model another small relationship in a sandbox.",
    "pitfall": "Do not change canonical relations to imitate an example. Inspect and preserve the existing schema.",
    "minutes": 30,
    "level": "Independent operator",
    "prerequisite": "notion-09",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Notion basics — official written tutorials",
        "url": "https://www.notion.com/help/category/new-to-notion",
        "kind": "Written guide"
      },
      {
        "label": "Notion Academy — structured lessons and videos",
        "url": "https://academy.notion.com/",
        "kind": "Official course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "notion-11",
    "tool": "notion",
    "number": 11,
    "title": "Read simple formulas",
    "objective": "Explain a calculation and its assumptions.",
    "explanation": "A formula derives a display from fields. Empty values, dates and units can make a formula misleading.",
    "example": "An accuracy formula needs both earned and total marks, and must handle a zero or unknown total.",
    "guided": [
      "Read a simple sandbox formula.",
      "Test normal, empty and zero-denominator inputs.",
      "Write the rule in plain English before editing syntax."
    ],
    "independent": "Explain a formula's behavior on three cases.",
    "transfer": "Inspect a different formula and identify one edge case.",
    "pitfall": "Do not copy a formula you cannot explain. Restore the last working sandbox version and simplify.",
    "minutes": 30,
    "level": "Independent operator",
    "prerequisite": "notion-10",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Notion basics — official written tutorials",
        "url": "https://www.notion.com/help/category/new-to-notion",
        "kind": "Written guide"
      },
      {
        "label": "Notion Academy — structured lessons and videos",
        "url": "https://academy.notion.com/",
        "kind": "Official course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "notion-12",
    "tool": "notion",
    "number": 12,
    "title": "Link Calendar and Drive",
    "objective": "Connect plans and sources without duplicating content.",
    "explanation": "Links preserve access to a canonical document. Calendar holds planned blocks; updating a calendar is not completion evidence.",
    "example": "A Paper Engine record can link a Drive scheme and a Calendar session while retaining its own actual score.",
    "guided": [
      "Add a source link to a sandbox entry.",
      "Open it and check the intended file and permission.",
      "Explain which system owns time, sources and actual results."
    ],
    "independent": "Retrieve a real paper source from a linked record.",
    "transfer": "Repeat on a different device where accessible.",
    "pitfall": "A broken or access-denied link is not a backup. Repair the source reference rather than pasting private content publicly.",
    "minutes": 30,
    "level": "Independent operator",
    "prerequisite": "notion-11",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Notion basics — official written tutorials",
        "url": "https://www.notion.com/help/category/new-to-notion",
        "kind": "Written guide"
      },
      {
        "label": "Notion Academy — structured lessons and videos",
        "url": "https://academy.notion.com/",
        "kind": "Official course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "notion-13",
    "tool": "notion",
    "number": 13,
    "title": "Sharing and permissions",
    "objective": "Recognize what a visitor can see.",
    "explanation": "Private, invited and published pages have different audiences. Parent and database permissions can expose more than the visible page.",
    "example": "A public template should contain synthetic examples, not a family's financial record.",
    "guided": [
      "Inspect a sandbox page's sharing settings.",
      "List the information that must stay private.",
      "Describe a public-safe version without actually publishing private data."
    ],
    "independent": "Identify and explain the current audience of one page.",
    "transfer": "Audit a second sandbox with different permissions.",
    "pitfall": "Do not infer privacy from an obscure URL. Inspect access settings and remove real private data from examples.",
    "minutes": 40,
    "level": "Transfer & recovery",
    "prerequisite": "notion-12",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Notion basics — official written tutorials",
        "url": "https://www.notion.com/help/category/new-to-notion",
        "kind": "Written guide"
      },
      {
        "label": "Notion Academy — structured lessons and videos",
        "url": "https://academy.notion.com/",
        "kind": "Official course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "notion-14",
    "tool": "notion",
    "number": 14,
    "title": "Export and recovery",
    "objective": "Create a usable backup and explain its limits.",
    "explanation": "An export is a file you can retrieve. A link or folder name alone does not prove a backup exists.",
    "example": "Exporting three sandbox records and locating them in the file is stronger evidence than clicking an export button.",
    "guided": [
      "Export a small sandbox using the current official instructions.",
      "Locate and inspect the resulting file.",
      "Restore sample content in a separate sandbox and record losses."
    ],
    "independent": "Demonstrate retrieval of the exported records.",
    "transfer": "Repeat with a different supported export format.",
    "pitfall": "Relations, permissions or formatting may not survive every export. Record limitations and keep the live original.",
    "minutes": 40,
    "level": "Transfer & recovery",
    "prerequisite": "notion-13",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Notion basics — official written tutorials",
        "url": "https://www.notion.com/help/category/new-to-notion",
        "kind": "Written guide"
      },
      {
        "label": "Notion Academy — structured lessons and videos",
        "url": "https://academy.notion.com/",
        "kind": "Official course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "notion-15",
    "tool": "notion",
    "number": 15,
    "title": "Use Notion AI carefully",
    "objective": "Verify generated output against its source.",
    "explanation": "AI output is a draft. It may omit conditions or invent details; a confident tone is not evidence.",
    "example": "A generated summary saying all retests passed must be rejected when the source contains only scheduled dates.",
    "guided": [
      "Provide a small trusted source.",
      "Compare each output claim with the original.",
      "Correct unsupported claims before updating any real record."
    ],
    "independent": "Find and repair one weakness in a draft summary.",
    "transfer": "Evaluate a different output without assuming agreement means truth.",
    "pitfall": "Do not let AI create results from intentions. Keep draft and verified states visibly separate.",
    "minutes": 40,
    "level": "Transfer & recovery",
    "prerequisite": "notion-14",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Notion basics — official written tutorials",
        "url": "https://www.notion.com/help/category/new-to-notion",
        "kind": "Written guide"
      },
      {
        "label": "Notion Academy — structured lessons and videos",
        "url": "https://academy.notion.com/",
        "kind": "Official course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "notion-16",
    "tool": "notion",
    "number": 16,
    "title": "Notion capstone",
    "objective": "Operate the existing system independently.",
    "explanation": "Combine retrieval, real evidence capture, error linking and recovery. Competence means doing the workflow without a copied step-by-step script.",
    "example": "The artifact is one source-linked marked attempt and a truthful next-check plan, not a redesigned dashboard.",
    "guided": [
      "Find one actual paper and its authoritative scheme.",
      "Complete and mark it independently, then log it accurately.",
      "Link a verified error and plan a transfer and delayed check."
    ],
    "independent": "Explain and demonstrate the complete evidence chain.",
    "transfer": "Repeat with another subject and return after a week.",
    "pitfall": "If any step needs help, repair only that skill. Do not restart the entire workspace.",
    "minutes": 40,
    "level": "Transfer & recovery",
    "prerequisite": "notion-15",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Notion basics — official written tutorials",
        "url": "https://www.notion.com/help/category/new-to-notion",
        "kind": "Written guide"
      },
      {
        "label": "Notion Academy — structured lessons and videos",
        "url": "https://academy.notion.com/",
        "kind": "Official course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "remnote-01",
    "tool": "remnote",
    "number": 1,
    "title": "Choose a retrieval role",
    "objective": "Decide whether RemNote fills a real gap.",
    "explanation": "RemNote combines notes and retrieval. Notion manages records; flashcard tools practise recall. More tools are useful only if they reduce friction.",
    "example": "A recurring definition weakness may suit five RemNote cards; a multi-step structured problem still needs question practice.",
    "guided": [
      "List the task you want to improve.",
      "Check whether Anki already handles that exact card set.",
      "Choose one primary home for those cards."
    ],
    "independent": "Explain one reason to use or skip RemNote.",
    "transfer": "Apply the decision to another topic.",
    "pitfall": "Do not duplicate a whole Anki deck merely to try a new app. Use a small pilot.",
    "minutes": 20,
    "level": "Orientation",
    "prerequisite": null,
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "RemNote in 5 Minutes",
        "url": "https://help.remnote.com/en/articles/6044066-remnote-in-5-minutes",
        "kind": "Written introduction"
      },
      {
        "label": "Creating Flashcards — official guide with video",
        "url": "https://help.remnote.com/en/articles/6025481-creating-flashcards",
        "kind": "Guide with video"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "remnote-02",
    "tool": "remnote",
    "number": 2,
    "title": "Documents and folders",
    "objective": "Create and retrieve a small document.",
    "explanation": "Documents contain notes and cards; folders group documents. A structure is useful when you can find the item quickly.",
    "example": "A folder Biology can hold a document Cell transport with a source link.",
    "guided": [
      "Create a sandbox document.",
      "Add a source-linked note.",
      "Find it through navigation and search."
    ],
    "independent": "Retrieve the same note without a walkthrough.",
    "transfer": "Create and find a second small document.",
    "pitfall": "A deep folder tree can hide notes. Simplify before adding more hierarchy.",
    "minutes": 20,
    "level": "Orientation",
    "prerequisite": "remnote-01",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "RemNote in 5 Minutes",
        "url": "https://help.remnote.com/en/articles/6044066-remnote-in-5-minutes",
        "kind": "Written introduction"
      },
      {
        "label": "Creating Flashcards — official guide with video",
        "url": "https://help.remnote.com/en/articles/6025481-creating-flashcards",
        "kind": "Guide with video"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "remnote-03",
    "tool": "remnote",
    "number": 3,
    "title": "Understand Rems",
    "objective": "Use indentation to represent meaning.",
    "explanation": "A Rem is a unit of information. Parent-child structure supplies context, but too much hidden context makes cards ambiguous.",
    "example": "A parent Cell membrane can contain a child Function, provided the resulting question remains understandable.",
    "guided": [
      "Write one concept with two child details.",
      "Inspect how indentation changes context.",
      "Rewrite an ambiguous child to be answerable."
    ],
    "independent": "Explain your hierarchy in plain English.",
    "transfer": "Structure a different concept.",
    "pitfall": "If the card cannot stand alone with its shown context, add a clear subject.",
    "minutes": 20,
    "level": "Orientation",
    "prerequisite": "remnote-02",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "RemNote in 5 Minutes",
        "url": "https://help.remnote.com/en/articles/6044066-remnote-in-5-minutes",
        "kind": "Written introduction"
      },
      {
        "label": "Creating Flashcards — official guide with video",
        "url": "https://help.remnote.com/en/articles/6025481-creating-flashcards",
        "kind": "Guide with video"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "remnote-04",
    "tool": "remnote",
    "number": 4,
    "title": "Basic atomic cards",
    "objective": "Write one answerable prompt per card.",
    "explanation": "A useful card tests a specific retrievable idea. A long summary is a poor substitute for a focused question.",
    "example": "Instead of 'Explain osmosis', ask for one precisely source-defined aspect appropriate to the syllabus.",
    "guided": [
      "Choose one verified unstable fact.",
      "Create a basic card using current official syntax.",
      "Preview it and check that the answer is unambiguous."
    ],
    "independent": "Create three source-verified basic cards.",
    "transfer": "Rewrite one card for a different concept.",
    "pitfall": "Do not split a fact until its pieces become meaningless. Keep enough context to ask a precise question.",
    "minutes": 20,
    "level": "Orientation",
    "prerequisite": "remnote-03",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "RemNote in 5 Minutes",
        "url": "https://help.remnote.com/en/articles/6044066-remnote-in-5-minutes",
        "kind": "Written introduction"
      },
      {
        "label": "Creating Flashcards — official guide with video",
        "url": "https://help.remnote.com/en/articles/6025481-creating-flashcards",
        "kind": "Guide with video"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "remnote-05",
    "tool": "remnote",
    "number": 5,
    "title": "Concepts and reverse recall",
    "objective": "Choose meaningful recall direction.",
    "explanation": "A forward card asks for a detail; a reverse card asks from a detail back to the concept. Reverse recall is useful only when the clue identifies a unique answer.",
    "example": "A distinctive term-definition pair may work both ways; a shared function may have many valid organelle answers.",
    "guided": [
      "Inspect a concept and its descriptors.",
      "Test the reverse prompt for uniqueness.",
      "Disable a direction that creates ambiguous questions."
    ],
    "independent": "Create one justified bidirectional pair.",
    "transfer": "Choose the right direction for another fact.",
    "pitfall": "Multiple valid reverse answers cause false failures. Rewrite the clue or keep only the useful direction.",
    "minutes": 30,
    "level": "Guided operator",
    "prerequisite": "remnote-04",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "RemNote in 5 Minutes",
        "url": "https://help.remnote.com/en/articles/6044066-remnote-in-5-minutes",
        "kind": "Written introduction"
      },
      {
        "label": "Creating Flashcards — official guide with video",
        "url": "https://help.remnote.com/en/articles/6025481-creating-flashcards",
        "kind": "Guide with video"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "remnote-06",
    "tool": "remnote",
    "number": 6,
    "title": "Cloze cards",
    "objective": "Hide a meaningful detail without cueing the answer.",
    "explanation": "A cloze removes part of a sentence. The remaining sentence should test knowledge rather than grammatical guessing.",
    "example": "Hide a required condition in a source-verified statement; avoid leaving the answer's abbreviation visible elsewhere.",
    "guided": [
      "Choose a short verified statement.",
      "Hide one meaningful element.",
      "Inspect the visible context for accidental clues."
    ],
    "independent": "Create two cloze cards and explain why they test recall.",
    "transfer": "Convert one weak cloze into a basic question.",
    "pitfall": "If wording reveals the answer, change the context or use a direct prompt.",
    "minutes": 30,
    "level": "Guided operator",
    "prerequisite": "remnote-05",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "RemNote in 5 Minutes",
        "url": "https://help.remnote.com/en/articles/6044066-remnote-in-5-minutes",
        "kind": "Written introduction"
      },
      {
        "label": "Creating Flashcards — official guide with video",
        "url": "https://help.remnote.com/en/articles/6025481-creating-flashcards",
        "kind": "Guide with video"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "remnote-07",
    "tool": "remnote",
    "number": 7,
    "title": "Image occlusion",
    "objective": "Practise labels on a permitted diagram.",
    "explanation": "Image occlusion hides a label or region. It tests identification, not complete functional understanding.",
    "example": "A permitted cell diagram can test one organelle label and pair with a separate function question.",
    "guided": [
      "Use a diagram you are allowed to store.",
      "Hide one label while keeping useful orientation.",
      "Preview on a small screen and check uniqueness."
    ],
    "independent": "Make two clear occlusions plus one function card.",
    "transfer": "Identify the same structure in a different diagram.",
    "pitfall": "Do not hide so much that orientation becomes arbitrary. Repair the mask and keep a text alternative.",
    "minutes": 30,
    "level": "Guided operator",
    "prerequisite": "remnote-06",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "RemNote in 5 Minutes",
        "url": "https://help.remnote.com/en/articles/6044066-remnote-in-5-minutes",
        "kind": "Written introduction"
      },
      {
        "label": "Creating Flashcards — official guide with video",
        "url": "https://help.remnote.com/en/articles/6025481-creating-flashcards",
        "kind": "Guide with video"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "remnote-08",
    "tool": "remnote",
    "number": 8,
    "title": "Links and backlinks",
    "objective": "Connect relevant notes without building clutter.",
    "explanation": "Links let you follow related concepts. They do not themselves establish a scientifically valid relationship.",
    "example": "Link membrane structure to a transport explanation and state why the connection matters.",
    "guided": [
      "Link two related notes.",
      "Open the link from both sides where supported.",
      "Write the relation in one sentence."
    ],
    "independent": "Demonstrate one useful linked explanation.",
    "transfer": "Evaluate another possible connection.",
    "pitfall": "A large graph can feel productive while teaching little. Keep links that support a real question.",
    "minutes": 30,
    "level": "Guided operator",
    "prerequisite": "remnote-07",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "RemNote in 5 Minutes",
        "url": "https://help.remnote.com/en/articles/6044066-remnote-in-5-minutes",
        "kind": "Written introduction"
      },
      {
        "label": "Creating Flashcards — official guide with video",
        "url": "https://help.remnote.com/en/articles/6025481-creating-flashcards",
        "kind": "Guide with video"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "remnote-09",
    "tool": "remnote",
    "number": 9,
    "title": "PDFs and sources",
    "objective": "Retain provenance while annotating.",
    "explanation": "Annotations should point back to a source and location. AI summaries or copied fragments can lose essential conditions.",
    "example": "A card can reference the teacher scheme's page without storing an unauthorized public copy.",
    "guided": [
      "Import or link a permitted source.",
      "Annotate one relevant passage.",
      "Attach the source and location to the resulting note."
    ],
    "independent": "Retrieve the passage behind one card.",
    "transfer": "Verify a second card's evidence.",
    "pitfall": "Do not share copyrighted class materials publicly. Keep source access within its permitted audience.",
    "minutes": 30,
    "level": "Independent operator",
    "prerequisite": "remnote-08",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "RemNote in 5 Minutes",
        "url": "https://help.remnote.com/en/articles/6044066-remnote-in-5-minutes",
        "kind": "Written introduction"
      },
      {
        "label": "Creating Flashcards — official guide with video",
        "url": "https://help.remnote.com/en/articles/6025481-creating-flashcards",
        "kind": "Guide with video"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "remnote-10",
    "tool": "remnote",
    "number": 10,
    "title": "Due reviews and honest ratings",
    "objective": "Recall before revealing and rate actual performance.",
    "explanation": "The due queue selects scheduled retrieval. Revealing an answer and recognizing it is easier than recalling it independently.",
    "example": "A guessed correct answer is fragile; a revealed answer is not an independent success.",
    "guided": [
      "Open a small due queue.",
      "Attempt recall before reveal.",
      "Rate honestly using the current official options."
    ],
    "independent": "Complete five real reviews and explain one rating.",
    "transfer": "Review a different topic without reading notes first.",
    "pitfall": "Do not inflate ratings to clear the queue. Repair an unclear card instead.",
    "minutes": 30,
    "level": "Independent operator",
    "prerequisite": "remnote-09",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "RemNote in 5 Minutes",
        "url": "https://help.remnote.com/en/articles/6044066-remnote-in-5-minutes",
        "kind": "Written introduction"
      },
      {
        "label": "Creating Flashcards — official guide with video",
        "url": "https://help.remnote.com/en/articles/6025481-creating-flashcards",
        "kind": "Guide with video"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "remnote-11",
    "tool": "remnote",
    "number": 11,
    "title": "Control review load",
    "objective": "Keep retrieval sustainable.",
    "explanation": "Adding too many cards creates future work. Review load should reflect your actual capacity and the importance of the facts.",
    "example": "Five good cards from recurring weaknesses can outperform fifty unreviewed cards from a full chapter.",
    "guided": [
      "Inspect your active card load.",
      "Prioritize a small source-backed set.",
      "Choose a sustainable review window without sacrificing sleep."
    ],
    "independent": "Explain which new cards you chose not to add.",
    "transfer": "Apply the same rule during a busy week.",
    "pitfall": "A missed day is not a reason for a punitive catch-up marathon. Resume with prioritized due work.",
    "minutes": 30,
    "level": "Independent operator",
    "prerequisite": "remnote-10",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "RemNote in 5 Minutes",
        "url": "https://help.remnote.com/en/articles/6044066-remnote-in-5-minutes",
        "kind": "Written introduction"
      },
      {
        "label": "Creating Flashcards — official guide with video",
        "url": "https://help.remnote.com/en/articles/6025481-creating-flashcards",
        "kind": "Guide with video"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "remnote-12",
    "tool": "remnote",
    "number": 12,
    "title": "Repair bad cards",
    "objective": "Reduce ambiguity and duplication deliberately.",
    "explanation": "A card can fail because the prompt is weak, not because you lack the concept. Duplicates consume review effort.",
    "example": "Two versions of the same definition may be merged after checking that they test the same idea.",
    "guided": [
      "Find a repeated or ambiguous card.",
      "Compare source, recall direction and scheduling history.",
      "Edit or suspend carefully and retain necessary context."
    ],
    "independent": "Repair two cards and explain the changes.",
    "transfer": "Audit another small set.",
    "pitfall": "Do not delete scheduling history blindly. Export first when making substantial changes.",
    "minutes": 30,
    "level": "Independent operator",
    "prerequisite": "remnote-11",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "RemNote in 5 Minutes",
        "url": "https://help.remnote.com/en/articles/6044066-remnote-in-5-minutes",
        "kind": "Written introduction"
      },
      {
        "label": "Creating Flashcards — official guide with video",
        "url": "https://help.remnote.com/en/articles/6025481-creating-flashcards",
        "kind": "Guide with video"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "remnote-13",
    "tool": "remnote",
    "number": 13,
    "title": "AI-generated cards",
    "objective": "Treat generated cards as drafts.",
    "explanation": "AI can produce unsupported answers and bloated cards. Review every item against the original before activating it.",
    "example": "A generated list may omit a limiting condition required by the marking scheme.",
    "guided": [
      "Generate or inspect a small draft set from a trusted source.",
      "Check each answer and its conditions.",
      "Reject duplicates, vague prompts and unsupported items."
    ],
    "independent": "Edit five draft cards into a verified small set.",
    "transfer": "Evaluate a draft from another source.",
    "pitfall": "No bulk activation without verification. Smaller accurate sets are easier to maintain.",
    "minutes": 40,
    "level": "Transfer & recovery",
    "prerequisite": "remnote-12",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "RemNote in 5 Minutes",
        "url": "https://help.remnote.com/en/articles/6044066-remnote-in-5-minutes",
        "kind": "Written introduction"
      },
      {
        "label": "Creating Flashcards — official guide with video",
        "url": "https://help.remnote.com/en/articles/6025481-creating-flashcards",
        "kind": "Guide with video"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "remnote-14",
    "tool": "remnote",
    "number": 14,
    "title": "Import, export and sync",
    "objective": "Understand where your data exists.",
    "explanation": "An account sync, a browser copy and an export are different things. A migration needs a small test before relying on it.",
    "example": "Export a few cards and inspect both prompts and answers after importing them into a sandbox.",
    "guided": [
      "Read current official export instructions.",
      "Test a small permitted sample.",
      "Check text, images and scheduling limitations."
    ],
    "independent": "Produce and retrieve an actual export file.",
    "transfer": "Repeat a recovery test later.",
    "pitfall": "Do not assume every format preserves history or media. Record what survived.",
    "minutes": 40,
    "level": "Transfer & recovery",
    "prerequisite": "remnote-13",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "RemNote in 5 Minutes",
        "url": "https://help.remnote.com/en/articles/6044066-remnote-in-5-minutes",
        "kind": "Written introduction"
      },
      {
        "label": "Creating Flashcards — official guide with video",
        "url": "https://help.remnote.com/en/articles/6025481-creating-flashcards",
        "kind": "Guide with video"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "remnote-15",
    "tool": "remnote",
    "number": 15,
    "title": "Bridge from exam errors",
    "objective": "Choose facts worth making into cards.",
    "explanation": "Cards help unstable retrievable facts. Diagnosing a multi-step reasoning failure usually needs another exam question.",
    "example": "A wrong unit definition can become a card; a force-diagram setup needs independent diagram practice.",
    "guided": [
      "Inspect one real diagnosed academic error.",
      "Decide whether it is factual or procedural.",
      "Create a small card only if useful, then return to questions."
    ],
    "independent": "Explain the card-versus-question decision on two errors.",
    "transfer": "Apply it to another subject.",
    "pitfall": "Do not convert every failed question into a long card. Repair the underlying skill.",
    "minutes": 40,
    "level": "Transfer & recovery",
    "prerequisite": "remnote-14",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "RemNote in 5 Minutes",
        "url": "https://help.remnote.com/en/articles/6044066-remnote-in-5-minutes",
        "kind": "Written introduction"
      },
      {
        "label": "Creating Flashcards — official guide with video",
        "url": "https://help.remnote.com/en/articles/6025481-creating-flashcards",
        "kind": "Guide with video"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "remnote-16",
    "tool": "remnote",
    "number": 16,
    "title": "RemNote capstone",
    "objective": "Show useful retention and transfer.",
    "explanation": "A completed deck is not evidence of exam mastery. Combine accurate cards, honest reviews and an unseen related question.",
    "example": "Your artifact is a small verified card set plus actual recall observations and a marked transfer question.",
    "guided": [
      "Create five to ten justified cards from diagnosed weaknesses.",
      "Review without notes and repair weak prompts.",
      "Attempt a different related exam question independently."
    ],
    "independent": "Explain the source, ratings and transfer result.",
    "transfer": "Recheck recall after a week.",
    "pitfall": "If reviews pass but transfer fails, practise questions rather than adding more cards.",
    "minutes": 40,
    "level": "Transfer & recovery",
    "prerequisite": "remnote-15",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "RemNote in 5 Minutes",
        "url": "https://help.remnote.com/en/articles/6044066-remnote-in-5-minutes",
        "kind": "Written introduction"
      },
      {
        "label": "Creating Flashcards — official guide with video",
        "url": "https://help.remnote.com/en/articles/6025481-creating-flashcards",
        "kind": "Guide with video"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "claude-01",
    "tool": "claude",
    "number": 1,
    "title": "Know the tool",
    "objective": "Distinguish Claude chat, Claude Code and the API.",
    "explanation": "Chat answers in a conversation. Claude Code works within a development environment and can read/edit files or run tools with permissions. API use has separate billing/access.",
    "example": "Asking chat to describe a repository is different from granting a coding agent access to it.",
    "guided": [
      "Identify the interface you are using.",
      "List the files and actions it can actually access.",
      "Check plan/access evidence without entering private credentials here."
    ],
    "independent": "Explain which tool fits a small coding task.",
    "transfer": "Apply the distinction to another provider.",
    "pitfall": "Do not assume a subscription includes every API model or permission. Consult current product documentation.",
    "minutes": 20,
    "level": "Orientation",
    "prerequisite": null,
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Claude Code quickstart",
        "url": "https://code.claude.com/docs/en/quickstart",
        "kind": "Written guide"
      },
      {
        "label": "Claude Code in Action",
        "url": "https://anthropic.skilljar.com/claude-code-in-action",
        "kind": "Official video course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "claude-02",
    "tool": "claude",
    "number": 2,
    "title": "Files and terminal",
    "objective": "Understand a working directory before commands.",
    "explanation": "A terminal runs commands relative to a directory. A wrong directory can make a harmless-looking operation affect the wrong project.",
    "example": "Printing the current directory and listing files is a safer first action than editing unknown files.",
    "guided": [
      "Open a disposable project folder.",
      "Use the appropriate shell's read-only directory commands.",
      "Identify the file you intend to inspect."
    ],
    "independent": "Find a named file and explain its path.",
    "transfer": "Repeat in a second sandbox folder.",
    "pitfall": "Windows PowerShell and WSL are different shells. Use one documented route consistently.",
    "minutes": 20,
    "level": "Orientation",
    "prerequisite": "claude-01",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Claude Code quickstart",
        "url": "https://code.claude.com/docs/en/quickstart",
        "kind": "Written guide"
      },
      {
        "label": "Claude Code in Action",
        "url": "https://anthropic.skilljar.com/claude-code-in-action",
        "kind": "Official video course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "claude-03",
    "tool": "claude",
    "number": 3,
    "title": "Install and authenticate",
    "objective": "Follow current official instructions safely.",
    "explanation": "Installation methods and supported environments change. Provider instructions are authoritative; credentials belong in official sign-in flows, not notes or public code.",
    "example": "Verify the installed version, then sign in through the supported interface.",
    "guided": [
      "Open the current official quickstart.",
      "Choose Windows-native or WSL instructions deliberately.",
      "Verify installation/version and use the official sign-in flow."
    ],
    "independent": "Explain your setup and confirm access without exposing secrets.",
    "transfer": "Locate update and troubleshooting instructions.",
    "pitfall": "Never paste passwords or tokens into lessons. Stop and inspect any unexpected credential request.",
    "minutes": 20,
    "level": "Orientation",
    "prerequisite": "claude-02",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Claude Code quickstart",
        "url": "https://code.claude.com/docs/en/quickstart",
        "kind": "Written guide"
      },
      {
        "label": "Claude Code in Action",
        "url": "https://anthropic.skilljar.com/claude-code-in-action",
        "kind": "Official video course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "claude-04",
    "tool": "claude",
    "number": 4,
    "title": "Repositories and Git",
    "objective": "Use history as a recovery tool.",
    "explanation": "A repository tracks source changes. Status shows local changes, diff shows what changed and commits make recoverable checkpoints.",
    "example": "A one-line label change should have a one-line source diff, not unexplained rewrites.",
    "guided": [
      "Open a disposable repository and inspect status.",
      "Make a harmless edit and inspect its diff.",
      "Commit or undo the sandbox change and verify the result."
    ],
    "independent": "Explain tracked versus untracked files.",
    "transfer": "Recover another harmless sample edit.",
    "pitfall": "Do not force-push or discard changes you have not inspected. Preserve a checkpoint.",
    "minutes": 20,
    "level": "Orientation",
    "prerequisite": "claude-03",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Claude Code quickstart",
        "url": "https://code.claude.com/docs/en/quickstart",
        "kind": "Written guide"
      },
      {
        "label": "Claude Code in Action",
        "url": "https://anthropic.skilljar.com/claude-code-in-action",
        "kind": "Official video course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "claude-05",
    "tool": "claude",
    "number": 5,
    "title": "First read-only session",
    "objective": "Verify an agent's explanation in source.",
    "explanation": "A model's repository summary is a hypothesis to check. File references make verification practical.",
    "example": "Ask which file renders the homepage, then open that file yourself.",
    "guided": [
      "Start Claude Code inside the intended sandbox repo.",
      "Request a read-only map with file references.",
      "Verify one claim directly in source."
    ],
    "independent": "Explain one feature's actual source location.",
    "transfer": "Repeat on a different feature.",
    "pitfall": "Do not accept guessed file paths. Ask for and check concrete references.",
    "minutes": 30,
    "level": "Guided operator",
    "prerequisite": "claude-04",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Claude Code quickstart",
        "url": "https://code.claude.com/docs/en/quickstart",
        "kind": "Written guide"
      },
      {
        "label": "Claude Code in Action",
        "url": "https://anthropic.skilljar.com/claude-code-in-action",
        "kind": "Official video course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "claude-06",
    "tool": "claude",
    "number": 6,
    "title": "Project instructions",
    "objective": "Give concise, relevant constraints.",
    "explanation": "Project instructions such as CLAUDE.md guide behavior. They should state purpose, commands, boundaries and acceptance checks without unrelated private history.",
    "example": "A small app can specify 'preserve storage keys; use existing tests; do not change access'.",
    "guided": [
      "Read existing repository instructions.",
      "Write a small sandbox instruction file if appropriate.",
      "Ask the agent to restate constraints before a change."
    ],
    "independent": "Explain the highest-risk constraint for your project.",
    "transfer": "Adapt instructions to another toy repository.",
    "pitfall": "Do not put passwords or private conversations in instruction files. Keep only task-relevant context.",
    "minutes": 30,
    "level": "Guided operator",
    "prerequisite": "claude-05",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Claude Code quickstart",
        "url": "https://code.claude.com/docs/en/quickstart",
        "kind": "Written guide"
      },
      {
        "label": "Claude Code in Action",
        "url": "https://anthropic.skilljar.com/claude-code-in-action",
        "kind": "Official video course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "claude-07",
    "tool": "claude",
    "number": 7,
    "title": "Permissions and review",
    "objective": "Distinguish read, edit, execution and external writes.",
    "explanation": "Reading source is different from running commands or publishing. Permissions should match the action and the user's authorization.",
    "example": "A label edit does not need access to email, payments or an unrelated repository.",
    "guided": [
      "Inspect the current permission mode in official docs.",
      "Classify a proposed action by its effects.",
      "Review a harmless diff before applying it."
    ],
    "independent": "Explain when a proposed action exceeds task scope.",
    "transfer": "Review a new action with different effects.",
    "pitfall": "Do not use blanket bypass as a beginner default. Narrow the action and inspect evidence.",
    "minutes": 30,
    "level": "Guided operator",
    "prerequisite": "claude-06",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Claude Code quickstart",
        "url": "https://code.claude.com/docs/en/quickstart",
        "kind": "Written guide"
      },
      {
        "label": "Claude Code in Action",
        "url": "https://anthropic.skilljar.com/claude-code-in-action",
        "kind": "Official video course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "claude-08",
    "tool": "claude",
    "number": 8,
    "title": "First bounded change",
    "objective": "Make one small reviewable improvement.",
    "explanation": "A bounded requirement says what triggers behavior and what should change. Small changes are easier to verify and recover.",
    "example": "Change a button label without changing its click behavior or persistence.",
    "guided": [
      "Write one before/after acceptance example.",
      "Ask for the smallest implementation.",
      "Inspect every changed file and run the relevant check."
    ],
    "independent": "Implement and verify one harmless sandbox improvement.",
    "transfer": "Repeat a similar improvement independently.",
    "pitfall": "If unrelated files change, pause and reconcile the diff rather than accepting the whole patch.",
    "minutes": 30,
    "level": "Guided operator",
    "prerequisite": "claude-07",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Claude Code quickstart",
        "url": "https://code.claude.com/docs/en/quickstart",
        "kind": "Written guide"
      },
      {
        "label": "Claude Code in Action",
        "url": "https://anthropic.skilljar.com/claude-code-in-action",
        "kind": "Official video course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "claude-09",
    "tool": "claude",
    "number": 9,
    "title": "Meaningful tests",
    "objective": "Test behavior rather than repeat implementation.",
    "explanation": "A useful check can fail when behavior is wrong. Passing a build alone does not prove interactions or recovery work.",
    "example": "A timer test should check elapsed time and pause/resume, not merely search for a function name.",
    "guided": [
      "Read a relevant existing test.",
      "Explain what defect it would catch.",
      "Run it and investigate an observed failure."
    ],
    "independent": "Write acceptance cases including one edge case.",
    "transfer": "Apply the cases to a different feature.",
    "pitfall": "Do not call unrun tests passed. Record the command and actual result.",
    "minutes": 30,
    "level": "Independent operator",
    "prerequisite": "claude-08",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Claude Code quickstart",
        "url": "https://code.claude.com/docs/en/quickstart",
        "kind": "Written guide"
      },
      {
        "label": "Claude Code in Action",
        "url": "https://anthropic.skilljar.com/claude-code-in-action",
        "kind": "Official video course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "claude-10",
    "tool": "claude",
    "number": 10,
    "title": "Debug with evidence",
    "objective": "Reproduce and isolate a problem.",
    "explanation": "Debugging begins with a concrete failing behavior. Changing many things at once hides the cause.",
    "example": "An import that fails only on malformed dates needs a targeted validation check.",
    "guided": [
      "Reproduce a sandbox failure with exact inputs.",
      "Inspect logs and isolate the smallest cause.",
      "Fix one cause and rerun the failing check."
    ],
    "independent": "Explain the before/after evidence.",
    "transfer": "Debug a different bounded failure.",
    "pitfall": "Do not repeatedly replace the whole app. Preserve working behavior and narrow the patch.",
    "minutes": 30,
    "level": "Independent operator",
    "prerequisite": "claude-09",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Claude Code quickstart",
        "url": "https://code.claude.com/docs/en/quickstart",
        "kind": "Written guide"
      },
      {
        "label": "Claude Code in Action",
        "url": "https://anthropic.skilljar.com/claude-code-in-action",
        "kind": "Official video course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "claude-11",
    "tool": "claude",
    "number": 11,
    "title": "Sessions and handoffs",
    "objective": "Carry forward verified state.",
    "explanation": "A concise handoff lists current source, changes, tests, blockers and next action. A long conversation is not a reliable backup.",
    "example": "A continuation should say which commit was tested and which browser checks remain unrun.",
    "guided": [
      "Write a short handoff from an actual sandbox task.",
      "Use current supported resume/session controls if available.",
      "Verify that the next session opens the correct repo and state."
    ],
    "independent": "Resume a small task without repeating completed work.",
    "transfer": "Produce a handoff for a different task.",
    "pitfall": "Never claim a deployed result from a plan. Mark unfinished checks explicitly.",
    "minutes": 30,
    "level": "Independent operator",
    "prerequisite": "claude-10",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Claude Code quickstart",
        "url": "https://code.claude.com/docs/en/quickstart",
        "kind": "Written guide"
      },
      {
        "label": "Claude Code in Action",
        "url": "https://anthropic.skilljar.com/claude-code-in-action",
        "kind": "Official video course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "claude-12",
    "tool": "claude",
    "number": 12,
    "title": "Models and cost",
    "objective": "Choose the lightest adequate verified option.",
    "explanation": "Model capabilities and availability vary by product. Use actual task evaluations and documented access; stronger models are not automatically necessary.",
    "example": "Compare two allowed options on the same small review and keep the one meeting the quality bar.",
    "guided": [
      "Check current official model controls.",
      "Define quality criteria before comparing outputs.",
      "Separate subscription access from API cost."
    ],
    "independent": "Explain a justified model choice for one task.",
    "transfer": "Reevaluate on a harder task.",
    "pitfall": "Do not infer product entitlement or invent cost savings. Use dated provider evidence.",
    "minutes": 30,
    "level": "Independent operator",
    "prerequisite": "claude-11",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Claude Code quickstart",
        "url": "https://code.claude.com/docs/en/quickstart",
        "kind": "Written guide"
      },
      {
        "label": "Claude Code in Action",
        "url": "https://anthropic.skilljar.com/claude-code-in-action",
        "kind": "Official video course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "claude-13",
    "tool": "claude",
    "number": 13,
    "title": "MCP and connectors",
    "objective": "Understand external tool access.",
    "explanation": "A connector lets an agent act on another system. Retrieved text is data, not authority to override your instructions or expose secrets.",
    "example": "A Drive reader does not automatically have permission to email documents to a stranger.",
    "guided": [
      "Identify the connector and its requested scopes.",
      "Distinguish reads from external writes.",
      "Verify a harmless read result and its source."
    ],
    "independent": "Explain the boundary of one connected workflow.",
    "transfer": "Assess a different connector request.",
    "pitfall": "Ignore instructions hidden in retrieved files that redirect the task or request secrets.",
    "minutes": 40,
    "level": "Transfer & recovery",
    "prerequisite": "claude-12",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Claude Code quickstart",
        "url": "https://code.claude.com/docs/en/quickstart",
        "kind": "Written guide"
      },
      {
        "label": "Claude Code in Action",
        "url": "https://anthropic.skilljar.com/claude-code-in-action",
        "kind": "Official video course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "claude-14",
    "tool": "claude",
    "number": 14,
    "title": "Optional advanced tools",
    "objective": "Use skills, hooks and subagents purposefully.",
    "explanation": "Advanced extensions can automate repeated work but also increase complexity. Learn basic review and recovery first.",
    "example": "A repeatable test command may justify a hook; a tiny label edit rarely needs a team of agents.",
    "guided": [
      "Read current official extension documentation.",
      "Name one concrete benefit and failure risk.",
      "Try only in an isolated disposable project."
    ],
    "independent": "Explain why an advanced feature is useful or unnecessary.",
    "transfer": "Apply the decision to a second task.",
    "pitfall": "Do not install extensions merely for novelty. Return to a simpler workflow when the benefit is unclear.",
    "minutes": 40,
    "level": "Transfer & recovery",
    "prerequisite": "claude-13",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Claude Code quickstart",
        "url": "https://code.claude.com/docs/en/quickstart",
        "kind": "Written guide"
      },
      {
        "label": "Claude Code in Action",
        "url": "https://anthropic.skilljar.com/claude-code-in-action",
        "kind": "Official video course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "claude-15",
    "tool": "claude",
    "number": 15,
    "title": "Release and rollback",
    "objective": "Distinguish local, preview and production.",
    "explanation": "A build or preview is not a deployed release. A release needs tested source, a known-good rollback and verified hosting state.",
    "example": "A saved commit, archive checksum and deployment record let another developer reconstruct the change.",
    "guided": [
      "Create a source checkpoint and backup.",
      "Run relevant checks and publish only to an authorized sandbox target.",
      "Verify the returned deployment and record rollback steps."
    ],
    "independent": "Explain how to restore the previous working version.",
    "transfer": "Rehearse rollback on a disposable project.",
    "pitfall": "Do not delete the only working backup or change the production origin casually.",
    "minutes": 40,
    "level": "Transfer & recovery",
    "prerequisite": "claude-14",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Claude Code quickstart",
        "url": "https://code.claude.com/docs/en/quickstart",
        "kind": "Written guide"
      },
      {
        "label": "Claude Code in Action",
        "url": "https://anthropic.skilljar.com/claude-code-in-action",
        "kind": "Official video course"
      }
    ],
    "checked": "2026-10-12"
  },
  {
    "id": "claude-16",
    "tool": "claude",
    "number": 16,
    "title": "Claude Code capstone",
    "objective": "Deliver a verified small change independently.",
    "explanation": "Competence means understanding the requirement, diff, checks and release boundary. An agent's success message is not the evidence.",
    "example": "Improve one sandbox feature, inspect files, check behavior and write a short release record.",
    "guided": [
      "Choose a small feature and define acceptance examples.",
      "Implement with source review and meaningful checks.",
      "Document actual completion and remaining limits."
    ],
    "independent": "Demonstrate the change and explain recovery without a script.",
    "transfer": "Perform a similar change after a week.",
    "pitfall": "If verification is missing, label the task incomplete and finish the specific check.",
    "minutes": 40,
    "level": "Transfer & recovery",
    "prerequisite": "claude-15",
    "rubric": [
      "Explain the key idea in your own words.",
      "Produce the stated artifact accurately, with a source where relevant.",
      "Demonstrate the task without following the guided steps."
    ],
    "resources": [
      {
        "label": "Claude Code quickstart",
        "url": "https://code.claude.com/docs/en/quickstart",
        "kind": "Written guide"
      },
      {
        "label": "Claude Code in Action",
        "url": "https://anthropic.skilljar.com/claude-code-in-action",
        "kind": "Official video course"
      }
    ],
    "checked": "2026-10-12"
  }
];
