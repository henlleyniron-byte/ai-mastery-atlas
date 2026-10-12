import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const desk=readFileSync(new URL("../app/model-desk/page.tsx",import.meta.url),"utf8");
const home=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
test("desktop and mobile navigation link the opt-in model decision desk",()=>{
 assert.equal(home.split('href="/model-desk"').length-1,2);
});
test("model desk avoids falsely asserting consumer entitlement or live synchronization",()=>{
 assert.match(desk,/not a live API synchronization/);
 assert.match(desk,/does not prove a model appears/);
 assert.match(desk,/No API keys, API calls/);
 assert.match(desk,/12 October 2026/);
 assert.doesNotMatch(desk,/fetch\(|localStorage|process\.env/);
});
test("model IDs are source-dated and every provider has a reference URL",()=>{
 assert.match(desk,/claude-sonnet-5-5/);
 assert.match(desk,/https:\/\/platform\.claude\.com\/docs\/en\/models\/overview/);
 assert.match(desk,/https:\/\/developers\.openai\.com\/api\/docs\/models/);
 assert.match(desk,/https:\/\/ai\.google\.dev\/gemini-api\/docs\/models/);
});
