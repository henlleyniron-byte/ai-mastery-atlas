import Trinity from './trinity-store.mjs';
import { importLearningState, type Curriculum } from './learning-state';
import { sanitizeStudioState } from './astra-studio';

const plain=(value:unknown):value is Record<string,unknown>=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value);
// Compare source fields with the interpreted record; extra fields are never silently discarded.
function retained(source:unknown,view:unknown):boolean {
 if(Array.isArray(source))return Array.isArray(view)&&source.length===view.length&&source.every((item,index)=>retained(item,view[index]));
 if(plain(source))return plain(view)&&Object.entries(source).every(([key,value])=>Object.hasOwn(view,key)&&retained(value,view[key]));
 return source===view;
}
export function preservationIssues(raw:unknown,curriculum:Curriculum,today:string):string[]{
 if(plain(raw)){const supported=['3','3.0','3.1','3.2','3.3','4.0','5.0'];for(const key of ['schemaVersion','version'])if(raw[key]!==undefined&&!supported.includes(String(raw[key])))return ['Unsupported stored schema requires review; original bytes are preserved.'];if(raw.schemaVersion!==undefined&&raw.version!==undefined&&String(raw.schemaVersion)!==String(raw.version)&&!(String(raw.schemaVersion)==='3.3'&&String(raw.version)==='4.0')&&!['3|3.0','3.0|3'].includes(String(raw.schemaVersion)+'|'+String(raw.version)))return ['Conflicting stored schema labels require review; original bytes are preserved.'];}
 const imported=importLearningState(raw,curriculum,today);if(imported.error||!imported.state)return [imported.error||'Saved record is unavailable.'];
 const issues=[...imported.warnings];if(!plain(raw))return ['Saved record is unreadable.'];
 const rootFields=new Set(['schemaVersion','version','route','units','legacyTracks','diagnostic','preferences','publicLabs','migration','atlasPreferences','trackProgress','studio','exportedAt','privacy','progress','statuses','depth','experience','goal','studentSafe','available']);
 for(const key of Object.keys(raw))if(!rootFields.has(key))issues.push('Unrecognized saved field retained in original: '+key);
 if(plain(raw.units))for(const [id,value]of Object.entries(raw.units)){if(!retained(value,imported.state.units[id]))issues.push('Original module fields require review: '+id);}
 for(const key of ['publicLabs','diagnostic','preferences','legacyTracks','migration'] as const)if(raw[key]!==undefined&&['4.0','5.0'].includes(String(raw.schemaVersion||raw.version))&&!retained(raw[key],imported.state[key]))issues.push('Original '+key+' fields require review.');
 if(raw.studio!==undefined&&!retained(raw.studio,sanitizeStudioState(raw.studio)))issues.push('Original Studio fields require review.');
 if(raw.atlasPreferences!==undefined){const p=raw.atlasPreferences;if(!plain(p)||Object.keys(p).some(key=>!['depth','experience','goal','studentSafe','available'].includes(key))||p.depth!==undefined&&!['Simple','Practical','Technical'].includes(String(p.depth))||p.studentSafe!==undefined&&typeof p.studentSafe!=='boolean')issues.push('Original interface preferences require review.');}
 return [...new Set(issues)];
}

export type RawCheckpoint={schema:'atlas-raw-checkpoint-v1';head:string;at:string};
export function checkpointWriter(storage:Pick<Storage,'getItem'|'setItem'> & Partial<Pick<Storage,'removeItem'>> & {keys?:()=>string[]},key:string,onProblem:(kind:'conflict'|'storage')=>void){
 let guard:ReturnType<typeof Trinity.open>|null=null,pending:string|null=null,paused=true,replacement=false;
 const adapter={getItem:(name:string)=>storage.getItem(name),setItem:(name:string,value:string)=>storage.setItem(name,value),keys:()=>typeof storage.keys==='function'?storage.keys():Object.keys(storage),removeItem:(name:string)=>{if(!storage.removeItem)throw Error('Storage coordination is unavailable.');storage.removeItem(name);}};
 const problem=(error:unknown)=>{paused=true;onProblem(/changed|overlap|claim|interrupted|pending/i.test(String(error))?'conflict':'storage');};
 return {
  isPaused(){return paused;},openedRaw(){return guard?.raw??null;},queuedRaw(){return pending;},
  resume(){try{guard=Trinity.open(adapter,key,{isolated:true,originalsKey:key+'__trinity_original_v1',checkpointSchema:'atlas-raw-checkpoint-v1',fallbacks:key==='atlas-v4-state'?['atlas-v33-state','atlas-v32-state','atlas-v31-state','atlas-v3-state']:[]});paused=guard.readOnly;if(paused)problem(guard.problem);return !paused;}catch(error){problem(error);return false;}},
  pause(){paused=true;},discard(){pending=null;},queue(value:string){pending=value;},
  approveReplacement(expected:string|null){
   if(!guard)throw Error('The recovery guard is unavailable. Keep this tab and export its current fields.');
   if(storage.getItem(key)!==expected)throw Error('Another tab changed the copy after the import preview. Review again.');
   // A reviewed replacement must not erase work waiting for the autosave timer.
   // Reuse the existing guarded checkpoint/original archive, including when an
   // unreadable old copy requires explicit replacement. Never evict recovery.
   if(pending!==null){
    const draft=pending;
    try{
     guard.replace(JSON.parse(draft));
     if(guard.readOnly||guard.raw!==draft)throw Error(guard.problem||'The current queued draft could not be preserved exactly.');
    }catch(error){problem(error);throw Error('Current work could not be preserved before replacement. '+String(error)+' Keep this tab and export all recovery copies.');}
    pending=null;
   }
   replacement=true;paused=false;
  },
  flush(){
   if(paused||pending===null||!guard)return false;
   const proposed=pending;
   try{
    const value=JSON.parse(proposed);if(replacement)guard.replace(value);else guard.save(value);
    if(guard.readOnly){problem(guard.problem);return false;}
    if(pending===proposed)pending=null;
    replacement=false;return true;
   }catch(error){problem(error);return false;}
  },
  copies(){const copies=guard?.copies();return {...copies,originalRaw:copies?.originalsRaw,queuedRaw:pending};}
 };
}
