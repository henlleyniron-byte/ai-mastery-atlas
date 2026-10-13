import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const html = readFileSync(new URL("../public/v6-evaluation-lab.html", import.meta.url), "utf8");
test("evaluation lab uses transparent five-category rubric", () => {
 for (const key of ["Factual accuracy","Instruction adherence","Reasoning and evidence","Safety and privacy","Clarity and usability"])
   assert.ok(html.includes(key), key);
 assert.match(html, /scoreA:a,scoreB:b/);
 assert.match(html, /Evidence-based rationale/);
});
test("evaluation lab keeps submissions local and exports on demand", () => {
 assert.doesNotMatch(html, /\blocalStorage\b|\bsessionStorage\b|\bfetch\s*\(|XMLHttpRequest|sendBeacon/);
 assert.match(html, /application\/json/);
 assert.match(html, /aria-live="polite"/);
});
