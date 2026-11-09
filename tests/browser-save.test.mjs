import assert from 'node:assert/strict';
import test, {after} from 'node:test';
import {createServer} from 'vite';
const vite=await createServer({appType:'custom',configFile:false,optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,hmr:false,ws:false}});
after(()=>vite.close());
const {createSnapshotWriter}=await vite.ssrLoadModule('/lib/browser-save.ts');
function fixture(){const records=new Map([['progress','original']]),problems=[];let writes=0;const storage={getItem:key=>records.get(key)??null,setItem:(key,value)=>{writes++;records.set(key,value)}};const writer=createSnapshotWriter(storage,'progress',kind=>problems.push(kind));writer.resume();return {records,problems,storage,writer,get writes(){return writes}}}
test('rapid edits keep the latest snapshot and require only one write',()=>{const f=fixture();f.writer.queue('first');f.writer.queue('second');f.writer.queue('latest');assert.equal(f.writes,0);f.writer.flush();assert.equal(f.records.get('progress'),'latest');assert.equal(f.writes,1);f.writer.queue('latest');f.writer.flush();assert.equal(f.writes,1)});
test('an older tab cannot overwrite a newer copy, even after more edits',()=>{const f=fixture();f.writer.queue('local draft');f.records.set('progress','another tab');f.writer.flush();f.writer.queue('more local work');f.writer.flush();assert.equal(f.records.get('progress'),'another tab');assert.deepEqual(f.problems,['conflict'])});
test('a storage failure retains pending work so a later flush can retry',()=>{const f=fixture(),normal=f.storage.setItem;f.storage.setItem=()=>{throw Error('full')};f.writer.queue('draft');f.writer.flush();assert.deepEqual(f.problems,['storage']);f.storage.setItem=normal;f.writer.flush();assert.equal(f.records.get('progress'),'draft')});
test('paused unreadable data survives automatic saves',()=>{const f=fixture();f.writer.pause();f.writer.queue('defaults');f.writer.flush();assert.equal(f.records.get('progress'),'original')});
test('explicit import can resume saving after a conflict without flushing old work',()=>{const f=fixture();f.writer.queue('old draft');f.records.set('progress','other tab');f.writer.flush();f.writer.discard();f.writer.resume();f.writer.flush();assert.equal(f.records.get('progress'),'other tab');f.writer.queue('confirmed import');f.writer.flush();assert.equal(f.records.get('progress'),'confirmed import')});
