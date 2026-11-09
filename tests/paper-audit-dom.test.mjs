import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {createServer} from 'vite';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';

const packagePath=process.env.DOM_QA_PACKAGE;
const domTest=(name,fn)=>test(name,{skip:!packagePath},fn);
let vite;
after(()=>vite?.close());
async function environment(){
  const {parseHTML}=await import(pathToFileURL(packagePath).href),{window}=parseHTML('<html><body><div id="root"></div></body></html>');
  Object.assign(globalThis,{window,document:window.document,HTMLElement:window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true,location:{search:'',hash:''},requestAnimationFrame:fn=>setTimeout(fn,0),cancelAnimationFrame:clearTimeout});
  window.HTMLElement.prototype.focus=function(){document.__focused=this;};
  window.HTMLElement.prototype.showModal=function(){this.setAttribute('open','');};
  window.HTMLElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new window.Event('close'));};
  window.HTMLAnchorElement.prototype.click=()=>{};
  const downloads=[];URL.createObjectURL=blob=>{downloads.push(blob);return 'blob:synthetic';};URL.revokeObjectURL=()=>{};
  if(!vite)vite=await createServer({root:process.cwd(),appType:'custom',configFile:false,resolve:{alias:{'@':process.cwd()}},optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,hmr:false,ws:false}});
  const M=await vite.ssrLoadModule('/lib/paper-audit.ts'),{PaperAnalysisStudio}=await vite.ssrLoadModule('/components/paper-analysis-studio.tsx'),root=createRoot(document.getElementById('root'));
  await act(async()=>root.render(React.createElement(PaperAnalysisStudio)));
  return {root,window,M,downloads};
}
const button=name=>[...document.querySelectorAll('button')].find(node=>node.textContent===name);
const field=name=>[...document.querySelectorAll('label')].find(node=>node.firstChild?.textContent===name)?.querySelector('input,select');
const props=node=>node[Object.keys(node).find(key=>key.startsWith('__reactProps$'))];
async function edit(node,value){await act(async()=>props(node).onChange({target:{value}}));}
async function importSheet(window,a){const input=document.querySelector('input[type=file]'),raw=JSON.stringify(a);Object.defineProperty(input,'files',{configurable:true,value:[{size:Buffer.byteLength(raw),text:async()=>raw}]});await act(async()=>input.dispatchEvent(new window.Event('change',{bubbles:true})));}
function fixture(M){return {...M.newPaperAudit(),subject:'Biology',year:2021,paperReference:'Synthetic exact sitting/English/I',paperSource:'synthetic-paper.pdf',schemeReference:'Synthetic scheme revision',schemeSource:'synthetic-scheme.pdf',syllabusReference:'Synthetic era',expectedQuestions:4,checks:{paperIdentity:true,schemeIdentity:true,ocrSpotCheck:true},rows:[{...M.newAuditRow(1),topic:'Literal <topic>',demand:'Recall',answer:'A',paperLocator:'paper p1 Q1',schemeLocator:'scheme p1 Q1',justification:'Synthetic evidence only',review:'verified'}]};}
async function apply(window,a){await importSheet(window,a);assert.ok(button('Open reviewed worksheet'));await act(async()=>button('Open reviewed worksheet').click());}

domTest('mounted comparison shows literal source quarantine, missing IDs and exact private snapshots without changing either sheet',async()=>{
  const {root,window,M,downloads}=await environment();try{
    const a=fixture(M),b=structuredClone(a);b.paperSource='<img src=x onerror=bad()> other-source.pdf';b.rows=[{...b.rows[0],question:2,topic:'Other topic',review:'disputed'}];const beforeA=JSON.stringify(a),beforeB=JSON.stringify(b);
    await apply(window,a);await apply(window,b);await edit(field('Retained worksheet to compare'),'1');
    assert.match(document.querySelector('.paper-audit-comparison').textContent,/Quarantined source comparison/);
    assert.match(document.querySelector('.paper-audit-comparison').textContent,/Q1 — missing-current/);
    assert.match(document.querySelector('.paper-audit-comparison').textContent,/Q3 — missing-both/);
    assert.equal(document.querySelectorAll('.paper-audit-comparison img').length,0);
    await act(async()=>button('Export private comparison JSON').click());const exported=JSON.parse(await downloads.at(-1).text());
    assert.deepEqual(exported.current,b);assert.deepEqual(exported.previous,a);assert.equal(exported.quarantined,true);assert.equal(JSON.stringify(a),beforeA);assert.equal(JSON.stringify(b),beforeB);
    await act(async()=>button('Download printable adjudication').click());const html=await downloads.at(-1).text();assert.ok(html.includes('&lt;img'));assert.doesNotMatch(html,/<img|<script/i);assert.match(html,/MISSING ROW/);
  }finally{await act(async()=>root.unmount());}
});

