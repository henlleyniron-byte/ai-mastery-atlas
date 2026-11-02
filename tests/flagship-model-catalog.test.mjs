import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const claude = await readFile(new URL("../components/claude-mastery.tsx", import.meta.url), "utf8");
const gemini = await readFile(new URL("../components/gemini-mastery.tsx", import.meta.url), "utf8");

test("current Claude model names are cited and access is not inferred", () => {
  for (const model of ["Fable 5.1", "Opus 5.5", "Sonnet 5.5", "Haiku 5.5"]) assert.ok(claude.includes('["' + model + '",'));
  assert.ok(claude.includes("checked 2 November 2026"));
  assert.ok(claude.includes("Current · verify access"));
});

test("Gemini model ID labels match the dated official register", () => {
  for (const model of ["gemini-4-argon", "gemini-3.8-flash", "gemini-3.5-flash-lite"]) assert.ok(gemini.includes('"' + model + '"'));
  assert.ok(gemini.includes("checked 2 November 2026"));
  assert.ok(gemini.includes("A model listing is not proof of account access"));
});
