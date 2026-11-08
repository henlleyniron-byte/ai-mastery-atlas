import assert from "node:assert/strict";
import test, { after } from "node:test";
import { createServer } from "vite";

const vite = await createServer({
  appType: "custom",
  configFile: false,
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, hmr: false, ws: false },
});
after(() => vite.close());
const { sanitizePublicLabState, sanitizeClaudeLab, sanitizeGeminiLab, parseOptionalBenchmarkMeasurement } = await vite.ssrLoadModule("/lib/v5-state.ts");

test("public lab retest dates reject impossible calendar days without changing valid leap days", () => {
  const invalid = ["2026-02-29", "2026-02-30", "2026-04-31", "2026-13-01", "2026-1-01", "not-a-date"];
  for (const date of invalid) {
    assert.equal(sanitizeClaudeLab({ stages: { C0: { retestDue: date } } }).stages.C0?.retestDue, undefined, date);
    assert.equal(sanitizeGeminiLab({ stages: { G0: { retestDue: date } } }).stages.G0?.retestDue, undefined, date);
  }
  assert.equal(sanitizeClaudeLab({ stages: { C0: { retestDue: "2028-02-29" } } }).stages.C0?.retestDue, "2028-02-29");
});

test("missing, null, blank or boolean benchmark measurements never fabricate zero", () => {
  const samples = [null, "", "   ", false, true, {}, []];
  for (const sample of samples) {
    const [run] = sanitizePublicLabState({ benchmarks: [{
      id: "bench-1", date: "2026-11-07", task: "Synthetic task", model: "Example",
      latencySeconds: sample, estimatedCost: sample, score: sample,
    }] }).benchmarks;
    assert.ok(run);
    for (const key of ["latencySeconds", "estimatedCost", "score"]) {
      assert.equal(Object.hasOwn(run, key), false, `${key} from ${JSON.stringify(sample)}`);
    }
  }
});

test("valid numeric benchmark measurements retain true zero, fractional costs and score bounds", () => {
  const state = sanitizePublicLabState({ benchmarks: [{
    id: "bench-1", date: "2026-11-07", task: "Synthetic task", model: "Example",
    latencySeconds: 0, estimatedCost: "0.125", score: 4,
  }] });
  assert.equal(state.benchmarks[0].latencySeconds, 0);
  assert.equal(state.benchmarks[0].estimatedCost, 0.125);
  assert.equal(state.benchmarks[0].score, 4);
  assert.equal(sanitizePublicLabState({ benchmarks: [{
    id: "bench-2", date: "2026-02-30", task: "Synthetic task", model: "Example",
  }] }).benchmarks.length, 0);
});

test("benchmark form rejects invalid values visibly rather than silently clamping", () => {
  for (const input of ["Infinity", "NaN", "-1", "4.01", "1e309"]) assert.equal(parseOptionalBenchmarkMeasurement(input, 4), null, input);
  assert.equal(parseOptionalBenchmarkMeasurement(""), undefined);
  assert.equal(parseOptionalBenchmarkMeasurement("   "), undefined);
  assert.equal(parseOptionalBenchmarkMeasurement("0"), 0);
  assert.equal(parseOptionalBenchmarkMeasurement("2.5", 4), 2.5);
  assert.equal(parseOptionalBenchmarkMeasurement("2.5", 2), null);
});

test("blank legacy arena scores cannot be converted into fictional zero", () => {
  const clean = sanitizeClaudeLab({ arena: { g0: "", m0: "  ", c0: 0, g1: "3" } });
  assert.equal(Object.hasOwn(clean.arena, "g0"), false);
  assert.equal(Object.hasOwn(clean.arena, "m0"), false);
  assert.equal(clean.arena.c0, 0);
  assert.equal(clean.arena.g1, "3");
});