domTest('search and next-gap navigation retain source records and only an explicit action creates a blank missing row',async()=>{
  const {root,window,M,downloads}=await environment();try{
    const a=fixture(M);await apply(window,a);await edit(field('Search exact question evidence'),'Q77');assert.equal(document.querySelectorAll('.paper-audit-question').length,0);
    await act(async()=>button('Next evidence gap').click());assert.match(document.getElementById('paper-audit-gap').textContent,/Q2: Missing row/);assert.equal(document.querySelectorAll('.paper-audit-question').length,1);
    await act(async()=>button('Export worksheet JSON').click());assert.deepEqual(JSON.parse(await downloads.at(-1).text()),a);
    await act(async()=>button('Add blank Q2 row').click());await act(async()=>button('Export worksheet JSON').click());const saved=JSON.parse(await downloads.at(-1).text());assert.equal(saved.rows[1].question,2);assert.equal(saved.rows[1].answer,'');assert.equal(saved.rows[1].review,'unverified');assert.equal(saved.rows[0].review,'verified');
  }finally{await act(async()=>root.unmount());}
});

domTest('changed denominator clears the selected gap and captured stale add handlers cannot insert an out-of-range row',async()=>{
  const {root,window,M,downloads}=await environment();try{
    const a=fixture(M);await apply(window,a);for(let n=0;n<3;n++)await act(async()=>button('Next evidence gap').click());
    const staleAdd=props(button('Add blank Q4 row')).onClick;await edit(field('Expected MCQ count, if checked'),'2');assert.equal(document.getElementById('paper-audit-gap'),null);
    await act(async()=>staleAdd());await act(async()=>button('Export worksheet JSON').click());const saved=JSON.parse(await downloads.at(-1).text());assert.equal(saved.expectedQuestions,2);assert.deepEqual(saved.rows,a.rows);assert.doesNotThrow(()=>M.validatePaperAudit(saved));
  }finally{await act(async()=>root.unmount());}
});

domTest('Share-safe clears comparison/brief/pending previews and captured exports or late imports cannot expose private copies',async()=>{
  const {root,window,M,downloads}=await environment();try{
    const a=fixture(M);await apply(window,a);await apply(window,a);await edit(field('Retained worksheet to compare'),'1');
    const staleExport=props(button('Export private comparison JSON')).onClick,stalePrint=props(button('Download printable adjudication')).onClick;await act(async()=>button('Review adjudication brief').click());assert.ok(document.querySelector('dialog[open]'));
    let finish;const pending=new Promise(resolve=>{finish=resolve;}),input=document.querySelector('input[type=file]');Object.defineProperty(input,'files',{configurable:true,value:[{size:20,text:()=>pending}]});await act(async()=>input.dispatchEvent(new window.Event('change',{bubbles:true})));
    await act(async()=>{location.search='?share=1';window.dispatchEvent(new window.Event('popstate'));});const count=downloads.length;
    await act(async()=>{staleExport();stalePrint();finish(JSON.stringify({...a,paperReference:'Private late preview'}));await pending;});
    assert.equal(downloads.length,count);assert.equal(document.querySelector('.paper-audit-comparison'),null);assert.equal(document.querySelector('dialog'),null);assert.equal(document.querySelectorAll('#paper-analysis-studio input').length,0);
    await act(async()=>{location.search='';window.dispatchEvent(new window.Event('popstate'));});assert.equal(field('Retained worksheet to compare').value,'');assert.equal(document.querySelector('.paper-audit-import'),null);
    await act(async()=>button('Export worksheet JSON').click());assert.deepEqual(JSON.parse(await downloads.at(-1).text()),a);
  }finally{await act(async()=>root.unmount());}
});

