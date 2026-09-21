import assert from "node:assert/strict";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({
  appType: "custom",
  configFile: false,
  root,
  resolve: { alias: { "@": root } },
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, hmr: false, ws: false },
});

after(async () => vite.close());

const page = await vite.ssrLoadModule("/app/page.tsx");
const { tracks, resources, runtimeCurriculum, runtimeUnitDetails, ExternalResourceLink, buildLearningQueue, calculateProgressHours, migrateLegacyStatuses, sanitizeProgressRecords, validateStatusTransition } = page;
const { routeOperatorTask } = await vite.ssrLoadModule("/lib/operator-core.ts");
const { competencyGraphIntegrity, competencyCoverage, resolveCompetencyGraph } = await vite.ssrLoadModule("/lib/competency-graph.ts");

test("derives the 500-hour runtime curriculum counts from real data", () => {
  const byRoute = Object.fromEntries(["Essential", "Builder", "Advanced"].map((route) => [
    route,
    tracks.filter((track) => track.route === route).reduce((sum, track) => sum + track.hours, 0),
  ]));

  assert.deepEqual(byRoute, { Essential: 184, Builder: 140, Advanced: 176 });
  assert.equal(tracks.reduce((sum, track) => sum + track.hours, 0), 500);
  assert.equal(tracks.length, 43);
  assert.equal(tracks.reduce((sum, track) => sum + track.modules.length, 0), 180);
  assert.equal(tracks.filter((track) => track.labBrief && track.proof).length, 43);
});

test("the real curriculum has a complete competency, assessment, project and capstone graph", () => {
  const report = competencyGraphIntegrity(runtimeCurriculum);
  for (const [field, values] of Object.entries(report)) assert.deepEqual(values, [], `${field} contains unresolved graph links`);
  const graph = resolveCompetencyGraph(runtimeCurriculum);
  assert.ok(graph.every(item => item.associatedModules.length > 0 && item.assessmentIds.length > 0));
  assert.ok(graph.filter(item => item.criticality === "core").every(item => item.minimumEvidence === "E4" && item.transferRequirement && item.retestRequirement));
  const coverage = competencyCoverage(runtimeCurriculum);
  for (const dimension of ["KNOW", "DO", "EXPLAIN", "DEBUG", "TRANSFER", "RETAIN"]) assert.ok(coverage[dimension].length > 0, `${dimension} is absent from the programme assessment blueprint`);
});

test("all 180 runtime modules use authored examples and sources, with unique assessment text and bounded hours", () => {
  const objectives = new Set();
  const explanations = new Set();
  const activities = new Set();
  const checks = new Set();
  const failures = new Set();
  const passes = new Set();
  const transfers = new Set();
  for (const track of tracks) {
    const allocated = track.modules.reduce(
      (sum, lesson) => sum + lesson.learn + lesson.lab + lesson.assessment,
      0,
    );
    assert.ok(Math.abs(allocated - track.hours) < 0.001, `${track.code} allocated ${allocated}h, expected ${track.hours}h`);

    for (const lesson of track.modules) {
      assert.equal(lesson.reviewStatus, "REVIEWED", `${track.code}/${lesson.title} fell back to an outline`);
      assert.ok(lesson.example.length > 45, `${track.code}/${lesson.title} lacks its authored example`);
      assert.doesNotMatch(lesson.explanation, /turns an abstract idea into|Within .* matters because/);
      for (const id of lesson.resourceIds) assert.ok(resources.some(item => item.id === id), `unknown lesson source ${id}`);
      assert.ok(lesson.objective.length > 30, `${track.code}/${lesson.title} lacks an objective`);
      assert.ok(lesson.explanation.length > 60, `${track.code}/${lesson.title} lacks an explanation`);
      assert.ok(lesson.activity.length > 40, `${track.code}/${lesson.title} lacks a practical activity`);
      assert.ok(lesson.check.length > 40, `${track.code}/${lesson.title} lacks an assessment`);
      assert.ok(lesson.failureMode.length > 40, `${track.code}/${lesson.title} lacks a failure mode`);
      assert.ok(lesson.passCriterion.length > 50, `${track.code}/${lesson.title} lacks a pass criterion`);
      assert.ok(lesson.transfer.length > 30, `${track.code}/${lesson.title} lacks transfer practice`);
      assert.ok(lesson.resourceIds.length > 0, `${track.code}/${lesson.title} lacks a lesson resource`);
      objectives.add(lesson.objective); explanations.add(lesson.explanation); activities.add(lesson.activity);
      checks.add(lesson.check); failures.add(lesson.failureMode); passes.add(lesson.passCriterion); transfers.add(lesson.transfer);
    }
  }
  for (const [label, values] of Object.entries({ objectives, explanations, activities, checks, failures, passes, transfers })) {
    assert.equal(values.size, 180, `${label} still contain repeated module shells`);
  }
});

