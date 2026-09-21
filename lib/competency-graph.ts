import type { Competency, Curriculum, Unit } from "./learning-state";
import type { Level } from "./programme";

export type EvidenceStrength = "E0" | "E1" | "E2" | "E3" | "E4";
export type EvaluatorType = "SELF" | "HUMAN" | "DETERMINISTIC CHECK" | "MODEL-ASSISTED" | "EXTERNAL TEST";
export type ReviewStatus = "NEEDS REVIEW" | "REVIEWED" | "VERIFIED" | "VOLATILE" | "DEPRECATED";
export type CompetencyDefinition = {
  competencyId: string;
  name: string;
  description: string;
  level: Level[];
  domains: string[];
  prerequisites: string[];
  criticality: "core" | "important" | "specialist";
  assessmentDimensions: Competency[];
  minimumEvidence: EvidenceStrength;
  transferRequirement: boolean;
  retestRequirement: boolean;
  reviewStatus: ReviewStatus;
};

export type ResolvedCompetency = CompetencyDefinition & {
  associatedModules: string[];
  assessmentIds: string[];
  projectLinks: string[];
  capstoneLinks: string[];
  evidenceRequirements: string;
};

const allDimensions: Competency[] = ["KNOW", "DO", "EXPLAIN", "DEBUG", "TRANSFER", "RETAIN"];

// These describe durable abilities, not product screens. A volatile product lesson can
// change without invalidating the learner's underlying competency.
export const competencyDefinitions: CompetencyDefinition[] = [
  { competencyId: "ai-foundations", name: "AI foundations and calibrated use", description: "Explain modern generative AI at a practical conceptual level and verify its limits.", level: ["Foundations"], domains: ["fundamentals"], prerequisites: [], criticality: "core", assessmentDimensions: allDimensions, minimumEvidence: "E4", transferRequirement: true, retestRequirement: true, reviewStatus: "REVIEWED" },
  { competencyId: "context-and-routing", name: "Task specification and model routing", description: "Frame a task, select an appropriate workflow or model role, and justify the decision.", level: ["Foundations", "Practitioner", "Advanced Systems"], domains: ["context", "routing"], prerequisites: ["ai-foundations"], criticality: "core", assessmentDimensions: allDimensions, minimumEvidence: "E4", transferRequirement: true, retestRequirement: true, reviewStatus: "REVIEWED" },
  { competencyId: "research-and-provenance", name: "Evidence-grounded research", description: "Find, assess, reconcile and cite sources while disclosing uncertainty and provenance.", level: ["Foundations", "Practitioner", "Mastery + Portfolio"], domains: ["research"], prerequisites: ["ai-foundations"], criticality: "core", assessmentDimensions: allDimensions, minimumEvidence: "E4", transferRequirement: true, retestRequirement: true, reviewStatus: "REVIEWED" },
  { competencyId: "learning-with-ai", name: "Learning without outsourcing thought", description: "Use AI for feedback and repair while retaining independent retrieval, transfer and delayed performance.", level: ["Foundations", "Practitioner", "Mastery + Portfolio"], domains: ["learning"], prerequisites: ["ai-foundations"], criticality: "important", assessmentDimensions: allDimensions, minimumEvidence: "E4", transferRequirement: true, retestRequirement: true, reviewStatus: "REVIEWED" },
  { competencyId: "documents-and-data", name: "Documents, data and reproducible analysis", description: "Create, inspect and validate structured documents and data outputs with a reproducible trail.", level: ["Practitioner", "Builder", "Mastery + Portfolio"], domains: ["documents", "data"], prerequisites: ["ai-foundations"], criticality: "important", assessmentDimensions: allDimensions, minimumEvidence: "E3", transferRequirement: true, retestRequirement: false, reviewStatus: "REVIEWED" },
  { competencyId: "software-building", name: "AI-assisted software building", description: "Specify, inspect, change, test and review software without delegating responsibility to an agent.", level: ["Builder", "Mastery + Portfolio"], domains: ["coding", "git", "apis"], prerequisites: ["ai-foundations", "context-and-routing"], criticality: "core", assessmentDimensions: allDimensions, minimumEvidence: "E4", transferRequirement: true, retestRequirement: true, reviewStatus: "REVIEWED" },
  { competencyId: "rag-engineering", name: "Retrieval-grounded system engineering", description: "Build, test and repair a retrieval-grounded system with evidence, citations and failure analysis.", level: ["Advanced Systems", "Mastery + Portfolio"], domains: ["rag"], prerequisites: ["research-and-provenance", "software-building"], criticality: "core", assessmentDimensions: allDimensions, minimumEvidence: "E4", transferRequirement: true, retestRequirement: true, reviewStatus: "REVIEWED" },
  { competencyId: "agents-and-mcp", name: "Constrained agents and MCP workflows", description: "Choose agentic or deterministic orchestration, establish permissions and verify tool-mediated outcomes.", level: ["Builder", "Advanced Systems", "Mastery + Portfolio"], domains: ["agents", "mcp", "automation"], prerequisites: ["context-and-routing", "software-building"], criticality: "core", assessmentDimensions: allDimensions, minimumEvidence: "E4", transferRequirement: true, retestRequirement: true, reviewStatus: "REVIEWED" },
  { competencyId: "evaluation-and-observability", name: "Evaluation and observability", description: "Design credible evaluations, interpret uncertainty and trace a system change to its effects.", level: ["Foundations", "Advanced Systems", "Mastery + Portfolio"], domains: ["evaluation", "systems"], prerequisites: ["context-and-routing"], criticality: "core", assessmentDimensions: allDimensions, minimumEvidence: "E4", transferRequirement: true, retestRequirement: true, reviewStatus: "REVIEWED" },
  { competencyId: "security-and-governance", name: "Defensive security and data governance", description: "Identify trust boundaries, protect data and permissions, and design defensible human approval points.", level: ["Advanced Systems", "Mastery + Portfolio"], domains: ["security"], prerequisites: ["ai-foundations", "context-and-routing"], criticality: "core", assessmentDimensions: allDimensions, minimumEvidence: "E4", transferRequirement: true, retestRequirement: true, reviewStatus: "REVIEWED" },
];

