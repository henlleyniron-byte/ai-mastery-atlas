import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
const path=process.env.STUDY_LIBRARY_PATH;
function model(){const c=vm.createContext({URL,Date,crypto:webcrypto});for(const f of ['science-model.js','model.js'])vm.runInContext(readFileSync(new URL('../public/study-library/'+f,import.meta.url),'utf8'),c);return c.StudyLibrary;}
// A transaction harness exercises failure/concurrent-tab boundaries; it is not browser QA.
function storage({quota=false,initial=null}={}){
 let saved=initial,opens=0,closes=0;
 const factory={open(name){assert.equal(name,'henlley_study_library_v1');opens++;const request={};setImmediate(()=>{request.result={createObjectStore(){},close(){closes++;},transaction(store,mode){assert.equal(store,'library');const tx={aborted:false,pending:saved,error:null,objectStore(){return {get(key){assert.equal(key,'owner-import');const q={};setImmediate(()=>{q.result=saved;q.onsuccess?.();setImmediate(()=>{if(!tx.aborted){if(mode==='readwrite')saved=tx.pending;tx.oncomplete?.();}});});return q;},put(value,key){assert.equal(key,'owner-import');if(quota){tx.error=new Error('Quota exceeded');tx.abort();}else tx.pending=value;},delete(key){assert.equal(key,'owner-import');tx.pending=null;setImmediate(()=>{saved=null;tx.oncomplete?.();});}};},abort(){tx.aborted=true;setImmediate(()=>tx.onabort?.());}};return tx;}};request.onsuccess?.();});return request;}};
 return {factory,get saved(){return saved;},get opens(){return opens;},get closes(){return closes;}};
}
const corpusTest=(name,fn)=>test(name,{skip:!path},fn);
corpusTest('browser save/load keeps the private package and guards stale writers',async()=>{const m=model(),p=JSON.parse(readFileSync(path,'utf8')),s=storage();const rev=await m.save(p,null,s.factory);assert.equal((await m.readSaved(s.factory)).revision,rev);assert.equal(s.saved.package.resources.length,47);await assert.rejects(m.save(p,null,s.factory),/changed|not been loaded/);assert.equal(s.saved.revision,rev);const next=await m.save(p,rev,s.factory);assert.notEqual(next,rev);assert.equal(s.saved.revision,next);assert.equal(s.opens,s.closes);});
corpusTest('quota failure preserves the previous copy and removal touches only the library record',async()=>{const m=model(),p=JSON.parse(readFileSync(path,'utf8')),old={revision:'old',package:p},s=storage({quota:true,initial:old});await assert.rejects(m.save(p,'old',s.factory),/Quota/);assert.equal(s.saved,old);await m.forget(s.factory);assert.equal(s.saved,null);assert.equal(s.opens,s.closes);});
corpusTest('unreadable saved data is returned without automatic replacement',async()=>{const m=model(),s=storage({initial:{revision:'broken',package:{schema:'unknown'}}});const raw=await m.readSaved(s.factory);assert.throws(()=>m.validate(raw.package));assert.equal(s.saved,raw);});