test("runtime units prove exact levels, integer minutes and at least sixty-five percent active allocation", () => {
  assert.equal(runtimeCurriculum.units.length, 180);
  assert.equal(Object.keys(runtimeUnitDetails).length, 180);
  assert.ok(runtimeCurriculum.units.every(unit => runtimeUnitDetails[unit.id]?.passCriterion));
  assert.equal(runtimeCurriculum.units.reduce((sum, unit) => sum + unit.minutes, 0), 30000);
  assert.ok(runtimeCurriculum.units.every(unit => Number.isInteger(unit.minutes) && Number.isInteger(unit.instructionMinutes)));
  const levelOrder = ["Foundations", "Practitioner", "Builder", "Advanced Systems", "Mastery + Portfolio"];
  for (const unit of runtimeCurriculum.units) for (const prerequisiteId of unit.prerequisites) {
    const prerequisite = runtimeCurriculum.byId.get(prerequisiteId);
    assert.ok(prerequisite, `${unit.id} has missing prerequisite ${prerequisiteId}`);
    assert.ok(levelOrder.indexOf(runtimeCurriculum.levelByTrack.get(prerequisite.trackId)) <= levelOrder.indexOf(runtimeCurriculum.levelByTrack.get(unit.trackId)), `${unit.id} depends on later-level ${prerequisiteId}`);
  }
  const active = runtimeCurriculum.units.reduce((sum, unit) => sum + unit.minutes - unit.instructionMinutes, 0);
  assert.ok(active >= 19480, `active allocation is only ${active} minutes`);
  const expected = { Foundations: 4800, Practitioner: 6600, Builder: 8400, "Advanced Systems": 6000, "Mastery + Portfolio": 4200 };
  const actual = Object.fromEntries(Object.keys(expected).map(level => [level, runtimeCurriculum.units.filter(unit => runtimeCurriculum.levelByTrack.get(unit.trackId) === level).reduce((sum, unit) => sum + unit.minutes, 0)]));
  assert.deepEqual(actual, expected);
  const byId = runtimeCurriculum.byId;
  assert.deepEqual([byId.get("e0-m1").minimumRetestDays, byId.get("e0-m1").maintenanceRetestDays], [21, 90]);
  assert.deepEqual([byId.get("g0-m1").minimumRetestDays, byId.get("g0-m1").maintenanceRetestDays], [14, 60]);
  assert.deepEqual([byId.get("e4-m1").minimumRetestDays, byId.get("e4-m1").maintenanceRetestDays], [7, 30]);
  assert.deepEqual([byId.get("c0-m1").minimumRetestDays, byId.get("c0-m1").maintenanceRetestDays], [14, 60]);
});

test("all 43 track labs assemble their protocol from authored lesson evidence instead of a noun-swapped shell", () => {
  const uniqueFields = Object.fromEntries(["scenario", "materials", "constraints", "guided", "partial", "independent", "evidence", "repair", "transfer", "retest"].map((field) => [field, new Set()]));
  for (const track of tracks) {
    const lab = track.lab;
    assert.ok(lab.scenario.length > 60, `${track.code} lacks a scenario`);
    assert.ok(lab.materials.length > 60, `${track.code} lacks starting materials`);
    assert.ok(lab.constraints.length > 80, `${track.code} lacks a safety boundary`);
    assert.ok(lab.guided.length > 60 && lab.partial.length > 60 && lab.independent.length > 60, `${track.code} lacks staged procedures`);
    assert.ok(lab.evidence.length > 80, `${track.code} lacks required evidence`);
    assert.equal(lab.rubric.length, 4, `${track.code} lacks a four-point rubric`);
    assert.ok(lab.repair.length > 60 && lab.transfer.length > 60 && lab.retest.length > 60, `${track.code} lacks repair, transfer or retest detail`);
    assert.ok(lab.scenario.includes(track.modules[0].example), `${track.code} lab is detached from its worked case`);
    assert.ok(lab.independent.includes(track.modules.at(-1).check), `${track.code} lab is detached from its independent assessment`);
    assert.ok(lab.transfer.includes(track.modules.at(-1).transfer), `${track.code} lab lacks its authored transfer`);
    assert.doesNotMatch(lab.guided, /work through the first module example/);
    for (const field of Object.keys(uniqueFields)) uniqueFields[field].add(lab[field]);
  }
  for (const [field, values] of Object.entries(uniqueFields)) assert.equal(values.size, 43, `${field} is not track-specific`);
});

