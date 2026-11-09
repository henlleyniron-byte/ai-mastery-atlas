"use client";

import {useEffect,useRef,useState} from "react";

export function SessionBriefDialog({text,date,onClose,shared=false}:{text:string;date:string;onClose:()=>void;shared?:boolean}){
  const dialog=useRef<HTMLDialogElement>(null),field=useRef<HTMLTextAreaElement>(null),download=useRef<HTMLAnchorElement>(null);
  const lifetime=useRef({mounted:false,shared}),objectUrl=useRef<string|null>(null);
  const [hidden,setHidden]=useState(shared);
  const [message,setMessage]=useState("");
  const privateNow=()=>lifetime.current.mounted&&!lifetime.current.shared&&new URLSearchParams(location.search).get('share')!=='1';
  const revoke=()=>{download.current?.removeAttribute('href');if(objectUrl.current){URL.revokeObjectURL(objectUrl.current);objectUrl.current=null;}};
  useEffect(()=>{lifetime.current={mounted:true,shared};const sync=()=>{if(!privateNow()){revoke();setHidden(true);return;}setHidden(false);};queueMicrotask(()=>{if(lifetime.current.mounted)sync();});window.addEventListener('popstate',sync);window.addEventListener('hashchange',sync);return()=>{lifetime.current.mounted=false;revoke();window.removeEventListener('popstate',sync);window.removeEventListener('hashchange',sync);};},[shared]);
  useEffect(()=>{if(hidden||!privateNow())return;const value=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));objectUrl.current=value;const link=download.current;if(link)link.href=value;dialog.current?.showModal();return()=>{link?.removeAttribute('href');if(objectUrl.current===value)objectUrl.current=null;URL.revokeObjectURL(value);};},[text,hidden,shared]);
  const copy=async()=>{if(!privateNow())return;try{await navigator.clipboard.writeText(text);if(privateNow())setMessage("Session brief copied. Keep any personal repair notes private.");}catch{if(!privateNow())return;field.current?.focus();field.current?.select();setMessage("Clipboard access is unavailable. The complete brief is selected; copy it manually.");}};
  if(hidden||shared)return null;
  return <dialog ref={dialog} className="session-brief-dialog" aria-labelledby="session-brief-title" onClose={onClose}><div className="session-brief-heading"><div><p className="section-kicker">YOUR SESSION / REVIEW BEFORE EXPORT</p><h2 id="session-brief-title">Take one clear task with you.</h2></div><button type="button" onClick={()=>dialog.current?.close()} aria-label="Close session brief">×</button></div><p>Planning only. This brief awards no progress. It may contain personal repair notes; keep it private.</p><label htmlFor="session-brief-text">Complete session brief<textarea ref={field} id="session-brief-text" value={text} readOnly rows={12}/></label><div className="session-brief-actions"><a ref={download} download={`atlas-private-session-brief-${date}.md`} onClick={event=>{if(!privateNow()){event.preventDefault();revoke();}}}>Download Markdown file</a><button type="button" onClick={copy}>Copy complete brief</button><button type="button" onClick={()=>dialog.current?.close()}>Back to learning</button></div><p role="status" aria-live="polite">{message||"If downloading is unavailable, copy the complete text above."}</p></dialog>;
}
