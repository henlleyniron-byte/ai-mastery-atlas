import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders the Flagship Model Lab and preserved beginner academy without development preview metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.doesNotMatch(html, developmentPreviewMeta);
  assert.match(html, /AI Mastery Atlas — Flagship Model Lab/);
  assert.match(html, /id="frontier-update"/);
  assert.match(html, /Prepare a head-to-head test/);
  assert.match(html, /claude-fable-5-2/);
  assert.match(html, /Gemini 4 Carbon/);
  assert.match(html, /Score completed runs in the Evaluation Workbench/);
  assert.match(html, /id="evaluation-workbench"/);
  assert.match(html, /id="learning-science"/);
  assert.match(html, /id="beginner-academy"/);
  assert.match(html, /id="v6-models"/);
  assert.match(html, /id="subject-study-lab"/);
  assert.match(html, /href="\/chemistry-intelligence\/"/);
  assert.match(html, /href="\/biology-intelligence\/"/);
});
