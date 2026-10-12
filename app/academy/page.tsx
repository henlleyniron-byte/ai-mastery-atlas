"use client";

import { useEffect, useMemo, useState } from "react";
import { academyLessons, academyResources, type AcademyTrack } from "@/lib/v6-academy-lessons";
import { guidedWorkshops } from "@/lib/v6-guided-workshops";

type Stage = "Not started" | "Viewed" | "Practised" | "Independently demonstrated" | "Retained";
type Evidence = { stage: Stage; independentNote: string; independentAt: string; delayedNote: string; delayedAt: string };
type Records = Record<string, Evidence>;
const KEY = "ai-mastery-atlas:v6-academy-preview:1";
const empty: Evidence = { stage: "Not started", independentNote: "", independentAt: "", delayedNote: "", delayedAt: "" };
const order: Stage[] = ["Not started", "Viewed", "Practised", "Independently demonstrated", "Retained"];
const starterExamples: Record<string, { mental: string; guided: string[]; independent: string; rubric: string[]; repair: string }> = {
  N01: {
    mental: "A workspace is a building; a page is a room; a block is one editable item inside a room. A database is a collection of structured entries. A view is just a way of looking at those same entries.",
    guided: ["Open your existing Notion workspace without changing its structure.", "Find the page containing your Paper & Marks Engine.", "Identify one database entry and one property such as a date or subject.", "Locate the related source link, if one exists. Do not add a dummy exam result."],
    independent: "Without referring to these steps, find the Paper & Marks Engine again and explain where plans, sources, actual paper attempts and verified errors belong.",
    rubric: ["Names a page, block, database, entry and view accurately.", "Finds the existing Paper & Marks Engine without cloning it.", "Does not mislabel a planned activity as a completed attempt."],
    repair: "If a view appears to be missing a row, first clear filters before creating a duplicate database."
  },
  R01: {
    mental: "Notion organizes evidence and tasks. RemNote/Anki are spaced-retrieval systems. A flashcard is a small question you try to answer before revealing it; creating many cards is not the same as retaining knowledge.",
    guided: ["Choose one verified Biology fact from an actual diagnosed error.", "Decide whether a flashcard would help, or whether an exam-style question is the better test.", "Check whether this fact already has an Anki or RemNote card.", "Write one clear question and one source-verified answer in a temporary note."],
    independent: "Explain which single flashcard system owns that fact and answer an unseen related exam question without help.",
    rubric: ["The answer is verifiable against the source.", "The card asks one unambiguous question.", "No duplicate deck or competing master tracker was created."],
    repair: "If the question is guessable from wording or the answer is debatable, rewrite it before scheduling review."
  },
  C01: {
    mental: "Claude chat is a conversational interface; Claude Code is an agent that can inspect and change project files. An API is a separately metered integration. Having a subscription does not prove access to every model or API.",
    guided: ["Open a disposable practice folder; do not use your live A/L projects.", "Write down which operations are read-only, which edit files and which publish externally.", "Ask a coding tool to explain a harmless sample file without authorizing changes.", "Verify the explanation by reading the source file yourself."],
    independent: "Explain to someone else the difference between a chat, coding agent, API and deployment, and identify which actions should require explicit permission.",
    rubric: ["Distinguishes files, model access, subscription and API billing.", "Can point to the source of one independently verified claim.", "Does not expose credentials or allow a first exercise to publish."],
    repair: "If an instruction includes an unfamiliar command, explain its effect and review its permissions before executing it."
  }
};
function validRecord(value: unknown): Evidence {
  if (!value || typeof value !== "object") return { ...empty };
  const raw = value as Record<string, unknown>;
  const stage = order.includes(raw.stage as Stage) ? raw.stage as Stage : "Not started";
  return {
    stage,
    independentNote: typeof raw.independentNote === "string" ? raw.independentNote.slice(0, 2000) : "",
    independentAt: typeof raw.independentAt === "string" ? raw.independentAt : "",
    delayedNote: typeof raw.delayedNote === "string" ? raw.delayedNote.slice(0, 2000) : "",
    delayedAt: typeof raw.delayedAt === "string" ? raw.delayedAt : ""
  };
}
export default function AcademyPage() {
  const [track, setTrack] = useState<AcademyTrack>("Notion");
  const [selectedId, setSelectedId] = useState("N01");
  const [records, setRecords] = useState<Records>({});
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [independentNote, setIndependentNote] = useState("");
  const [delayedNote, setDelayedNote] = useState("");
  const [message, setMessage] = useState("");
  const filtered = useMemo(() => academyLessons.filter(x => x.track === track), [track]);
  const selected = academyLessons.find(x => x.id === selectedId) ?? filtered[0];
  const active = records[selected.id] ?? empty;
  const example = starterExamples[selected.id] ?? guidedWorkshops[selected.id];
  const practised = filtered.filter(x => order.indexOf((records[x.id] ?? empty).stage) >= 2).length;
  const demonstrated = filtered.filter(x => order.indexOf((records[x.id] ?? empty).stage) >= 3).length;
  const retained = filtered.filter(x => (records[x.id] ?? empty).stage === "Retained").length;
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const safe: Records = {};
          for (const [id, value] of Object.entries(parsed)) {
            if (academyLessons.some(x => x.id === id)) safe[id] = validRecord(value);
          }
          setRecords(safe);
        }
      }
    } catch { setStorageError(true); }
    setReady(true);
  }, []);
  useEffect(() => {
    setIndependentNote(active.independentNote);
    setDelayedNote(active.delayedNote);
    setMessage("");
  }, [selectedId, active.independentNote, active.delayedNote]);
  function store(id: string, next: Evidence) {
    const updated = { ...records, [id]: next };
    setRecords(updated);
    try { window.localStorage.setItem(KEY, JSON.stringify(updated)); setStorageError(false); }
    catch { setStorageError(true); }
  }
  function mark(stage: "Viewed" | "Practised") {
    if (order.indexOf(active.stage) > order.indexOf(stage)) { setMessage("A later evidence stage is already recorded."); return; }
    store(selected.id, { ...active, stage }); setMessage("Saved in this browser only. This is not a mastery claim.");
  }
  function demonstrate() {
    if (independentNote.trim().length < 20) { setMessage("Describe what you independently did, and what evidence you checked (at least 20 characters)."); return; }
    if (active.stage === "Retained") { setMessage("Already retained; changes require a new review cycle outside this preview."); return; }
    store(selected.id, { ...active, stage: "Independently demonstrated", independentNote: independentNote.trim().slice(0, 2000), independentAt: new Date().toISOString(), delayedNote: "", delayedAt: "" });
    setMessage("Self-reported independent demonstration recorded. Retention remains unverified until a delayed check.");
  }
  function retain() {
    const since = Date.parse(active.independentAt);
    if (active.stage !== "Independently demonstrated" || !Number.isFinite(since)) { setMessage("First record independent demonstration."); return; }
    if (Date.now() - since < 86400000) { setMessage("A delayed check is not due yet. Return at least 24 hours after independent demonstration."); return; }
    if (delayedNote.trim().length < 20) { setMessage("Describe a fresh, unaided delayed task and its result before marking retained."); return; }
    store(selected.id, { ...active, stage: "Retained", delayedNote: delayedNote.trim().slice(0, 2000), delayedAt: new Date().toISOString() });
    setMessage("Self-reported delayed check recorded. No external certification or independent verification is implied.");
  }
  function exportProgress() {
    const json = JSON.stringify({ format: "atlas-academy-preview-v1", exportedAt: new Date().toISOString(), records }, null, 2);
    const objectUrl = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a"); a.href = objectUrl; a.download = "atlas-academy-preview-export.json"; a.click();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    setMessage("Local export requested. Check the downloaded file; this preview has no restore/import feature.");
  }
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 text-slate-100">
      <a href="/" className="text-cyan-300 underline underline-offset-4">← AI Mastery Atlas home</a>
      <header className="my-7 rounded-3xl border border-cyan-500/30 bg-slate-900 p-6 sm:p-9">
        <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">V6 Academy preview · source branch</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-5xl">From complete beginner to independent operator</h1>
        <p className="mt-4 max-w-3xl text-slate-300">Choose Notion, RemNote or Claude Code. Each track has 16 structured guided workshops with a mental model, worked steps, an independent task, an explicit rubric and a repair strategy. Three starter lessons offer expanded walkthroughs. Current official-documentation checks and in-browser assessment remain necessary; <strong>these workshops are not independently accredited or fully validated courses</strong>. A viewed page never counts as mastery.</p>
        <p className="mt-3 text-sm text-amber-200">This preview saves only to this browser; it does not sync to Notion, RemNote, Anki or the main Atlas progress system. Do not type passwords, private messages, grades or medical information into evidence notes.</p>
      </header>
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Select learning track">
        {(["Notion", "RemNote", "Claude Code"] as AcademyTrack[]).map(t =>
          <button key={t} type="button" aria-pressed={track === t} onClick={() => { setTrack(t); setSelectedId(t === "Notion" ? "N01" : t === "RemNote" ? "R01" : "C01"); }}
            className={"rounded-xl border px-5 py-3 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200 " + (track === t ? "border-cyan-300 bg-cyan-900 text-white" : "border-slate-600 bg-slate-900 text-slate-300")}>{t}</button>)}
      </div>
      <div className="mb-6 grid grid-cols-3 gap-3" aria-label="Evidence stage totals for selected track">
        <div className="rounded-xl bg-slate-900 p-4"><div className="text-2xl font-bold">{practised}/16</div><span className="text-sm text-slate-300">Practised</span></div>
        <div className="rounded-xl bg-slate-900 p-4"><div className="text-2xl font-bold">{demonstrated}/16</div><span className="text-sm text-slate-300">Demonstrated*</span></div>
        <div className="rounded-xl bg-slate-900 p-4"><div className="text-2xl font-bold">{retained}/16</div><span className="text-sm text-slate-300">Delayed checks*</span></div>
      </div>
      <p className="mb-6 text-xs text-slate-400">* Self-reported only; the app does not independently verify evidence.</p>
      <div className="grid gap-5 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <nav aria-label={track + " lessons"} className="rounded-2xl border border-slate-700 bg-slate-900 p-3">
          <h2 className="px-2 py-2 text-lg font-bold">16-lesson route</h2>
          <div className="grid gap-1">
            {filtered.map(item => <button type="button" key={item.id} aria-current={selected.id === item.id ? "page" : undefined}
              onClick={() => setSelectedId(item.id)}
              className={"rounded-lg p-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200 " + (selected.id === item.id ? "bg-cyan-950 text-white" : "hover:bg-slate-800")}>
              <span className="mr-2 font-mono text-cyan-300">{item.id}</span>{item.title}
              <span className="mt-1 block text-xs text-slate-400">{(records[item.id] ?? empty).stage}{starterExamples[item.id] ? " · expanded starter" : " · guided workshop"}</span>
            </button>)}
          </div>
        </nav>
        <article className="rounded-2xl border border-slate-700 bg-slate-900 p-5 sm:p-8">
          <p className="text-sm uppercase tracking-widest text-cyan-300">{selected.id} · {starterExamples[selected.id] ? "Expanded starter lesson" : "Guided workshop"}</p>
          <h2 className="my-3 text-2xl font-bold">{selected.title}</h2>
          <p className="leading-7 text-slate-200">{selected.brief}</p>
          {example ? <div className="mt-6 space-y-5">
            <section><h3 className="font-bold text-cyan-200">Mental model</h3><p className="mt-2 text-slate-300">{example.mental}</p></section>
            <section><h3 className="font-bold text-cyan-200">Guided demonstration</h3><ol className="mt-2 list-decimal space-y-2 pl-5 text-slate-300">{example.guided.map((step, i) => <li key={i}>{step}</li>)}</ol></section>
            <section><h3 className="font-bold text-cyan-200">Independent transfer</h3><p className="mt-2 text-slate-300">{example.independent}</p></section>
            <section><h3 className="font-bold text-cyan-200">Pass rubric</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">{example.rubric.map((point, i) => <li key={i}>{point}</li>)}</ul></section>
            <section><h3 className="font-bold text-cyan-200">Common mistake and recovery</h3><p className="mt-2 text-slate-300">{example.repair}</p></section>
          </div> : <p className="mt-6 rounded-xl border border-amber-500/30 p-4 text-amber-100">This entry is a curriculum brief, not a finished tutorial. Consult the official reference below. Do not use the stage buttons as a substitute for an independently checked practical task.</p>}
          <div className="mt-6 rounded-xl bg-slate-800 p-4">
            <strong>Official source · verified link on {academyResources[track].verified}</strong>
            <p className="mt-2"><a href={academyResources[track].url} target="_blank" rel="noreferrer" className="text-cyan-300 underline underline-offset-4">{academyResources[track].title} ↗</a></p>
            <p className="mt-2 text-xs text-slate-400">Features, commands and pricing can change. Verify current documentation before acting.</p>
          </div>
          <section aria-label="Learning evidence" className="mt-8 border-t border-slate-700 pt-6">
            <h3 className="text-xl font-bold">Evidence, not just exposure</h3>
            <p className="my-2 text-sm text-slate-300">Current stage: <strong>{ready ? active.stage : "Loading local state..."}</strong>. Only you can attest to the quality of the work; a button is not proof.</p>
            <div className="my-4 flex flex-wrap gap-2"><button type="button" onClick={() => mark("Viewed")} className="rounded-lg bg-slate-700 px-4 py-2">Mark viewed</button><button type="button" onClick={() => mark("Practised")} className="rounded-lg bg-slate-700 px-4 py-2">Mark practised</button></div>
            <label htmlFor="independent-evidence" className="block font-semibold">Independent evidence description</label>
            <textarea id="independent-evidence" value={independentNote} onChange={e => setIndependentNote(e.target.value)} maxLength={2000} rows={3} className="my-2 w-full rounded-lg border border-slate-600 bg-slate-950 p-3" placeholder="Describe what you independently did and how you checked the result. No sensitive details."/>
            <button type="button" onClick={demonstrate} className="rounded-lg bg-cyan-700 px-4 py-2 font-semibold">Record independent demonstration</button>
            <label htmlFor="delayed-evidence" className="mt-5 block font-semibold">Fresh delayed check (at least 24 hours later)</label>
            <textarea id="delayed-evidence" value={delayedNote} onChange={e => setDelayedNote(e.target.value)} maxLength={2000} rows={3} className="my-2 w-full rounded-lg border border-slate-600 bg-slate-950 p-3" placeholder="Describe a NEW unaided task and its outcome."/>
            <button type="button" onClick={retain} className="rounded-lg border border-cyan-400 px-4 py-2 font-semibold">Record delayed check</button>
            {message && <p role="status" className="mt-4 text-sm text-amber-200">{message}</p>}
          </section>
        </article>
      </div>
      <footer className="mt-7 rounded-xl border border-slate-700 bg-slate-900 p-5 text-sm text-slate-300">
        <p>Local-first preview: evidence notes are not synchronized, accredited or independently verified. All 48 entries now have guided workshop material; N01, R01 and C01 have expanded starter demonstrations. Provider software details, exact lesson-specific source citations and live interactive assessment have not been fully validated.</p>
        <button type="button" onClick={exportProgress} className="mt-3 rounded-lg border border-slate-500 px-4 py-2 text-white">Export local preview state (JSON)</button>
        {storageError && <p role="alert" className="mt-3 text-red-300">Browser storage is unavailable or blocked. Entries may not survive a reload; export what you can.</p>}
      </footer>
    </main>
  );
}
