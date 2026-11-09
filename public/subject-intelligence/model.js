/* Pure evidence rules shared by the two subject explorers. */
(function(root){
  const day=(time=Date.now())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Colombo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(time));
  const shift=(date,n)=>new Date(Date.parse(date+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
  const operation=row=>{
    const t=(row.topic||row.family||'').toLowerCase();
    if(/comparison|non-mendelian|diversity|classes|phyla/.test(t))return 'Comparison';
    if(/structure|histology|tissue|protein|carbohydrate|lipid|properties of water|skeleton/.test(t))return 'Structure & function';
    if(/inheritance|pedigree|mutation|hardy|gmo|pcr|recombinant|breeding/.test(t))return 'Genetics & molecular logic';
    if(/microb|nitrogen|biome|biodiversity|preservation|culture|spoilage|treatment|agricultur/.test(t))return 'Ecology & application';
    return 'Mechanism';
  };
  function items(data,subject){
    if(subject==='chemistry')return data.questions.map(r=>({...r,id:'chem-q'+r.q,name:r.concept,kind:r.similarity,refs:r.prior_refs,reference:'2025 Q'+String(r.q).padStart(2,'0')}));
    return [...data.revision_bank.map(r=>({...r,sourceUnit:r.unit,unit:r.id===4?2:r.id===28?3:r.unit,id:'bio-bank'+r.id,name:r.topic,kind:operation(r),refs:[],reference:'Breadth bank topic '+r.id})),...data.recent_evidence_families.map((r,i)=>({...r,sourceUnit:r.unit,unit:i===10?3:r.unit,id:'bio-recent'+i,name:r.family,kind:operation(r),refs:[r.mcq_evidence],reference:r.mcq_evidence,recent:true}))];
  }
  function normalize(rows,ids){
    if(!Array.isArray(rows)||rows.length>10000)throw Error('Invalid practice-record list.');
    const seen=new Set();
    return rows.map(r=>{
      const numeric=['earned','total','guesses','minutes','target','confidence'].every(k=>typeof r?.[k]==='number'&&Number.isFinite(r[k]));
      const valid=numeric&&ids.has(r.itemId)&&typeof r.id==='string'&&r.id.length>0&&r.id.length<=100&&!seen.has(r.id)&&['baseline','reattempt','transfer','retest'].includes(r.role)&&r.earned>=0&&r.earned<=r.total&&r.total>0&&r.total<=1000&&Number.isInteger(r.guesses)&&r.guesses>=0&&r.guesses<=1000&&r.minutes>0&&r.minutes<=600&&r.target>0&&r.target<=600&&Number.isInteger(r.confidence)&&r.confidence>=1&&r.confidence<=5&&typeof r.unaided==='boolean'&&typeof r.novel==='boolean'&&typeof r.reference==='string'&&r.reference.trim().length>0&&r.reference.length<=300&&typeof r.note==='string'&&r.note.length<=2000&&typeof r.error==='string'&&r.error.length<=80&&typeof r.at==='string'&&!Number.isNaN(Date.parse(r.at))&&Date.parse(r.at)<=Date.now()+60000;
      if(!valid)throw Error('A practice record contains invalid marks, references, timing or identity.');
      seen.add(r.id);return {id:r.id,itemId:r.itemId,role:r.role,earned:r.earned,total:r.total,guesses:r.guesses,minutes:r.minutes,target:r.target,confidence:r.confidence,unaided:r.unaided,novel:r.novel,reference:r.reference,note:r.note,error:r.error,at:r.at};
    });
  }
  const clean=r=>r.unaided&&r.guesses===0&&r.error==='none'&&(r.total<=5?r.earned===r.total:r.earned/r.total>=.85)&&r.minutes<=r.target;
  function summary(rows,now=Date.now()){
    const sorted=[...rows].sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));
    const total=rows.reduce((n,r)=>n+r.total,0),earned=rows.reduce((n,r)=>n+r.earned,0),failures=rows.filter(r=>!clean(r)).length;
    const slow=rows.filter(r=>r.minutes>r.target).length,mismatch=rows.filter(r=>r.confidence>=4&&!clean(r)).length;
    const score=rows.length?Math.round(60*(1-earned/total)+15*Math.min(failures/3,1)+15*slow/rows.length+10*mismatch/rows.length):null;
    const lastFailure=sorted.filter(r=>!clean(r)).at(-1);
    const transfer=sorted.filter(r=>r.role==='transfer'&&r.novel&&clean(r)&&(!lastFailure||Date.parse(r.at)>Date.parse(lastFailure.at))).at(-1);
    const due=transfer?shift(day(transfer.at),3):null;
    const retest=transfer?sorted.find(r=>r.role==='retest'&&clean(r)&&Date.parse(r.at)>=Date.parse(transfer.at)+3*86400000):null;
    const latest=sorted.at(-1),newFailure=latest&&!clean(latest);
    let action=!rows.length?'Start a diagnostic':newFailure?'Narrow repair → closed-book reattempt':!transfer?'Prove fresh transfer':retest?'3-day retest passed · continue spaced practice':now>=Date.parse(transfer.at)+3*86400000?'Delayed retest due':'Retest scheduled · wait at least 72 hours';
    return {total,earned,score,count:rows.length,failures,slow,mismatch,transfer,due,retest,action,closed:!!retest&&!newFailure};
  }
  function filter(rows,{search='',unit='all',kind='all'}={}){
    const q=search.toLowerCase().trim();return rows.filter(r=>(unit==='all'||String(r.unit)===unit)&&(kind==='all'||r.kind===kind)&&(!q||[r.name,r.reference,...r.refs,r.essay_history||''].join(' ').toLowerCase().includes(q)));
  }
  function coreByUnit(core,subject){
    if(!core||!Array.isArray(core.attempts))return [];
    const units=new Map();for(const r of core.attempts){
      const parts=String(r.topicKey||'').split('|'),u=Number(parts[1])+1;
      if(r.subject!==subject||parts[0]!==subject||!Number.isInteger(u)||u<1||!Number.isFinite(r.earned)||!Number.isFinite(r.total)||r.total<=0||r.earned<0||r.earned>r.total)continue;
      const a=units.get(u)||{unit:u,count:0,earned:0,total:0};a.count++;a.earned+=r.earned;a.total+=r.total;units.set(u,a);
    }return [...units.values()].sort((a,b)=>a.unit-b.unit);
  }
  root.SubjectIntelligence={day,shift,operation,items,normalize,clean,summary,filter,coreByUnit};
})(globalThis);
