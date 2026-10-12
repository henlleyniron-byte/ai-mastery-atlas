"use client";

import { useMemo, useState } from "react";

const checked = "12 October 2026";
const providers = [
 { name:"OpenAI", url:"https://developers.openai.com/api/docs/models", models: [] as {name:string;apiId:string}[], accuracy:"Catalog URL checked; returned page snapshot may lag current releases. No definitive newest API model asserted.", access:"ChatGPT plan, model picker and API account entitlement must be checked separately." },
 { name:"Anthropic", url:"https://platform.claude.com/docs/en/models/overview", models:[
  {name:"Claude Fable 5.1",apiId:"claude-fable-5-1"},
  {name:"Claude Opus 5.5",apiId:"claude-opus-5-5"},
  {name:"Claude Sonnet 5.5",apiId:"claude-sonnet-5-5"},
  {name:"Claude Haiku 5.5",apiId:"claude-haiku-5-5"},
 ], accuracy:"These four API IDs appeared in the official overview accessed on 12 October 2026. Recheck before deployment or billing.", access:"Documentation of an API ID does not guarantee its presence in your Claude subscription or account." },
 { name:"Google Gemini", url:"https://ai.google.dev/gemini-api/docs/models", models:[], accuracy:"Official model index available, but captured documentation may be older than the latest changes. Verify the current list on the provider site.", access:"Gemini consumer, Google AI Studio and paid Gemini API entitlements are separate questions." },
 { name:"DeepSeek", url:"https://api-docs.deepseek.com/quick_start/pricing", models:[], accuracy:"Reference link only; no October 2026 model lineup independently verified in this release.", access:"API access and plan/pricing require direct verification." },
 { name:"Qwen", url:"https://help.aliyun.com/zh/model-studio/getting-started/models", models:[], accuracy:"Provider source reference only; model IDs and availability require confirmation.", access:"Access varies by provider service and region." },
];
const tasks=[
 {label:"A/L revision", key:"Revision & marking", steps:["Attempt a real question independently first.", "Use the official marking scheme or your teacher as the source of truth.", "Ask AI for a small explanation only after diagnosing the error.", "Reattempt closed-book, try an unseen transfer question, and schedule a delayed check."]},
 {label:"Research", key:"Source-grounded research", steps:["Decide which first-party or peer-reviewed sources are necessary.", "Compare at least two candidate approaches on a small real task.", "Ask for attributed claims and examine the original documents yourself.", "Flag disputed results rather than treating confident fluency as evidence."]},
 {label:"Coding", key:"Code and agents", steps:["Start with a disposable repository and narrow acceptance criteria.", "Evaluate whether read-only explanation suffices before granting write permissions.", "Inspect diff, run tests, and verify changes before publishing.", "Never assume a chat-model subscription covers agent or API costs."]},
 {label:"Routine", key:"Fast everyday tasks", steps:["Try the available model you already have.", "Choose a lower-latency option if the outcome remains sufficiently accurate.", "Use explicit constraints, examples and a quick result check.", "Escalate to deeper reasoning only when a real error demands it."]},
];
export default function ModelDesk() {
 const [search,setSearch]=useState("");
 const [task,setTask]=useState("Revision & marking");
 const filtered=useMemo(()=>providers.filter(p=>[p.name,p.accuracy,...p.models.map(m=>m.name+" "+m.apiId)].join(" ").toLowerCase().includes(search.trim().toLowerCase())),[search]);
 const selected=tasks.find(t=>t.key===task) ?? tasks[0];
 return <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 text-slate-100">
   <a href="/" className="text-cyan-300 underline underline-offset-4">← AI Mastery Atlas</a>
   <header className="mt-6 rounded-3xl border border-cyan-500/30 bg-slate-900 p-7">
     <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">V6 Model Decision Desk · provenance-first beta</p>
     <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">Choose the workflow first. Then the model.</h1>
     <p className="mt-4 max-w-3xl text-slate-300">Reference check: {checked}. This is a human-readable provider catalogue and decision workflow, not a live API synchronization or a paid-model entitlement checker. A provider's API catalogue does not prove a model appears in your ChatGPT, Claude or Gemini account.</p>
   </header>
   <section aria-label="Model selection workflow" className="mt-7 rounded-2xl border border-slate-700 bg-slate-900 p-6">
    <h2 className="text-2xl font-bold">What are you trying to accomplish?</h2>
    <div className="mt-4 flex flex-wrap gap-2">
      {tasks.map(t=><button type="button" key={t.key} aria-pressed={task===t.key} className={"rounded-xl border px-4 py-2 focus-visible:outline-2 focus-visible:outline-cyan-300 "+(task===t.key?"border-cyan-400 bg-cyan-900":"border-slate-600 bg-slate-800")} onClick={()=>setTask(t.key)}>{t.label}</button>)}
    </div>
    <h3 className="mt-6 text-xl font-bold">{selected.key}</h3>
    <ol className="mt-4 list-decimal space-y-3 pl-6 text-slate-300">{selected.steps.map((s,i)=><li key={i}>{s}</li>)}</ol>
    <p className="mt-4 text-amber-200">The cheapest, fastest or newest model is not automatically the most accurate for every task. Test the outcome with an independently checkable example.</p>
   </section>
   <section className="mt-7">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold uppercase tracking-widest text-cyan-300">Official reference shelf</p><h2 className="mt-1 text-2xl font-bold">Provider and model sources</h2></div><label className="block text-sm text-slate-200">Search provider or model<input type="search" value={search} onChange={e=>setSearch(e.target.value)} className="mt-2 block w-full rounded-lg border border-slate-600 bg-slate-900 p-3 sm:w-72" placeholder="e.g. Claude"/></label></div>
    <div className="mt-4 grid gap-4 md:grid-cols-2">
    {filtered.map(p=><article key={p.name} className="rounded-xl border border-slate-700 bg-slate-900 p-5">
       <h3 className="text-xl font-bold">{p.name}</h3><a href={p.url} target="_blank" rel="noopener noreferrer" className="mt-2 block break-all text-cyan-300 underline underline-offset-4">Official catalogue or vendor reference ↗</a>
       <p className="mt-3 text-sm text-slate-300">{p.accuracy}</p><p className="mt-2 text-sm text-amber-200">{p.access}</p>
       {p.models.length>0 && <div className="mt-4 border-t border-slate-700 pt-3"><p className="text-sm font-bold">Source-listed API IDs, not account entitlements</p><ul className="mt-2 space-y-2">{p.models.map(m=><li key={m.apiId} className="rounded-lg bg-slate-800 p-3"><span className="block font-semibold">{m.name}</span><code className="break-all text-xs text-slate-300">{m.apiId}</code></li>)}</ul></div>}
    </article>)}
    {filtered.length===0&&<p className="rounded-xl border border-slate-700 p-5 text-slate-300">No matching source entries. Try a broader name.</p>}
    </div>
   </section>
   <section className="mt-7 rounded-xl border border-amber-700/50 bg-slate-900 p-6">
    <h2 className="text-lg font-bold text-amber-200">Before treating a catalogue entry as current</h2>
    <p className="mt-3 text-slate-300">Check the vendor's current model page, dated changelog, lifecycle/deprecation notice, supported regions, permissions, actual account picker, pricing and quotas. Confirm a test call where permitted. Record the verification date and model ID. If the page is stale, label the model unverified instead of inventing a latest release.</p>
    <p className="mt-3 text-sm text-slate-400">Entries here are educational, not an exhaustive list. No API keys, API calls, subscriptions or paid inference are used. No rankings are asserted without independently reproduced task-specific benchmarks.</p>
   </section>
 </main>;
}