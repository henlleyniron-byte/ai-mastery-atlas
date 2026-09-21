import assert from "node:assert/strict";
import test, { after } from "node:test";
import ts from "typescript";
import { createServer } from "vite";
const vite = await createServer({ appType: "custom", configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false } });
after(() => vite.close());
const { applyStudioPreset, composeStudioPrompt, newStudioState, sanitizeStudioState, studioFields, studioPresets, studioReadiness, studioRubric } = await vite.ssrLoadModule("/lib/astra-studio.ts");
const { astraLessons, astraTrackMinutes, developerExamples, missionControl } = await vite.ssrLoadModule("/lib/astra-track.ts");
const { lessonData } = await vite.ssrLoadModule("/lib/lesson-data.ts");
const { expansionTracks } = await vite.ssrLoadModule("/lib/expansion-track-data.ts");

test("authored lesson replacements have examples and explicit source mappings, without outline boilerplate", () => {
  assert.equal(Object.values(lessonData).flat().length, 132);
  for (const lesson of Object.values(lessonData).flat()) {
    assert.ok(lesson.example.length > 45);
    assert.ok(lesson.resourceIds.length > 0);
    assert.doesNotMatch(lesson.explanation, /turns an abstract idea into|Within .* matters because/);
    assert.doesNotMatch(lesson.transfer, /After .* transfer the method/);
    assert.notEqual(lesson.activity, lesson.check);
  }
});

test("the ten non-Astra expansion tracks contain forty authored lessons and exactly 182 hours", () => {
  assert.equal(expansionTracks.length, 10);
  assert.equal(expansionTracks.reduce((sum, track) => sum + track.hours, 0), 182);
  assert.equal(expansionTracks.flatMap(track => track.lessons).length, 40);
  for (const track of expansionTracks) {
    assert.equal(track.lessons.length, 4, `${track.id} needs four authored lessons`);
    assert.equal(new Set(track.lessons.map(item => item.title)).size, 4);
    for (const item of track.lessons) {
      assert.ok(item.example.length > 60);
      assert.ok(item.activity.length > 60);
      assert.ok(item.check.length > 50);
      assert.ok(item.passCriterion.length > 60);
      assert.notEqual(item.activity, item.check);
      assert.ok(item.resourceIds.length > 0);
    }
  }
});

test("all eight Studio presets have distinct tasks, boundaries and transfer variants", () => {
  assert.equal(studioPresets.length, 8);
  assert.equal(new Set(studioPresets.map(item => item.objective)).size, 8);
  assert.equal(new Set(studioPresets.map(item => item.transfer)).size, 8);
  for (const preset of studioPresets) {
    const state = applyStudioPreset(preset.id);
    assert.equal(studioReadiness(state).missing.length, 0);
    const prompt = composeStudioPrompt(state);
    for (const [, title] of studioFields) assert.ok(prompt.includes(title.toUpperCase()));
    assert.equal(state.result, "");
    assert.equal(studioReadiness(state).validRun, false);
    assert.equal(studioReadiness(state).assessed, false);
    assert.equal(state.mastered, undefined);
  }
});

test("Studio import strips unknown fields and validates dates, scores and field types", () => {
  const input = { ...applyStudioPreset("debug"), fields: { objective: "x".repeat(8000), unknown: "discard" }, runDate: "2026-02-31", scores: { [studioRubric[0]]: 99, [studioRubric[1]]: "4" }, Mastered: true };
  const state = sanitizeStudioState(input);
  assert.equal(state.fields.objective.length, 6000);
  assert.equal(state.fields.unknown, undefined);
  assert.equal(state.runDate, "");
  assert.equal(state.scores[studioRubric[0]], null);
  assert.equal(state.scores[studioRubric[1]], null);
  assert.equal(state.Mastered, undefined);
  assert.deepEqual(sanitizeStudioState(null), newStudioState());
});

test("Studio recording requires actual evidence; planned and premature retention are not a pass", () => {
  const state = applyStudioPreset("science");
  Object.assign(state, { result: "Observed checked result", productModel: "Recorded selector", runDate: "2026-09-01", transfer: "Fresh task passed", transferDate: "2026-09-02", retestDate: "2026-09-08", scores: Object.fromEntries(studioRubric.map(label => [label, 3])) });
  assert.equal(studioReadiness(state, "2026-09-06").validRun, true);
  assert.equal(studioReadiness(state, "2026-09-06").assessed, true);
  assert.equal(studioReadiness(state, "2026-09-06").validRetest, false);
  state.retestDate = "2026-09-09";
  assert.equal(studioReadiness(state, "2026-09-06").validRetest, true);
  state.runDate = "2026-10-01";
  assert.equal(studioReadiness(state, "2026-09-06").validRun, false);
  assert.equal(studioReadiness(state, "2026-09-06").earliestRetest, undefined);
});

test("Astra track has eight authored modules and includes its capstone within eighteen hours", () => {
  assert.equal(astraLessons.length, 8);
  assert.equal(astraTrackMinutes.reduce((a, b) => a + b, 0), 1080);
  assert.equal(missionControl.allocatedMinutes + 120, astraTrackMinutes[7]);
  assert.equal(missionControl.rubric.reduce((sum, [, points]) => sum + points, 0), 100);
  assert.equal(missionControl.minimumPass, 80);
  assert.ok(missionControl.criticalFailures.some(item => /unauthorised/.test(item)));
  for (const lesson of astraLessons) for (const field of ["objective", "explanation", "example", "activity", "check", "failureMode", "passCriterion", "transfer"]) assert.ok(lesson[field].length > 60, `${lesson.title}/${field}`);
});

test("developer examples are syntactically valid and do not contain a key or pretend to be executed", () => {
  for (const example of developerExamples) {
    if (example.language === "JSON") JSON.parse(example.code);
    else {
      const source = ts.createSourceFile("example.mjs", example.code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
      assert.equal(source.parseDiagnostics.length, 0);
    }
    assert.doesNotMatch(example.code, /sk-[a-zA-Z0-9_-]{12,}/);
    assert.match(example.source, /^https:\/\/developers\.openai\.com\//);
  }
});
