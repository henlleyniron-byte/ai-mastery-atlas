/* Private corpus and sessions are additive; no existing Powerhouse namespace is written. */
(() => {
  'use strict';
  const SUBJECTS = ['biology', 'chemistry', 'physics'];
  const KEY = 'alpp_science_sessions_v1';
  const STATUSES = ['PROVISIONAL','UNCLASSIFIED','TEACHER CHECK','SOURCE VALIDATED','INDEPENDENTLY CHECKED','OFFICIAL-SOURCE CHECKED','NOT AUDITED'];
  const STAGES = ['Target','Timed attempt','Strict marking','Diagnose','Minimum repair','Reattempt + fresh transfer','Schedule retests'];
  const PHASE_MINUTES = [5,30,15,10,15,10,5];
  const today = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Colombo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const BAD = new Set(['__proto__','constructor','prototype']);
  const fail = m => { throw new Error(m); };
  const plain = o => !!o && typeof o==='object' && !Array.isArray(o);
  const str = (x,max=8000) => typeof x==='string' && x.length<=max;
  const number = (x,min,max) => typeof x==='number' && Number.isFinite(x) && x>=min && x<=max;
  const integer = (x,min,max) => Number.isSafeInteger(x) && number(x,min,max);
  const unit = (v,s) => typeof v==='string' && new RegExp('^U([1-9]|1[0-'+(s==='chemistry'?4:s==='physics'?1:0)+'])$').test(v);
  const date = d => typeof d==='string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d+'T12:00:00Z')) && new Date(d+'T12:00:00Z').toISOString().slice(0,10)===d;
  function safeTree(o,depth=0) {
    if(depth>20)fail('Import nesting is too deep.');
    if(typeof o==='string' && o.length>20000)fail('Import text is too long.');
    if(o && typeof o==='object')for(const [k,v] of Object.entries(o)){if(BAD.has(k))fail('Unsafe import key.');safeTree(v,depth+1);}
  }
  function parse(text,max=12_000_000) {
    if(!str(text,max))fail('File is too large or unreadable.');
    const o=JSON.parse(text); safeTree(o);return o;
  }
  const id = r => [r.subject,r.exam_year,r.paper_part,r.question_number,r.subpart||''].join(':');
  const denominator = (s,y) => s==='physics' && y<=2010?60:50;
  function validatePackage(p) {
    safeTree(p);
    if(!plain(p) || p.schema!=='powerhouse-science-package' || p.schema_version!==1 || !str(p.dataset_version,100))fail('Unsupported science package.');
    if(!plain(p.units) || !Array.isArray(p.records) || p.records.length>6000 || !Array.isArray(p.diagnostics) || p.diagnostics.length!==70)fail('Incomplete corpus or diagnostic sets.');
    for(const s of SUBJECTS) {
      const us=p.units[s];
      if(!Array.isArray(us)||us.length!==({biology:10,chemistry:14,physics:11})[s]||new Set(us.map(x=>x.code)).size!==us.length)fail('Invalid unit map.');
      for(const u of us)if(!unit(u.code,s)||!str(u.name,200)||!integer(u.periods,0,600))fail('Invalid syllabus unit.');
    }
    const ids=new Set(),years=new Map(),counts={biology:0,chemistry:0,physics:0};
    for(const r of p.records) {
      if(!plain(r)||!SUBJECTS.includes(r.subject)||!integer(r.exam_year,2000,2100)||r.paper_part!=='I'||!integer(r.question_number,1,denominator(r.subject,r.exam_year))||r.subpart!==''||r.stable_id!==id(r)||ids.has(r.stable_id))fail('Invalid or duplicate question identity.');
      if(r.principal_unit!==null&&!unit(r.principal_unit,r.subject))fail('Invalid primary unit.');
      if(!STATUSES.includes(r.classification_status)||!str(r.concept_focus_paraphrase)||r.answer_status!=='WITHHELD'||typeof r.official_paper_verified!=='boolean')fail('Invalid classification or answer boundary.');
      if(r.principal_unit===null && r.classification_status!=='UNCLASSIFIED')fail('Missing unit must remain UNCLASSIFIED.');
      if(r.sitting_year!==null&&!integer(r.sitting_year,2000,2100))fail('Invalid sitting year.');
      if('answer' in r || 'provisional_answer' in r || 'answer_key' in r)fail('National answer keys cannot be imported into this explorer.');
      ids.add(r.stable_id);counts[r.subject]++;const k=r.subject+':'+r.exam_year;years.set(k,(years.get(k)||0)+1);
    }
    for(const [k,n] of years){const [s,y]=k.split(':');if(n!==denominator(s,Number(y)))fail('Incomplete year denominator: '+k);}
    for(const s of SUBJECTS)if(p.counts?.[s]!==counts[s])fail('Manifest count mismatch.');
    const positions=new Set(),targets=new Set(),sets={};
    for(const d of p.diagnostics) {
      if(!SUBJECTS.includes(d.subject)||!['A','B'].includes(d.set)||!integer(d.position,1,14)||d.position_id!==d.subject+':'+d.set+':'+d.position||positions.has(d.position_id)||!ids.has(d.stable_id)||!unit(d.principal_unit,d.subject)||d.answer_status!=='WITHHELD'||d.official_paper_verified!==false)fail('Invalid diagnostic position or unsupported trusted label.');
      const r=p.records.find(r=>r.stable_id===d.stable_id);
      if(!r || r.subject!==d.subject || r.exam_year!==d.exam_year || r.question_number!==d.question_number || r.paper_part!==d.paper_part || r.sitting_year!==d.sitting_year)fail('Diagnostic identity does not match its atlas row.');
      if(targets.has(d.stable_id))fail('Baseline and re-baseline reuse an identical question.');
      positions.add(d.position_id);targets.add(d.stable_id);const k=d.subject+':'+d.set;sets[k]=(sets[k]||0)+1;
    }
    for(const s of SUBJECTS)for(const set of ['A','B'])if(sets[s+':'+set]!==p.units[s].length)fail('Diagnostic unit coverage incomplete.');
    if(!Array.isArray(p.merge_decisions)||!Array.isArray(p.source_register)||!Array.isArray(p.paper2)||!Array.isArray(p.original_practice)||!Array.isArray(p.limitations))fail('Source and quality records missing.');
    return p;
  }
  function matrix(p,subject,years,version='candidate') {
    const rs=p.records.filter(r=>r.subject===subject && r.paper_part==='I');
    return [...p.units[subject],{code:'UNCLASSIFIED',name:'Unclassified — needs original visual'}].map(u=>({
      ...u,cells:years.map(y=>{
        const yr=rs.filter(r=>r.exam_year===y);
        if(!yr.length)return {year:y,count:null,share:null,state:'NOT AUDITED',ids:[]};
        const chosen=r=>subject==='biology' && version!=='candidate'?r.source_labels?.[version==='audit_copy'?'audit_copy':version]:r.principal_unit;
        const hit=yr.filter(r=>(chosen(r)||'UNCLASSIFIED')===u.code);
        const allVerified=yr.length===denominator(subject,y) && yr.every(r=>r.official_paper_verified && r.classification_status==='OFFICIAL-SOURCE CHECKED');
        return {year:y,count:hit.length,share:hit.length/denominator(subject,y),state:u.code==='UNCLASSIFIED'?'UNCLASSIFIED':allVerified&&!hit.length?'VERIFIED ZERO':allVerified?'OFFICIAL-SOURCE CHECKED':'PROVISIONAL',ids:hit.map(r=>r.stable_id)};
      })
    }));
  }
  function filter(p,f={}) {
    return p.records.filter(r=>(!f.subject||f.subject==='all'||r.subject===f.subject) &&
      (!f.unit||f.unit==='all'||(r.principal_unit||'UNCLASSIFIED')===f.unit) &&
      (!f.year||f.year==='all'||r.exam_year===Number(f.year)) &&
      (!f.status||f.status==='all'||r.classification_status===f.status) &&
      (!f.search||[r.stable_id,r.concept_focus_paraphrase,r.subtopic,r.family_id,r.review_flag].join(' ').toLowerCase().includes(f.search.toLowerCase())));
  }
  const initialProgress=()=>({schema:'powerhouse-science-progress',schema_version:1,revision:0,groupEnabled:false,participants:1,intervals:[3,10],sessions:[],records:[]});
  function validateProgress(p) {
    safeTree(p);
    if(!plain(p)||p.schema!=='powerhouse-science-progress'||p.schema_version!==1||!integer(p.revision,0,1e9)||typeof p.groupEnabled!=='boolean'||!integer(p.participants,1,8)||!p.groupEnabled&&p.participants!==1||p.groupEnabled&&p.participants<2)fail('Invalid session backup.');
    if(!Array.isArray(p.intervals)||p.intervals.length!==2||!p.intervals.every(x=>integer(x,1,90))||p.intervals[0]>=p.intervals[1])fail('Invalid retest intervals.');
    if(!Array.isArray(p.records)||p.records.length>5000||!Array.isArray(p.sessions)||p.sessions.length>1000)fail('Too many records.');
    const ids=new Set();
    for(const s of p.sessions) {
      if(!str(s.id,100)||!SUBJECTS.includes(s.subject)||!['A','B'].includes(s.set)||!integer(s.phase,0,6)||!date(s.date)||typeof s.closed!=='boolean'||ids.has(s.id))fail('Invalid session.');
      ids.add(s.id);
    }
    ids.clear();
    for(const r of p.records) {
      if(!str(r.id,100)||ids.has(r.id)||!SUBJECTS.includes(r.subject)||!str(r.reference_id,150)||!str(r.session_id,100)||!date(r.date)||!number(r.earned,0,1e5)||!number(r.total,0.01,1e5)||r.earned>r.total||!integer(r.guesses,0,1000)||!number(r.minutes,0.01,1440)||!str(r.marking_source,1000)||!r.marking_source.trim()||!str(r.error,2000)||!str(r.repair,2000)||!['baseline','reattempt','transfer','delayed-retest'].includes(r.role)||typeof r.unaided!=='boolean'||typeof r.fresh!=='boolean'||!str(r.core_attempt_id,150))fail('Invalid marked evidence.');
      if(r.guesses>r.total)fail('Guesses exceed question total.');
      if(r.date>today())fail('Marked evidence cannot be dated in the future.');
      if(r.source_record_id!==undefined && (!str(r.source_record_id,100)||r.source_record_id===r.id))fail('Invalid source evidence link.');
      if(!p.sessions.some(s=>s.id===r.session_id && s.subject===r.subject))fail('Evidence has no matching session.');
      if(!Array.isArray(r.retest_dates)||r.retest_dates.length!==2||!r.retest_dates.every(date)||r.retest_dates[0]<=r.date||r.retest_dates[1]<=r.retest_dates[0])fail('Invalid retest dates.');
      ids.add(r.id);
    }
    for(const r of p.records)if(r.source_record_id){const source=p.records.find(x=>x.id===r.source_record_id);if(!source||source.subject!==r.subject||source.role!=='baseline'||r.date<source.date)fail('Related evidence must link to an earlier baseline in the same subject.');}
    return p;
  }
  function followups(p,day=today()) {
    validateProgress(p);if(!date(day))fail('Invalid review date.');
    const clean=r=>r.unaided && r.earned===r.total && r.guesses===0 && !r.error.trim();
    return p.records.filter(r=>r.role==='baseline'&&!clean(r)).flatMap(source=>{
      const checks=p.records.filter(r=>r.source_record_id===source.id&&r.role==='delayed-retest').slice().sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
      const used=new Set();return source.retest_dates.map((due,index)=>{
        const check=checks.find(r=>r.date>=due&&!used.has(r.id));if(check)used.add(check.id);
        return {source_id:source.id,subject:source.subject,reference_id:source.reference_id,stage:index+1,due,state:check&&clean(check)?'recorded':check?'repair':due<=day?'due':'scheduled',check_id:check?.id||null};
      });
    }).sort((a,b)=>a.due.localeCompare(b.due)||a.reference_id.localeCompare(b.reference_id));
  }
  function clockRemaining(clock,now=Date.now()) {
    if(!clock||!number(clock.remainingMs,0,10800000))fail('Invalid stage clock.');
    if(clock.running && !number(clock.startedAt,0,1e15))fail('Invalid stage clock start.');
    return Math.max(0,clock.remainingMs-(clock.running?Math.max(0,now-clock.startedAt):0));
  }
  function retestDates(day,intervals=[3,10]) {
    if(!date(day)||!Array.isArray(intervals)||intervals.length!==2||!intervals.every(x=>integer(x,1,90))||intervals[0]>=intervals[1])fail('Invalid retest schedule.');
    return intervals.map(n=>new Date(Date.parse(day+'T12:00:00Z')+n*86400000).toISOString().slice(0,10));
  }
  function mergeProgress(current,incoming) {
    validateProgress(current);validateProgress(incoming);
    const conflicts=[], merge=(a,b)=>{
      const map=new Map(a.map(r=>[r.id,r]));
      for(const r of b){if(map.has(r.id)&&JSON.stringify(map.get(r.id))!==JSON.stringify(r))conflicts.push(r.id);else map.set(r.id,r);}
      return [...map.values()];
    };
    const sessions=merge(current.sessions,incoming.sessions),records=merge(current.records,incoming.records);
    const candidate={...current,sessions,records,revision:current.revision+1};
    validateProgress(candidate);
    return {candidate,conflicts,added:records.length-current.records.length};
  }
  function bridge(p) {
    validateProgress(p);
    return {schema:'powerhouse-science-notion-review',version:1,mode:'MANUAL REVIEW — no automatic writes or sync',
      conflicts_policy:'Match stable reference and local evidence ID; preserve canonical Notion rows.',
      rows:p.records.map(r=>({local_evidence_id:r.id,reference_id:r.reference_id,
        linked_core_attempt_id:r.core_attempt_id||null,properties:{
          Paper:r.reference_id,Subject:r.subject[0].toUpperCase()+r.subject.slice(1),
          'Attempted Date':r.date,'Raw Marks':r.earned,'Maximum Marks':r.total,
          'Time Used Min':r.minutes,Guesses:r.guesses,'Source Link':'',
          Notes:r.marking_source+' | '+r.error+' | '+r.repair,
          '5-Pass Cycle ID':r.session_id,
        }}))};
  }
  function csv(data,columns) {
    const cell=x=>{let s=x===null||x===undefined?'':Array.isArray(x)?x.join(';'):String(x);if(/^[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
    return [columns.map(cell).join(','),...data.map(r=>columns.map(k=>cell(r[k])).join(','))].join('\r\n');
  }
  function safeUrl(u) {
    try {const x=new URL(u);return x.protocol==='https:' && ['drive.google.com','docs.google.com','www.nie.lk','nie.lk','e-thaksalawa.moe.gov.lk'].includes(x.hostname)?x.href:null;}catch{return null;}
  }
  globalThis.ScienceIntelligence={KEY,SUBJECTS,STAGES,PHASE_MINUTES,today,followups,clockRemaining,parse,id,denominator,validatePackage,matrix,filter,initialProgress,validateProgress,retestDates,mergeProgress,bridge,csv,safeUrl};
})();
