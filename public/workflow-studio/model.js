export const FIELDS = ['scope','first','check','repair','transfer','next'];
export const LIMIT = 1000000;
export function validate(value, site, ids) {
 if (!value || value.schema !== site+'-workflow-drafts-v1' || !Array.isArray(value.drafts) || value.drafts.length>100) throw Error('This is not a compatible workflow backup.');
 const seen=new Set();
 return value.drafts.map(d=>{
  if(!d || !ids.includes(d.id) || seen.has(d.id)) throw Error('Unknown or duplicate workflow ID.');
  seen.add(d.id); const out={id:d.id};
  for(const f of FIELDS){if(typeof d[f]!=='string'||d[f].length>6000)throw Error('A note is missing or exceeds 6,000 characters.');out[f]=d[f];}
  return out;
 });
}
export function parse(text, site, ids){
 if(typeof text!=='string'||new TextEncoder().encode(text).length>LIMIT)throw Error('Choose a backup below 1 MB.');
 return validate(JSON.parse(text,(k,v)=>{if(['__proto__','prototype','constructor'].includes(k))throw Error('Unsafe backup key.');return v;}),site,ids);
}
export function merge(current,incoming){
 const map=new Map(current.map(d=>[d.id,d]));
 for(const d of incoming){if(map.has(d.id)&&JSON.stringify(map.get(d.id))!==JSON.stringify(d))throw Error('A workflow has conflicting notes. Export both copies and reconcile them manually; nothing was replaced.');map.set(d.id,d);}
 return [...map.values()];
}
export function snapshot(site,drafts){return JSON.stringify({schema:site+'-workflow-drafts-v1',drafts},null,2);}
export function persist(storage,key,baseline,text){
 if(storage.getItem(key)!==baseline)throw Error('Another tab changed these notes. Export this draft and reload before saving.');
 if(baseline!==null)storage.setItem(key+'-recovery',baseline);
 storage.setItem(key,text);return text;
}
export function blank(id){return Object.fromEntries([['id',id],...FIELDS.map(f=>[f,''])]);}
export function filterMissions(missions,group,query){const q=query.trim().toLowerCase();return missions.filter(m=>(group==='All'||m.group===group)&&[m.title,m.group,m.level,m.brief].join(' ').toLowerCase().includes(q));}
