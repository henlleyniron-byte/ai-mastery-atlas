import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const component = await readFile(new URL("../components/v5-systems-lab.tsx", import.meta.url), "utf8");
const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("V5 exposes durable model roles and benchmark scope rather than a leaderboard", () => {
  for (const role of ["Frontier reasoner", "Fast everyday model", "High-compute variant", "Coding specialist", "Open/local model", "Multimodal specialist"]) assert.match(component, new RegExp(role.replace("/", "\\/")));
  for (const family of ["Knowledge / reasoning", "Mathematics", "Coding", "Agents / tools", "Long context", "Safety"]) assert.match(component, new RegExp(family.replace("/", "\\/")));
  assert.match(component, /freeze task, prompt, context, tools, reasoning budget/);
});

test("model explorer keeps provider claims source-linked and access-conditional", () => {
  for (const provider of ["OpenAI", "Anthropic", "Google", "xAI", "DeepSeek", "Qwen", "Moonshot AI", "Perplexity", "Local ecosystem"]) assert.match(component, new RegExp(provider.replace("/", "\\/")));
  assert.match(component, /Re-open primary source before routing/);
  assert.match(component, /A source link is not proof that the learner has access/);
});

test("personal benchmark records are bounded, local and part of the unified export", () => {
  assert.match(component, /One task, one rubric, dated results/);
  assert.match(component, /Records stay in the unified browser-local V5 export/);
  assert.match(page, /runs=\{learningState\.publicLabs\.benchmarks\}/);
  assert.match(page, /setRuns=\{setBenchmarkRuns\}/);
});

test("Failure Atlas teaches the full defensive loop", () => {
  for (const heading of ["Symptom", "Cause", "Detection", "Prevention", "Recovery"]) assert.match(component, new RegExp(`>${heading}<`));
  for (const failure of ["Hallucination", "Citation fabrication", "Prompt injection", "Automation loop", "State loss", "Duplicate execution"]) assert.match(component, new RegExp(failure));
});

test("economics optimises successful work and declares excluded costs", () => {
  assert.match(component, /Cost per successful task/);
  assert.match(component, /Cost\/success/);
  assert.match(component, /Subscription fees, cached tokens, tools, retries and human correction time are separate costs/);
});

test("public systems lab explicitly excludes private entitlement data", () => {
  assert.match(component, /stores no billing, account, hardship or private entitlement data/);
  assert.doesNotMatch(component, /ResearchRabbit\+|Lecturio temporary|hardship access/);
});
