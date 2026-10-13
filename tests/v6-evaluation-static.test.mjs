import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const page = readFileSync(new URL("../public/v6-evaluation-lab.html", import.meta.url), "utf8");

test("V6 lab includes evaluation criteria and independent evidence prompts", () => {
  for (const label of ["Factual accuracy", "Instruction adherence", "Reasoning and evidence", "Safety and privacy", "Clarity and usability", "Expected evidence or trustworthy reference", "Evidence-based rationale"]) {
    assert.ok(page.includes(label), `Missing rubric requirement: ${label}`);
  }
});

test("V6 lab has user-initiated export and no stored or transmitted answers", () => {
  assert.match(page, /addEventListener\('submit'/);
  assert.match(page, /addEventListener\('click'/);
  assert.match(page, /JSON\.stringify\(report,null,2\)/);
  assert.doesNotMatch(page, /\b(?:fetch|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage)\b/);
});

test("V6 lab escapes supplied content by using textContent rather than innerHTML", () => {
  assert.match(page, /textContent/);
  assert.doesNotMatch(page, /\.innerHTML\s*=/);
});
