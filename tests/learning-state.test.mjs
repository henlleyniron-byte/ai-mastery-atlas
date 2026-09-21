import assert from "node:assert/strict";
import test, { after } from "node:test";
import { createServer } from "vite";
const vite = await createServer({ appType: "custom", configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false } });
after(() => vite.close());
const { additionalHours, levels, levelTargets, programmeMap } = await vite.ssrLoadModule("/lib/programme.ts");
const { addDays, capstonePaths, defineCurriculum, deriveProgress, diagnosticRoute, exportLearningState, graduation, importLearningState, newLearningState, planSession, progressMinutes, recordEvidence, validDate } = await vite.ssrLoadModule("/lib/learning-state.ts");

// These are state-engine fixtures, not a claim that every planned lesson has been authored.
const fixtureUnits = levels.flatMap(level => Object.entries(programmeMap[level]).map(([id, hours]) => ({ id: `${id}-fixture`, trackId: id, title: id, minutes: hours * 60, instructionMinutes: hours * 20, prerequisites: [], minimumRetestDays: 7, domains: [id === "b0" ? "coding" : "fundamentals"], kind: id === "c0" ? "capstone" : id === "pr0" ? "project" : "module" })));
const curriculum = defineCurriculum(fixtureUnits);
const unit = curriculum.byId.get("e0-fixture");
const today = "2026-09-20";
const scores = { KNOW: 3, DO: 3, EXPLAIN: 3, DEBUG: 3, TRANSFER: 3, RETAIN: 3 };
const evidence = (action, date = "2026-09-01", overrides = {}) => ({ action, date, note: "Criterion checked against the frozen expected result.", artifact: "Local artifact reference, not uploaded.", independent: true, scores, context: "Unseen input with a different failure mode.", ...overrides });
const completed = (id = unit.id) => {
  let state = newLearningState();
  for (const action of ["learn", "practise", "demonstrate", "transfer", "retest"]) {
    const result = recordEvidence(state, id, evidence(action, action === "retest" ? "2026-09-08" : "2026-09-01"), curriculum, today);
    assert.equal(result.error, undefined);
    state = result.state;
  }
  return state;
};

test("500-hour plan retains 300 hours and accounts for the additional 200 by track", () => {
  assert.equal(levels.reduce((sum, level) => sum + Object.values(programmeMap[level]).reduce((a, b) => a + b, 0), 0), 500);
  assert.deepEqual(levels.map(level => Object.values(programmeMap[level]).reduce((a, b) => a + b, 0)), [80, 110, 140, 100, 70]);
  assert.equal(additionalHours.reduce((sum, [, hours]) => sum + hours, 0), 200);
  for (const [id, hours, reason] of additionalHours) {
    assert.equal(levels.flatMap(level => Object.entries(programmeMap[level])).find(([track]) => track === id)[1], hours);
    assert.ok(reason.length > 50);
  }
});

test("curriculum validator rejects misallocation, invalid references, cycles and passive padding", () => {
  for (const change of [
    units => { units[0].minutes++; },
    units => { units[0].id = units[1].id; },
    units => { units[0].prerequisites = ["absent"]; },
    units => { units[0].prerequisites = [units[1].id]; units[1].prerequisites = [units[0].id]; },
    units => { units.forEach(u => { u.instructionMinutes = u.minutes; }); },
    units => { units[0].minimumRetestDays = 1; },
    units => { units[0].minutes = NaN; },
  ]) {
    const units = structuredClone(fixtureUnits); change(units);
    assert.throws(() => defineCurriculum(units));
  }
});

test("date handling rejects impossible calendar dates and remains stable across year boundaries", () => {
  for (const date of ["2026-02-29", "2026-02-31", "2026-13-01", "2026-9-01", "not-a-date", "2026-09-01T00:00:00Z"]) assert.equal(validDate(date), false);
  assert.equal(validDate("2028-02-29"), true);
  assert.equal(addDays("2026-12-28", 7), "2027-01-04");
});

