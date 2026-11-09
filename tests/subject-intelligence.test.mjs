import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const publicRoot=new URL('../public/',import.meta.url);
const read=path=>readFileSync(new URL(path,publicRoot),'utf8');
const chem=JSON.parse(read('chemistry-intelligence/source-audit.json'));
const bio=JSON.parse(read('biology-intelligence/source-audit.json'));
const ctx=vm.createContext({Intl,Date});vm.runInContext(read('subject-intelligence/model.js'),ctx);const M=ctx.SubjectIntelligence;
const at='2026-10-01T00:00:00Z';
const record=(extra={})=>({id:'1',itemId:'chem-q5',role:'baseline',earned:1,total:1,guesses:0,minutes:2,target:2,confidence:3,unaided:true,novel:false,reference:'2025 Q05',note:'',error:'none',at,...extra});

test('Chemistry source reconciles 50 unique keys, all 14 units and actual label counts',()=>{
 assert.equal(chem.questions.length,50);assert.equal(new Set(chem.questions.map(r=>r.q)).size,50);
 assert.deepEqual([...new Set(chem.questions.map(r=>r.unit))].sort((a,b)=>a-b),Array.from({length:14},(_,i)=>i+1));
 const counts={};for(const r of chem.questions)counts[r.similarity]=(counts[r.similarity]||0)+1;
 assert.deepEqual(counts,chem.classification_counts);assert.equal(chem.unit_allocations.reduce((n,r)=>n+r.periods,0),600);
 assert.equal(chem.questions.filter(r=>r.unit===12).length,7);
});
test('Biology retains 86 sub-question records and distinguishes unavailable previous-year evidence',()=>{
 assert.equal(bio.year_pairs.reduce((n,r)=>n+r.essay_records,0),86);assert.equal(bio.year_pairs[0].previous_year_exact,null);
 for(const r of bio.year_pairs){assert.equal(r.direct+r.complementary+r.conceptual_foreshadowing+r.same_unit+r.no_link,r.essay_records);assert.equal(r.direct,r.same_year_exact);}
 assert.equal(bio.revision_bank.length,40);assert.equal(bio.recent_evidence_families.length,15);assert.equal(bio.unit_allocations.reduce((n,r)=>n+r.periods,0),603);
 const rows=M.items(bio,'biology');assert.equal(rows.length,55);assert.equal(new Set(rows.map(r=>r.id)).size,55);
 assert.equal(rows.find(r=>r.id==='bio-bank4').unit,2);assert.equal(rows.find(r=>r.id==='bio-bank4').sourceUnit,6);
 assert.equal(rows.find(r=>r.id==='bio-bank28').unit,3);
});
test('filters search exact references and return empty syllabus gaps honestly',()=>{
 const c=M.items(chem,'chemistry');assert.equal(M.filter(c,{unit:'12'}).length,7);assert.equal(M.filter(c,{search:'2022 Q14'}).length,2);
 assert.equal(M.filter(c,{kind:'N'}).length,2);assert.equal(M.filter(M.items(bio,'biology'),{unit:'1'}).length,0);
});
test('backup validation rejects impossible marks, coercions, duplicate IDs and foreign items',()=>{
 const ids=new Set(['chem-q5']);assert.equal(M.normalize([record()],ids).length,1);
 for(const bad of [{earned:2},{total:0},{earned:'1'},{confidence:6},{minutes:0},{guesses:.5},{itemId:'bio-bank1'},{at:'bad'},{reference:''},{at:'2099-01-01'}])assert.throws(()=>M.normalize([record(bad)],ids));
 assert.throws(()=>M.normalize([record(),record()],ids));
});
test('repair gate requires unaided, supported and timely performance; exposure alone never closes',()=>{
 assert.equal(M.summary([]).score,null);assert.equal(M.summary([record()]).closed,false);
 for(const bad of [{unaided:false},{guesses:1},{minutes:3},{error:'retrieval'},{earned:0}])assert.equal(M.clean(record(bad)),false);
 const failed=record({earned:0,confidence:5,minutes:3});assert.ok(M.summary([failed]).score>60);
});
test('a retest must follow a clean fresh transfer by at least 72 hours; a later failure reopens the cycle',()=>{
 const transfer=record({role:'transfer',novel:true});
 const early=record({id:'2',role:'retest',at:'2026-10-03T23:59:59Z'});
 const passed=record({id:'2',role:'retest',at:'2026-10-04T00:00:00Z'});
 assert.equal(M.summary([transfer,early]).closed,false);assert.equal(M.summary([transfer,passed]).closed,true);
 const failure=record({id:'3',earned:0,at:'2026-10-05T00:00:00Z'});
 assert.equal(M.summary([transfer,passed,failure]).closed,false);
 const rewrite=record({id:'4',role:'reattempt',at:'2026-10-06T00:00:00Z'});
 assert.equal(M.summary([transfer,passed,failure,rewrite]).closed,false);
});
test('Command overlay reads only matching subject/unit evidence and ignores invalid marks',()=>{
 const rows=M.coreByUnit({attempts:[{subject:'chemistry',topicKey:'chemistry|11|2',earned:2,total:4},{subject:'biology',topicKey:'biology|4|0',earned:2,total:4},{subject:'chemistry',topicKey:'chemistry|11|3',earned:8,total:2}]},'chemistry');
 assert.equal(rows.length,1);assert.equal(rows[0].unit,12);assert.equal(rows[0].earned,2);
 assert.equal(M.day('2026-10-13T19:00:00Z'),'2026-10-14');
});
test('new subject routes expose source provenance and share-safe controls',()=>{
 for(const subject of ['chemistry','biology']){
  const html=read(`${subject}-intelligence/index.html`);assert.match(html,/Read-only share view/);assert.match(html,/29 September 2026/);assert.match(html,/id="importBackup"/);
 }
});
