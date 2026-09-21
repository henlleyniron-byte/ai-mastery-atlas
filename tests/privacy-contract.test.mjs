import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const sourceRoots = ["app", "components", "lib", "worker", "db"];
const privateMarkers = [
  /C:\\Users\\/i,
  /@[a-z0-9.-]+\.(?:com|net|org)\b/i,
  /appgprj_[a-z0-9]+/i,
  /siwc_bypass/i,
  /(?:^|[^a-z])sk-[a-z0-9]{16,}/i,
  /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/,
];

async function filesUnder(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async entry => entry.isDirectory()
    ? filesUnder(join(root, entry.name))
    : [join(root, entry.name)]));
  return nested.flat();
}

test("public source contains no private local paths, account identifiers or credential-shaped values", async () => {
  const files = (await Promise.all(sourceRoots.map(filesUnder))).flat().filter(file => /\.(?:ts|tsx|js|mjs|json)$/.test(file));
  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const marker of privateMarkers) assert.doesNotMatch(source, marker, `${file} contains a private deployment or credential-shaped value`);
  }
});

test("the learner-state implementation remains browser-local and does not send progress over the network", async () => {
  const page = await readFile("app/page.tsx", "utf8");
  assert.match(page, /localStorage\.setItem\("atlas-v4-state"/);
  assert.doesNotMatch(page, /(?:fetch|XMLHttpRequest|sendBeacon)\s*\(/);
  assert.doesNotMatch(page, /(?:document\.cookie|sessionStorage|indexedDB)/);
});

test("managed hosting configuration has no runtime bindings or credential fields", async () => {
  const hosting = JSON.parse(await readFile(".openai/hosting.json", "utf8"));
  assert.deepEqual(Object.keys(hosting).sort(), ["d1", "project_id", "r2"]);
  assert.equal(hosting.d1, null);
  assert.equal(hosting.r2, null);
  assert.match(hosting.project_id, /^appgprj_[a-z0-9]+$/);
});