test("ordinary evidence stages advance without a manually trusted Mastered field", () => {
  let state = newLearningState();
  const expected = { learn: "Learned", practise: "Practised", demonstrate: "Demonstrated", transfer: "Transferred", retest: "Mastered" };
  for (const action of Object.keys(expected)) {
    const date = action === "retest" ? "2026-09-08" : "2026-09-01";
    const result = recordEvidence(state, unit.id, evidence(action, date), curriculum, date);
    assert.equal(result.error, undefined);
    state = result.state;
    assert.equal(deriveProgress(state.units[unit.id], unit, date).stage, expected[action]);
  }
  assert.equal(deriveProgress({ events: [], status: "Mastered" }, unit, today).stage, "Unseen");
});

test("independent evidence requires the prior stage, artifact, independence and competence anchors", () => {
  const state = newLearningState();
  assert.match(recordEvidence(state, unit.id, evidence("demonstrate"), curriculum, today).error, /preceding/);
  let practised = recordEvidence(state, unit.id, evidence("learn"), curriculum, today).state;
  practised = recordEvidence(practised, unit.id, evidence("practise"), curriculum, today).state;
  for (const overrides of [{ artifact: "" }, { independent: false }, { scores: {} }, { scores: { ...scores, DEBUG: 2 } }, { date: "2026-09-30" }, { date: "2026-02-31" }, { date: "2026-08-30" }]) {
    const result = recordEvidence(practised, unit.id, evidence("demonstrate", undefined, overrides), curriculum, today);
    assert.ok(result.error);
    assert.equal(result.state, practised, "Rejected input must not mutate state");
  }
});

test("transfer requires a different-context record and retention requires seven complete days", () => {
  const state = completed();
  const beforeTransfer = { ...state, units: { [unit.id]: { events: state.units[unit.id].events.slice(0, 3) } } };
  assert.match(recordEvidence(beforeTransfer, unit.id, evidence("transfer", undefined, { context: "" }), curriculum, today).error, /different context/);
  const transferred = { ...state, units: { [unit.id]: { events: state.units[unit.id].events.slice(0, 4) } } };
  assert.equal(deriveProgress(transferred.units[unit.id], unit, "2026-09-07").stage, "Transferred");
  assert.equal(deriveProgress(transferred.units[unit.id], unit, "2026-09-08").stage, "Retest Due");
  assert.ok(recordEvidence(transferred, unit.id, evidence("retest", "2026-09-07"), curriculum, today).error);
  assert.equal(recordEvidence(transferred, unit.id, evidence("retest", "2026-09-08"), curriculum, today).error, undefined);
});

test("mastered work receives a scheduled long-term maintenance check without losing mastery credit", () => {
  const state = completed();
  assert.equal(deriveProgress(state.units[unit.id], unit, "2026-09-14").maintenanceDue, "2026-09-15");
  assert.match(recordEvidence(state, unit.id, evidence("maintain", "2026-09-14"), curriculum, today).error, /maintenance check/i);
  const maintained = recordEvidence(state, unit.id, evidence("maintain", "2026-09-15", { evaluator: "DETERMINISTIC CHECK" }), curriculum, today);
  assert.equal(maintained.error, undefined);
  assert.equal(deriveProgress(maintained.state.units[unit.id], unit, today).stage, "Mastered");
  assert.equal(deriveProgress(maintained.state.units[unit.id], unit, today).maintenanceDue, "2026-09-22");
  assert.equal(progressMinutes(maintained.state, curriculum, today).programme.mastered, unit.minutes);
});

test("a real independent challenge can bypass instruction, but diagnostic placement alone cannot", () => {
  const state = newLearningState();
  state.diagnostic = [{ domain: "fundamentals", score: 4, note: "Placement", date: "2026-09-01" }];
  assert.equal(deriveProgress(state.units[unit.id], unit, today).stage, "Unseen");
  assert.ok(recordEvidence(state, unit.id, evidence("challenge", undefined, { artifact: "" }), curriculum, today).error);
  assert.ok(recordEvidence(state, unit.id, evidence("challenge", undefined, { scores: { ...scores, EXPLAIN: 2 } }), curriculum, today).error);
  const assessed = recordEvidence(state, unit.id, evidence("challenge"), curriculum, today);
  assert.equal(assessed.error, undefined);
  assert.equal(deriveProgress(assessed.state.units[unit.id], unit, today).stage, "Demonstrated");
  assert.equal(progressMinutes(assessed.state, curriculum, today).programme.mastered, 0);
});

