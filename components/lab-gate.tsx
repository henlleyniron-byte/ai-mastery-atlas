"use client";

import {Component,lazy,useEffect,useState,Suspense,type ComponentType,type ReactNode} from "react";

export const labCatalog=[
  {id:"beginner-academy",title:"Beginner Academy",description:"48 practical lessons in Notion, RemNote, Claude Code and reliable tool use.",aliases:[]},
  {id:"evaluation-workbench",title:"Evaluation Workbench",description:"Inspect outputs against a frozen task, explicit rubric and critical failure checks.",aliases:["learning-science"]},
  {id:"knowledge-studio",title:"Knowledge Systems Studio",description:"Assign each tool a job, practise its workflow and test export and recovery.",aliases:[]},
  {id:"paper-analysis-studio",title:"Paper Analysis Studio",description:"Audit exact MCQ sources, review classifications, expose coverage gaps and prepare a constrained analysis brief.",aliases:[]},
  {id:"operator-core",title:"Operator Core",description:"Route a bounded task, inspect authority and constraints, then judge the result.",aliases:[]},
] as const;

export function matchesLabTarget(id:string,aliases:readonly string[],hash:string){const target=hash.replace(/^#/,"");return target===id||aliases.includes(target)||target.startsWith(id+"-");}

class LabBoundary extends Component<{children:ReactNode;fallback:(retry:()=>void)=>ReactNode},{failed:boolean}>{
  state={failed:false};static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?this.props.fallback(()=>this.setState({failed:false})):this.props.children;}
}

function LabReady({id,aliases,focusRequested,children}:{id:string;aliases:readonly string[];focusRequested:boolean;children:ReactNode}){
  useEffect(()=>{const linked=matchesLabTarget(id,aliases,location.hash);if(linked||focusRequested){const target=linked?location.hash.slice(1):id;requestAnimationFrame(()=>{const anchor=document.getElementById(target)||document.getElementById(id);if(!anchor)return;const editing=document.activeElement?.matches('input,textarea,select,[contenteditable="true"]');if(editing)return;anchor.scrollIntoView({block:"start"});const heading=anchor.querySelector<HTMLElement>('h2,h3')||anchor;heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});});}},[id,aliases,focusRequested]);
  return children;
}

export function LabGate<P extends object>({id,load,componentProps}:{id:typeof labCatalog[number]["id"];load:()=>Promise<{default:ComponentType<P>}>;componentProps:P}){
  const item=labCatalog.find(lab=>lab.id===id)!;
  const [opened,setOpened]=useState(false),[retryKey,setRetryKey]=useState(0),[focusRequested,setFocusRequested]=useState(false);
  const [Loaded,setLoaded]=useState(()=>lazy(load));
  useEffect(()=>{const reveal=()=>{if(matchesLabTarget(id,item.aliases,location.hash))setOpened(true);};reveal();window.addEventListener("hashchange",reveal);return()=>window.removeEventListener("hashchange",reveal);},[id,item.aliases]);
  const shell=(loading=false,retry?:()=>void)=><section id={id} className="page-section lab-gateway" aria-labelledby={`${id}-gateway-title`} aria-busy={loading}><div><p className="section-kicker">SPECIALIST WORKSPACE / OPEN WHEN NEEDED</p><h2 id={`${id}-gateway-title`} className="section-title">{item.title}</h2><p className="section-intro">{item.description}</p><p className="lab-gateway-note">{loading?"Opening this workspace…":retry?"This workspace could not load. Your existing record has not been replaced. Try again or reload the page.":"Opens on demand. Once opened, the workspace stays mounted so your in-progress draft is preserved while you explore."}</p></div>{!loading?<button type="button" aria-expanded={false} onClick={()=>{setFocusRequested(true);if(retry){setLoaded(lazy(load));setRetryKey(value=>value+1);retry();}else setOpened(true);}}>{retry?"Retry workspace":"Open "+item.title+" →"}</button>:<span role="status">Loading workspace…</span>}{item.aliases.map(alias=><span id={alias} key={alias} className="lab-gateway-anchor"/>)}</section>;
  return <div className="lab-gate" data-lab={id} data-open={opened}>{opened?<LabBoundary key={retryKey} fallback={retry=>shell(false,retry)}><Suspense fallback={shell(true)}><LabReady id={id} aliases={item.aliases} focusRequested={focusRequested}><Loaded {...componentProps}/></LabReady></Suspense></LabBoundary>:shell()}</div>;
}
