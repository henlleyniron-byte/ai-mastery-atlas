(() => {
  'use strict';
  const SUBJECTS=['all','biology','chemistry','physics','ai'];
  const DB='henlley_study_library_v1';
  const BAD=new Set(['__proto__','prototype','constructor']);
  const fail=m=>{throw new Error(m);};
  const text=(v,max=1000)=>typeof v==='string'&&v.length<=max;
  const list=(v,max)=>Array.isArray(v)&&v.length<=max;
  const date=v=>text(v,10)&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
  function safeTree(v,depth=0){
    if(depth>24)fail('File nesting is too deep.');
    if(typeof v==='string'&&v.length>1_000_000)fail('Text section is too large.');
    if(v&&typeof v==='object')for(const [k,x] of Object.entries(v)){if(BAD.has(k))fail('Unsafe file key.');safeTree(x,depth+1);}
  }
  function safeUrl(v){try{const u=new URL(v);return u.protocol==='https:'&&['docs.google.com','drive.google.com','nie.lk','www.nie.lk','e-thaksalawa.moe.gov.lk'].includes(u.hostname)?u.href:null;}catch{return null;}}
  function validate(p){
    safeTree(p);
    if(!p||p.schema!=='henlley-study-library'||p.schema_version!==1||!date(p.captured_at)||!text(p.title,300)||!text(p.scope,4000))fail('Choose a supported private Study Library file.');
    if(!list(p.resources,300)||!p.resources.length||!list(p.heatmaps,30)||!list(p.review_notes,100)||!p.review_notes.every(x=>text(x,4000)))fail('Resource or review records are incomplete.');
    const ids=new Set();
    for(const r of p.resources){
      if(!r||!text(r.id,200)||!r.id||ids.has(r.id)||!text(r.title,500)||!SUBJECTS.includes(r.subject)||!['document','workbook','source','slides'].includes(r.kind)||!text(r.status,2000)||!text(r.text,1_000_000)||!text(r.modified_at,100)||!date(r.captured_at)||!text(r.sha256,64)||!safeUrl(r.url)||!list(r.tables,60))fail('Invalid or duplicate resource.');
      ids.add(r.id);const tabs=new Set();
      for(const t of r.tables){if(!t||!text(t.id,100)||tabs.has(t.id)||!text(t.title,500)||!list(t.columns,60)||!t.columns.every(x=>text(x,2000))||!list(t.rows,6000)||!t.rows.every(row=>list(row,60)&&row.every(x=>text(x,20000))))fail('Invalid workbook table.');tabs.add(t.id);}
      if(r.sections!==undefined){if(r.kind!=='slides'||!list(r.sections,700))fail('Invalid slide text collection.');const sections=new Set();for(const [i,s]of r.sections.entries()){if(!s||!text(s.id,200)||sections.has(s.id)||!text(s.title,300)||!text(s.text,60000)||s.order!==i+1||!safeUrl(s.source_url))fail('Invalid or duplicate source slide.');sections.add(s.id);}}
    }
    const mapIds=new Set();
    for(const h of p.heatmaps){
      if(!h||!text(h.id,100)||mapIds.has(h.id)||!SUBJECTS.slice(1,4).includes(h.subject)||!text(h.title,500)||!text(h.status,300)||!text(h.source_id,200)||!text(h.sheet_name,100)||!list(h.years,50)||!h.years.length||new Set(h.years).size!==h.years.length||!h.years.every((y,i)=>Number.isInteger(y)&&y>=2000&&y<=2100&&(!i||y>h.years[i-1]))||!list(h.rows,20)||!h.rows.length||!list(h.notes,100)||!h.notes.every(n=>text(n,8000))||!list(h.denominators,50)||h.denominators.length!==h.years.length)fail('Invalid heatmap version.');
      mapIds.add(h.id);const units=new Set();
      for(const r of h.rows){if(!r||!text(r.code,20)||units.has(r.code)||!/^U([1-9]|1[0-4])$|^UNCLASSIFIED$/.test(r.code)||!text(r.name,300)||!(r.periods===null||Number.isInteger(r.periods)&&r.periods>=0&&r.periods<=600)||!list(r.counts,50)||r.counts.length!==h.years.length||!r.counts.every(c=>c===null||Number.isInteger(c)&&c>=0&&c<=60))fail('Invalid heatmap unit or count.');units.add(r.code);}
      h.years.forEach((y,i)=>{const d=h.subject==='physics'&&y<=2010?60:50;if(h.denominators[i]!==d)fail('Incorrect year denominator.');const cs=h.rows.map(r=>r.counts[i]);if(cs.some(c=>c===null)){if(!cs.every(c=>c===null))fail('A year must be complete or wholly NOT AUDITED.');}else if(cs.reduce((a,b)=>a+b,0)!==d)fail('Year counts do not match the paper denominator.');});
      const required=Array.from({length:{biology:10,chemistry:14,physics:11}[h.subject]},(_,i)=>'U'+(i+1));
      if(required.some(u=>!units.has(u))||[...units].some(u=>u!=='UNCLASSIFIED'&&!required.includes(u)))fail('Heatmap unit coverage is incomplete.');
    }
    globalThis.ScienceIntelligence.validatePackage(p.science_package);
    if(p.practice_prompts!==undefined){if(!list(p.practice_prompts,500))fail('Invalid original prompt collection.');const prompts=new Set();for(const r of p.practice_prompts){if(!r||!text(r.id,200)||prompts.has(r.id)||!['biology','chemistry','physics'].includes(r.subject)||!p.science_package.units[r.subject].some(u=>u.code===r.unit)||!text(r.prompt,10000)||!r.prompt.trim()||!ids.has(r.source_id)||!text(r.source_version,100)||!text(r.status,1000))fail('Invalid original retrieval prompt.');prompts.add(r.id);}}
    // Version-specific classification labels must reconcile with the retained corpus.
    const versions={'bio-earlier':'earlier','bio-claude':'claude','bio-audit':'audit_copy'};
    for(const h of p.heatmaps){
      for(let i=0;i<h.years.length;i++){
        const rs=p.science_package.records.filter(r=>r.subject===h.subject&&r.exam_year===h.years[i]);
        if(!rs.length||h.rows.every(r=>r.counts[i]===null))continue;
        for(const row of h.rows){const n=rs.filter(r=>((versions[h.id]?r.source_labels?.[versions[h.id]]:r.principal_unit)||'UNCLASSIFIED')===row.code).length;if(n!==row.counts[i])fail('Heatmap does not reconcile with its retained source labels: '+h.id);}
      }
    }
    return p;
  }
  function parse(raw){if(!text(raw,16_000_000))fail('Choose a JSON file smaller than 16 MB.');return validate(JSON.parse(raw));}
  function content(r){return [r.title,r.subject,r.status,r.text,...r.tables.flatMap(t=>[t.title,...t.columns,...t.rows.flat()]),...(r.sections||[]).flatMap(s=>[s.title,s.text])].join('\n');}
  const terms=q=>q.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean).slice(0,12);
  function matches(s,q){const lower=s.toLocaleLowerCase();return terms(q).every(t=>lower.includes(t));}
  function search(p,{query='',subject='all',kind='all'}={}){return p.resources.filter(r=>(subject==='all'||r.subject===subject||r.subject==='all')&&(kind==='all'||r.kind===kind)&&matches(content(r),query));}
  function excerpt(r,q){const s=[r.title,r.subject,r.status,r.text.replace(/\{\{([^}]+)\}\}/g,'[ … ]'),...r.tables.flatMap(t=>{const cues=t.columns.map((c,i)=>/answer|model response|marking insight|common trap/i.test(c)?i:-1);return [t.title,...t.rows.flatMap(row=>row.filter((_,i)=>!cues.includes(i)))];}),...(r.sections||[]).flatMap(s=>[s.title,s.text])].join('\n'),first=terms(q)[0],at=first?s.toLocaleLowerCase().indexOf(first):0;return s.slice(Math.max(0,at-80),Math.max(0,at-80)+260).replace(/\s+/g,' ');}
  function compare(a,b){
    if(a.subject!==b.subject)fail('Compare versions of the same subject.');
    const years=a.years.filter(y=>b.years.includes(y));
    return a.rows.map(r=>{const other=b.rows.find(x=>x.code===r.code);const pairs=years.map(y=>({year:y,a:r.counts[a.years.indexOf(y)],b:other?.counts[b.years.indexOf(y)]??null}));return {code:r.code,name:r.name,pairs,delta:pairs.some(p=>p.a===null||p.b===null)?null:pairs.reduce((n,p)=>n+p.a-p.b,0)};});
  }
  function references(p,h,code,year,query=''){
    const versions={'bio-earlier':'earlier','bio-claude':'claude','bio-audit':'audit_copy'};
    return p.science_package.records.filter(r=>r.subject===h.subject&&h.years.includes(r.exam_year)&&(!year||r.exam_year===Number(year))&&(!code||((versions[h.id]?r.source_labels?.[versions[h.id]]:r.principal_unit)||'UNCLASSIFIED')===code)&&matches([r.stable_id,r.concept_focus_paraphrase,r.family_id,r.review_flag].join(' '),query));
  }
  function clozes(r){return r.text.split(/\r?\n/).filter(line=>line.includes('{{')&&line.includes('}}')).map((line,i)=>({id:r.id+':'+i,question:line.replace(/\{\{([^}]+)\}\}/g,'[ … ]'),answer:line.replace(/\{\{([^}]+)\}\}/g,'$1'),source_id:r.id}));}
  function csv(rows){const cell=x=>{let s=x==null?'NOT AUDITED':String(x);if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};return rows.map(r=>r.map(cell).join(',')).join('\r\n');}
  function heatmapCsv(h){return csv([['Unit','Topic',...h.years,'Source version','Status'],...h.rows.map(r=>[r.code,r.name,...r.counts,h.title,h.status])]);}
  async function openDB(factory=globalThis.indexedDB){if(!factory)fail('Browser saving is unavailable. Export your file before leaving.');return new Promise((resolve,reject)=>{const q=factory.open(DB,1);q.onupgradeneeded=()=>q.result.createObjectStore('library');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);q.onblocked=()=>reject(new Error('Close other Study Library tabs before opening browser storage.'));});}
  async function readSaved(factory){const db=await openDB(factory);try{return await new Promise((resolve,reject)=>{const tx=db.transaction('library','readonly');let value=null;const q=tx.objectStore('library').get('owner-import');q.onsuccess=()=>{value=q.result||null;};tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Browser read failed.'));});}finally{db.close();}}
  async function save(p,expectedRevision,factory){validate(p);const db=await openDB(factory);try{return await new Promise((resolve,reject)=>{const tx=db.transaction('library','readwrite'),s=tx.objectStore('library');let reason=null,revision=globalThis.crypto?.randomUUID?.()||String(Date.now())+Math.random();const q=s.get('owner-import');q.onsuccess=()=>{if((q.result?.revision||null)!==expectedRevision){reason=new Error('A saved copy changed or has not been loaded. Load the saved copy first; keep your new file available to reimport.');tx.abort();return;}s.put({revision,package:p},'owner-import');};tx.oncomplete=()=>resolve(revision);tx.onerror=()=>reject(reason||tx.error);tx.onabort=()=>reject(reason||tx.error||new Error('Browser save failed. Your imported file is still in this tab.'));});}finally{db.close();}}
  async function forget(factory){const db=await openDB(factory);try{await new Promise((resolve,reject)=>{const tx=db.transaction('library','readwrite');tx.objectStore('library').delete('owner-import');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Removal failed.'));});}finally{db.close();}}
  globalThis.StudyLibrary={DB,parse,validate,safeUrl,content,matches,search,excerpt,compare,references,clozes,csv,heatmapCsv,readSaved,save,forget};
})();