test("failed independent work or retention routes to repair and preserves the failed-attempt history", () => {
  for (const starting of [completed(), { ...completed(), units: { [unit.id]: { events: completed().units[unit.id].events.slice(0, 2) } } }]) {
    const failed = recordEvidence(starting, unit.id, evidence("fail", "2026-09-10", { note: "Wrong unit conversion; repair the dimensional check." }), curriculum, today).state;
    assert.equal(deriveProgress(failed.units[unit.id], unit, today).stage, "Needs Repair");
    assert.equal(progressMinutes(failed, curriculum, today).programme.mastered, 0);
    assert.match(planSession(failed, curriculum, today).reason, /unit conversion/);
    const repair = recordEvidence(failed, unit.id, evidence("practise", "2026-09-11"), curriculum, today).state;
    assert.equal(deriveProgress(repair.units[unit.id], unit, today).stage, "Practised");
    assert.ok(repair.units[unit.id].events.some(event => event.action === "fail"));
    assert.ok(recordEvidence(repair, unit.id, evidence("retest", "2026-09-20"), curriculum, today).error);
  }
});

test("evidence records evaluator type and a narrow failure category without claiming automatic verification", () => {
  let state = newLearningState();
  state = recordEvidence(state, unit.id, evidence("learn"), curriculum, today).state;
  state = recordEvidence(state, unit.id, evidence("practise"), curriculum, today).state;
  const demonstrated = recordEvidence(state, unit.id, evidence("demonstrate", "2026-09-02", { evaluator: "HUMAN" }), curriculum, today);
  assert.equal(demonstrated.error, undefined);
  assert.equal(demonstrated.state.units[unit.id].events.at(-1).evaluator, "HUMAN");
  const failed = recordEvidence(demonstrated.state, unit.id, evidence("fail", "2026-09-03", { failureCategory: "coding defect" }), curriculum, today);
  assert.equal(failed.error, undefined);
  assert.equal(failed.state.units[unit.id].events.at(-1).failureCategory, "coding defect");
  assert.equal(failed.state.units[unit.id].events.at(-1).evaluator, "SELF");
  const imported = importLearningState({ ...failed.state, units: { [unit.id]: { events: failed.state.units[unit.id].events.map(event => ({ ...event, evaluator: "UNTRUSTED", failureCategory: "invented category" })) } } }, curriculum, today);
  assert.equal(imported.error, undefined);
  assert.equal(imported.state.units[unit.id].events.at(-1).evaluator, "SELF");
  assert.equal(imported.state.units[unit.id].events.at(-1).failureCategory, undefined);
});

test("valid v3.2 track evidence migrates without creating module awards or losing original notes", () => {
  const legacy = { status: "Mastered", demonstratedEvidence: "Original independent artifact", demonstratedAt: "2026-08-01", transferContext: "Second domain", transferEvidence: "Original transfer", transferredAt: "2026-08-08", retestDue: "2026-08-16", retestEvidence: "Original retest", retestPassedAt: "2026-08-16" };
  const migrated = importLearningState({ version: "3.2", progress: { e0: legacy, e1: { status: "Practised" } } }, curriculum, today);
  assert.equal(migrated.error, undefined);
  assert.deepEqual(migrated.state.legacyTracks.e0, legacy);
  assert.equal(migrated.state.legacyTracks.e1.status, "Practised");
  assert.deepEqual(migrated.state.units, {});
  assert.equal(progressMinutes(migrated.state, curriculum, today).programme.mastered, 300);
  assert.equal(graduation(migrated.state, curriculum, today).achieved, false);
});

