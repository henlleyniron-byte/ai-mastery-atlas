import {parseRuns,reviewQueue,day} from './run-model.js';
const host=document.createElement('section');host.className='workflow-review-home';host.id='workflow-practice-review';
const site=document.documentElement.dataset.uiFamily==='atlas'?'atlas':'powerhouse';
const heading=document.createElement('h3'),text=document.createElement('p'),actions=document.createElement('div');heading.textContent='Continue your workflow practice';host.append(heading,text,actions);
async function init(){
 const target=document.getElementById('workflow-orientation')||document.getElementById('execution-desk');if(!target)return;target.after(host);
 const response=await fetch('/workflow-studio/missions.json');if(!response.ok){text.textContent='Open the studio to review your saved workflow runs.';return;}const config=await response.json();
 function render(){actions.replaceChildren();if(new URLSearchParams(location.search).get('share')==='1'||document.body.classList.contains('share-safe')){host.hidden=true;return;}host.hidden=false;
  try{const raw=localStorage.getItem(site+'-workflow-runs-v1'),runs=raw===null?[]:parseRuns(raw,site,config.missions,day()),queue=reviewQueue(runs,day()),next=queue[0];text.textContent=next?next.label+' · '+config.missions.find(m=>m.id===next.missionId).title+' · review date '+next.due+'. These are workflow records, separate from your paper or curriculum ledger.':runs.length+' completed workflow runs recorded. Choose a task and inspect its actual output before recording another result.';const a=document.createElement('a');a.textContent=next?'Review the next workflow action →':'Open a guided run desk →';a.href='/workflow-studio/?view='+(next?'review':'run')+'#'+(next?.missionId||config.missions[0].id);actions.append(a);}
  catch{text.textContent='Saved workflow runs could not be read safely. Their bytes remain unchanged; use the studio’s export and recovery controls.';const a=document.createElement('a');a.href='/workflow-studio/?view=review';a.textContent='Open workflow recovery →';actions.append(a);}
 }
 render();document.getElementById('share-safe-btn')?.addEventListener('click',render);window.addEventListener('storage',e=>{if(e.key===site+'-workflow-runs-v1'||e.key===null)render();});
}
init().catch(()=>{text.textContent='Open the workflow studio to continue your recorded practice.';});
