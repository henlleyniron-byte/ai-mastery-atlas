"use client";

import { useRef, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currentChanges, guidanceDateLabel, practiceWorkflows } from "@/lib/current-guidance";

export function CurrentGuide() {
  const [copyMessage, setCopyMessage] = useState("");
  const promptRef = useRef<HTMLTextAreaElement>(null);
  async function copyPrompt(prompt: string) {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyMessage("Prompt copied. Replace the placeholders before using it.");
    } catch {
      promptRef.current?.focus();
      promptRef.current?.select();
      setCopyMessage("Copy was unavailable. The prompt is selected so you can copy it manually.");
    }
  }
  return <section className="page-section current-guide" aria-labelledby="current-guide-title">
    <div className="current-guide-heading">
      <div><div className="section-kicker">Current guide · checked {guidanceDateLabel}</div><h2 id="current-guide-title" className="section-title">Learn what changed. Practise what matters.</h2></div>
      <Badge variant="outline">Official sources</Badge>
    </div>
    <p className="section-intro">A checked snapshot of current guidance, with practical exercises. Feature availability depends on your plan, country, app and workspace. This page does not refresh the news automatically; each source has its own verification date in the Library.</p>
    <div className="current-priority"><strong>First check: saved GPT-5.5 defaults.</strong><p>GPT-5.5 retired from Codex for users signed in with ChatGPT on <time dateTime="2026-10-14T19:00:00Z">14 October 2026 at 19:00 UTC</time>. The API and API-key-authenticated Codex sessions are not affected. Check agents and scheduled tasks for unavailable defaults. <a href="https://learn.chatgpt.com/docs/models" target="_blank" rel="noopener noreferrer">Official notice</a> · checked <time dateTime="2026-10-16">16 October 2026</time>.</p></div>
    <Tabs defaultValue="changes" onValueChange={() => setCopyMessage("")}>
      <TabsList className="current-guide-tabs" aria-label="Current AI learning guide">
        <TabsTrigger value="changes">What changed</TabsTrigger><TabsTrigger value="practice">Practical workflows</TabsTrigger><TabsTrigger value="judgment">Use AI with judgment</TabsTrigger>
      </TabsList>
      <TabsContent value="changes">
        <div className="current-change-grid">{currentChanges.map((item, index) => <article key={item.id}>
          <div className="current-change-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div><span className="current-status">{item.status}</span><h3>{item.title}</h3><p>{item.change}</p><p><strong>What to do:</strong> {item.action}</p><a href={item.source} target="_blank" rel="noopener noreferrer">{item.sourceLabel}</a>{"verifiedAt" in item && <p className="eval-note">This claim checked <time dateTime={item.verifiedAt}>{item.verifiedAt}</time>.</p>}
        </article>)}</div>
      </TabsContent>
      <TabsContent value="practice">
        <p className="current-practice-intro">These are practice briefs you run in an appropriate tool. Copying a prompt earns no progress; save your checked work as evidence in the Command centre. Use public, synthetic or authorised inputs.</p>
        <Tabs defaultValue="study" onValueChange={() => setCopyMessage("")}>
          <TabsList className="current-workflow-tabs" aria-label="Choose a practice workflow">{practiceWorkflows.map(item => <TabsTrigger key={item.id} value={item.id}>{item.label}</TabsTrigger>)}</TabsList>
          {practiceWorkflows.map(item => <TabsContent key={item.id} value={item.id}><article className="current-workflow">
            <div><span className="current-status">{item.surface} · {item.time}</span><h3>{item.label}</h3><p><strong>Before AI:</strong> {item.prepare}</p><p><strong>Evidence that counts:</strong> {item.proof}</p><p><strong>Finish point:</strong> {item.stop}</p></div>
            <div><label htmlFor={`workflow-prompt-${item.id}`}>Practice prompt</label><textarea ref={promptRef} id={`workflow-prompt-${item.id}`} readOnly value={item.prompt} rows={9} /><Button type="button" variant="outline" onClick={() => copyPrompt(item.prompt)}>Copy {item.label.toLowerCase()} prompt</Button></div>
          </article></TabsContent>)}
        </Tabs>
        <p className="current-copy-message" role="status" aria-live="polite">{copyMessage}</p>
      </TabsContent>
      <TabsContent value="judgment">
        <div className="current-judgment"><h3>Keep the thinking you need to retain.</h3><p>Use this learning rule: attempt first, request focused feedback, check the source, then reproduce the result without AI. A polished assisted answer is evidence of an assisted result; an independent transfer task tests what you can do yourself.</p>
          <ol><li><strong>Attempt:</strong> write your own answer, decision or draft.</li><li><strong>Repair:</strong> ask for the smallest useful explanation or correction.</li><li><strong>Verify:</strong> compare claims, numbers and marking points with the authoritative source.</li><li><strong>Transfer:</strong> solve a changed task unaided, then retest after a delay.</li></ol>
        </div>
        <Accordion type="multiple" className="current-judgment-accordion">
          <AccordionItem value="privacy"><AccordionTrigger>Private conversations and consent</AccordionTrigger><AccordionContent>Use synthetic examples or a minimal anonymised account where possible. Someone sharing a message or picture with you does not automatically authorise uploading it to AI. Respect an explicit refusal. Removing a name may still leave someone identifiable through context. Never put another person&apos;s private messages into this public Site or a shared Page.</AccordionContent></AccordionItem>
          <AccordionItem value="truth"><AccordionTrigger>Agreement, citations and uncertainty</AccordionTrigger><AccordionContent>Two models can agree on the same mistake. Ask for sources, open the supporting passage and check the precise claim. For an A/L answer, use the official resource book and marking scheme. A model&apos;s confidence, fluent wording or longer reasoning time does not establish correctness.</AccordionContent></AccordionItem>
          <AccordionItem value="spend"><AccordionTrigger>Subscriptions and API charges</AccordionTrigger><AccordionContent>ChatGPT Work and Codex share usage. API billing is separate from a ChatGPT subscription. Check current allowances before a long task. Compare total correction time and cost per accepted result before buying a higher tier. API token rates cannot tell you how many tasks your subscription includes. <a href="https://learn.chatgpt.com/docs/pricing" target="_blank" rel="noopener noreferrer">Check official pricing</a>.</AccordionContent></AccordionItem>
          <AccordionItem value="delegation"><AccordionTrigger>Define authority and check completion</AccordionTrigger><AccordionContent>State the deliverable, allowed sources, permitted actions and review point. A draft is not a sent message, a proposed change is not a saved change, and a created schedule is not a successful run. Check the actual artifact or final app state. Start with a small reversible task before granting wider access.</AccordionContent></AccordionItem>
        </Accordion>
      </TabsContent>
    </Tabs>
  </section>;
}
