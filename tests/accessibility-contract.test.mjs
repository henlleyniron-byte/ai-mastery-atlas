import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const page = await readFile(`${root}/app/page.tsx`, "utf8");
const operator = await readFile(`${root}/components/operator-core.tsx`, "utf8");
const studio = await readFile(`${root}/components/astra-studio.tsx`, "utf8");
const developer = await readFile(`${root}/components/astra-developer.tsx`, "utf8");
const commandCentre = await readFile(`${root}/components/v4-command-centre.tsx`, "utf8");
const knowledgeStudio = await readFile(`${root}/components/knowledge-systems-studio.tsx`, "utf8");
const css = await readFile(`${root}/app/globals.css`, "utf8");

test("accordion triggers contain one semantic heading and no nested heading", () => {
  const triggers = [...page.matchAll(/<AccordionTrigger\b[\s\S]*?<\/AccordionTrigger>/g)].map((match) => match[0]);
  assert.ok(triggers.length > 0);
  for (const trigger of triggers) {
    assert.doesNotMatch(trigger, /<h[1-6]\b/i);
    assert.match(trigger, /className="track-title"/);
  }
});

test("literal ids are unique and internal navigation targets exist", () => {
  const source = `${page}\n${operator}\n${studio}\n${developer}\n${commandCentre}\n${knowledgeStudio}`;
  const ids = [...source.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]).filter((id) => !id.includes("${"));
  assert.equal(new Set(ids).size, ids.length, "duplicate literal id found");
  const targets = [...source.matchAll(/href="#([a-z0-9-]+)"/gi)].map((match) => match[1]);
  for (const target of targets) assert.ok(ids.includes(target), `missing internal target #${target}`);
});

test("operator router and judge expose named controls and live results", () => {
  assert.match(operator, /id="operator-core"[^>]+aria-labelledby="operator-core-title"/);
  assert.match(operator, /role="group" aria-label="Strategic Judge variant"/);
  assert.match(operator, /aria-pressed=/);
  assert.match(operator, /type="checkbox"/);
  assert.match(operator, /type="radio"[^>]+name="consequence"/);
  assert.match(operator, /aria-live="polite"/);
});

test("evidence controls are named and keyboard focus remains visible", () => {
  const controlIds = [...page.matchAll(/<(?:input|select)\b[^>]*\bid={`([^`]+)`}[^>]*>/g)].map((match) => match[1]);
  assert.ok(controlIds.length >= 10, "expected named progress controls");
  for (const id of controlIds) assert.ok(page.includes("htmlFor={`" + id + "`}"), `missing label for ${id}`);
  assert.match(css, /:focus-visible\s*\{[^}]*outline:/s);
});

test("progress messages and accordion content expose accessible state", () => {
  assert.match(page, /aria-live="polite"/);
  assert.match(page, /aria-labelledby=\{`evidence-title-/);
  assert.match(page, /<AccordionItem[^>]+value=\{track\.id\}/);
  assert.match(page, /<AccordionTrigger className="track-trigger">/);
});

