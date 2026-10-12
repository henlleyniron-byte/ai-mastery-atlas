import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const data = readFileSync(new URL("../lib/v6-academy-lessons.ts", import.meta.url), "utf8");
const page = readFileSync(new URL("../app/academy/page.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
test("academy contains exactly sixteen distinct briefs per owner-specified track", () => {
  for (const prefix of ["N", "R", "C"]) {
    const ids = Array.from(data.matchAll(/"id": "([NRC]\d{2})"/g), x => x[1]).filter(x => x.startsWith(prefix));
    assert.equal(ids.length, 16);
    assert.equal(new Set(ids).size, 16);
    assert.ok(ids.includes(prefix + "01") && ids.includes(prefix + "16"));
  }
});
test("academy doesn't passively equate exposure with retained skill", () => {
  assert.match(page, /independentNote\.trim\(\)\.length < 20/);
  assert.match(page, /Date\.now\(\) - since < 86400000/);
  assert.match(page, /delayedNote\.trim\(\)\.length < 20/);
  assert.match(page, /Self-reported/);
  assert.match(page, /not yet completed full lessons/);
});
test("academy local state has separate namespace and export", () => {
  assert.match(page, /ai-mastery-atlas:v6-academy-preview:1/);
  assert.match(page, /JSON\.stringify/);
  assert.match(page, /URL\.createObjectURL/);
  assert.doesNotMatch(page, /fetch\(/);
});
test("existing Atlas desktop and mobile navigation offers the preview", () => {
  assert.equal(home.split('href="/academy"').length - 1, 2);
});