domTest('a retained copy exports and restores independently of an invalid current comparison while every working field survives',async()=>{
  const {root,window,M,downloads}=await environment();try{
    const a=fixture(M),b={...fixture(M),paperReference:'Second exact synthetic sitting'};await apply(window,a);await apply(window,b);await edit(field('Expected MCQ count, if checked'),'0');await edit(field('Retained worksheet to compare'),'1');
    assert.match(document.querySelector('.paper-audit-comparison').textContent,/Comparison paused/);assert.equal(document.querySelector('.paper-audit-recovery pre').textContent,JSON.stringify(a,null,2));
    await act(async()=>button('Export selected retained JSON').click());assert.deepEqual(JSON.parse(await downloads.at(-1).text()),a);
    await act(async()=>button('Review restoring this retained worksheet').click());await act(async()=>new Promise(resolve=>setTimeout(resolve,5)));assert.equal(document.__focused.id,'paper-audit-restore-title');
    await act(async()=>button('Archive current worksheet and restore this copy').click());await act(async()=>new Promise(resolve=>setTimeout(resolve,5)));assert.ok(document.__focused.classList.contains('paper-audit-status'));
    await act(async()=>button('Export worksheet JSON').click());assert.deepEqual(JSON.parse(await downloads.at(-1).text()),a);
    await act(async()=>button('Export all working copies (3 previous)').click());const recovery=JSON.parse(await downloads.at(-1).text());assert.deepEqual(recovery.previous[0],M.newPaperAudit());assert.deepEqual(recovery.previous[1],a);assert.deepEqual(recovery.previous[2],{...b,expectedQuestions:0});assert.equal(recovery.pending,null);
  }finally{await act(async()=>root.unmount());}
});

domTest('an invalid retained draft stays literal recovery JSON with restoration disabled and strict imports unchanged',async()=>{
  const {root,window,M,downloads}=await environment();try{
    const a=fixture(M),b={...fixture(M),paperReference:'Current valid sitting'};await apply(window,a);await edit(field('Expected MCQ count, if checked'),'0');await apply(window,b);await edit(field('Retained worksheet to compare'),'1');
    assert.match(document.querySelector('.paper-audit-recovery').textContent,/Recovery-only \/ unvalidated/);assert.equal(button('Review restoring this retained worksheet').disabled,true);
    await act(async()=>button('Export selected retained JSON').click());const raw=await downloads.at(-1).text();assert.deepEqual(JSON.parse(raw),{...a,expectedQuestions:0});assert.throws(()=>M.parsePaperAudit(raw));
    await act(async()=>props(button('Review restoring this retained worksheet')).onClick());assert.equal(document.querySelector('.paper-audit-restore'),null);await act(async()=>button('Export worksheet JSON').click());assert.deepEqual(JSON.parse(await downloads.at(-1).text()),b);
  }finally{await act(async()=>root.unmount());}
});

domTest('edits, selection round trips and Share-safe invalidate captured restore and export controls',async()=>{
  const {root,window,M,downloads}=await environment();try{
    const a=fixture(M),b={...fixture(M),paperReference:'Current private work'};await apply(window,a);await apply(window,b);await edit(field('Retained worksheet to compare'),'1');
    await act(async()=>button('Review restoring this retained worksheet').click());const staleConfirm=props(button('Archive current worksheet and restore this copy')).onClick,staleExport=props(button('Export selected retained JSON')).onClick;
    await edit(field('Exact paper identity'),'New unsaved work');assert.equal(document.querySelector('.paper-audit-restore'),null);await act(async()=>staleConfirm());await act(async()=>button('Export worksheet JSON').click());assert.equal(JSON.parse(await downloads.at(-1).text()).paperReference,'New unsaved work');
    await act(async()=>button('Review restoring this retained worksheet').click());const selectionConfirm=props(button('Archive current worksheet and restore this copy')).onClick;await edit(field('Retained worksheet to compare'),'0');await edit(field('Retained worksheet to compare'),'1');await act(async()=>selectionConfirm());assert.equal(document.querySelector('.paper-audit-restore'),null);
    await act(async()=>button('Review restoring this retained worksheet').click());const privacyConfirm=props(button('Archive current worksheet and restore this copy')).onClick;
    await act(async()=>{location.search='?share=1';window.dispatchEvent(new window.Event('popstate'));});const count=downloads.length;await act(async()=>{privacyConfirm();staleExport();});assert.equal(downloads.length,count);assert.equal(document.querySelector('.paper-audit-recovery'),null);assert.equal(document.querySelectorAll('#paper-analysis-studio textarea').length,0);
    await act(async()=>{location.search='';window.dispatchEvent(new window.Event('popstate'));});await edit(field('Retained worksheet to compare'),'1');await act(async()=>{privacyConfirm();staleExport();});assert.equal(downloads.length,count);assert.equal(document.querySelector('.paper-audit-restore'),null);
    await act(async()=>button('Export worksheet JSON').click());assert.equal(JSON.parse(await downloads.at(-1).text()).paperReference,'New unsaved work');
  }finally{await act(async()=>root.unmount());}
});

