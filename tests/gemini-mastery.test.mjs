import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const component = await readFile(new URL("../components/gemini-mastery.tsx", import.meta.url), "utf8");
const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("Gemini pathway exposes fifteen evidence stages and a separate capability passport", () => {
  const ids = [...component.matchAll(/\["G(\d+)",/g)].map(match => Number(match[1]));
  assert.deepEqual(ids, Array.from({ length: 15 }, (_, index) => index));
  for (const field of ["Artifact / result reference", "Novel transfer evidence", "Retest due", "Retest result"]) assert.match(component, new RegExp(field));
  assert.match(page, /readLegacyLab\("atlas-v42-gemini"\)/);
  assert.match(page, /GeminiMastery state=\{learningState\.publicLabs\.gemini\}/);
});

test("public plan audit separates observed capabilities from private entitlements", () => {
  assert.match(component, /Public plan-access audit template/);
  assert.match(component, /capabilities observed locally/);
  assert.match(component, /country, language, age, device, plan and rollout restrictions/);
  assert.match(component, /No plan identity, billing or entitlement value is embedded/);
  assert.match(component, /One-million-token context/);
  assert.match(component, /5 TB cloud storage/);
});

test("Gemini mastery covers study, research, Workspace, creation and building", () => {
  for (const lane of ["Study", "Research", "Workspace", "Build", "Create"]) assert.match(component, new RegExp(`>${lane}<`));
  for (const lab of ["Pro Plan Audit Lab", "A/L Evidence Tutor Lab", "Deep Research Tribunal", "5 TB Knowledge Vault Lab", "Google Builder Capstone"]) assert.match(component, new RegExp(lab));
});

test("ten canonical Google sources remain registered in the universal-systems release", () => {
  for (let id = 139; id <= 148; id += 1) assert.match(page, new RegExp(`r${id}`));
  assert.match(page, /v5\.0 — Universal AI Systems Mastery/);
  assert.match(page, /No private entitlement or billing values are present/);
});
