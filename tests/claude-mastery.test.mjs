import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const component = await readFile(new URL("../components/claude-mastery.tsx", import.meta.url), "utf8");
const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("Claude pathway exposes all fifteen evidence stages", () => {
  const ids = [...component.matchAll(/\["C(\d+)",/g)].map(match => Number(match[1]));
  assert.deepEqual(ids, Array.from({ length: 15 }, (_, index) => index));
  for (const field of ["Artifact / result reference", "Novel transfer evidence", "Retest due", "Retest result"]) assert.match(component, new RegExp(field));
});

test("Sparring Arena holds task and rubric constant across all three systems", () => {
  assert.match(component, /Frozen task and inputs/);
  assert.match(component, /Frozen pass criteria/);
  assert.match(component, /ChatGPT · 0–4/);
  assert.match(component, /Claude · 0–4/);
  assert.match(component, /Gemini · 0–4/);
  assert.match(component, /ChatGPT, Claude and Gemini comparison rubric/);
  assert.match(component, /Which system would you route a similar task to next time/);
});

test("Claude sources are versioned and the unreviewed playlist cannot masquerade as canonical", () => {
  assert.match(component, /verified 8 September 2026/);
  assert.match(page, /r129.*Claude models overview/);
  assert.match(page, /r138.*Review needed.*D · Discovery \/ unverified.*User-supplied.*Historical \/ version-specific/);
});

test("Claude labs include configuration, repair, reusable expertise and a builder capstone", () => {
  for (const lab of ["Project Architect Lab", "Autonomous Repair Lab", "Scientific Explanation Skill", "Builder Capstone"]) assert.match(component, new RegExp(lab));
  assert.match(component, /SKILL = HOW/);
  assert.match(component, /MCP \/ CONNECTOR = ACCESS/);
});
