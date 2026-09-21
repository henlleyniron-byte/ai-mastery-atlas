"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, ExternalLink, Layers3, RotateCcw, ShieldCheck } from "lucide-react";

type ToolRoute = { id: string; name: string; role: string; caution: string; official: { label: string; url: string }[]; steps: { label: string; detail: string }[]; proof: string; transfer: string };

const routes: ToolRoute[] = [
  { id: "notion", name: "Notion", role: "Operations and a canonical project home", caution: "Do not make it a second copy of every note, file and task list.", official: [{ label: "Notion Academy", url: "https://academy.notion.com/" }], steps: [
    { label: "Start", detail: "Create a disposable pilot workspace with one Projects database. Use only: name, next action, status and source link." },
    { label: "Build", detail: "Make Inbox, Active, Waiting and Archived views of the same records—never four separate lists." },
    { label: "Test", detail: "Answer three lookup questions: What is next? What is waiting? Where did this record come from?" },
    { label: "Maintain", detail: "Use one small weekly-review template; archive finished pilots instead of endlessly redesigning dashboards." },
    { label: "Recover", detail: "Export the pilot, find three records in the export, then restore them in a fresh test workspace." },
  ], proof: "A screen recording or short note showing the four views, three lookup answers and a successful export/recovery check.", transfer: "Run the same architecture for a different bounded project without copying your original template blindly." },
  { id: "anki", name: "Anki", role: "Spaced retrieval for facts and procedures worth retaining", caution: "It is a recall engine, not a place to paste summaries or manufacture thousands of cards.", official: [{ label: "Anki Manual", url: "https://docs.ankiweb.net/" }], steps: [
    { label: "Start", detail: "Make one disposable deck with ten source-backed, atomic prompts. One card should test one retrievable idea." },
    { label: "Build", detail: "Write the answer before revealing it. Mark difficulty from recall quality, not from whether the answer looks familiar." },
    { label: "Test", detail: "Repair five vague, overloaded or answer-giving cards. Every repaired card must have one clear expected answer." },
    { label: "Maintain", detail: "Review to the schedule you can sustain; protect accuracy and card quality before chasing review counts." },
    { label: "Recover", detail: "Export the deck, import into a test profile or collection, and verify the prompts and scheduling data are present." },
  ], proof: "Ten atomic cards, five documented repairs and one delayed free-response check that is not simply another card review.", transfer: "Turn a new short source into five cards, then explain why each is more testable than its original sentence." },
  { id: "remnote", name: "RemNote", role: "Connected notes with built-in retrieval practice", caution: "Do not mistake linked pages or nested bullets for learning; retrieval still has to happen before the answer.", official: [{ label: "RemNote Help Centre", url: "https://help.remnote.com/en/" }], steps: [
    { label: "Start", detail: "Create one short document from a public or disposable source. Identify ten claims worth recalling." },
    { label: "Build", detail: "Turn the claims into clear prompts and link only relationships that improve later retrieval or navigation." },
    { label: "Test", detail: "Attempt the prompts without opening the source. Repair prompts that are ambiguous, too broad or give away the answer." },
    { label: "Maintain", detail: "Use document structure for meaning and spaced review for retention; do not duplicate the same note in a separate system." },
    { label: "Recover", detail: "Export the pilot and confirm that source notes and prompts can be found after an import or recovery rehearsal." },
  ], proof: "A ten-prompt source note, two repaired prompts and a short account of one connection that made retrieval or navigation better.", transfer: "Use the same method on a second source whose structure is different—such as a table, diagram or procedure." },
  { id: "xtiles", name: "xTiles", role: "Spatial planning and visual maps—not a hidden database", caution: "A beautiful board is not useful unless it answers a real navigation or planning question.", official: [{ label: "xTiles Help Centre", url: "https://help.xtiles.app/en/" }], steps: [
    { label: "Start", detail: "Choose a bounded visual problem: a project map, a research landscape or a weekly planning board." },
    { label: "Build", detail: "Create a small map where every tile links to a canonical note, source or action—not duplicated content." },
    { label: "Test", detail: "Use the map to answer three questions a plain list made slow or unclear." },
    { label: "Maintain", detail: "Remove decorative tiles and expired links at review time. Keep the board smaller than the project it represents." },
    { label: "Recover", detail: "Export the board or record its linked sources, then prove that its essential structure can be reconstructed." },
  ], proof: "A compact map with linked canonical records, three successful lookup tasks and one deliberate simplification.", transfer: "Map a different kind of problem—for example, switch from planning a project to comparing research sources." },
  { id: "notebooklm", name: "NotebookLM", role: "Source-grounded questioning and evidence synthesis", caution: "It is not your canonical home, a citation substitute or a replacement for retrieval practice.", official: [{ label: "NotebookLM Help", url: "https://support.google.com/notebooklm/" }], steps: [
    { label: "Start", detail: "Use a small, public or non-sensitive source set with a clear question you genuinely need to investigate." },
    { label: "Build", detail: "Ask one bounded question and trace every useful claim back to the relevant source passage." },
    { label: "Test", detail: "Identify one missing, weak or conflicting source rather than accepting a fluent synthesis as complete." },
    { label: "Maintain", detail: "Keep an evidence matrix outside the chat: claim, source, date, uncertainty and next verification action." },
    { label: "Recover", detail: "Recreate one conclusion from the original source passages without relying on the generated prose." },
  ], proof: "A five-claim evidence matrix, source passages for each supported claim and one explicitly unresolved uncertainty.", transfer: "Repeat the method on a new question with a different source mix and explain how your source selection changed." },
];

