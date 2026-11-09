export type ProofStage = "viewed" | "guided" | "independent" | "transfer" | "retained";
export type LessonProof = {stage:ProofStage;note:string;date:string;transferDate?:string;};
export type AcademyProgress = {version:1;proofs:Record<string,LessonProof>};
export const stages:ProofStage[]=["viewed","guided","independent","transfer","retained"];
export const emptyProgress=():AcademyProgress=>({version:1,proofs:{}});
export function validDay(v:unknown):v is string {return typeof v==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(new Date(v+"T00:00:00Z").getTime())&&new Date(v+"T00:00:00Z").toISOString().slice(0,10)===v;}
export function todayColombo(){return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Colombo",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());}
export function retestDue(date:string,today:string){return validDay(date)&&validDay(today)&&Date.parse(today+"T00:00:00Z")-Date.parse(date+"T00:00:00Z")>=7*86400000;}
export function importAcademy(value:unknown,known:string[],today:string):AcademyProgress{
 const v=value as AcademyProgress;if(!v||v.version!==1||!v.proofs||typeof v.proofs!=="object"||Array.isArray(v.proofs))throw Error("This is not a v6 Academy backup.");
 if(Object.keys(v.proofs).length>known.length)throw Error("Too many lesson records.");
 const out=emptyProgress();for(const [id,p] of Object.entries(v.proofs)){
  if(!known.includes(id)||!p||!stages.includes(p.stage)||typeof p.note!=="string"||p.note.length>4000||!validDay(p.date)||p.date>today)throw Error("Invalid lesson evidence.");
  if(stages.indexOf(p.stage)>=2&&p.note.trim().length<30)throw Error("Independent evidence needs a specific note.");
  if(stages.indexOf(p.stage)>=3&&(!validDay(p.transferDate)||p.transferDate>p.date))throw Error("Invalid transfer date.");
  if(p.stage==="retained"&&!retestDue(p.transferDate!,p.date))throw Error("A retained record needs a delayed check at least seven days after transfer.");
  out.proofs[id]={stage:p.stage,note:p.note,date:p.date,...(p.transferDate?{transferDate:p.transferDate}:{})};
 }return out;
}
export function nextStage(previous:LessonProof|undefined,stage:ProofStage,note:string,checked:boolean,today:string):LessonProof{
 const old=previous?stages.indexOf(previous.stage):-1,next=stages.indexOf(stage);
 if(next!==old+1)throw Error("Work through the stages in order.");
 if(!checked)throw Error("Complete the three self-check criteria first.");
 if(note.trim().length<30)throw Error("Describe what you actually did in at least 30 characters.");
 const transferDate=stage==="transfer"?today:previous?.transferDate;
 if(stage==="retained"&&(!transferDate||!retestDue(transferDate,today)))throw Error("Return at least seven days after transfer for the delayed check.");
 return {stage,note:note.trim().slice(0,4000),date:today,...(transferDate?{transferDate}:{})};
}
