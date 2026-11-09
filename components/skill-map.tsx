"use client";

import {useMemo,useState} from "react";
import type {Curriculum,LearningState} from "@/lib/learning-state";
import {buildSkillMap} from "@/lib/learning-workspace";
import type {UnitDetail} from "@/components/v4-command-centre";

export function SkillMap({curriculum,details,state,today,privateUnavailable,onOpenUnit}:{curriculum:Curriculum;details:Record<string,UnitDetail>;state:LearningState;today:string;privateUnavailable:boolean;onOpenUnit:(id:string)=>void}){
  const [query,setQuery]=useState("");const [stage,setStage]=useState("all");const [track,setTrack]=useState("all");const [count,setCount]=useState(12);
  const rows=useMemo(()=>buildSkillMap(state,curriculum,today),[state,curriculum,today]);
  const tracks=useMemo(()=>Array.from(new Map(curriculum.units.map(unit=>[unit.trackId,details[unit.id]?.trackCode+" · "+details[unit.id]?.trackTitle])).entries()),[curriculum,details]);
  const words=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const filtered=rows.filter(row=>(track==="all"||row.unit.trackId===track)&&(privateUnavailable||stage==="all"||(stage==="locked"?row.unmet.length>0&&!row.canRecord:stage==="available"?row.canRecord:row.progress.stage===stage))&&words.every(word=>`${row.unit.title} ${details[row.unit.id]?.trackCode} ${details[row.unit.id]?.trackTitle} ${details[row.unit.id]?.objective}`.toLowerCase().includes(word)));
  const reset=()=>setCount(12);
  return <div className="skill-map" aria-labelledby="skill-map-title"><div className="skill-map-heading"><div><p className="section-kicker">V12 / COMPLETE SKILL MAP</p><h2 id="skill-map-title">Find your next demonstrable skill.</h2><p>Inspect every module and project, its prerequisites and the criterion for a useful result.</p></div><span>{curriculum.units.length} curriculum tasks</span></div>
    <div className="skill-map-controls"><label>Find a curriculum task<input type="search" placeholder="Task, track or learning objective" value={query} onChange={e=>{setQuery(e.target.value);reset();}}/></label><label>Track<select value={track} onChange={e=>{setTrack(e.target.value);reset();}}><option value="all">All tracks</option>{tracks.map(([id,title])=><option key={id} value={id}>{title}</option>)}</select></label><label>Evidence stage<select value={privateUnavailable?"all":stage} disabled={privateUnavailable} onChange={e=>{setStage(e.target.value);reset();}}><option value="all">All stages</option><option value="available">Action available</option><option value="locked">Prerequisite locked</option>{["Unseen","Learned","Practised","Demonstrated","Transferred","Retest Due","Needs Repair","Mastered"].map(value=><option key={value}>{value}</option>)}</select></label></div>
    <p className="lw-note" role="status">{filtered.length} tasks match · showing {Math.min(count,filtered.length)}.{privateUnavailable?" Private evidence stages are hidden; the public curriculum remains available.":" Inspection awards no progress and never bypasses prerequisites."}</p>
    <div className="skill-map-grid">{filtered.slice(0,count).map(({unit,progress,unmet,canRecord})=><article key={unit.id}><div className="skill-map-card-top"><span>{details[unit.id]?.trackCode} / {unit.kind}</span>{!privateUnavailable?<strong data-locked={!canRecord}>{progress.stage}</strong>:null}</div><h3>{unit.title}</h3><p>{details[unit.id]?.objective}</p><p className="skill-map-check"><b>Pass criterion:</b> {details[unit.id]?.passCriterion}</p>{!privateUnavailable&&unmet.length?<p className="skill-map-lock">{unmet.length} prerequisite{unmet.length===1?"":"s"} to inspect{canRecord?"; existing review work is available":" before new task evidence"}.</p>:null}{!privateUnavailable&&progress.due?<p className="skill-map-date">Delayed check: <time>{progress.due}</time></p>:null}<button type="button" aria-label={`Inspect ${unit.title} and prerequisites`} onClick={()=>onOpenUnit(unit.id)}>Inspect task & prerequisites →</button></article>)}</div>
    {!filtered.length?<p className="lw-empty">No task matches. Try a shorter term, another track or All stages.</p>:null}
    <div className="skill-map-footer">{filtered.length>count?<button type="button" onClick={()=>setCount(value=>value+12)}>Show next 12 tasks</button>:null}<button type="button" onClick={()=>{setQuery("");setTrack("all");setStage("all");reset();}}>Reset task filters</button></div>
  </div>;
}
