import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildStudyPrompt, studyTasks } from '../lib/subject-study-prompt.ts';
const base={subject:'Chemistry',task:studyTasks[0],reference:'2025 Q05; scheme p2',error:'Used initial pressure',attempted:true,marked:true,questionReady:true,sourceReady:true,firstRetest:3,secondRetest:10};
test('diagnosis, repair and transfer require the exact question and an already marked unaided attempt',()=>{
 for(const task of studyTasks.slice(0,3))for(const k of ['attempted','marked','questionReady','sourceReady'])assert.throws(()=>buildStudyPrompt({...base,task,[k]:false}));
});
test('source audit and recall preparation require the source without inventing an attempted paper',()=>{
 for(const task of studyTasks.slice(3))assert.match(buildStudyPrompt({...base,task,attempted:false,marked:false,questionReady:false}),/resource excerpt/);
 assert.throws(()=>buildStudyPrompt({...base,task:studyTasks[3],sourceReady:false}));
});
test('custom retest intervals remain explicit and invalid or reversed intervals are rejected',()=>{
 assert.match(buildStudyPrompt({...base,firstRetest:2,secondRetest:7}),/\+2 and \+7 days/);
 for(const [firstRetest,secondRetest] of [[0,7],[3,3],[10,3],[2.5,7],[3,91]])assert.throws(()=>buildStudyPrompt({...base,firstRetest,secondRetest}));
});
test('unsupported subjects, tasks and blank references cannot produce a misleading prompt',()=>{
 for(const extra of [{subject:'toString'},{subject:'Maths'},{task:'Predict next paper'},{reference:''}])assert.throws(()=>buildStudyPrompt({...base,...extra}));
});
test('each task selects its own instruction and retains withholding, source and no-fabrication rules',()=>{
 const transfer=buildStudyPrompt({...base,task:studyTasks[2]});assert.match(transfer,/withhold the worked answer until I submit/);assert.doesNotMatch(transfer,/Create atomic/);
 const cards=buildStudyPrompt({...base,task:studyTasks[4]});assert.match(cards,/context-complete recall/);assert.match(cards,/Exclude uncertain or disputed facts/);
 for(const task of studyTasks){const p=buildStudyPrompt({...base,task});assert.match(p,/do not predict future papers/);assert.match(p,/not official exam marking/);assert.match(p,/no generated grade/);}
});
test('input changes invalidate a generated snapshot and downloadable prompts stay in the browser',()=>{
 const component=readFileSync(new URL('../components/subject-study-lab.tsx',import.meta.url),'utf8');assert.match(component,/const invalidate = \(\) => \{ setPrompt\(""\)/);assert.match(component,/Download prepared prompt/);assert.doesNotMatch(component,/fetch\s*\(|localStorage/);
});