domTest('an in-flight or pending import blocks restore until explicit cancellation and cannot return after a later restore',async()=>{
  const {root,window,M,downloads}=await environment();try{
    const a=fixture(M),b={...fixture(M),paperReference:'Current before interrupted import'};await apply(window,a);await apply(window,b);await edit(field('Retained worksheet to compare'),'1');await act(async()=>button('Review restoring this retained worksheet').click());const staleConfirm=props(button('Archive current worksheet and restore this copy')).onClick;
    let finish;const late=new Promise(resolve=>{finish=resolve;}),input=document.querySelector('input[type=file]');Object.defineProperty(input,'files',{configurable:true,value:[{size:40,text:()=>late}]});await act(async()=>input.dispatchEvent(new window.Event('change',{bubbles:true})));
    assert.equal(button('Review restoring this retained worksheet').disabled,true);assert.equal(document.querySelector('.paper-audit-restore'),null);await act(async()=>staleConfirm());await act(async()=>button('Cancel import').click());
    await act(async()=>button('Review restoring this retained worksheet').click());await act(async()=>button('Archive current worksheet and restore this copy').click());await act(async()=>{finish(JSON.stringify({...b,paperReference:'Late discarded import'}));await late;});assert.equal(document.querySelector('.paper-audit-import'),null);
    await act(async()=>button('Export worksheet JSON').click());assert.deepEqual(JSON.parse(await downloads.at(-1).text()),a);await edit(field('Retained worksheet to compare'),'1');await importSheet(window,b);assert.equal(button('Review restoring this retained worksheet').disabled,true);await act(async()=>button('Cancel import').click());assert.equal(button('Review restoring this retained worksheet').disabled,false);
  }finally{await act(async()=>root.unmount());}
});

domTest('five retained copies cannot be silently evicted, but each selected copy still exports for a new private tab',async()=>{
  const {root,window,M,downloads}=await environment();try{
    const originals=[];for(let n=0;n<5;n++){const a={...fixture(M),paperReference:'Synthetic sitting '+n};originals.push(a);await apply(window,a);}
    await edit(field('Retained worksheet to compare'),'1');assert.equal(button('Review restoring this retained worksheet').disabled,true);assert.match(document.querySelector('.paper-audit-recovery').textContent,/Nothing is evicted/);
    await act(async()=>button('Export selected retained JSON').click());assert.deepEqual(JSON.parse(await downloads.at(-1).text()),originals[0]);await act(async()=>props(button('Review restoring this retained worksheet')).onClick());assert.equal(document.querySelector('.paper-audit-restore'),null);
    await act(async()=>button('Export all working copies (5 previous)').click());const all=JSON.parse(await downloads.at(-1).text());assert.deepEqual(all.current,originals[4]);assert.deepEqual(all.previous,[M.newPaperAudit(),...originals.slice(0,4)]);
  }finally{await act(async()=>root.unmount());}
});

