"use client";
import {useEffect, useState} from "react";
import {day, parseRuns, reviewQueue} from "@/lib/workflow-runs";

type View = {message:string; href:string; label:string; hidden:boolean};
const initial: View = {message:"Review your saved workflow checks or begin one bounded task.",href:"/workflow-studio/?view=run",label:"Open a guided run desk →",hidden:false};

export function WorkflowReview({shared=false}:{shared?:boolean}) {
  const [view,setView] = useState<View>(initial);
  const [publicView,setPublicView]=useState(shared);
  useEffect(() => {
    let cancelled = false,attempt=0;
    const privateNow=()=>!cancelled&&!shared&&new URLSearchParams(window.location.search).get('share')!=='1';
    async function refresh() {
      const ticket=++attempt;
      if(cancelled)return;
      setPublicView(!privateNow());
      if(!privateNow())return;
      try {
        const response = await fetch("/workflow-studio/missions.json");
        if(ticket!==attempt||!privateNow())return;
        if (!response.ok) throw Error("Workflow catalogue unavailable.");
        const config = await response.json();
        if(ticket!==attempt||!privateNow())return;
        const raw = localStorage.getItem("atlas-workflow-runs-v1");
        const runs = raw === null ? [] : parseRuns(raw,"atlas",config.missions,day());
        const next = reviewQueue(runs,day())[0];
        const mission = next && config.missions.find((item:{id:string;title:string}) => item.id === next.missionId);
        if(ticket!==attempt||!privateNow())return;
        setView(next ? {
          message:next.label+" · "+mission.title+" · review date "+next.due+". Workflow observations remain separate from curriculum evidence.",
          href:"/workflow-studio/?view=review#"+next.missionId,
          label:"Review the next workflow action →",hidden:false,
        } : {...initial,message:runs.length+" completed workflow runs recorded. Choose a task and inspect its actual output before recording another result."});
      } catch {
        if(ticket===attempt&&privateNow())setView({message:"Saved workflow runs could not be read safely. Existing bytes remain unchanged; use the studio’s export and recovery controls.",href:"/workflow-studio/?view=review",label:"Open workflow recovery →",hidden:false});
      }
    }
    queueMicrotask(()=>{if(!cancelled)void refresh();});
    const onStorage = (event:StorageEvent) => {if (event.key === "atlas-workflow-runs-v1" || event.key === null) void refresh();};
    window.addEventListener("storage",onStorage);
    const onNavigation=()=>void refresh();window.addEventListener('popstate',onNavigation);window.addEventListener('hashchange',onNavigation);
    return () => {cancelled = true;attempt++;window.removeEventListener("storage",onStorage);window.removeEventListener('popstate',onNavigation);window.removeEventListener('hashchange',onNavigation);};
  },[shared]);
  if(shared||publicView)return <section id="workflow-practice-review" className="workflow-review-home"><h3>Workflow practice</h3><p>Public method; private workflow observations and review dates are hidden.</p></section>;
  if (view.hidden) return null;
  return <section id="workflow-practice-review" className="workflow-review-home" aria-labelledby="workflow-review-heading"><h3 id="workflow-review-heading">Continue your workflow practice</h3><p>{view.message}</p><a href={view.href}>{view.label}</a></section>;
}