const intersects = (left: string[], right: string[]) => left.some(value => right.includes(value));

export function resolveCompetencyGraph(curriculum: Curriculum): ResolvedCompetency[] {
  return competencyDefinitions.map(definition => {
    const matching = curriculum.units.filter(unit => intersects(unit.domains, definition.domains));
    const modules = matching.filter(unit => unit.kind === "module").map(unit => unit.id);
    const projects = matching.filter(unit => unit.kind === "project").map(unit => unit.id);
    const capstones = matching.filter(unit => unit.kind === "capstone").map(unit => unit.id);
    return {
      ...definition,
      associatedModules: modules,
      assessmentIds: modules,
      projectLinks: projects,
      capstoneLinks: capstones,
      evidenceRequirements: `${definition.minimumEvidence} minimum; ${definition.transferRequirement ? "materially different transfer" : "transfer where the assessment requires it"}; ${definition.retestRequirement ? "delayed independent retest" : "retention review proportionate to volatility"}.`,
    };
  });
}

export type GraphIntegrityReport = {
  orphanUnits: string[];
  orphanCompetencies: string[];
  unassessedCompetencies: string[];
  missingTransfer: string[];
  missingRepairRoute: string[];
  invalidPrerequisites: string[];
  circularPrerequisites: string[];
  projectsWithoutCompetency: string[];
  capstonesWithoutCompetency: string[];
};

function cycles(definitions: CompetencyDefinition[]) {
  const byId = new Map(definitions.map(item => [item.competencyId, item]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const found = new Set<string>();
  const visit = (id: string) => {
    if (visiting.has(id)) { found.add(id); return; }
    if (visited.has(id)) return;
    visiting.add(id);
    byId.get(id)?.prerequisites.forEach(visit);
    visiting.delete(id); visited.add(id);
  };
  definitions.forEach(item => visit(item.competencyId));
  return [...found];
}

export function competencyGraphIntegrity(curriculum: Curriculum): GraphIntegrityReport {
  const graph = resolveCompetencyGraph(curriculum);
  const mapped = new Set(graph.flatMap(item => [...item.associatedModules, ...item.projectLinks, ...item.capstoneLinks]));
  const defined = new Set(competencyDefinitions.map(item => item.competencyId));
  const invalidPrerequisites = competencyDefinitions.flatMap(item => item.prerequisites.filter(id => !defined.has(id)).map(id => `${item.competencyId} -> ${id}`));
  const repairableDomains = new Set(curriculum.units.flatMap(unit => unit.domains));
  return {
    orphanUnits: curriculum.units.filter(unit => !mapped.has(unit.id)).map(unit => unit.id),
    orphanCompetencies: graph.filter(item => !item.associatedModules.length).map(item => item.competencyId),
    unassessedCompetencies: graph.filter(item => !item.assessmentIds.length).map(item => item.competencyId),
    missingTransfer: graph.filter(item => item.transferRequirement && !item.associatedModules.length).map(item => item.competencyId),
    // Every unit progresses through the shared fail -> practise -> independent reattempt state machine.
    missingRepairRoute: graph.filter(item => !item.domains.some(domain => repairableDomains.has(domain))).map(item => item.competencyId),
    invalidPrerequisites,
    circularPrerequisites: cycles(competencyDefinitions),
    projectsWithoutCompetency: curriculum.units.filter(unit => unit.kind === "project" && !mapped.has(unit.id)).map(unit => unit.id),
    capstonesWithoutCompetency: curriculum.units.filter(unit => unit.kind === "capstone" && !mapped.has(unit.id)).map(unit => unit.id),
  };
}

export function evidenceStrengthForStage(stage: string): EvidenceStrength {
  if (stage === "Mastered") return "E4";
  if (stage === "Transferred" || stage === "Retest Due") return "E3";
  if (stage === "Demonstrated") return "E2";
  if (stage === "Learned" || stage === "Practised") return "E1";
  return "E0";
}

export function competencyCoverage(curriculum: Curriculum) {
  const graph = resolveCompetencyGraph(curriculum);
  return Object.fromEntries(allDimensions.map(dimension => [dimension, graph.filter(item => item.assessmentDimensions.includes(dimension)).map(item => item.competencyId)]));
}

export const unitCompetencies = (unit: Unit, curriculum: Curriculum) => resolveCompetencyGraph(curriculum)
  .filter(item => item.associatedModules.includes(unit.id) || item.projectLinks.includes(unit.id) || item.capstoneLinks.includes(unit.id))
  .map(item => item.competencyId);
