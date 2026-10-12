import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const data = readFileSync(new URL("../lib/v6-academy-lessons.ts", import.meta.url), "utf8");
const page = readFileSync(new URL("../app/academy/page.tsx", import.meta.url), "utf8");
const workshops = readFileSync(new URL("../lib/v6-guided-workshops.ts", import.meta.url), "utf8");
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
  assert.match(page, /not independently accredited or fully validated courses/);
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

test("remaining forty-five lessons have authored workshops with all five fields", () => {
  const mainIds = Array.from(data.matchAll(/"id": "([NRC]\d{2})"/g), x => x[1]);
  const workshopIds = Array.from(workshops.matchAll(/"([NRC]\d{2})": \{/g), x => x[1]);
  assert.equal(workshopIds.length, 45);
  assert.equal(new Set(workshopIds).size, 45);
  for (const id of workshopIds) {
    assert.ok(mainIds.includes(id));
    assert.ok(!["N01", "R01", "C01"].includes(id));
  }
  for (const field of ['"mental"', '"guided"', '"independent"', '"rubric"', '"repair"']) {
    assert.equal(workshops.split(field).length - 1, 45, field);
  }
  assert.match(page, /guidedWorkshops\[selected\.id\]/);
});
