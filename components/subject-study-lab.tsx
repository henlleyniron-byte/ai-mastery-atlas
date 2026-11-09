"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { buildStudyPrompt, studyTasks, type StudyTask } from "@/lib/subject-study-prompt";

const subjects = [
  { name: "Physics", href: "https://al-performance-powerhouse.phenlleyniron.chatgpt.site/physics-intelligence/", detail: "1,410 validated archive MCQs; current-era family explorer.", prescription: "Check assumptions, free-body diagrams, units, signs and limiting cases before accepting an explanation." },
  { name: "Chemistry", href: "/chemistry-intelligence/", detail: "50 mapped 2025 MCQs; D/S/C/N similarity labels and exact prior-year references.", prescription: "Check balanced equations, stoichiometry, reaction conditions, species and sign conventions." },
  { name: "Biology", href: "/biology-intelligence/", detail: "Seven year-pair audits; 40-topic essay bank and 15 recent-evidence families.", prescription: "Check scientific terminology, distinct marking points, causal sequence, matched comparisons and diagram labels." },
] as const;
const jobs = studyTasks;

export function SubjectStudyLab({shared=false}:{shared?:boolean}) {
  const [subject, setSubject] = useState<"Physics" | "Chemistry" | "Biology">("Chemistry");
  const [job, setJob] = useState<StudyTask>(jobs[0]);
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState("");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState({ attempted: false, marked: false, questionReady: false, sourceReady: false });
  const [firstRetest, setFirstRetest] = useState(3);
  const [secondRetest, setSecondRetest] = useState(10);
  const privacy=useRef({mounted:false,shared});
  useEffect(()=>{privacy.current={mounted:true,shared};return()=>{privacy.current.mounted=false;};},[shared]);
  const privateNow=()=>privacy.current.mounted&&!privacy.current.shared&&new URLSearchParams(location.search).get('share')!=='1';
  const invalidate = () => { setPrompt(""); setMessage(""); };
  const createPrompt = () => {
    if(!privateNow())return;
    try {
      setPrompt(buildStudyPrompt({ subject, task: job, reference, error, ...ready, firstRetest, secondRetest }));
      setMessage("Prompt prepared for the selected task and intervals. Attach your exact materials separately; nothing is sent from this page.");
    } catch (error) { setPrompt(""); setMessage(error instanceof Error ? error.message : "Prepare the required inputs first."); }
  };
  if(shared)return <section id="subject-study-lab" className="page-section compact-section subject-study-lab" aria-labelledby="subject-study-title"><h2 id="subject-study-title">Academic transfer lab</h2><p>Public method; private source references, observed errors and prepared prompts are hidden. Your working fields remain in this tab.</p></section>;
  return <section id="subject-study-lab" className="page-section compact-section subject-study-lab" aria-labelledby="subject-study-title">
    <div className="section-kicker">Academic transfer lab · Physics / Chemistry / Biology</div>
    <h2 id="subject-study-title" className="section-title">Turn AI assistance into a better unaided answer.</h2>
    <p className="section-intro">Start with a timed paper attempt and strict marking. Use these evidence explorers to choose a repair or transfer exercise, then return to closed-book work. Atlas teaches the AI workflow; Powerhouse records exam evidence.</p>
    <div className="subject-lab-flow"><article><strong>Your private source library</strong><p>Search imported Drive drafts, revision workbook tabs and source slide text. Compare heatmap versions and practise Biology clozes with answers hidden.</p><a href="/study-library/">Open Study Library →</a></article><article><strong>Move from source to practice</strong><p>Choose an exact reference or original prompt, write before revealing cues, and prepare a repair prompt only after marking. Export your worksheet for review before canonical entry.</p><a href="/study-library/?view=practice">Open private practice desk →</a></article></div>
    <div className="subject-lab-cards">{subjects.map(item => <article key={item.name}>
      <h3>{item.name} Intelligence</h3><p>{item.detail}</p><p>{item.prescription}</p><a href={item.href}>Open {item.name} explorer →</a>
    </article>)}</div>
    <div className="subject-lab-flow"><article><strong>01 · Produce</strong><p>Attempt without AI, notes or a revealed solution.</p></article><article><strong>02 · Verify</strong><p>Mark with the scheme; attach exact source excerpts for any AI diagnosis.</p></article><article><strong>03 · Repair</strong><p>Fix one cause, then reconstruct the answer independently.</p></article><article><strong>04 · Transfer & retest</strong><p>Change the context and prove delayed retrieval with actual marks.</p></article></div>
    <div className="subject-lab-builder"><h3>Build a source-anchored study prompt</h3><p>No model choice or paid plan is required. The quality of the supplied evidence and your independent reattempt decide whether this helps.</p>
      <div className="subject-lab-fields"><label>Subject<select value={subject} onChange={e => { setSubject(e.target.value as typeof subject); invalidate(); }}>{subjects.map(item => <option key={item.name}>{item.name}</option>)}</select></label><label>Task<select value={job} onChange={e => { setJob(e.target.value as StudyTask); invalidate(); }}>{jobs.map(item => <option key={item}>{item}</option>)}</select></label><label>Exact question / source reference<input value={reference} onChange={e => { setReference(e.target.value); invalidate(); }} maxLength={300} placeholder="e.g. 2025 Chemistry Q05; scheme page 2" /></label><label>Observed error / claim<input value={error} onChange={e => { setError(e.target.value); invalidate(); }} maxLength={500} placeholder="e.g. used initial pressure instead of equilibrium pressure" /></label></div>
      <fieldset className="subject-readiness"><legend>Prepare your evidence before using AI</legend>{([
        ["attempted", "I attempted the question closed-book and unaided"], ["marked", "I marked my original answer"], ["questionReady", "I have the exact question to attach"], ["sourceReady", "I have the exact scheme or resource excerpt to attach"],
      ] as const).map(([key,label]) => <label key={key}><input type="checkbox" checked={ready[key]} onChange={e => { setReady(value => ({ ...value, [key]: e.target.checked })); invalidate(); }} />{label}</label>)}</fieldset>
      <div className="subject-lab-fields"><label>First delayed check · days<input type="number" min="1" max="89" value={firstRetest} onChange={e => { setFirstRetest(Number(e.target.value)); invalidate(); }} /></label><label>Second delayed check · days<input type="number" min="2" max="90" value={secondRetest} onChange={e => { setSecondRetest(Number(e.target.value)); invalidate(); }} /></label></div><p>Default +3/+10 matches the optional diagnostic plan. You can choose +3/+7 or another increasing pair. These settings create no reminders or completed retests.</p>
      <Button onClick={createPrompt}>Prepare study prompt</Button>
      {prompt ? <><label className="subject-lab-output">Prompt to use after marking<textarea rows={13} readOnly value={prompt} /></label><Button variant="outline" onClick={async () => { if(!privateNow())return;try { await navigator.clipboard.writeText(prompt); if(privateNow())setMessage("Prompt copied. Attach your exact source materials before using it."); } catch { if(privateNow())setMessage("Copy is unavailable. Select the prompt text and copy it manually."); } }}>Copy prompt</Button></> : null}
      {prompt ? <Button variant="outline" onClick={() => { if(!privateNow())return;const url = URL.createObjectURL(new Blob([prompt], { type: "text/plain;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = `${subject.toLowerCase()}-after-marking-prompt.txt`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }}>Download prepared prompt</Button> : null}
      <p role="status" aria-live="polite">{message}</p>
    </div>
    <p className="section-intro">Chemistry and Biology explorers are available here and in <a href="https://al-performance-powerhouse.phenlleyniron.chatgpt.site/">Performance Powerhouse</a>. Their practice logs are separate browser copies with separate export/import controls. The source pack was recovered from the 29 September 2026 companion drafts; it is not a new independently recoded historical corpus.</p>
  </section>;
}
