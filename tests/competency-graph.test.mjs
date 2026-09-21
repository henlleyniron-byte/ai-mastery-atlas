import assert from "node:assert/strict";
import test, { after } from "node:test";
import { createServer } from "vite";

const vite = await createServer({ appType: "custom", configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false } });
after(() => vite.close());
const { competencyDefinitions, competencyCoverage, competencyGraphIntegrity, evidenceStrengthForStage, resolveCompetencyGraph, unitCompetencies } = await vite.ssrLoadModule("/lib/competency-graph.ts");

const units = [
  { id: "e0-foundations", trackId: "e0", title: "Foundations", minutes: 300, instructionMinutes: 100, prerequisites: [], domains: ["fundamentals"], kind: "module", minimumRetestDays: 14 },
  { id: "e2-context", trackId: "e2", title: "Context", minutes: 600, instructionMinutes: 200, prerequisites: ["e0-foundations"], domains: ["context", "evaluation"], kind: "module", minimumRetestDays: 14 },
  { id: "e4-research", trackId: "e4", title: "Research", minutes: 480, instructionMinutes: 160, prerequisites: ["e0-foundations"], domains: ["research"], kind: "module", minimumRetestDays: 14 },
  { id: "e7-learning", trackId: "e7", title: "Learning", minutes: 360, instructionMinutes: 120, prerequisites: ["e0-foundations"], domains: ["learning"], kind: "module", minimumRetestDays: 14 },
  { id: "p0-documents", trackId: "p0", title: "Documents", minutes: 1080, instructionMinutes: 360, prerequisites: ["e0-foundations"], domains: ["documents", "data"], kind: "module", minimumRetestDays: 14 },
  { id: "b0-coding", trackId: "b0", title: "Coding", minutes: 900, instructionMinutes: 300, prerequisites: ["e0-foundations"], domains: ["coding", "git", "apis"], kind: "module", minimumRetestDays: 14 },
  { id: "r0-rag", trackId: "r0", title: "RAG", minutes: 1080, instructionMinutes: 360, prerequisites: ["b0-coding"], domains: ["rag", "evaluation"], kind: "module", minimumRetestDays: 14 },
  { id: "g0-agents", trackId: "g0", title: "Agents", minutes: 1200, instructionMinutes: 420, prerequisites: ["b0-coding"], domains: ["agents", "mcp", "automation", "security", "systems"], kind: "module", minimumRetestDays: 14 },
  { id: "pr0-project", trackId: "pr0", title: "Project", minutes: 1680, instructionMinutes: 560, prerequisites: ["r0-rag"], domains: ["research", "data", "coding", "evaluation"], kind: "project", minimumRetestDays: 14 },
  { id: "c0-capstone", trackId: "c0", title: "Capstone", minutes: 1200, instructionMinutes: 400, prerequisites: ["pr0-project"], domains: ["systems", "evaluation", "security"], kind: "capstone", minimumRetestDays: 14 },
];
const curriculum = { units, byId: new Map(units.map(unit => [unit.id, unit])), levelByTrack: new Map() };

test("competency graph maps durable competencies to assessable units, projects and capstones", () => {
  const graph = resolveCompetencyGraph(curriculum);
  assert.equal(graph.length, competencyDefinitions.length);
  assert.ok(graph.every(item => item.associatedModules.length > 0));
  assert.ok(graph.every(item => item.assessmentIds.length > 0));
  assert.ok(graph.find(item => item.competencyId === "evaluation-and-observability").capstoneLinks.includes("c0-capstone"));
  assert.ok(unitCompetencies(curriculum.byId.get("g0-agents"), curriculum).includes("agents-and-mcp"));
});

test("competency integrity detects no orphaned curriculum relationships in the representative programme", () => {
  const report = competencyGraphIntegrity(curriculum);
  for (const value of Object.values(report)) assert.deepEqual(value, []);
});

test("assessment blueprint covers all six dimensions and evidence strength cannot be click-awarded", () => {
  const coverage = competencyCoverage(curriculum);
  for (const dimension of ["KNOW", "DO", "EXPLAIN", "DEBUG", "TRANSFER", "RETAIN"]) assert.ok(coverage[dimension].length > 0, `${dimension} needs an assessment route`);
  assert.equal(evidenceStrengthForStage("Unseen"), "E0");
  assert.equal(evidenceStrengthForStage("Practised"), "E1");
  assert.equal(evidenceStrengthForStage("Demonstrated"), "E2");
  assert.equal(evidenceStrengthForStage("Transferred"), "E3");
  assert.equal(evidenceStrengthForStage("Mastered"), "E4");
});