const journeys: Record<string, string[]> = {
  notion: ["Zero: name the one operational problem your workspace will solve.", "Setup: use one database and four views before adding templates.", "Daily use: capture one item, choose its next action, then retrieve it later.", "Intermediate: connect projects to sources without duplicating either.", "Advanced: build a small review system with deliberate archive rules.", "Maintenance: prune stale views and records weekly.", "Portability: export, recover and locate records without the original workspace."],
  anki: ["Zero: explain why retrieval beats rereading for a fact you need later.", "Setup: make ten atomic, source-backed prompts in one pilot deck.", "Daily use: answer before reveal and repair weak cards immediately.", "Intermediate: use cloze or image occlusion only when the cue stays precise.", "Advanced: identify leeches, suspend bad cards and protect a sustainable review load.", "Maintenance: review schedule, card quality and missed concepts—not just counts.", "Portability: export, import and independently reproduce the underlying knowledge."],
  remnote: ["Zero: choose one source that needs both notes and later recall.", "Setup: turn ten claims into direct prompts inside one small document.", "Daily use: retrieve before opening the source and repair unclear cues.", "Intermediate: link ideas only when a future question or route benefits.", "Advanced: use structure, tags and review queues without duplicating notes.", "Maintenance: prune ambiguous prompts and consolidate only proven duplicates.", "Portability: export, recover and find both the source note and the prompt."],
  xtiles: ["Zero: select a spatial problem that a plain list makes unclear.", "Setup: make a compact board linked to canonical notes or actions.", "Daily use: use the board to decide the next action or locate a source.", "Intermediate: map dependencies, alternatives or evidence without copying content.", "Advanced: design a reusable visual review for one recurring project type.", "Maintenance: remove decorative tiles and expired links.", "Portability: preserve the linked source map so the board can be rebuilt."],
  notebooklm: ["Zero: form one answerable question before adding sources.", "Setup: use a small, public or non-sensitive source set with known provenance.", "Daily use: trace each useful answer back to its cited passage.", "Intermediate: compare conflicting sources and record uncertainty explicitly.", "Advanced: maintain an external evidence matrix rather than a chat-only conclusion.", "Maintenance: replace stale or weak sources as the question changes.", "Portability: recreate a conclusion from original passages without generated prose."],
};

export function KnowledgeSystemsStudio() {
  const [selectedId, setSelectedId] = useState(routes[0].id);
  const selected = routes.find(route => route.id === selectedId) ?? routes[0];
  const journey = journeys[selected.id] ?? [];
  const selectIndex = (index: number) => setSelectedId(routes[(index + routes.length) % routes.length].id);
  return <section id="knowledge-studio" className="page-section knowledge-studio" aria-labelledby="knowledge-studio-title">
    <div className="knowledge-studio-heading"><div><div className="section-kicker">E7 practical studio · no extra hours claimed</div><h2 id="knowledge-studio-title" className="section-title">Master a knowledge tool by using, testing and recovering it.</h2><p className="section-intro">Pick one tool for a seven-day, non-private pilot. The aim is a reliable capability—not a perfectly decorated workspace or a collection of apps you never return to.</p></div><aside className="knowledge-studio-rule"><Layers3 aria-hidden="true" /><p><strong>Role before app.</strong> Choose one canonical home, add one recall system only when retention matters, and use a visual map only when it makes a real decision easier.</p></aside></div>
    <div className="knowledge-tool-tabs" role="tablist" aria-label="Knowledge tool practice routes">{routes.map((route, index) => <button key={route.id} id={`knowledge-tab-${route.id}`} type="button" role="tab" tabIndex={selected.id === route.id ? 0 : -1} aria-selected={selected.id === route.id} aria-controls={`knowledge-panel-${route.id}`} className={selected.id === route.id ? "active" : ""} onClick={() => setSelectedId(route.id)} onKeyDown={(event) => { if (event.key === "ArrowRight") { event.preventDefault(); selectIndex(index + 1); } if (event.key === "ArrowLeft") { event.preventDefault(); selectIndex(index - 1); } }}>{route.name}<span>{route.role}</span></button>)}</div>
    <article id={`knowledge-panel-${selected.id}`} className="knowledge-route" role="tabpanel" aria-labelledby={`knowledge-tab-${selected.id}`}><header><div><div className="knowledge-route-label">Use {selected.name} for</div><h3>{selected.role}</h3></div><p><ShieldCheck aria-hidden="true" /> {selected.caution}</p></header><div className="knowledge-journey" aria-label={`${selected.name} independent-use pathway`}><strong>Zero → independent use</strong><ol>{journey.map((stage) => <li key={stage}>{stage}</li>)}</ol></div><ol className="knowledge-steps">{selected.steps.map((step, index) => <li key={step.label}><span>{index + 1}</span><div><strong>{step.label}</strong><p>{step.detail}</p></div></li>)}</ol><div className="knowledge-evidence-grid"><div><CheckCircle2 aria-hidden="true" /><h4>Evidence that counts</h4><p>{selected.proof}</p></div><div><ArrowRight aria-hidden="true" /><h4>Transfer before calling it learned</h4><p>{selected.transfer}</p></div><div><RotateCcw aria-hidden="true" /><h4>Keep or remove</h4><p>Keep the tool only if it solved its assigned job with less friction than your prior method. Otherwise export the pilot and remove it from the workflow.</p></div></div><footer><strong>Official starting point</strong>{selected.official.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} <ExternalLink aria-hidden="true" /></a>)}</footer></article>
  </section>;
}
