import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {setTimeout as hostSetTimeout,clearTimeout as hostClearTimeout} from 'node:timers';
import {createServer} from 'vite';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
const packagePath=process.env.DOM_QA_PACKAGE;
const domTest=(name,fn)=>test(name,{skip:!packagePath},fn);
let vite;after(()=>vite?.close());
const props=node=>node[Object.keys(node).find(key=>key.startsWith('__reactProps$'))];
const button=text=>[...document.querySelectorAll('button')].find(node=>node.textContent.trim()===text);
const pause=()=>new Promise(resolve=>hostSetTimeout(resolve,15));
async function environment(options={}){
 const {parseHTML}=await import(pathToFileURL(packagePath).href),{window}=parseHTML('<html><body><div id="root"></div></body></html>');
 const data=new Map(),storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key),keys:()=>[...data.keys()]},autosaves=[],downloads=[],confirmations=[],caught=[];
 Object.assign(globalThis,{window,document:window.document,HTMLElement:window.HTMLElement,Element:window.Element,DocumentFragment:window.DocumentFragment,HTMLFormElement:window.HTMLFormElement??window.HTMLElement,HTMLInputElement:window.HTMLInputElement,HTMLSelectElement:window.HTMLSelectElement,HTMLButtonElement:window.HTMLButtonElement,HTMLAnchorElement:window.HTMLAnchorElement,MutationObserver:window.MutationObserver,CustomEvent:window.CustomEvent,Node:window.Node,IS_REACT_ACT_ENVIRONMENT:true,location:{href:'http://synthetic.test/',search:'',hash:''},localStorage:storage,requestAnimationFrame:fn=>hostSetTimeout(fn,0),cancelAnimationFrame:hostClearTimeout,ResizeObserver:class{observe(){}unobserve(){}disconnect(){}}});
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{userAgent:'Synthetic DOM',clipboard:{writeText:async()=>{}}}});
 window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
 globalThis.getComputedStyle=node=>({display:node.style.display||'block',animationName:'none',animationDuration:'0s',transitionDuration:'0s',direction:'ltr',getPropertyValue:name=>node.style.getPropertyValue(name)});
 // LinkeDOM exposes a non-constructible facade; Radix uses the native constructor.
 globalThis.DocumentFragment=function(){return document.createDocumentFragment();};
 globalThis.DocumentFragment.prototype=window.DocumentFragment.prototype;
 // Native select.value is writable. LinkeDOM's getter-only facade cannot
 // restore the actual uncontrolled Evaluation form during a privacy return.
 Object.defineProperty(Object.getPrototypeOf(window.document.createElement('select')),'value',{configurable:true,get(){return this.querySelector('option[selected]')?.value??this.querySelector('option')?.value??'';},set(value){for(const option of this.querySelectorAll('option'))if(option.value===String(value))option.setAttribute('selected','');else option.removeAttribute('selected');}});
 window.HTMLElement.prototype.focus=function(){document.__focused=this;};window.HTMLElement.prototype.scrollIntoView=()=>{};
 window.HTMLElement.prototype.showModal=function(){this.setAttribute('open','');};window.HTMLElement.prototype.close=function(){this.removeAttribute('open');};
 window.HTMLAnchorElement.prototype.click=()=>{};URL.createObjectURL=blob=>{downloads.push(blob);return 'blob:synthetic';};URL.revokeObjectURL=()=>{};
 window.setTimeout=(fn,ms)=>{if(ms===350){autosaves.push(fn);return -autosaves.length;}return hostSetTimeout(fn,ms);};window.clearTimeout=id=>{if(id>=0)hostClearTimeout(id);};
 window.confirm=message=>{confirmations.push(message);return true;};
 if(!vite)vite=await createServer({root:process.cwd(),appType:'custom',configFile:false,resolve:{alias:{'@':process.cwd()}},optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,hmr:false,ws:false}});
 const P=await vite.ssrLoadModule('/app/page.tsx'),L=await vite.ssrLoadModule('/lib/learning-state.ts'),A=await vite.ssrLoadModule('/lib/astra-studio.ts');
 const initial={...L.newLearningState(),studio:{...A.newStudioState(),result:'INITIAL_SAVED_RESULT'}};storage.setItem('atlas-v4-state',options.raw??JSON.stringify(initial));
 const root=createRoot(document.getElementById('root'),{onCaughtError:error=>caught.push(String(error))});await act(async()=>{root.render(React.createElement(P.default));await pause();});await act(async()=>pause());
 await act(async()=>button('Open Operator Core →').click());
 for(let attempt=0;attempt<350&&!document.getElementById('studio-result');attempt++)await act(async()=>pause());
 assert.ok(document.getElementById('studio-result'),'actual lazily opened child Studio must be mounted');
 const input=()=>document.querySelector('[aria-label="Import Atlas progress file"]');
 const fixture=marker=>({...L.newLearningState(),version:'5.0',studio:{...A.newStudioState(),result:marker}});
 const changeResult=async value=>{await act(async()=>props(document.getElementById('studio-result')).onChange({target:{value}}));};
 const start=async file=>{let task;await act(async()=>{task=props(input()).onChange({target:{files:[file]}});});return {task};};
 const begin=async marker=>start({size:100,text:async()=>JSON.stringify(fixture(marker))});
 const exportCurrent=async()=>{await act(async()=>button('Export progress').click());return JSON.parse(await downloads.at(-1).text());};
 const exportRecovery=async()=>{await act(async()=>button('Export exact originals & recovery copies').click());return JSON.parse(await downloads.at(-1).text());};
 return {root,window,data,storage,autosaves,downloads,confirmations,caught,initial,input,fixture,changeResult,start,begin,exportCurrent,exportRecovery};
}
const deferred=()=>{let finish;const text=new Promise(resolve=>finish=resolve);return {file:{size:100,text:()=>text},finish};};

