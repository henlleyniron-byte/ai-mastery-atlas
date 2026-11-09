import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const vite=await createServer({appType:'custom',configFile:false,resolve:{alias:{'@':process.cwd()}},optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,hmr:false,ws:false}});
after(()=>vite.close());
const M=await vite.ssrLoadModule('/lib/evaluation-workbench.ts');
const legacy={id:'r1',scenario:'research',date:'2026-10-12',system:'System A',evidence:'Frozen source pack v1, five source claims checked.',scores:[2,2,2,2,2],criticalFailure:false,minutes:12,cost:null};
const protocol={fixture:'public-pack-v1',groundTruth:'reviewed five-claim reference v1',tools:'no tools',baseline:'human source check: 12 minutes',task:'Frozen comparison task and expected outputs',rubricVersion:'atlas-five-criteria-v1',evaluator:'SELF',repetition:1,retries:0,latencySeconds:null,correctionMinutes:null,failureNotes:'',remediation:'',verification:''};
const current={...legacy,protocol};
const today='2026-10-16';
const backup=runs=>({schema:M.EVALUATION_SCHEMA,runs});

test('old v1 records stay intact without invented protocol, and v2 snapshots round-trip',()=>{
  const old=M.importEvaluations(JSON.stringify({schema:'atlas-evaluation-v1',runs:[legacy]}),today);
  assert.deepEqual(old,[legacy]);assert.equal(old[0].protocol,undefined);assert.equal(M.comparisonKey(old[0]),null);
  assert.deepEqual(M.importEvaluations(JSON.stringify(backup([current])),today),[current]);
  assert.deepEqual(M.legacyEvaluationBackup([current]),{schema:'atlas-evaluation-v1',runs:[legacy]});
  assert.deepEqual(M.importEvaluations(M.legacyEvaluationBackup([current]),today),[legacy]);
  assert.deepEqual(current.protocol,protocol);
});
test('comparisons separate changed inputs and conditions, while preserving candidate differences',()=>{
  const key=M.comparisonKey(current);
  assert.equal(M.comparisonKey({...current,system:'System B, different reasoning settings'}),key);
  for(const field of ['fixture','groundTruth','tools','baseline','task']) {
    assert.notEqual(M.comparisonKey({...current,protocol:{...protocol,[field]:'different'}}),key,field);
  }
});
test('protocol checks reject bad provenance, timestamps, counts and unsupported precision',()=>{
  for(const patch of [{repetition:0},{repetition:1.5},{retries:-1},{latencySeconds:Infinity},{correctionMinutes:-1},{evaluator:'AUTOMATICALLY CERTIFIED'},{rubricVersion:'unknown'},{task:''},{fixture:'x'.repeat(501)}]) {
    assert.throws(()=>M.validateEvaluation({...current,protocol:{...protocol,...patch}},today));
  }
  assert.throws(()=>M.validateEvaluation(current,'2026-02-30'));
  assert.throws(()=>M.validateEvaluation({...current,criticalFailure:true},today),/critical failure/);
  assert.throws(()=>M.validateEvaluation({...current,protocol:{...protocol,correctionMinutes:13}},today),/total effort/);
  assert.equal(M.verdict(M.validateEvaluation({...current,criticalFailure:true,protocol:{...protocol,failureNotes:'Invented source detected against frozen input.'}},today)).pass,false);
  const sparse=Array(5);sparse[0]=2;
  assert.throws(()=>M.validateEvaluation({...legacy,scores:sparse},today));
});
test('unsafe, oversized, duplicate and unknown-schema imports are rejected before mutation',()=>{
  for(const value of [backup([current,current]),{schema:'atlas-evaluation-v3',runs:[]},JSON.parse('{"schema":"atlas-evaluation-v2","runs":[],"__proto__":{"polluted":true}}')]) assert.throws(()=>M.importEvaluations(value,today));
  assert.throws(()=>M.importEvaluations('{"padding":"'+'x'.repeat(M.MAX_EVALUATION_BYTES)+'"}',today),/2 MB/);
  for(const patch of [{cost:NaN},{cost:Infinity},{protocol:{...protocol,latencySeconds:Infinity}}]) assert.throws(()=>M.importEvaluations(backup([{...current,...patch}]),today),/non-finite/);
  assert.equal({}.polluted,undefined);
});
test('merging is idempotent and a conflicting ID preserves both input arrays',()=>{
  assert.deepEqual(M.mergeEvaluations([current],[structuredClone(current)]),[current]);
  const old=[current],incoming=[{...current,evidence:'A different checked output for the same identifier.'}];
  const before=JSON.stringify([old,incoming]);
  assert.throws(()=>M.mergeEvaluations(old,incoming),/conflicting/);
  assert.equal(JSON.stringify([old,incoming]),before);
});
function storageFixture(raw){
  const records=new Map([[M.EVALUATION_KEY,raw]]),writes=[];
  return {records,writes,storage:{getItem:key=>records.get(key)??null,setItem:(key,value)=>{writes.push(key);records.set(key,value);}}};
}
test('valid restoration preserves exact malformed original bytes and resumes a usable ledger',()=>{
  const f=storageFixture('{damaged original\n');
  const saved=M.writeEvaluationSnapshot(f.storage,'{damaged original\n',[current],today,true);
  assert.equal(f.records.get(M.EVALUATION_KEY+'-recovery'),'{damaged original\n');
  assert.deepEqual(M.importEvaluations(saved,today),[current]);
});
test('stale-tab restore and failed recovery writes cannot replace the current record',()=>{
  const original=JSON.stringify({schema:'atlas-evaluation-v1',runs:[legacy]}),f=storageFixture(original);
  f.records.set(M.EVALUATION_KEY,'another tab');
  assert.throws(()=>M.writeEvaluationSnapshot(f.storage,original,[current],today),/Another tab/);
  assert.equal(f.records.get(M.EVALUATION_KEY),'another tab');assert.equal(f.writes.length,0);
  f.records.set(M.EVALUATION_KEY,original);
  const set=f.storage.setItem;f.storage.setItem=(key,value)=>{if(key.endsWith('-recovery'))throw Error('quota');set(key,value);};
  assert.throws(()=>M.writeEvaluationSnapshot(f.storage,original,[current],today,true),/quota/);
  assert.equal(f.records.get(M.EVALUATION_KEY),original);
  f.storage.setItem=(key,value)=>{if(key===M.EVALUATION_KEY)throw Error('interrupted');set(key,value);};
  assert.throws(()=>M.writeEvaluationSnapshot(f.storage,original,[current],today,true),/interrupted/);
  assert.equal(f.records.get(M.EVALUATION_KEY),original);
  assert.equal(f.records.get(M.EVALUATION_KEY+'-recovery'),original);
});
test('a rapid same-tab save merges the latest committed runs instead of losing the first result',()=>{
  const f=storageFixture(JSON.stringify(backup([])));
  const first=M.writeEvaluationSnapshot(f.storage,f.records.get(M.EVALUATION_KEY),[current],today);
  const second=M.writeEvaluationSnapshot(f.storage,first,[{...current,id:'r2'}],today);
  assert.deepEqual(M.importEvaluations(second,today).map(run=>run.id),['r1','r2']);
  const replacement=M.writeEvaluationSnapshot(f.storage,second,[{...current,id:'r3'}],today,true);
  assert.deepEqual(M.importEvaluations(replacement,today).map(run=>run.id),['r3']);
  assert.equal(f.records.get(M.EVALUATION_KEY+'-recovery'),second);
});
test('the server-rendered workbench starts with the public method and withholds private forms until browser privacy is known',async()=>{
  const {EvaluationWorkbench}=await vite.ssrLoadModule('/components/evaluation-workbench.tsx');
  const html=renderToStaticMarkup(createElement(EvaluationWorkbench));
  assert.match(html,/Evaluation workbench · public method/);
  assert.match(html,/Private runs, protocols, recovery copies and unsubmitted fields are hidden/);
  assert.doesNotMatch(html,/<(?:form|input|textarea)\b/);
  assert.match(html,/role="status"/);assert.match(html,/aria-live="polite"/);
  assert.doesNotMatch(html,/<input[^>]+(?:name="fixture"|name="groundTruth")[^>]+value="[^\"]+"/);
});
