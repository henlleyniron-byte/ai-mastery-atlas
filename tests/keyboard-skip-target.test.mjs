import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("skip-to-start link targets a keyboard-focusable section", () => {
  assert.match(page, /<a className="skip-link" href="#start">Skip to start<\/a>/);
  assert.match(page, /<section id="start" tabIndex=\{-1\} className="page-section">/);
});