test("v4.0-A exports are identified by schema 3.3, and unsupported old claims are demoted", () => {
  const result = importLearningState({ version: "4.0", schemaVersion: "3.3", progress: { e0: { status: "Mastered" }, e1: { status: "Demonstrated", demonstratedEvidence: "date is impossible", demonstratedAt: "2026-02-31" } } }, curriculum, today);
  assert.equal(result.state.legacyTracks.e0.status, "Practised");
  assert.equal(result.state.legacyTracks.e1.status, "Practised");
  assert.ok(result.warnings.length >= 2);
  const old = importLearningState({ version: "3.1", statuses: { e0: "Mastered", e1: "Learned" } }, curriculum, today);
  assert.equal(old.state.legacyTracks.e0.status, "Practised");
  assert.equal(old.state.legacyTracks.e1.status, "Learned");
});

test("state round trip preserves module evidence, diagnostics and preferences; reset is truly empty", () => {
  const state = completed();
  state.route = "Developer";
  state.preferences = { sessionMinutes: 90, currentUnit: unit.id, capstonePath: capstonePaths[0] };
  state.diagnostic = [{ domain: "coding", score: 3, note: "Completed a placement challenge", date: "2026-09-01" }];
  const restored = importLearningState(exportLearningState(state), curriculum, today);
  assert.equal(restored.error, undefined);
  assert.deepEqual(restored.state.units, state.units);
  assert.deepEqual(restored.state.preferences, state.preferences);
  assert.deepEqual(restored.state.diagnostic, state.diagnostic);
  assert.equal(restored.state.route, "Developer");
  assert.deepEqual(progressMinutes(newLearningState(), curriculum, today).programme, { exposure: 0, practice: 0, demonstrated: 0, transfer: 0, mastered: 0 });
});

test("v5 export unifies public ecosystem labs and sanitizes untrusted fields", () => {
  const state = newLearningState();
  state.publicLabs.claude.stages.C0 = { artifact: "routing record", transfer: "new task" };
  state.publicLabs.gemini.planAudit.workspace = true;
  state.publicLabs.benchmarks.push({ id: "run-1", date: "2026-09-09", task: "Frozen task", model: "Model A", version: "dated", tools: "none", score: 3 });
  const restored = importLearningState(exportLearningState(state), curriculum, today);
  assert.equal(restored.error, undefined);
  assert.equal(restored.state.schemaVersion, "5.0");
  assert.equal(restored.state.publicLabs.claude.stages.C0.artifact, "routing record");
  assert.equal(restored.state.publicLabs.gemini.planAudit.workspace, true);
  assert.equal(restored.state.publicLabs.benchmarks[0].score, 3);

  const hostile = structuredClone(state);
  hostile.publicLabs.claude.stages.BAD = { artifact: "ignore" };
  hostile.publicLabs.benchmarks[0].score = 900;
  const sanitized = importLearningState(hostile, curriculum, today);
  assert.equal(sanitized.state.publicLabs.claude.stages.BAD, undefined);
  assert.equal(sanitized.state.publicLabs.benchmarks[0].score, undefined);
});

test("malformed imports fail atomically; missing optional fields and extra fields fail safely", () => {
  for (const input of ["{", "null", "[]", '{"schemaVersion":"9.0"}', '{"schemaVersion":"4.0","units":[]}', '{"version":"3.2","progress":"broken"}', "x".repeat(2_000_001)]) {
    const result = importLearningState(input, curriculum, today);
    assert.ok(result.error);
    assert.equal(result.state, undefined);
  }
  const minimal = importLearningState({ schemaVersion: "4.0", injectedMastery: 500, units: { missing: { events: [] } } }, curriculum, today);
  assert.equal(minimal.error, undefined);
  assert.deepEqual(minimal.state.units, {});
  assert.equal(minimal.state.injectedMastery, undefined);
  const proto = importLearningState('{"schemaVersion":"4.0","units":{"__proto__":{"events":[]}},"legacyTracks":{"__proto__":{"status":"Mastered"}}}', curriculum, today);
  assert.equal(proto.error, undefined);
  assert.equal({}.status, undefined);
  assert.deepEqual(proto.state.legacyTracks, {});
});

