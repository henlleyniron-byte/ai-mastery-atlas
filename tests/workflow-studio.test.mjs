import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {FIELDS,blank,validate,parse,merge,snapshot,persist,filterMissions} from '../public/workflow-studio/model.js';
const config=JSON.parse(readFileSync('public/workflow-studio/missions.json','utf8'));
const ids=config.missions.map(m=>m.id);
const note=(id=ids[0])=>({...blank(id),scope:'Bounded synthetic task',first:'Original result',check:'Observed failure'});
test('all workflow links resolve to existing local pages or sections',()=>{
 assert.equal(new Set(ids).size,10);
 for(const m of config.missions){assert.equal(m.steps.length,6);assert.ok(m.checks.length>=3);assert.ok(m.traps.length>=2);assert.ok(m.prompt.length>70);for(const [label,href]of m.links){assert.ok(label);if(href.startsWith('/#'))continue;assert.ok(existsSync('public/'+href.split('?')[0].replace(/^\//,'')+'index.html'),href);}}
});
test('workflow notes round-trip literal text and reject unsafe or foreign backups',()=>{
 const d=note();d.repair='<img src=x onerror=alert(1)>';
 assert.deepEqual(parse(snapshot(config.site,[d]),config.site,ids),[d]);
 assert.throws(()=>parse(snapshot('other',[d]),config.site,ids));
 assert.throws(()=>parse('{"__proto__":{},"schema":"x"}',config.site,ids));
 assert.throws(()=>validate({schema:config.site+'-workflow-drafts-v1',drafts:[d,d]},config.site,ids));
 assert.throws(()=>parse(snapshot(config.site,[{...d,scope:'x'.repeat(6001)}]),config.site,ids));
 assert.throws(()=>parse(snapshot(config.site,[{...d,id:'unknown'}]),config.site,ids));
 assert.throws(()=>parse(snapshot(config.site,[{...d,next:9}]),config.site,ids));
});
test('merge retains distinct notes and blocks conflicting evidence without mutation',()=>{
 const a=note(),b=note(ids[1]);assert.equal(merge([a],[a,b]).length,2);
 const before=JSON.stringify(a);assert.throws(()=>merge([a],[{...a,scope:'different'}]));assert.equal(JSON.stringify(a),before);
});
test('saving detects concurrent changes and preserves exact previous bytes',()=>{
 const values=new Map([['key','original']]);const storage={getItem:k=>values.has(k)?values.get(k):null,setItem:(k,v)=>values.set(k,v)};
 assert.throws(()=>persist(storage,'key','stale','new'));assert.equal(values.get('key'),'original');
 persist(storage,'key','original','new');assert.equal(values.get('key-recovery'),'original');assert.equal(values.get('key'),'new');
 const failing={getItem:()=> 'original',setItem:()=>{throw Error('quota');}};assert.throws(()=>persist(failing,'key','original','new'));
});
test('search and category filtering are combined, with a clear empty state',()=>{
 const m=config.missions[0];assert.ok(filterMissions(config.missions,m.group,m.title).some(x=>x.id===m.id));assert.equal(filterMissions(config.missions,'All','nothingmatches-xyz').length,0);
});
test('share mode does not read note storage; dynamic notes avoid HTML interpolation',()=>{
 const app=readFileSync('public/workflow-studio/app.js','utf8');
 assert.match(app,/if\(share\)\{\$\('notes'\)\.hidden=true/);assert.ok(app.includes('else{try{baseline=localStorage.getItem'));
 assert.ok(!app.includes('innerHTML'));assert.ok(app.includes('beforeunload'));assert.ok(app.includes('if(!writable)'));
});

test('static and generated editor fields never duplicate document IDs',()=>{const html=readFileSync('public/workflow-studio/index.html','utf8');const staticIds=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);const all=[...staticIds,...FIELDS];assert.equal(new Set(all).size,all.length);});
