import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
const read=p=>readFileSync(new URL('../public/'+p,import.meta.url),'utf8');

async function fixture(subject,{share=false,stored=null,storageFails=false}={}){
 const elements=new Map(),writes=[],events={};
 const element=id=>{if(!elements.has(id))elements.set(id,{value:['unit','kind','yearPair'].includes(id)?'all':'',checked:false,innerHTML:'',textContent:'',hidden:false,disabled:false,listeners:{},addEventListener(name,fn){this.listeners[name]=fn;},insertAdjacentHTML(_,s){this.innerHTML+=s;},replaceChildren(){this.innerHTML='';},setAttribute(){},querySelector(){return element('submit');},scrollIntoView(){},focus(){},click(){}});return elements.get(id);};
 const body={dataset:{subject,host:'power'},classList:{toggle(){}}};
 const context=vm.createContext({URL,URLSearchParams,Intl,Date,Blob,setTimeout,crypto:webcrypto,matchMedia:()=>({matches:true}),confirm:()=>true,fetch:async()=>({ok:true,json:async()=>JSON.parse(read(subject+'-intelligence/source-audit.json'))}),location:{href:`https://example.test/${subject}-intelligence/${share?'?share=1':''}`,search:share?'?share=1':''},history:{replaceState(){}},localStorage:{getItem(key){if(storageFails)throw Error('denied');return key.includes('intelligence')?stored:null;},setItem(key,value){if(storageFails)throw Error('quota');writes.push({key,value});stored=value;}},document:{body,getElementById:element,querySelector:()=>element('main'),querySelectorAll:()=>[],createElement:()=>element('anchor'),addEventListener(name,fn){events[name]=fn;}},window:{addEventListener(){}}});
 vm.runInContext(read('subject-intelligence/model.js'),context);vm.runInContext(read('subject-intelligence/app.js'),context);
 await new Promise(resolve=>setImmediate(resolve));await new Promise(resolve=>setImmediate(resolve));
 return {element,writes,body,context};
}
test('both explorers initialize their real data and render the right public denominators',async()=>{
 for(const s of ['chemistry','biology']){const f=await fixture(s);assert.match(f.element('metrics').innerHTML,s==='chemistry'?/>50</:/>86</);assert.ok(f.element('items').innerHTML.includes('data-practice'));assert.ok(!f.element('main').innerHTML.includes('could not load'));}
});
test('share entry does not read denied private storage and removes personal rendering',async()=>{
 const f=await fixture('chemistry',{share:true,storageFails:true});assert.ok(f.element('metrics').innerHTML.includes('50'));assert.equal(f.element('history').innerHTML,'');assert.ok(!f.element('items').innerHTML.includes('data-practice'));assert.equal(f.writes.length,0);
});
test('a real submit stores normalized evidence and share toggle clears the personal DOM',async()=>{
 const f=await fixture('chemistry');for(const [k,v] of Object.entries({attemptItem:'chem-q5',role:'baseline',earned:'0',total:'1',guesses:'0',minutes:'2',target:'2',confidence:'5',error:'concept',reference:'2025 Q05',note:'Use equilibrium pressure.'}))f.element(k).value=v;f.element('unaided').checked=true;
 f.element('attemptForm').listeners.submit({preventDefault(){}});assert.equal(f.writes.length,1);assert.equal(JSON.parse(f.writes[0].value).records[0].earned,0);assert.match(f.element('queue').innerHTML,/Narrow repair/);
 f.element('shareToggle').listeners.click();assert.equal(f.element('history').innerHTML,'');assert.equal(f.element('queue').innerHTML,'');
 f.element('shareToggle').listeners.click();assert.match(f.element('history').innerHTML,/2025 Q05/);assert.equal(f.writes.length,1);
});
test('unreadable saved bytes block ordinary writes and retain a recovery warning',async()=>{
 const f=await fixture('biology',{stored:'{broken'});assert.match(f.element('dataStatus').textContent,/preserved/);assert.equal(f.element('submit').disabled,true);f.element('attemptForm').listeners.submit({preventDefault(){}});assert.equal(f.writes.length,0);
});
test('an older tab cannot overwrite a newer subject log; unsaved evidence remains available in memory',async()=>{
 const f=await fixture('chemistry'),key='al_performance_powerhouse_chemistry_intelligence_v1';
 const newer=JSON.stringify({version:1,subject:'chemistry',records:[]});f.context.localStorage.setItem(key,newer);
 for(const [k,v] of Object.entries({attemptItem:'chem-q5',role:'baseline',earned:'0',total:'1',guesses:'0',minutes:'2',target:'2',confidence:'5',error:'concept',reference:'2025 Q05',note:'Review pressures'}))f.element(k).value=v;f.element('unaided').checked=true;
 f.element('attemptForm').listeners.submit({preventDefault(){}});assert.equal(f.writes.length,1);assert.match(f.element('dataStatus').textContent,/Another tab/);assert.match(f.element('history').innerHTML,/2025 Q05/);
});