domTest('actual Home refuses a delayed import after a child Studio edit without discarding its queued work',async()=>{
 const env=await environment();try{
  const read=deferred(),{task}=await env.start(read.file);await env.changeResult('NEW_CHILD_EDIT');
  await act(async()=>{read.finish(JSON.stringify(env.fixture('OLD_BACKUP')));await task;});
  assert.equal(env.confirmations.length,0);assert.equal((await env.exportCurrent()).studio.result,'NEW_CHILD_EDIT');
  await act(async()=>env.autosaves.at(-1)());assert.ok([...env.data.values()].some(raw=>raw.includes('NEW_CHILD_EDIT')));assert.equal(env.storage.getItem('atlas-v4-state'),JSON.stringify(env.initial));
 }finally{await act(async()=>env.root.unmount());}
});

domTest('actual Home preserves pre-existing queued Studio notes before a successful reviewed import',async()=>{
 const env=await environment();try{
  await env.changeResult('QUEUED_BEFORE_FILE');const {task}=await env.begin('REVIEWED_BACKUP');await act(async()=>task);
  assert.equal(env.confirmations.length,1);assert.equal((await env.exportCurrent()).studio.result,'REVIEWED_BACKUP');
  const originals=JSON.parse(env.storage.getItem('atlas-v4-state__trinity_original_v1'));assert.ok(originals.some(row=>JSON.parse(row.raw).studio?.result==='QUEUED_BEFORE_FILE'));assert.equal(env.storage.getItem('atlas-v4-state'),JSON.stringify(env.initial));
 }finally{await act(async()=>env.root.unmount());}
});

