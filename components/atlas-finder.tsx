"use client";

import { useMemo, useState, type MouseEvent } from "react";

type TrackEntry = { id: string; title: string; detail: string; status: string; keywords?: string };
type SourceEntry = { id: string; title: string; detail: string; href: string };
type ModuleEntry = { id:string; title:string; detail:string; trackCode:string; status:string };
const sections = [
  { id: "beginner-academy", title: "Beginner Academy", detail: "Guided lessons in Notion, RemNote and Claude Code" },
  { id: "command-centre", title: "Learning Command Centre", detail: "Existing module evidence and next learning action" },
  { id: "queue", title: "Repairs & delayed retests", detail: "Review the existing track queue" },
  { id: "roadmap", title: "Complete curriculum", detail: "Every track, prerequisite and assessment" },
  { id: "subject-study-lab", title: "Subject Study Lab", detail: "Source-based Biology, Chemistry and Physics workflows" },
  { id: "paper-analysis-studio", title: "Paper Analysis Studio", detail: "MCQ paper analysis, provenance checks, topic classification, missing coverage and audit briefs" },
  { id: "frontier-update", title: "Flagship Model Lab", detail: "Compare Claude Fable 5.2, GPT-6 Astra and Gemini on a fixed task" },
  { id: "evaluation-workbench", title: "Evaluation Workbench", detail: "Check an output against explicit criteria" },
  { id: "knowledge-studio", title: "Knowledge Systems Studio", detail: "Turn sources into usable notes and retrieval" },
  { id: "library", title: "Source library", detail: "Official documents, reference materials and videos" },
  { id: "operator-core", title: "Operator Core", detail: "Practical operating rules and safe execution" },
  { id: "systems-lab", title: "Systems Lab", detail: "Local experiments and comparison evidence" },
];

export function AtlasFinder({ tracks, sources, modules, onModuleClick, onTrackClick, onSectionClick }: {
  tracks: TrackEntry[]; sources: SourceEntry[];
  modules:ModuleEntry[];onModuleClick:(id:string)=>void;
  onTrackClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  onSectionClick: () => void;
}) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const [visibleCount,setVisibleCount]=useState(12);
  const results = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matches = (entry: { title: string; detail: string; keywords?: string }) => words.every(word => `${entry.title} ${entry.detail} ${entry.keywords || ""}`.toLowerCase().includes(word));
    return [
      ...(scope === "all" || scope === "sections" ? sections.filter(matches).map(entry => ({ ...entry, kind: "Section", href: `#${entry.id}`, status: "" })) : []),
      ...(scope === "all" || scope === "tracks" ? tracks.filter(matches).map(entry => ({ ...entry, kind: "Track", href: `#track-${entry.id}` })) : []),
      ...(scope === "all" || scope === "modules" ? modules.filter(entry=>matches({...entry,keywords:entry.trackCode})).map(entry=>({...entry,kind:"Module",href:`?unit=${encodeURIComponent(entry.id)}#command-centre`})) : []),
      ...(scope === "all" || scope === "sources" ? sources.filter(matches).map(entry => ({ ...entry, kind: "Source", status: "" })) : []),
    ];
  }, [query, scope, tracks, sources, modules]);
  const visible = results.slice(0, query.trim() || scope !== "all" ? visibleCount : 4);
  return <section id="atlas-finder" className="atlas-finder page-section" aria-labelledby="atlas-finder-title">
    <div className="finder-heading"><div><div className="section-kicker">Find your place</div><h2 id="atlas-finder-title" className="section-title">One curriculum. A clear way in.</h2><p className="section-intro">Search sections, tracks, module objectives and sources together. A module result opens its exact task; labels reflect browser evidence, not certification.</p></div><a href="/workflow-studio/" className="finder-practice-link">I need a practical exercise →</a></div>
    <div className="finder-controls"><label htmlFor="atlas-finder-query">What do you want to learn?<input id="atlas-finder-query" type="search" value={query} onChange={event=>{setQuery(event.target.value);setVisibleCount(12);}} placeholder="Try source verification, Notion or evaluation" /></label><label htmlFor="atlas-finder-scope">Look in<select id="atlas-finder-scope" value={scope} onChange={event=>{setScope(event.target.value);setVisibleCount(12);}}><option value="all">Everything</option><option value="sections">Sections</option><option value="tracks">Tracks</option><option value="modules">Modules & objectives</option><option value="sources">Sources</option></select></label><button type="button" onClick={()=>{setQuery("");setScope("all");setVisibleCount(12);}}>Clear</button></div>
    <p className="finder-count" role="status" aria-live="polite">{query.trim() || scope !== "all" ? `${results.length} matches · showing ${visible.length}. Use Show more to inspect the remaining results.` : "Start with a section below, or search the complete index. Shortcut: Ctrl / ⌘ K."}</p>
    <div className="finder-results">{visible.map(entry=><a key={`${entry.kind}-${entry.id}`} href={entry.href} onClick={entry.kind==="Track"?onTrackClick:entry.kind==="Section"?onSectionClick:entry.kind==="Module"?event=>{event.preventDefault();onModuleClick(entry.id);}:undefined} {...(entry.kind==="Source"?{target:"_blank",rel:"noreferrer"}:{})}><span>{entry.kind}{entry.status?` · ${entry.status}`:""}</span><strong>{entry.title}{entry.kind==="Source"?" ↗":" →"}</strong><p>{entry.detail}</p></a>)}</div>
    {(query.trim()||scope!=="all")&&results.length>visible.length?<button type="button" className="finder-more" onClick={()=>setVisibleCount(count=>count+12)}>Show next matches</button>:null}
    {!results.length && <p className="finder-empty">No match in this index. Try a shorter concept or change the scope. The full roadmap and source library remain available.</p>}
    <div className="finder-progression"><a href="#beginner-academy" onClick={onSectionClick}><b>01 / LEARN</b>Follow a guided lesson</a><a href="/workflow-studio/"><b>02 / PRACTISE</b>Produce an inspectable result</a><a href="#command-centre" onClick={onSectionClick}><b>03 / REVIEW</b>Use existing evidence & retests</a></div>
  </section>;
}
