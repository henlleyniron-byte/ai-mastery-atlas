"use client";

import {useCallback,useEffect,useRef,useState,type Dispatch,type SetStateAction} from "react";
import type {checkpointWriter} from "@/lib/storage-preservation";

type Writer=ReturnType<typeof checkpointWriter>;
type ImportToken={generation:number;writer:Writer;head:string|null};

/** Captured private actions consult the current view and their mounted owner. */
export function useLivePrivateView(shared=false){
  const scope=useRef({mounted:false,shared});
  useEffect(()=>{const current=scope.current;current.mounted=true;return()=>{current.mounted=false;};},[]);
  useEffect(()=>{scope.current.shared=shared;},[shared]);
  return useCallback(()=>scope.current.mounted&&!scope.current.shared&&new URLSearchParams(location.search).get("share")!=="1",[]);
}

/** In-memory operation lifetime only: no storage, file reads or schema changes. */
export function useCoreImportGuard(shared:boolean){
  const lifetime=useRef({mounted:false,shared,generation:0,observedShared:false});
  const [revision,setRevision]=useState(0),[reading,setReading]=useState(false);
  const invalidate=useCallback(()=>{const state=lifetime.current;state.generation++;setRevision(state.generation);setReading(false);},[]);
  const privateNow=useCallback(()=>{const current=lifetime.current;if(!current.mounted)return false;if(current.shared||new URLSearchParams(location.search).get("share")==="1"){if(!current.observedShared){current.observedShared=true;invalidate();}return false;}current.observedShared=false;return true;},[invalidate]);
  useEffect(()=>{const state=lifetime.current;state.mounted=true;const retire=()=>invalidate();window.addEventListener("popstate",retire);window.addEventListener("hashchange",retire);return()=>{state.mounted=false;state.generation++;window.removeEventListener("popstate",retire);window.removeEventListener("hashchange",retire);};},[invalidate]);
  useEffect(()=>{lifetime.current.shared=shared;invalidate();},[shared,invalidate]);
  const canStart=useCallback((renderRevision:number,writer:Writer|null)=>privateNow()&&lifetime.current.generation===renderRevision&&writer!==null,[privateNow]);
  const begin=useCallback((renderRevision:number,writer:Writer):ImportToken|null=>{if(!canStart(renderRevision,writer))return null;const generation=++lifetime.current.generation;setRevision(generation);setReading(true);return {generation,writer,head:writer.queuedRaw()??writer.openedRaw()};},[canStart]);
  const active=useCallback((token:ImportToken,writer:Writer|null)=>privateNow()&&lifetime.current.generation===token.generation&&writer===token.writer,[privateNow]);
  const current=useCallback((token:ImportToken,writer:Writer|null)=>active(token,writer)&&writer!==null&&(writer.queuedRaw()??writer.openedRaw())===token.head,[active]);
  const finish=useCallback((token:ImportToken)=>{if(lifetime.current.generation===token.generation)invalidate();},[invalidate]);
  return {revision,reading,invalidate,canStart,begin,active,current,finish,privateNow};
}

/** Retire a pending read immediately, before React commits a child state update. */
export function useImportAwareState<T>(initial:T|(()=>T),invalidate:()=>void,canEdit:()=>boolean):[T,Dispatch<SetStateAction<T>>]{
  const [value,setValue]=useState(initial);
  const update=useCallback((next:SetStateAction<T>)=>{if(!canEdit())return;invalidate();setValue(next);},[invalidate,canEdit]);
  return [value,update];
}
