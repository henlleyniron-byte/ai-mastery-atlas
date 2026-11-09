export function newRunId(api=globalThis.crypto){if(typeof api?.randomUUID==='function')return api.randomUUID();if(typeof api?.getRandomValues!=='function')throw Error('Secure random IDs are unavailable. Export your draft and retry in a supported browser.');const bytes=new Uint8Array(16);api.getRandomValues(bytes);return 'run-'+Array.from(bytes,n=>n.toString(16).padStart(2,'0')).join('');}
export const RUN_LIMIT=2_000_000;
export const KINDS=['baseline','repair','transfer','retest'];
export const ASSISTANCE=['none','hints','worked-example','ai-assisted'];
export const REVIEWERS=['self','human','deterministic'];
export const RETEST_DAYS=7; // This workbench's declared retention protocol, not a universal learning law.
export function day(now=new Date()){const p=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Colombo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);return ['year','month','day'].map(k=>p.find(v=>v.type===k).value).join('-');}
export function realDay(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;}
export function plusDays(s,n){if(!realDay(s)||!Number.isInteger(n))throw Error('Invalid review date.');const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
function text(v,key,max,min=0){if(typeof v[key]!=='string'||v[key].trim().length<min||v[key].length>max)throw Error('Check the '+key+' field ('+min+'–'+max+' characters).');return v[key].trim();}
export function validateRuns(value,site,missions,today=day()){
 if(!realDay(today)||!value||value.schema!==site+'-workflow-runs-v1'||!Array.isArray(value.runs)||value.runs.length>1000)throw Error('Wrong run backup format or too many records.');
 const seen=new Set(),known=new Map(missions.map(m=>[m.id,m]));
 const runs=value.runs.map(v=>{
  if(!v||typeof v!=='object'||Array.isArray(v)||!known.has(v.missionId)||!KINDS.includes(v.kind)||!ASSISTANCE.includes(v.assistance)||!REVIEWERS.includes(v.reviewer))throw Error('Unknown workflow, run kind, assistance or reviewer.');
  const id=text(v,'id',150,1);if(seen.has(id))throw Error('Duplicate run IDs.');seen.add(id);
  if(!realDay(v.date)||v.date>today)throw Error('Use the actual completed date, not a future date.');
  if(v.minutes!==null&&(!Number.isInteger(v.minutes)||v.minutes<0||v.minutes>600))throw Error('Actual minutes must be 0–600, or unknown.');
  const checks=known.get(v.missionId).checks;
  if(!Array.isArray(v.checks)||v.checks.length!==checks.length)throw Error('Every rubric item needs a recorded check status.');
  if(typeof v.critical!=='boolean')throw Error('Record the critical-failure flag.');
  const record={critical:v.critical,criticalNote:text(v,'criticalNote',2000,v.critical?20:0),id,missionId:v.missionId,kind:v.kind,date:v.date,assistance:v.assistance,reviewer:v.reviewer,minutes:v.minutes,sourceId:text(v,'sourceId',150),task:text(v,'task',1500,12),artifact:text(v,'artifact',2000,12),source:text(v,'source',2000,8),system:text(v,'system',150,1),notes:text(v,'notes',3000,12),next:text(v,'next',1500,8),changed:text(v,'changed',2000),checks:v.checks.map((c,i)=>{if(!c||c.criterion!==checks[i]||!['met','failed','unchecked'].includes(c.status))throw Error('Rubric text or check status does not match this workflow.');return {criterion:checks[i],status:c.status,evidence:text(c,'evidence',1500,c.status==='unchecked'?0:12)};})};
  if(v.due!==''&&(!realDay(v.due)||v.due<=v.date))throw Error('A review date must follow the recorded attempt.');record.due=v.due;
  if(record.kind==='baseline'&&record.sourceId)throw Error('A baseline cannot claim an earlier source run.');
  if(['transfer','retest'].includes(record.kind)&&record.changed.length<20)throw Error('Describe the changed task or context in at least 20 characters.');
  return record;
 });
 const map=new Map(runs.map(r=>[r.id,r]));
 for(const r of runs){
  if(r.kind==='baseline')continue;
  const base=map.get(r.sourceId);if(!base||base.kind!=='baseline'||base.missionId!==r.missionId||base.date>r.date)throw Error('Link this check to an earlier baseline in the same workflow.');
  if(r.kind==='retest'){
   const transfers=runs.filter(t=>t.sourceId===base.id&&t.kind==='transfer'&&independentMet(t)&&plusDays(t.date,RETEST_DAYS)<=r.date);
   if(!transfers.length)throw Error('An independent retest with all checks met requires a recorded independent transfer at least seven complete days earlier.');
  }
 }
 return runs;
}
export function parseRuns(raw,site,missions,today=day()){
 if(typeof raw!=='string'||new TextEncoder().encode(raw).length>RUN_LIMIT)throw Error('Choose a run backup below 2 MB.');
 return validateRuns(JSON.parse(raw,(k,v)=>{if(['__proto__','prototype','constructor'].includes(k))throw Error('Unsafe backup key.');return v;}),site,missions,today);
}
export function runSnapshot(site,runs){return JSON.stringify({schema:site+'-workflow-runs-v1',runs},null,2);}
export function mergeRuns(a,b){const map=new Map(a.map(r=>[r.id,r]));for(const r of b){if(map.has(r.id)&&JSON.stringify(map.get(r.id))!==JSON.stringify(r))throw Error('Conflicting run ID. Existing results were preserved.');map.set(r.id,r);}if(map.size>1000)throw Error('The combined history exceeds 1,000 runs.');return [...map.values()];}
export function independentMet(r){return !r.critical&&r.assistance==='none'&&r.checks.length>0&&r.checks.every(c=>c.status==='met');}
export function outcome(r){if(r.critical)return 'Critical failure · repair required';if(r.checks.some(c=>c.status==='failed'))return 'Repair needed';if(r.checks.some(c=>c.status==='unchecked'))return 'Checks incomplete';if(r.assistance!=='none')return 'Assisted practice';return 'Checks recorded met';}
export function reviewQueue(runs,today=day()){
 const out=[];
 for(const base of runs.filter(r=>r.kind==='baseline')){
  const chain=runs.filter(r=>r.id===base.id||r.sourceId===base.id).map((r,i)=>({r,i})).sort((a,b)=>a.r.date.localeCompare(b.r.date)||a.i-b.i).map(x=>x.r),latest=chain.at(-1);
  if(latest.kind==='retest'&&independentMet(latest))continue;
  let kind='repair',label=outcome(latest),due=latest.due||today;
  if(independentMet(latest)){if(latest.kind==='transfer'){kind='retest';due=[plusDays(latest.date,RETEST_DAYS),latest.due||''].sort().at(-1);label=due<=today?'Delayed check due':'Delayed check scheduled';}else{kind='transfer';label='Try fresh transfer';}}
  else if(latest.checks.some(c=>c.status==='unchecked')){kind='repair';label='Finish the evidence check';}
  out.push({baselineId:base.id,missionId:base.missionId,kind,due,label,task:base.task,priority:due<=today?0:1,latestId:latest.id});
 }
 return out.sort((a,b)=>a.priority-b.priority||a.due.localeCompare(b.due));
}
const normalized=s=>s.trim().replace(/\s+/g,' ');
export function compareRuns(a,b){
 if(!a||!b||a.id===b.id)throw Error('Choose two different runs.');
 const reasons=[];if(a.missionId!==b.missionId)reasons.push('different workflows');if(a.kind!==b.kind)reasons.push('different run kinds');if(normalized(a.task)!==normalized(b.task))reasons.push('different declared tasks');if(normalized(a.source)!==normalized(b.source))reasons.push('different source-pack descriptions');if(a.assistance!==b.assistance)reasons.push('different assistance conditions');if(a.reviewer!==b.reviewer)reasons.push('different reviewer types');
 return {matched:!reasons.length,reasons,rows:[a,b].map(r=>({id:r.id,system:r.system,met:r.checks.filter(c=>c.status==='met').length,failed:r.checks.filter(c=>c.status==='failed').length,unchecked:r.checks.filter(c=>c.status==='unchecked').length,minutes:r.minutes,outcome:outcome(r)}))};
}
export function handoff(run,mission){return '# '+mission.title+' — recorded workflow run\n\nDate: '+run.date+'\nKind: '+run.kind+'\nSystem/method: '+run.system+'\nAssistance: '+run.assistance+'\nReviewer: '+run.reviewer+' (reported)\nActual minutes: '+(run.minutes??'unknown')+'\nOriginal baseline: '+(run.sourceId||run.id)+'\n\n## Task\n'+run.task+'\n\n## Artifact reference\n'+run.artifact+'\n\n## Checking source / method\n'+run.source+'\n\n## Rubric observations\n'+run.checks.map(c=>'- '+c.criterion+' — '+c.status+'\n  '+c.evidence).join('\n')+'\n\n## Observed result\n'+run.notes+'\nCritical failure: '+(run.critical?run.criticalNote:'none recorded')+'\n\n## Changed context\n'+(run.changed||'Not recorded')+'\n\n## Next action\n'+run.next+'\nReview due: '+(run.due||'not scheduled')+'\n\nThese are user-recorded observations. The site has not inspected the external artifact, verified reviewer identity or certified subject mastery.\n';}