domTest('actual Home ignores an older file finishing after a newer selection and a same-value edit retires an old read',async()=>{
 const env=await environment();try{
  const old=deferred(),newer=deferred(),a=await env.start(old.file),b=await env.start(newer.file);
  await act(async()=>{newer.finish(JSON.stringify(env.fixture('NEWER_SELECTION')));await b.task;});await act(async()=>{old.finish(JSON.stringify(env.fixture('OLDER_READ')));await a.task;});
  assert.equal(env.confirmations.length,1);assert.equal((await env.exportCurrent()).studio.result,'NEWER_SELECTION');
  const again=deferred(),c=await env.start(again.file);await env.changeResult('NEWER_SELECTION');await act(async()=>{again.finish(JSON.stringify(env.fixture('SHOULD_NOT_APPLY')));await c.task;});assert.equal(env.confirmations.length,1);assert.equal((await env.exportCurrent()).studio.result,'NEWER_SELECTION');
 }finally{await act(async()=>env.root.unmount());}
});

domTest('actual Home cancel, shared URL and share round trip retire late reads and block captured private exports',async()=>{
 const env=await environment();try{
  for(const cancel of [()=>button('Cancel progress import').click(),()=>props(env.input()).onChange({target:{files:[]}}),()=>env.input().dispatchEvent(new window.Event('cancel'))]){
   const cancelled=deferred(),a=await env.start(cancelled.file);await act(async()=>cancel());await act(async()=>{cancelled.finish(JSON.stringify(env.fixture('CANCELLED')));await a.task;});assert.equal(env.confirmations.length,0);
  }
  const staleExport=props(button('Export progress')).onClick,read=deferred(),b=await env.start(read.file);
  await act(async()=>{location.search='?share=1';window.dispatchEvent(new window.Event('popstate'));});const before=env.downloads.length;await act(async()=>staleExport());assert.equal(env.downloads.length,before);
  await act(async()=>{location.search='';window.dispatchEvent(new window.Event('popstate'));read.finish(JSON.stringify(env.fixture('PRIVATE_LATE')));await b.task;});assert.equal(env.confirmations.length,0);assert.equal((await env.exportCurrent()).studio.result,'INITIAL_SAVED_RESULT');
 }finally{await act(async()=>env.root.unmount());}
});

domTest('actual Home rechecks an edit made during confirmation and refuses quota failure without replacing visible or queued notes',async()=>{
 const env=await environment();try{
  window.confirm=()=>{props(document.getElementById('studio-result')).onChange({target:{value:'EDIT_DURING_CONFIRM'}});return true;};
  const first=await env.begin('CONFIRM_BACKUP');await act(async()=>first.task);assert.equal((await env.exportCurrent()).studio.result,'EDIT_DURING_CONFIRM');
  window.confirm=()=>true;const write=env.storage.setItem;env.storage.setItem=(key,value)=>{if(key==='atlas-v4-state__trinity_checkpoint_v1')throw Error('Synthetic quota');write(key,value);};
  const second=await env.begin('QUOTA_BACKUP');await act(async()=>second.task);
  const recovery=await env.exportRecovery();assert.ok(recovery.copies.queuedRaw.includes('EDIT_DURING_CONFIRM'));assert.equal(recovery.inMemoryDraft.studio.result,'EDIT_DURING_CONFIRM');assert.equal(env.storage.getItem('atlas-v4-state'),JSON.stringify(env.initial));
 }finally{await act(async()=>env.root.unmount());}
});

domTest('actual Home unmount retires the import before any late confirmation or storage write',async()=>{
 const env=await environment();const read=deferred(),{task}=await env.start(read.file);await act(async()=>env.root.unmount());const before=JSON.stringify([...env.data]);
 await act(async()=>{read.finish(JSON.stringify(env.fixture('AFTER_UNMOUNT')));await task;});assert.equal(env.confirmations.length,0);assert.equal(JSON.stringify([...env.data]),before);
});