test("forged imported events cannot skip prerequisites, independence, dates or rubric dimensions", () => {
  const state = completed();
  state.units[unit.id].events[2].independent = false;
  const result = importLearningState(state, curriculum, today);
  assert.equal(result.error, undefined);
  assert.equal(deriveProgress(result.state.units[unit.id], unit, today).stage, "Practised");
  assert.equal(progressMinutes(result.state, curriculum, today).programme.demonstrated, 0);
});

test("module, track, level and programme credit remain bounded and legacy credit never doubles them", () => {
  let state = newLearningState();
  for (const unit of curriculum.units) Object.assign(state.units, completed(unit.id).units);
  const legacy = { status: "Mastered", demonstratedEvidence: "old", demonstratedAt: "2026-08-01", transferContext: "other", transferEvidence: "old", transferredAt: "2026-08-02", retestDue: "2026-08-10", retestEvidence: "old", retestPassedAt: "2026-08-11" };
  state.legacyTracks.e0 = legacy;
  const credits = progressMinutes(state, curriculum, today);
  for (const value of Object.values(credits.programme)) assert.equal(value, 30000);
  for (const level of levels) for (const value of Object.values(credits.byLevel[level])) assert.equal(value, levelTargets[level] * 60);
  for (const unit of curriculum.units) assert.equal(credits.byTrack[unit.trackId].mastered, unit.minutes);
  const failed = recordEvidence(state, unit.id, evidence("fail", "2026-09-12"), curriculum, today).state;
  assert.equal(progressMinutes(failed, curriculum, today).byTrack.e0.mastered, 0, "A new failure cannot be hidden by legacy mastery");
  const repairedPractice = recordEvidence(failed, unit.id, evidence("practise", "2026-09-13"), curriculum, today).state;
  assert.equal(progressMinutes(repairedPractice, curriculum, today).byTrack.e0.mastered, 0, "Recording practice must not resurrect an invalidated legacy mastery award");
});

test("diagnostic placement changes recommendations, never evidence credit or prerequisites", () => {
  const state = newLearningState();
  state.route = "Developer";
  state.diagnostic = [{ domain: "coding", score: 4, note: "Placement only", date: "2026-09-01" }];
  const next = planSession(state, curriculum, today);
  assert.equal(next.unitId, "b0-fixture");
  assert.equal(next.challenge, true);
  assert.match(diagnosticRoute(4), /independent challenge/);
  assert.equal(progressMinutes(state, curriculum, today).programme.mastered, 0);
  const dependent = structuredClone(fixtureUnits);
  dependent.find(unit => unit.id === "b0-fixture").prerequisites = ["e0-fixture"];
  assert.notEqual(planSession(state, defineCurriculum(dependent), today).unitId, "b0-fixture");
});

test("session planner prioritises repair and retention, respects session length and permits long breaks", () => {
  let state = completed();
  state.units["e1-fixture"] = { events: completed("e1-fixture").units["e1-fixture"].events.slice(0, 4) };
  for (const minutes of [30, 60, 90, 120]) {
    state.preferences.sessionMinutes = minutes;
    assert.equal(planSession(state, curriculum, "2027-09-01").minutes, minutes);
    assert.equal(planSession(state, curriculum, "2027-09-01").unitId, "e1-fixture");
  }
  state = recordEvidence(state, unit.id, evidence("fail", "2026-09-10"), curriculum, today).state;
  assert.equal(planSession(state, curriculum, today).unitId, unit.id);
});

test("graduation requires all core unit evidence including projects and the selected capstone path", () => {
  const state = newLearningState();
  for (const unit of curriculum.units) Object.assign(state.units, completed(unit.id).units);
  assert.equal(graduation(state, curriculum, today).achieved, false);
  state.preferences.capstonePath = capstonePaths[0];
  assert.equal(graduation(state, curriculum, today).achieved, true);
  delete state.units["pr0-fixture"];
  assert.equal(graduation(state, curriculum, today).achieved, false);
});
