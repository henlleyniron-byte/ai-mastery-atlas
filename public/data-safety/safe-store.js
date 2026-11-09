(function(root){'use strict';
 const object=value=>value&&typeof value==='object'&&!Array.isArray(value),json=raw=>{const value=JSON.parse(raw);if(!object(value))throw Error('Saved data must be an object.');return value;};
 function open(storage,key,{validate=()=>{},fallbacks=[],originalsKey:customOriginalsKey,checkpointSchema='trinity-checkpoint-v1',isolated=false}={}){
  const checkpointKey=key+'__trinity_checkpoint_v1',originalsKey=customOriginalsKey||key+'__trinity_originals_v1',claimPrefix=key+'__trinity_claim_v1:';
  let baseline,raw=null,value=null,problem='',sourceKey=key,sourceBaseline=null,checkpoint=null,checkpointBaseline=null,openedClaims=[];
  const claims=()=>{if(typeof storage.keys!=='function'||typeof storage.removeItem!=='function')throw Error('Storage coordination is unavailable. Export before changing records.');return storage.keys().filter(k=>k.startsWith(claimPrefix)).sort().map(k=>{const bytes=storage.getItem(k);let data;try{data=json(bytes);}catch{}return {key:k,raw:bytes,data};});};
  const pending=rows=>rows.filter(row=>row.data?.schema!=='trinity-write-claim-v1'||typeof row.data.head!=='string'||row.data.head!==raw);
  try{
   baseline=storage.getItem(key);raw=baseline;if(raw===null)for(const oldKey of fallbacks){const candidate=storage.getItem(oldKey);if(candidate!==null){raw=candidate;sourceKey=oldKey;break;}}sourceBaseline=raw;
   checkpointBaseline=storage.getItem(checkpointKey);
   if(checkpointBaseline!==null){checkpoint=json(checkpointBaseline);if(checkpoint.schema!==checkpointSchema||typeof checkpoint.head!=='string')throw Error('The recovery checkpoint is unreadable.');if(checkpoint.mode!==undefined&&(checkpoint.mode!=='isolated-v1'||!isolated))throw Error('Unsupported recovery checkpoint mode.');}
   if(isolated&&checkpoint?.mode==='isolated-v1'){
    const parsed=json(checkpoint.head);validate(parsed);raw=checkpoint.head;value=parsed;
    if(checkpoint.legacySourceKey&&checkpoint.legacySourceKey!==key){sourceKey=checkpoint.legacySourceKey;sourceBaseline=storage.getItem(sourceKey);}
    if(checkpoint.legacyRaw!==baseline||checkpoint.legacySourceKey!==sourceKey||checkpoint.legacySourceRaw!==sourceBaseline)throw Error('An older version changed its separate saved copy. Both versions are preserved; export and review before continuing.');
   }else{
    if(raw!==null){const parsed=json(raw);validate(parsed);value=parsed;}
    if(checkpoint!==null&&baseline!==checkpoint.head)throw Error('A save was interrupted or another version changed the saved copy. Export both copies and review before replacing either.');
   }
   openedClaims=claims();if(pending(openedClaims).length)throw Error('An overlapping or interrupted write needs review. Export all pending copies before replacing data.');
  }catch(error){try{openedClaims=claims();}catch{}problem=error.message+' Saving is paused; original stored bytes are preserved.';}
  const check=(expectedCheckpoint=checkpointBaseline)=>{
   if(baseline===undefined)throw Error('Browser storage is unavailable. Export your current work before leaving.');
   if(sourceKey!==key&&storage.getItem(sourceKey)!==sourceBaseline)throw Error('A legacy source changed in another tab. Export both source copies before upgrading.');
   if(storage.getItem(key)!==baseline)throw Error('Another tab changed the saved copy. Saving is paused; export this tab and reload to compare.');
   if(storage.getItem(checkpointKey)!==expectedCheckpoint)throw Error('Another tab changed the candidate saved copy. Export this tab and reload to compare.');
  };
  function commit(next,replacing=false){if(problem&&!replacing)throw Error(problem);let claimKey;try{
   validate(next);const text=JSON.stringify(next);if(text===raw&&!replacing){check();value=next;return next;}
   const observed=claims(),approved=replacing?openedClaims:[],previousRaw=raw;
   const token=root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);claimKey=claimPrefix+token;
   storage.setItem(claimKey,JSON.stringify({schema:'trinity-write-claim-v1',head:text,at:new Date().toISOString()}));
   check();for(const row of claims()){if(row.key===claimKey)continue;if(approved.some(old=>old.key===row.key&&old.raw===row.raw)||row.data?.head===raw)continue;throw Error('Overlapping saves detected. Both proposals are retained; export pending copies and review.');}
   if((replacing||!checkpoint)&&raw!==null||replacing&&approved.length){
    const before=storage.getItem(originalsKey),records=before===null?[]:JSON.parse(before);if(!Array.isArray(records))throw Error('Original-recovery index is unreadable.');
    const retain=(source,bytes)=>{if(bytes===null||records.some(row=>row.raw===bytes))return;if(records.length>=5)throw Error('Five original recovery copies are retained. Export them before further replacement.');records.push({sourceKey:source,raw:bytes,at:new Date().toISOString()});};
    retain(sourceKey,sourceBaseline);retain(key,baseline);retain(key,raw);if(replacing&&checkpointBaseline!==null)retain(checkpointKey,checkpoint?.schema===checkpointSchema&&[undefined,'isolated-v1'].includes(checkpoint?.mode)&&typeof checkpoint?.head==='string'?checkpoint.head:checkpointBaseline);if(replacing)for(const row of approved)retain(row.key,typeof row.data?.head==='string'?row.data.head:row.raw);
    storage.setItem(originalsKey,JSON.stringify(records));
   }
   check();const head={schema:checkpointSchema,head:text,sourceKey:key,at:new Date().toISOString(),...(isolated?{mode:'isolated-v1',legacyRaw:baseline,legacySourceKey:sourceKey,legacySourceRaw:sourceBaseline}:{})},headText=JSON.stringify(head);
   storage.setItem(checkpointKey,headText);
   // An isolated candidate never writes the key used by legacy releases. A late
   // old writer therefore retains its own copy even inside the final save gap.
   if(!isolated){check(headText);storage.setItem(key,text);baseline=text;sourceKey=key;sourceBaseline=text;}
   raw=text;checkpoint=head;checkpointBaseline=headText;value=next;problem='';
   try{storage.removeItem(claimKey);for(const row of observed)if(approved.some(old=>old.key===row.key&&old.raw===row.raw)||row.data?.head===previousRaw)storage.removeItem(row.key);}catch{}openedClaims=[];return next;
  }catch(error){problem=error.message+' Saving is paused; export original and pending copies.';throw Error(problem);}}
  return {get value(){return value;},get raw(){return raw;},get sourceKey(){return sourceKey;},get problem(){return problem;},get readOnly(){if(!problem){try{check();if(pending(claims()).length)problem='Pending or overlapping saves need review. Export all copies before editing.';}catch(error){problem=error.message;}}return Boolean(problem);},checkpointKey,originalsKey,save:next=>commit(next),replace:next=>commit(next,true),copies(){return {schema:'trinity-raw-recovery-v1',key,sourceKey,isolated,openedRaw:raw,activeRaw:raw,sourceCurrentRaw:storage.getItem(sourceKey),storedRaw:storage.getItem(key),checkpointRaw:storage.getItem(checkpointKey),originalsRaw:storage.getItem(originalsKey),pendingWrites:claims().map(row=>({key:row.key,raw:row.raw}))};}};
 }
 function core(value){if(value.version!==undefined&&(!Number.isInteger(value.version)||value.version<1||value.version>8))throw Error('Unsupported core schema version.');if(!Array.isArray(value.attempts)||!Array.isArray(value.retests))throw Error('Core attempts or retests are unreadable.');if(value.dailyEntries!==undefined&&!Array.isArray(value.dailyEntries))throw Error('Daily evidence is unreadable.');for(const rows of [value.attempts,value.retests])if(rows.some(row=>!object(row)))throw Error('One or more evidence records are unreadable.');const day=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;const ids=new Set();for(const row of value.attempts){if(typeof row.id!=='string'||!row.id||ids.has(row.id))throw Error('Duplicate or missing attempt identifier.');if(!day(row.date)||!['biology','chemistry','physics'].includes(row.subject)||typeof row.question!=='string'||!Number.isFinite(row.earned)||!Number.isFinite(row.total)||row.total<=0||row.earned<0||row.earned>row.total)throw Error('A historical attempt has invalid dates or marks. Preserve its original before repair.');ids.add(row.id);}for(const row of value.retests)if(!day(row.due)||row.completedAt&&!day(row.completedAt))throw Error('A retest date needs review.');}

 root.TrinityStore={open,core};if(typeof module!=='undefined')module.exports=root.TrinityStore;
})(globalThis);