domTest('actual Home restores editable progress from an unreadable baseline only after preserving exact legacy bytes',async()=>{
 const original='{unreadable exact historic bytes',env=await environment({raw:original});try{
  assert.equal(document.querySelector('.task-settings-fieldset').hasAttribute('disabled'),true);
  const {task}=await env.begin('CHECKED_RECOVERED_PROGRESS');await act(async()=>task);
  assert.equal(document.querySelector('.task-settings-fieldset').hasAttribute('disabled'),false);assert.equal((await env.exportCurrent()).studio.result,'CHECKED_RECOVERED_PROGRESS');assert.equal(env.storage.getItem('atlas-v4-state'),original);
  assert.ok(JSON.parse(env.storage.getItem('atlas-v4-state__trinity_original_v1')).some(row=>row.raw===original));
 }finally{await act(async()=>env.root.unmount());}
});

domTest('actual Home dynamic Share-safe removes private core/Studio fields without writing or clearing them and restores their exact values',async()=>{
 const env=await environment();try{
  const marker='PRIVATE_DYNAMIC_STUDIO_SENTINEL';await env.changeResult(marker);const before=await env.exportCurrent(),stored=JSON.stringify([...env.data]);
  await act(async()=>{location.search='?share=1';window.dispatchEvent(new window.Event('popstate'));});
  assert.equal(document.getElementById('studio-result'),null);assert.ok(!document.body.textContent.includes(marker));assert.ok(![...document.querySelectorAll('input,textarea')].some(node=>node.value?.includes(marker)));assert.equal(JSON.stringify([...env.data]),stored);
  for(const flush of env.autosaves)await act(async()=>flush());assert.equal(JSON.stringify([...env.data]),stored,'public projections must never flush into the writer');
  await act(async()=>{location.search='';window.dispatchEvent(new window.Event('popstate'));});assert.ok(document.getElementById('studio-result'));const after=await env.exportCurrent();assert.ok(Number.isFinite(Date.parse(before.exportedAt)));assert.ok(Number.isFinite(Date.parse(after.exportedAt)));delete before.exportedAt;delete after.exportedAt;assert.deepEqual(after,before);
 }finally{await act(async()=>env.root.unmount());}
});

domTest('all opened Atlas panels have unique rendered IDs in private, shared and returned private views',async()=>{
 const env=await environment();try{
  const labs=[['beginner-academy','Beginner Academy'],['evaluation-workbench','Evaluation Workbench'],['knowledge-studio','Knowledge Systems Studio'],['paper-analysis-studio','Paper Analysis Studio'],['operator-core','Operator Core']];
  for(const [id,title]of labs){
   if(document.querySelector(`.lab-gate[data-lab="${id}"][data-open="true"] section:not(.lab-gateway)`))continue;
   await act(async()=>button(`Open ${title} →`).click());
   for(let attempt=0;attempt<350&&!document.querySelector(`.lab-gate[data-lab="${id}"] section:not(.lab-gateway)`);attempt++)await act(async()=>pause());
   assert.ok(document.querySelector(`.lab-gate[data-lab="${id}"] section:not(.lab-gateway)`),`${title} must actually open before inspecting IDs`);
  }
  const unique=view=>{const ids=[...document.querySelectorAll('[id]')].map(node=>node.id),duplicates=ids.filter((id,index)=>ids.indexOf(id)!==index);assert.deepEqual(duplicates,[],`${view}: duplicate rendered IDs`);for(const id of ['main-content','roadmap',...labs.map(([id])=>id)])assert.equal(ids.filter(value=>value===id).length,1,`${view}: exact single target #${id}`);assert.equal(document.querySelectorAll('.lab-gate[data-open="true"]').length,5);for(const [id,title]of labs)assert.ok(document.querySelector(`.lab-gate[data-lab="${id}"] section:not(.lab-gateway)`),`${view}: ${title} must render its real panel, not an error/loading gateway`);assert.deepEqual(env.caught,[],`${view}: no caught render errors may silently replace a panel`);};
  unique('private');await act(async()=>{location.search='?share=1';window.dispatchEvent(new window.Event('popstate'));});unique('shared');await act(async()=>{location.search='';window.dispatchEvent(new window.Event('popstate'));});unique('returned private');
 }finally{await act(async()=>env.root.unmount());}
});
