import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {createServer} from 'vite';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';

const packagePath=process.env.DOM_QA_PACKAGE;
const domTest=(name,fn)=>test(name,{skip:!packagePath},fn);
const markingUrl='https://www.doenets.lk/documents/evaluation-reports/new/09-E-Bilogy.pdf';
let vite;
after(()=>vite?.close());

async function environment({shared=false,search=''}={}){
  const {parseHTML}=await import(pathToFileURL(packagePath).href),{window}=parseHTML('<html><body><div id="root"></div></body></html>');
  Object.assign(globalThis,{window,document:window.document,HTMLElement:window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true,location:{search,hash:''},requestAnimationFrame:fn=>setTimeout(fn,0),cancelAnimationFrame:clearTimeout});
  window.HTMLElement.prototype.focus=function(){document.__focused=this;};
  window.HTMLElement.prototype.showModal=function(){this.setAttribute('open','');};
  window.HTMLElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new window.Event('close'));};
  const downloads=[],requests=[],followed=[];
  const originalFetch=globalThis.fetch,originalCreate=URL.createObjectURL,originalRevoke=URL.revokeObjectURL;
  globalThis.fetch=(...args)=>{requests.push(args);throw Error('The source hint must not fetch a document.');};
  URL.createObjectURL=blob=>{downloads.push(blob);return 'blob:synthetic-marking-test';};
  URL.revokeObjectURL=()=>{};
  window.HTMLAnchorElement.prototype.click=function(){if(this.hasAttribute('download'))return;this.dispatchEvent(new window.Event('click',{bubbles:true,cancelable:true}));};
  document.addEventListener('click',event=>{const anchor=event.target.closest?.('a');if(anchor?.href===markingUrl){followed.push(anchor.href);event.preventDefault();}});
  if(!vite)vite=await createServer({root:process.cwd(),appType:'custom',configFile:false,resolve:{alias:{'@':process.cwd()}},optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,hmr:false,ws:false}});
  const M=await vite.ssrLoadModule('/lib/paper-audit.ts'),{PaperAnalysisStudio}=await vite.ssrLoadModule('/components/paper-analysis-studio.tsx'),root=createRoot(document.getElementById('root'));
  await act(async()=>root.render(React.createElement(PaperAnalysisStudio,{shared})));
  return {root,window,M,downloads,requests,followed,async close(){await act(async()=>root.unmount());globalThis.fetch=originalFetch;URL.createObjectURL=originalCreate;URL.revokeObjectURL=originalRevoke;}};
}

const button=name=>[...document.querySelectorAll('button')].find(node=>node.textContent===name);
const field=name=>[...document.querySelectorAll('label')].find(node=>node.firstChild?.textContent===name)?.querySelector('input,select');
const props=node=>node[Object.keys(node).find(key=>key.startsWith('__reactProps$'))];
const source=()=>document.querySelector('[aria-label="2019 Biology NEW marking source"]');
async function edit(node,value){assert.ok(node);await act(async()=>props(node).onChange({target:{value}}));}
async function importSheet(window,sheet){
  const input=document.querySelector('input[type=file]'),raw=JSON.stringify(sheet);
  Object.defineProperty(input,'files',{configurable:true,value:[{size:Buffer.byteLength(raw),text:async()=>raw}]});
  try{await act(async()=>input.dispatchEvent(new window.Event('change',{bubbles:true})));}finally{delete input.files;}
  assert.equal(Object.hasOwn(input,'files'),false);
}
async function apply(window,sheet){await importSheet(window,sheet);assert.ok(button('Open reviewed worksheet'));await act(async()=>button('Open reviewed worksheet').click());}
async function exported(downloads,name='Export worksheet JSON'){
  const count=downloads.length;assert.ok(button(name));await act(async()=>button(name).click());assert.equal(downloads.length,count+1);return JSON.parse(await downloads.at(-1).text());
}
function fixture(M){return {...M.newPaperAudit(),subject:'Biology',year:2019,paperReference:'Synthetic 2019 English / NEW / exact sitting',paperSource:'synthetic-paper.pdf',schemeReference:'Synthetic unreviewed key revision',schemeSource:'synthetic-key.pdf',syllabusReference:'Synthetic syllabus references: U3 and U5 unresolved',expectedQuestions:50,rows:[{...M.newAuditRow(42),topic:'Synthetic mixed-unit hold',paperLocator:'paper p6 Q42',justification:'Synthetic boundary remains held; no answer inferred',review:'disputed'}]};}