domTest('a captured older import preview cannot apply a newer file that has not been explicitly reviewed',async()=>{
  const {root,window,M,downloads}=await environment();try{
    const current=fixture(M),a={...fixture(M),paperReference:'Earlier pending import'},b={...fixture(M),paperReference:'New pending import'};await apply(window,current);await importSheet(window,a);const staleApply=props(button('Open reviewed worksheet')).onClick;await importSheet(window,b);
    await act(async()=>staleApply());assert.match(document.querySelector('.paper-audit-import').textContent,/New pending import/);await act(async()=>button('Export worksheet JSON').click());assert.deepEqual(JSON.parse(await downloads.at(-1).text()),current);
    await act(async()=>button('Open reviewed worksheet').click());await act(async()=>button('Export worksheet JSON').click());assert.deepEqual(JSON.parse(await downloads.at(-1).text()),b);await act(async()=>button('Export all working copies (2 previous)').click());assert.deepEqual(JSON.parse(await downloads.at(-1).text()).previous,[M.newPaperAudit(),current]);
  }finally{await act(async()=>root.unmount());}
});

domTest('same-value retained selection after cancelling a late import keeps fresh recovery controls usable',async()=>{
  const {root,window,M,downloads}=await environment();try{
    const a=fixture(M),b={...fixture(M),paperReference:'Current work before cancelled import'};await apply(window,a);await apply(window,b);await edit(field('Retained worksheet to compare'),'1');
    let finish;const late=new Promise(resolve=>{finish=resolve;}),input=document.querySelector('input[type=file]');Object.defineProperty(input,'files',{configurable:true,value:[{size:40,text:()=>late}]});await act(async()=>input.dispatchEvent(new window.Event('change',{bubbles:true})));await act(async()=>button('Cancel import').click());
    await act(async()=>{finish(JSON.stringify({...b,paperReference:'Late cancelled file'}));await late;});delete input.files;assert.equal(document.querySelector('.paper-audit-import'),null);
    const staleExport=props(button('Export selected retained JSON')).onClick;await edit(field('Retained worksheet to compare'),'1');const before=downloads.length;await act(async()=>staleExport());assert.equal(downloads.length,before,'older selection callback must still be invalid');
    await act(async()=>button('Export selected retained JSON').click());assert.equal(downloads.length,before+1,'fresh rendered export must remain usable after a same-value selection');assert.deepEqual(JSON.parse(await downloads.at(-1).text()),a);
    await act(async()=>button('Review restoring this retained worksheet').click());assert.ok(button('Archive current worksheet and restore this copy'),'fresh restore review must open');await act(async()=>button('Archive current worksheet and restore this copy').click());await act(async()=>button('Export all working copies (3 previous)').click());const all=JSON.parse(await downloads.at(-1).text());assert.deepEqual(all.current,a);assert.deepEqual(all.previous,[M.newPaperAudit(),a,b]);
  }finally{await act(async()=>root.unmount());}
});

domTest('same-value retained selection without a pending import refreshes controls while older callbacks remain blocked',async()=>{
  const {root,window,M,downloads}=await environment();try{
    const a=fixture(M),b={...fixture(M),paperReference:'Current unmodified worksheet'};await apply(window,a);await apply(window,b);await edit(field('Retained worksheet to compare'),'1');
    await act(async()=>button('Review restoring this retained worksheet').click());const staleConfirm=props(button('Archive current worksheet and restore this copy')).onClick;await act(async()=>button('Cancel restore review').click());const staleExport=props(button('Export selected retained JSON')).onClick;
    await edit(field('Retained worksheet to compare'),'1');const before=downloads.length;await act(async()=>{staleExport();staleConfirm();});assert.equal(downloads.length,before);assert.equal(document.querySelector('.paper-audit-restore'),null);
    await act(async()=>button('Export selected retained JSON').click());assert.equal(downloads.length,before+1);assert.deepEqual(JSON.parse(await downloads.at(-1).text()),a);await act(async()=>button('Review restoring this retained worksheet').click());assert.ok(button('Archive current worksheet and restore this copy'));await act(async()=>button('Cancel restore review').click());
    await act(async()=>button('Export all working copies (2 previous)').click());assert.deepEqual(JSON.parse(await downloads.at(-1).text()),{schema:'atlas-paper-audit-working-copies-v1',notice:'Private working copies. Each audit member can be reviewed separately; this bundle is not a direct worksheet import.',current:b,previous:[M.newPaperAudit(),a],pending:null});
  }finally{await act(async()=>root.unmount());}
});
