import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const component = readFileSync(new URL("../components/model-currency-panel.tsx", import.meta.url), "utf8");
const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

test("model reference has a visible date and authoritative links", () => {
  assert.match(component, /checked 2 November 2026/);
  for (const domain of ["developers.openai.com/api/docs/models", "www.anthropic.com/news/models", "ai.google.dev/gemini-api/docs/models"]) {
    assert.ok(component.includes(domain), `Missing official reference ${domain}`);
  }
});
test("model reference is accessible and rendered once", () => {
  assert.match(component, /aria-labelledby="model-currency-title"/);
  assert.match(component, /id="model-currency-title"/);
  assert.equal(page.split("<ModelCurrencyPanel />").length - 1, 1);
  assert.match(page, /import \{ ModelCurrencyPanel \} from "@\/components\/model-currency-panel";/);
});
test("model reference does not initiate model calls or imply account access", () => {
  assert.match(component, /not a live model selector/);
  assert.doesNotMatch(component, /fetch\s*\(|Authorization:|apiKey|process\.env/);
});