domTest('the mounted source hint follows only the current Biology 2019 worksheet and makes its scope and revision limits explicit',async()=>{
  const env=await environment();try{
    assert.equal(source(),null);await edit(field('Subject'),'Biology');assert.ok(source());
    const anchor=source().querySelector('a');assert.equal(anchor.href,markingUrl);assert.equal(anchor.target,'_blank');assert.equal(anchor.rel,'noreferrer');
    assert.match(source().textContent,/NEW syllabus only/);assert.match(source().textContent,/revision check required/);assert.match(source().textContent,/Paper I key table: PDF page 11/);
    assert.match(source().textContent,/Amendments to be included/);assert.match(source().textContent,/exact paper, medium, sitting\/variant and latest amendments/);
    assert.match(source().textContent,/does not verify your source checks, answer labels or question classifications/);
    await edit(field('Paper year'),'2020');assert.equal(source(),null);await edit(field('Paper year'),'2019');assert.ok(source());
    for(const subject of ['Physics','Chemistry']){await edit(field('Subject'),subject);assert.equal(source(),null);}
    assert.deepEqual(env.requests,[]);assert.equal(document.querySelectorAll('iframe,object,embed').length,0);
  }finally{await env.close();}
});

domTest('opening the official source leaves the strict v1 worksheet, held Q42 and every retained working copy unchanged',async()=>{
  const env=await environment();try{
    const a=fixture(env.M),b={...fixture(env.M),paperReference:'Another synthetic exact sitting',schemeSource:'other-synthetic-key.pdf'};
    await apply(env.window,a);await apply(env.window,b);
    const before=await exported(env.downloads,'Export all working copies (2 previous)');assert.deepEqual(before.previous,[env.M.newPaperAudit(),a]);assert.deepEqual(before.current,b);
    await act(async()=>source().querySelector('a').click());assert.deepEqual(env.followed,[markingUrl]);assert.deepEqual(env.requests,[]);
    const current=await exported(env.downloads);assert.deepEqual(current,b);assert.deepEqual(env.M.parsePaperAudit(JSON.stringify(current)),b);
    assert.equal(current.rows[0].question,42);assert.equal(current.rows[0].review,'disputed');assert.equal(current.rows[0].answer,'');assert.deepEqual(current.checks,{paperIdentity:false,schemeIdentity:false,ocrSpotCheck:false});
    assert.deepEqual(await exported(env.downloads,'Export all working copies (2 previous)'),before);
    await importSheet(env.window,{...b,futureEvidence:'must stay unsupported'});assert.equal(document.querySelector('.paper-audit-import'),null);
    assert.deepEqual(await exported(env.downloads),b);assert.deepEqual(await exported(env.downloads,'Export all working copies (2 previous)'),before);
  }finally{await env.close();}
});

domTest('the source hint disappears in a dynamic Share-safe view while the exact private worksheet returns intact',async()=>{
  const env=await environment();try{
    const a=fixture(env.M);await apply(env.window,a);assert.ok(source());
    await act(async()=>{location.search='?share=1';env.window.dispatchEvent(new env.window.Event('popstate'));});
    assert.equal(source(),null);assert.equal(document.querySelectorAll('#paper-analysis-studio input,#paper-analysis-studio textarea').length,0);assert.equal(button('Export worksheet JSON'),undefined);
    assert.match(document.getElementById('paper-analysis-studio').textContent,/Public method; private worksheet hidden/);assert.deepEqual(env.requests,[]);
    await act(async()=>{location.search='';env.window.dispatchEvent(new env.window.Event('popstate'));});
    assert.ok(source());assert.deepEqual(await exported(env.downloads),a);assert.deepEqual(env.requests,[]);
  }finally{await env.close();}
});

domTest('explicit shared props and initially shared URLs render only the public method without a marking link or document request',async()=>{
  for(const options of [{shared:true},{search:'?share=1'}]){
    const env=await environment(options);try{
      assert.equal(source(),null);assert.equal(document.querySelectorAll('#paper-analysis-studio input,#paper-analysis-studio textarea').length,0);
      assert.equal(button('Export worksheet JSON'),undefined);assert.match(document.getElementById('paper-analysis-studio').textContent,/Public method; private worksheet hidden/);
      assert.deepEqual(env.requests,[]);assert.deepEqual(env.downloads,[]);
    }finally{await env.close();}
  }
});