test("learning queue and progress filtering are labelled navigation aids", () => {
  assert.match(page, /id="queue"[^>]+aria-labelledby="queue-title"/);
  assert.match(page, /id="queue-title"/);
  assert.match(page, /aria-label="Filter by learning status"/);
  assert.match(page, /aria-label="Filter by level"/);
  assert.match(page, /htmlFor=\{`skip-reason-/);
});

test("mobile navigation preserves every major section link when the desktop nav is hidden", () => {
  const mobileNav = page.match(/<details className="mobile-nav"[\s\S]*?<\/details>/)?.[0];
  assert.ok(mobileNav, "expected a compact mobile navigation menu");
  for (const target of ["start", "command-centre", "knowledge-studio", "operator-core", "systems-lab", "roadmap", "library"]) {
    assert.match(mobileNav, new RegExp(`href="#${target}"`));
  }
  assert.match(mobileNav, /aria-label="Open section navigation"/);
  assert.match(css, /\.mobile-nav\[open\] nav/);
});

test("knowledge systems studio teaches tool roles through practical, evidence-aware routes", () => {
  assert.match(page, /<KnowledgeSystemsStudio\s*\/>/);
  assert.match(knowledgeStudio, /id="knowledge-studio"[^>]+aria-labelledby="knowledge-studio-title"/);
  assert.match(knowledgeStudio, /role="tablist" aria-label="Knowledge tool practice routes"/);
  assert.match(knowledgeStudio, /event\.key === "ArrowRight"/);
  assert.match(knowledgeStudio, /event\.key === "ArrowLeft"/);
  for (const name of ["Notion", "Anki", "RemNote", "xTiles", "NotebookLM"]) assert.match(knowledgeStudio, new RegExp(`name: "${name}"`));
  for (const phase of ["Start", "Build", "Test", "Maintain", "Recover"]) assert.match(knowledgeStudio, new RegExp(`label: "${phase}"`));
  assert.match(knowledgeStudio, /Evidence that counts/);
  assert.match(knowledgeStudio, /Transfer before calling it learned/);
  assert.match(knowledgeStudio, /Zero → independent use/);
  assert.match(knowledgeStudio, /Portability: export, import and independently reproduce/);
  assert.match(knowledgeStudio, /export the pilot and remove it from the workflow/);
});

test("command centre exposes evidence, diagnostic and graduation state without click mastery", () => {
  assert.match(commandCentre, /id="command-centre"[^>]+aria-labelledby="command-centre-title"/);
  assert.match(commandCentre, /role="status" aria-live="polite"/);
  assert.match(commandCentre, /recordEvidence\(state, unit\.id, event, curriculum, today\)/);
  assert.match(commandCentre, /Diagnostic placement saved[\s\S]*awards no progress or mastery/);
  assert.match(commandCentre, /I completed this assessment independently/);
  assert.doesNotMatch(commandCentre, /set(?:Stage|Status)\([^)]*Mastered/);
  assert.match(page, /<V4CommandCentre curriculum=\{runtimeCurriculum\}/);
  assert.match(page, /schemaVersion: "5\.0"/);
  assert.match(page, /localStorage\.getItem\("atlas-v4-state"\)/);
  assert.match(page, /atlas-v41-claude/);
  assert.match(page, /atlas-v42-gemini/);
});

test("resource search exposes derived counts and no-match guidance in a live status", () => {
  const status = page.match(/<p\b[^>]*\bid="resource-results"[\s\S]*?<\/p>/)?.[0];
  assert.ok(status, "resource results need a persistent status message");
  assert.match(status, /role="status"/);
  assert.match(status, /aria-live="polite"/);
  assert.match(status, /aria-atomic="true"/);
  assert.match(status, /filteredResources\.length === 0/);
  assert.match(status, /visibleResources\.length/);
  assert.match(status, /No resources match this search and filter combination/);
  assert.match(status, /All formats and All topics/);
  assert.match(page, /aria-label="Filter resources by freshness status"/);
  assert.match(page, /freshnessFilter === "All" \|\| item\.status === freshnessFilter/);
  assert.match(page, /Freshness register:/);
});

test("video-library shortcut clears conflicting resource filters", () => {
  const handler = page.match(/const openVideoLibrary = \(\) => \{[\s\S]*?\n  \};/)?.[0];
  assert.ok(handler, "expected a dedicated video-library shortcut handler");
  assert.match(handler, /setResourceQuery\(""\)/);
  assert.match(handler, /setFormatFilter\("Video"\)/);
  assert.match(handler, /setTopicFilter\("All"\)/);
  assert.match(handler, /setFreshnessFilter\("All"\)/);
  assert.match(handler, /setShowAllResources\(true\)/);
  assert.match(page, /href="#library" onClick=\{openVideoLibrary\}>Browse all \{videoCount\} videos/);
});

test("learning-queue links reveal tracks hidden by roadmap filters", () => {
  const handler = page.match(/const openTrackInRoadmap = \(\) => \{[\s\S]*?\n  \};/)?.[0];
  assert.ok(handler, "expected a dedicated queue-to-roadmap handler");
  assert.match(handler, /setQuery\(""\)/);
  assert.match(handler, /setRouteFilter\("All"\)/);
  assert.match(handler, /setNeedFilter\("All"\)/);
  assert.match(handler, /setProgressFilter\("All"\)/);
  assert.equal((page.match(/onClick=\{openTrackInRoadmap\}/g) || []).length, 2);
});