test("resource register is unique, classified, dated and fully integrated; freshness requires a live audit", () => {
  assert.equal(resources.length, 150);
  assert.equal(new Set(resources.map((item) => item.id)).size, resources.length);
  assert.equal(new Set(resources.map((item) => item.url)).size, resources.length);

  const moduleResourceIds = new Set(tracks.flatMap((track) => track.modules.flatMap((lesson) => lesson.resourceIds)));
  const formats = Object.fromEntries(["Course", "Video", "Official docs", "Standard", "Reference"].map((format) => [
    format,
    resources.filter((item) => item.format === format).length,
  ]));

  assert.deepEqual(formats, { Course: 36, Video: 38, "Official docs": 65, Standard: 8, Reference: 3 });
  assert.equal(resources.filter((item) => item.url.includes("youtube.com/")).length, 37);

  assert.deepEqual(resources.filter(item => !moduleResourceIds.has(item.id)).map(item => item.id), [], "resources missing explicit lesson placement");
  for (const item of resources) {
    assert.match(item.url, /^https:\/\//, `${item.id} is not HTTPS`);
    assert.doesNotMatch(item.url, /[?&](utm_|fbclid|gclid)/i, `${item.id} contains tracking parameters`);
    assert.ok(["Active", "Rolling out", "Changing", "Review needed"].includes(item.status), `${item.id} has an invalid publication status`);
    const expectedDate = ["r149", "r150"].includes(item.id) ? "2026-09-13" : item.id.match(/^r1(?:3[0-9]|4[0-8])$/) || item.id === "r129" ? "2026-09-08" : item.id === "r128" ? "2026-09-07" : item.id.match(/^r12[4-7]$/) ? "2026-09-06" : item.id.match(/^r12[1-3]$/) ? "2026-09-04" : "2026-09-01";
    assert.equal(item.lastVerified, expectedDate, `${item.id} lacks the correct audit date`);
    assert.ok(["Fetched", "Search-confirmed", "User-supplied"].includes(item.verification), `${item.id} lacks verification evidence`);
    assert.ok(item.qualityTier && item.versionRelevance, `${item.id} lacks quality/version metadata`);
    assert.ok(moduleResourceIds.has(item.id), `${item.id} is listed but not integrated into a lesson`);
  }
});

test("external resource links announce their new-tab behaviour", () => {
  const markup = renderToStaticMarkup(createElement(ExternalResourceLink, { href: resources[0].url }, resources[0].title));
  assert.match(markup, /target="_blank"/);
  assert.match(markup, /class="sr-only"> \(opens in a new tab\)<\/span>/);
});

test("verified product resources sit in their corresponding lessons", () => {
  const idsFor = (trackId, moduleTitle) => tracks.find((track) => track.id === trackId).modules.find((lesson) => lesson.title === moduleTitle).resourceIds;
  assert.ok(["r19", "r20", "r121"].every((id) => idsFor("e3", "Chat, Search, Deep Research, Projects and memory").includes(id)));
  assert.ok(["r20", "r21", "r23", "r149"].every((id) => idsFor("e3", "Work, Codex, plugins and scheduled execution").includes(id)));
  assert.ok(["r121", "r122", "r123", "r149"].every((id) => idsFor("e3", "Strategic Judge, privacy and model-change survival").includes(id)));
  assert.ok(["r21", "r23"].every((id) => idsFor("b4", "Codex app, CLI and IDE workflows").includes(id)));
  assert.ok(["r61", "r62", "r63"].every((id) => idsFor("b4", "Cursor Agent, Plan and Rules").includes(id)));
  assert.ok(["r64", "r65"].every((id) => idsFor("b4", "Claude Code and terminal-native work").includes(id)));
  assert.ok(["r24", "r26"].every((id) => idsFor("e4", "Notebook-only grounding vs Gemini tools and web").includes(id)));
  assert.ok(["r139", "r140", "r143"].every((id) => idsFor("e4", "Gemini fundamentals and multimodal work").includes(id)));
  assert.ok(["r141", "r142"].every((id) => idsFor("e4", "Gemini research and Google integration").includes(id)));
  assert.ok(["r144", "r145", "r146"].every((id) => idsFor("b3", "Beginner API project and error handling").includes(id)));
  assert.ok(["r147", "r148"].every((id) => idsFor("b4", "Tests, diffs, review and rollback").includes(id)));
  assert.ok(["r66", "r67", "r68", "r102", "r150"].every((id) => idsFor("b6", "MCP clients, servers, tools, resources and prompts").includes(id)));
  assert.ok(["r35", "r36", "r37", "r38", "r39"].every((id) => idsFor("e5", "Kimi, Grok, DeepSeek, Qwen and Perplexity").includes(id)));
  assert.ok(["r42", "r45"].every((id) => idsFor("e7", "Anki and RemNote: recall before buttons").includes(id)));
  assert.ok(["r40", "r46"].every((id) => idsFor("e7", "Notion and xTiles: operations vs maps").includes(id)));
  assert.ok(["r47", "r48"].every((id) => idsFor("e7", "Chrome, Brave, permissions, passwords and export").includes(id)));
});

test("Strategic Operator router selects the narrowest suitable execution surface", () => {
  const base = {
    hasMaterialAiAdvantage: true,
    needsCurrentInformation: false,
    needsMultipleSources: false,
    needsPersistentContext: false,
    needsConnectedAccounts: false,
    changesSoftware: false,
    controlsLocalInterface: false,
    recursLater: false,
    consequence: "Green",
  };
  assert.equal(routeOperatorTask({ ...base, hasMaterialAiAdvantage: false }).primary, "No AI");
  assert.equal(routeOperatorTask({ ...base, needsCurrentInformation: true }).primary, "Search");
  assert.equal(routeOperatorTask({ ...base, needsMultipleSources: true }).primary, "Deep Research");
  assert.equal(routeOperatorTask({ ...base, needsPersistentContext: true }).primary, "Projects");
  assert.equal(routeOperatorTask({ ...base, needsConnectedAccounts: true }).primary, "Work");
  assert.equal(routeOperatorTask({ ...base, changesSoftware: true }).primary, "Codex");
  assert.equal(routeOperatorTask({ ...base, controlsLocalInterface: true }).primary, "Local computer agent");
  assert.equal(routeOperatorTask({ ...base, recursLater: true }).primary, "Scheduled Task");
  assert.match(routeOperatorTask({ ...base, consequence: "Red" }).gate, /human verifies and authorises/i);
  assert.match(routeOperatorTask({ ...base, hasMaterialAiAdvantage: false, consequence: "Red" }).gate, /human verifies and authorises/i);
});

test("progress arithmetic credits only justified track hours", () => {
  const e0 = tracks.find((track) => track.id === "e0");
  for (const status of ["Unseen", "Learned", "Practised", "Demonstrated", "Transferred", "Retest Due", "Mastered", "Needs Repair", "Later", "Skipped with reason"]) {
    const record = { status, demonstratedEvidence: "artifact passed", demonstratedAt: "2026-08-01", retestEvidence: "fresh retest passed", retestPassedAt: "2026-08-20" };
    const hours = calculateProgressHours({ e0: record });
    assert.ok(Object.values(hours).every((value) => value <= e0.hours), `${status} over-credits E0`);
  }
  assert.deepEqual(calculateProgressHours({ e0: { status: "Practised" } }), { courseHours: 5, practisedHours: 5, demonstratedHours: 0, masteredHours: 0 });
  const allMastered = Object.fromEntries(tracks.map((track) => [track.id, { status: "Mastered", demonstratedEvidence: "pass", demonstratedAt: "2026-08-01", transferContext: "new task", transferEvidence: "pass", transferredAt: "2026-08-08", retestDue: "2026-08-20", retestEvidence: "pass", retestPassedAt: "2026-08-20" }]));
  assert.deepEqual(calculateProgressHours(allMastered), { courseHours: 500, practisedHours: 500, demonstratedHours: 500, masteredHours: 500 });
});

test("mastery transitions require dated, staged self-reported evidence", () => {
  assert.match(validateStatusTransition({ status: "Unseen" }, "Mastered", "2026-08-31"), /one stage at a time/i);
  assert.match(validateStatusTransition({ status: "Practised" }, "Demonstrated", "2026-08-31"), /evidence note/i);
  assert.equal(validateStatusTransition({ status: "Practised", demonstratedEvidence: "artifact", demonstratedAt: "2026-08-01" }, "Demonstrated", "2026-08-31"), undefined);
  assert.match(validateStatusTransition({ status: "Retest Due", retestDue: "2026-09-10", retestEvidence: "pass", retestPassedAt: "2026-08-31" }, "Mastered", "2026-08-31"), /locked/i);
  assert.equal(validateStatusTransition({ status: "Retest Due", demonstratedEvidence: "pass", demonstratedAt: "2026-08-01", transferContext: "new task", transferEvidence: "pass", transferredAt: "2026-08-08", retestDue: "2026-08-20", retestEvidence: "fresh variant passed", retestPassedAt: "2026-08-31" }, "Mastered", "2026-08-31"), undefined);
  assert.equal(validateStatusTransition({ status: "Needs Repair", repairNote: "Transfer missed the required citation check." }, "Practised", "2026-08-31"), undefined);
  assert.match(validateStatusTransition({ status: "Practised", demonstratedEvidence: "artifact", demonstratedAt: "2026-09-01" }, "Demonstrated", "2026-08-31"), /future/i);
  assert.match(validateStatusTransition({ status: "Demonstrated", demonstratedAt: "2026-08-20", transferContext: "new case", transferEvidence: "passed", transferredAt: "2026-08-19" }, "Transferred", "2026-08-31"), /on or after demonstration/i);
  assert.match(validateStatusTransition({ status: "Transferred", transferredAt: "2026-08-20", retestDue: "2026-08-20" }, "Retest Due", "2026-08-31"), /after the transfer/i);
  assert.match(validateStatusTransition({ status: "Retest Due", retestDue: "2026-08-25", retestEvidence: "pass", retestPassedAt: "2026-08-24" }, "Mastered", "2026-08-31"), /on or after the due date/i);
  assert.match(validateStatusTransition({ status: "Unseen" }, "Skipped with reason", "2026-08-31"), /add a reason/i);
  assert.equal(validateStatusTransition({ status: "Unseen", skipReason: "Covered by an equivalent assessed course." }, "Skipped with reason", "2026-08-31"), undefined);
});

test("runtime counters cannot retain mastery after missing, invalid or future evidence", () => {
  const record = { status: "Mastered", demonstratedEvidence: "pass", demonstratedAt: "2026-08-01", transferContext: "new task", transferEvidence: "pass", transferredAt: "2026-08-08", retestDue: "2026-08-20", retestEvidence: "pass", retestPassedAt: "2026-08-20" };
  for (const patch of [{ transferEvidence: "" }, { retestPassedAt: "2026-02-31" }, { retestPassedAt: "2099-01-01" }, { status: "Needs Repair", repairNote: "Fresh independent case failed" }]) {
    const hours = calculateProgressHours({ e0: { ...record, ...patch } }, "2026-09-06");
    assert.equal(hours.masteredHours, 0);
  }
  assert.equal(validateStatusTransition({ status: "Practised", repairNote: "Independent attempt failed" }, "Needs Repair", "2026-09-06"), undefined);
});

test("v3.2 progress imports are reduced to the highest evidence-backed stage", () => {
  const sanitized = sanitizeProgressRecords({
    e0: { status: "Mastered", demonstratedEvidence: "artifact", demonstratedAt: "2026-08-01", transferContext: "new case", transferEvidence: "passed", transferredAt: "2026-08-10", retestDue: "2026-08-20", retestEvidence: "passed", retestPassedAt: "2026-08-21" },
    e1: { status: "Mastered", demonstratedEvidence: "artifact", demonstratedAt: "2026-08-01", transferContext: "new case", transferEvidence: "passed", transferredAt: "2026-08-10", retestDue: "2026-08-20", retestEvidence: "passed", retestPassedAt: "2026-08-19" },
    e2: { status: "Demonstrated", demonstratedEvidence: "artifact", demonstratedAt: "2026-09-02" },
    e3: { status: "Skipped with reason" },
    unknown: { status: "Mastered" },
  }, "2026-08-31");
  assert.equal(sanitized.progress.e0.status, "Mastered");
  assert.equal(sanitized.progress.e1.status, "Retest Due");
  assert.equal(sanitized.progress.e2.status, "Practised");
  assert.equal(sanitized.progress.e3.status, "Later");
  assert.equal(sanitized.progress.unknown, undefined);
  assert.equal(sanitized.changed, true);
});

test("learning queue prioritises repair, due retests, active work and future retests", () => {
  const queue = buildLearningQueue({
    e0: { status: "Practised" },
    e1: { status: "Retest Due", retestDue: "2026-09-10" },
    e2: { status: "Retest Due", retestDue: "2026-08-20" },
    e3: { status: "Needs Repair", repairNote: "Transfer failed its citation check." },
  }, "2026-08-31");
  assert.deepEqual(queue.map((item) => [item.trackId, item.kind]), [
    ["e3", "Repair"],
    ["e2", "Retest now"],
    ["e0", "Continue"],
    ["e1", "Retest scheduled"],
  ]);
});

test("v3.1 imports preserve ordinary stages and safely demote unsupported mastery claims", () => {
  const migrated = migrateLegacyStatuses({ e0: "Learned", e1: "Practised", e2: "Demonstrated", e3: "Mastered", e4: "Retest due", e5: "Needs repair", unknown: "Mastered" });
  assert.equal(migrated.progress.e0.status, "Learned");
  assert.equal(migrated.progress.e1.status, "Practised");
  assert.equal(migrated.progress.e2.status, "Practised");
  assert.equal(migrated.progress.e3.status, "Practised");
  assert.equal(migrated.progress.e4.status, "Practised");
  assert.equal(migrated.progress.e5.status, "Needs Repair");
  assert.equal(migrated.progress.unknown, undefined);
  assert.equal(migrated.changed, true);
});

test("uses the current canonical AI for Everyone course URL", () => {
  const course = resources.find((item) => item.id === "r02");
  assert.equal(course?.url, "https://www.deeplearning.ai/courses/ai-for-everyone");
  assert.equal(course?.verification, "Search-confirmed");
});

test("uses the current canonical Generative AI for Everyone course URL", () => {
  const course = resources.find((item) => item.id === "r10");
  assert.equal(course?.url, "https://www.deeplearning.ai/courses/generative-ai-for-everyone");
  assert.equal(course?.verification, "Search-confirmed");
});

test("uses the current canonical crewAI course URL", () => {
  const course = resources.find((item) => item.id === "r118");
  assert.equal(course?.url, "https://www.deeplearning.ai/courses/multi-ai-agent-systems-with-crewai");
  assert.equal(course?.verification, "Fetched");
});

test("uses the current canonical Claude Code security URL", () => {
  const guide = resources.find((item) => item.id === "r65");
  assert.equal(guide?.url, "https://code.claude.com/docs/en/security");
  assert.equal(guide?.verification, "Fetched");
});

test("uses the current canonical Claude Code overview URL", () => {
  const guide = resources.find((item) => item.id === "r64");
  assert.equal(guide?.url, "https://code.claude.com/docs/en/overview");
  assert.equal(guide?.verification, "Fetched");
});

test("uses the current canonical MCP introduction URL", () => {
  const guide = resources.find((item) => item.id === "r66");
  assert.equal(guide?.url, "https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro");
  assert.equal(guide?.verification, "Fetched");
});

test("uses the current direct NotebookLM teaching URL", () => {
  const guide = resources.find((item) => item.id === "r26");
  assert.equal(guide?.url, "https://support.google.com/gemininotebook/answer/16164461");
  assert.equal(guide?.verification, "Fetched");
});

test("uses the direct current Grok overview URL", () => {
  const guide = resources.find((item) => item.id === "r36");
  assert.equal(guide?.url, "https://docs.x.ai/grok/overview");
  assert.equal(guide?.verification, "Fetched");
});

test("uses the current official QwenLM route", () => {
  const guide = resources.find((item) => item.id === "r38");
  assert.equal(guide?.url, "https://github.com/QwenLM");
  assert.equal(guide?.verification, "Fetched");
});

test("uses the current canonical English Perplexity Help Center URL", () => {
  const guide = resources.find((item) => item.id === "r39");
  assert.equal(guide?.url, "https://www.perplexity.ai/help-center/en/");
  assert.equal(guide?.verification, "Fetched");
});

test("uses the canonical English RemNote Help Center URL", () => {
  const guide = resources.find((item) => item.id === "r45");
  assert.equal(guide?.url, "https://help.remnote.com/en/");
  assert.equal(guide?.verification, "Fetched");
});

test("uses the current canonical GitHub Hello World URL", () => {
  const guide = resources.find((item) => item.id === "r52");
  assert.equal(guide?.url, "https://docs.github.com/en/get-started/using-github/hello-world");
  assert.equal(guide?.verification, "Fetched");
});

test("uses the current canonical GitHub secret scanning URL", () => {
  const guide = resources.find((item) => item.id === "r84");
  assert.equal(guide?.url, "https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning");
  assert.equal(guide?.verification, "Fetched");
});

test("uses the current canonical ChatGPT prompt-engineering course URL", () => {
  const course = resources.find((item) => item.id === "r13");
  assert.equal(course?.url, "https://www.deeplearning.ai/courses/chatgpt-prompt-eng");
  assert.equal(course?.verification, "Search-confirmed");
});

test("uses the current canonical ChatGPT systems course URL", () => {
  const course = resources.find((item) => item.id === "r111");
  assert.equal(course?.url, "https://www.deeplearning.ai/courses/chatgpt-building-system");
  assert.equal(course?.verification, "Search-confirmed");
});

test("uses the current canonical Guardrails safety course URL", () => {
  const course = resources.find((item) => item.id === "r113");
  assert.equal(course?.url, "https://www.deeplearning.ai/courses/safe-and-reliable-ai-via-guardrails");
  assert.equal(course?.verification, "Search-confirmed");
});

test("uses the current canonical generative-AI evaluation course URL", () => {
  const course = resources.find((item) => item.id === "r112");
  assert.equal(course?.url, "https://www.deeplearning.ai/courses/evaluating-debugging-generative-ai");
  assert.equal(course?.verification, "Search-confirmed");
});

test("uses the current canonical LLM quality-and-safety course URL", () => {
  const course = resources.find((item) => item.id === "r114");
  assert.equal(course?.url, "https://www.deeplearning.ai/courses/quality-safety-llm-applications");
  assert.equal(course?.verification, "Search-confirmed");
});

test("uses the current canonical LangChain functions-and-agents course URL", () => {
  const course = resources.find((item) => item.id === "r117");
  assert.equal(course?.url, "https://www.deeplearning.ai/courses/functions-tools-agents-langchain");
  assert.equal(course?.verification, "Search-confirmed");
});

test("uses the current canonical MCP rich-context course URL", () => {
  const course = resources.find((item) => item.id === "r67");
  assert.equal(course?.url, "https://www.deeplearning.ai/courses/mcp-build-rich-context-ai-apps-with-anthropic");
  assert.equal(course?.verification, "Search-confirmed");
});

test("uses the current canonical vector-databases course URL", () => {
  const course = resources.find((item) => item.id === "r77");
  assert.equal(course?.url, "https://www.deeplearning.ai/courses/vector-databases-embeddings-applications");
  assert.equal(course?.verification, "Search-confirmed");
});

test("uses the current canonical unstructured-data preprocessing course URL", () => {
  const course = resources.find((item) => item.id === "r115");
  assert.equal(course?.url, "https://www.deeplearning.ai/courses/preprocessing-unstructured-data-for-llm-applications");
  assert.equal(course?.verification, "Search-confirmed");
});

test("uses the current canonical knowledge-graphs RAG course URL", () => {
  const course = resources.find((item) => item.id === "r116");
  assert.equal(course?.url, "https://www.deeplearning.ai/courses/knowledge-graphs-rag");
  assert.equal(course?.verification, "Search-confirmed");
});

test("uses the current canonical retrieval-optimization course URL", () => {
  const course = resources.find((item) => item.id === "r119");
  assert.equal(course?.url, "https://www.deeplearning.ai/courses/retrieval-optimization-from-tokenization-to-vector-quantization");
  assert.equal(course?.verification, "Search-confirmed");
});

test("uses the current canonical AutoGen design-patterns course URL", () => {
  const course = resources.find((item) => item.id === "r120");
  assert.equal(course?.url, "https://www.deeplearning.ai/courses/ai-agentic-design-patterns-with-autogen");
  assert.equal(course?.verification, "Search-confirmed");
});

test("uses the current canonical Cochrane Interactive Learning URL", () => {
  const course = resources.find((item) => item.id === "r89");
  assert.equal(course?.url, "https://www.cochrane.org/learn/courses-and-resources/interactive-learning");
  assert.equal(course?.verification, "Fetched");
});
