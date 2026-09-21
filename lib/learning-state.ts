import { competencies, learnerRoutes, levels, levelTargets, programmeMap, type Level } from "./programme";
import { newPublicLabState, sanitizePublicLabState, type PublicLabState } from "./v5-state";

export type Competency = typeof competencies[number];
export type LearnerRoute = typeof learnerRoutes[number];
export type Stage = "Unseen" | "Learned" | "Practised" | "Demonstrated" | "Transferred" | "Retest Due" | "Mastered" | "Needs Repair";
export const evaluatorTypes = ["SELF", "HUMAN", "DETERMINISTIC CHECK", "MODEL-ASSISTED", "EXTERNAL TEST"] as const;
export type EvaluatorType = typeof evaluatorTypes[number];
export const failureCategories = [
  "concept misunderstanding", "instruction-following failure", "tool-selection error", "source-quality error",
  "retrieval failure", "hallucination", "prompt/context design failure", "coding defect", "test failure",
  "security boundary failure", "data/schema failure", "evaluation-design failure", "over-automation",
  "under-specification", "poor human judgment",
] as const;
export type FailureCategory = typeof failureCategories[number];
export type Unit = {
  id: string; trackId: string; title: string; minutes: number; instructionMinutes: number;
  kind: "module" | "project" | "capstone"; prerequisites: string[]; domains: string[];
  minimumRetestDays: number; maintenanceRetestDays?: number;
};
export type Curriculum = { units: Unit[]; byId: Map<string, Unit>; levelByTrack: Map<string, Level> };
export type EvidenceEvent = {
  action: "learn" | "practise" | "demonstrate" | "challenge" | "transfer" | "retest" | "maintain" | "fail";
  date: string; note: string; artifact?: string; context?: string; independent?: boolean;
  scores?: Partial<Record<Competency, number>>; evaluator?: EvaluatorType; failureCategory?: FailureCategory;
};
export type UnitProgress = { events: EvidenceEvent[] };
export type LegacyRecord = {
  status: string; demonstratedEvidence?: string; demonstratedAt?: string; transferContext?: string;
  transferEvidence?: string; transferredAt?: string; retestDue?: string; retestEvidence?: string;
  retestPassedAt?: string; repairNote?: string; skipReason?: string; migrationNote?: string;
};
export type Placement = { domain: string; score: number; note: string; date: string };
export type LearningState = {
  schemaVersion: "5.0"; route: LearnerRoute; units: Record<string, UnitProgress>;
  legacyTracks: Record<string, LegacyRecord>; diagnostic: Placement[];
  preferences: { sessionMinutes: 30 | 60 | 90 | 120; currentUnit?: string; capstonePath?: string };
  publicLabs: PublicLabState;
  migration: { from: string; notes: string[] };
};
export type DerivedProgress = { stage: Stage; due?: string; maintenanceDue?: string; repair?: string; demonstrated?: EvidenceEvent; transferred?: EvidenceEvent; retained?: EvidenceEvent; maintenance?: EvidenceEvent };
export const capstonePaths = ["Research + evidence", "AI-assisted software", "RAG system", "Constrained agent", "Automation", "Evaluation + security", "AI learning system", "Personal specialisation"] as const;
export const MAX_IMPORT_BYTES = 2_000_000;
const MAX_EVENTS = 100;
const text = (value: unknown, max = 4000) => typeof value === "string" ? value.trim().slice(0, max) : "";
const object = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const own = (value: Record<string, unknown>, key: string) => Object.hasOwn(value, key) ? value[key] : undefined;

// Calendar arithmetic uses UTC date-only values, avoiding DST and locale parsing.
export function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
export function addDays(date: string, days: number) {
  if (!validDate(date) || !Number.isInteger(days)) throw new Error("Invalid date arithmetic.");
  return new Date(new Date(`${date}T00:00:00Z`).getTime() + days * 86400000).toISOString().slice(0, 10);
}
export const localDate = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

export function defineCurriculum(units: Unit[]): Curriculum {
  const byId = new Map<string, Unit>();
  const levelByTrack = new Map<string, Level>(levels.flatMap(level => Object.keys(programmeMap[level]).map(id => [id, level] as const)));
  for (const unit of units) {
    if (!/^[a-z][a-z0-9-]*$/.test(unit.id) || byId.has(unit.id)) throw new Error(`Invalid or duplicate unit: ${unit.id}`);
    if (!levelByTrack.has(unit.trackId)) throw new Error(`Unknown track: ${unit.trackId}`);
    if (!Number.isSafeInteger(unit.minutes) || unit.minutes <= 0 || !Number.isSafeInteger(unit.instructionMinutes) || unit.instructionMinutes < 0 || unit.instructionMinutes > unit.minutes) throw new Error(`Invalid minute allocation: ${unit.id}`);
    if (!Number.isInteger(unit.minimumRetestDays) || unit.minimumRetestDays < 7) throw new Error(`Retention delay is too short: ${unit.id}`);
    if (unit.maintenanceRetestDays !== undefined && (!Number.isInteger(unit.maintenanceRetestDays) || unit.maintenanceRetestDays < unit.minimumRetestDays)) throw new Error(`Maintenance delay is invalid: ${unit.id}`);
    byId.set(unit.id, unit);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string) => {
    if (visiting.has(id)) throw new Error(`Cyclic prerequisite: ${id}`);
    if (visited.has(id)) return;
    const unit = byId.get(id);
    if (!unit) throw new Error(`Missing prerequisite: ${id}`);
    visiting.add(id);
    unit.prerequisites.forEach(visit);
    visiting.delete(id); visited.add(id);
  };
  units.forEach(unit => visit(unit.id));
  for (const level of levels) {
    for (const [id, hours] of Object.entries(programmeMap[level])) {
      const allocated = units.filter(unit => unit.trackId === id).reduce((sum, unit) => sum + unit.minutes, 0);
      if (allocated !== hours * 60) throw new Error(`Track ${id}: ${allocated} minutes, expected ${hours * 60}.`);
    }
    const allocated = units.filter(unit => levelByTrack.get(unit.trackId) === level).reduce((sum, unit) => sum + unit.minutes, 0);
    if (allocated !== levelTargets[level] * 60) throw new Error(`Level allocation mismatch: ${level}`);
  }
  if (units.reduce((sum, unit) => sum + unit.minutes, 0) !== 30000) throw new Error("The programme must contain exactly 500 hours.");
  if (units.reduce((sum, unit) => sum + unit.minutes - unit.instructionMinutes, 0) < 19500) throw new Error("Active work must represent at least 65% of allocated time.");
  return { units, byId, levelByTrack };
}

export function newLearningState(): LearningState {
  return { schemaVersion: "5.0", route: "Complete beginner", units: {}, legacyTracks: {}, diagnostic: [], preferences: { sessionMinutes: 30 }, publicLabs: newPublicLabState(), migration: { from: "new", notes: [] } };
}

function replay(events: EvidenceEvent[], unit: Unit, today: string): DerivedProgress {
  let result: DerivedProgress = { stage: "Unseen" };
  const maintenanceDelay = unit.maintenanceRetestDays ?? unit.minimumRetestDays;
  for (const event of events) {
    switch (event.action) {
      case "learn": result = { stage: "Learned" }; break;
      case "practise": result = { stage: "Practised" }; break;
      case "demonstrate":
      case "challenge": result = { stage: "Demonstrated", demonstrated: event }; break;
      case "transfer": result = { ...result, stage: "Transferred", transferred: event, due: addDays(event.date, unit.minimumRetestDays) }; break;
      case "retest": result = { ...result, stage: "Mastered", retained: event, maintenanceDue: addDays(event.date, maintenanceDelay) }; break;
      case "maintain": result = { ...result, stage: "Mastered", retained: event, maintenance: event, maintenanceDue: addDays(event.date, maintenanceDelay) }; break;
      case "fail": result = { ...result, stage: "Needs Repair", repair: event.note }; break;
    }
  }
  if (result.stage === "Transferred" && result.due! <= today) result.stage = "Retest Due";
  return result;
}

function cleanEvent(raw: unknown): EvidenceEvent | undefined {
  if (!object(raw) || !["learn", "practise", "demonstrate", "challenge", "transfer", "retest", "maintain", "fail"].includes(String(raw.action)) || !validDate(raw.date) || !text(raw.note)) return;
  const event: EvidenceEvent = { action: raw.action as EvidenceEvent["action"], date: raw.date, note: text(raw.note) };
  if (text(raw.artifact)) event.artifact = text(raw.artifact);
  if (text(raw.context)) event.context = text(raw.context);
  if (typeof raw.independent === "boolean") event.independent = raw.independent;
  if (evaluatorTypes.includes(raw.evaluator as EvaluatorType)) event.evaluator = raw.evaluator as EvaluatorType;
  else if (["demonstrate", "challenge", "transfer", "retest", "maintain", "fail"].includes(event.action)) event.evaluator = "SELF";
  if (event.action === "fail" && failureCategories.includes(raw.failureCategory as FailureCategory)) event.failureCategory = raw.failureCategory as FailureCategory;
  if (object(raw.scores)) {
    event.scores = {};
    for (const dimension of competencies) {
      const score = own(raw.scores, dimension);
      if (typeof score === "number" && Number.isInteger(score) && score >= 0 && score <= 4) event.scores[dimension] = score;
    }
  }
  return event;
}

function eventError(events: EvidenceEvent[], event: EvidenceEvent, unit: Unit, today: string): string | undefined {
  if (!validDate(today) || event.date > today) return "Evidence must have a valid completion date no later than today.";
  if (events.length >= MAX_EVENTS) return "This unit has reached its 100-entry limit. Export it for review before further changes.";
  if (events.length && event.date < events[events.length - 1].date) return "Evidence dates must follow the recorded attempt sequence.";
  const prior = replay(events, unit, today);
  const allowed: Record<EvidenceEvent["action"], Stage[]> = {
    learn: ["Unseen"], practise: ["Learned", "Needs Repair"], demonstrate: ["Practised"],
    challenge: ["Unseen", "Learned", "Practised", "Needs Repair"], transfer: ["Demonstrated"], retest: ["Retest Due"], maintain: ["Mastered"],
    fail: ["Practised", "Demonstrated", "Transferred", "Retest Due", "Mastered"],
  };
  if (!allowed[event.action].includes(prior.stage)) return `Cannot ${event.action} from ${prior.stage}. Complete the preceding learning step first.`;
  if (["demonstrate", "challenge", "transfer", "retest", "maintain"].includes(event.action)) {
    if (!event.artifact || event.independent !== true) return "Add an inspectable evidence reference and confirm independent performance. Atlas does not inspect the artifact.";
    const required: Competency[] = ["KNOW", "DO", "EXPLAIN", "DEBUG"];
    if (["transfer", "retest", "maintain"].includes(event.action)) required.push("TRANSFER");
    if (["retest", "maintain"].includes(event.action)) required.push("RETAIN");
    if (required.some(dimension => (event.scores?.[dimension] ?? -1) < 3)) return `Independent performance requires at least 3 in: ${required.join(", ")}. Record a failure and repair if needed.`;
    if (event.action === "transfer" && !event.context) return "Explain the materially different context used for transfer.";
    if (event.action === "retest" && event.date < prior.due!) return "The retention attempt must occur after the full delay from transfer.";
    if (event.action === "maintain" && (!prior.maintenanceDue || event.date < prior.maintenanceDue)) return "The maintenance check must occur after its full retention interval.";
  }
}

// All imported and runtime evidence goes through the same checks; saved status is never authoritative.
export function deriveProgress(progress: UnitProgress | undefined, unit: Unit, today = localDate()): DerivedProgress {
  const accepted: EvidenceEvent[] = [];
  for (const raw of progress?.events || []) {
    const event = cleanEvent(raw);
    if (event && !eventError(accepted, event, unit, today)) accepted.push(event);
  }
  return replay(accepted, unit, today);
}

export function recordEvidence(state: LearningState, id: string, raw: EvidenceEvent, curriculum: Curriculum, today = localDate()): { state: LearningState; error?: string } {
  const unit = curriculum.byId.get(id);
  if (!unit) return { state, error: "Unknown curriculum unit." };
  const event = cleanEvent(raw);
  if (!event) return { state, error: "Supply a valid action, completion date and evidence note." };
  const events = state.units[id]?.events || [];
  const error = eventError(events, event, unit, today);
  if (error) return { state, error };
  return { state: { ...state, units: { ...state.units, [id]: { events: [...events, event] } }, preferences: { ...state.preferences, currentUnit: id } } };
}

const legacyStatuses = ["Unseen", "Learned", "Practised", "Demonstrated", "Transferred", "Retest Due", "Mastered", "Needs Repair", "Later", "Skipped with reason"];
const legacyText = ["demonstratedEvidence", "transferContext", "transferEvidence", "retestEvidence", "repairNote", "skipReason", "migrationNote"] as const;
const legacyDates = ["demonstratedAt", "transferredAt", "retestDue", "retestPassedAt"] as const;
export function sanitizeLegacyRecord(raw: unknown, today: string): LegacyRecord | undefined {
  if (!object(raw) || !legacyStatuses.includes(String(raw.status))) return;
  const record: LegacyRecord = { status: String(raw.status) };
  for (const field of legacyText) if (text(raw[field])) record[field] = text(raw[field]);
  for (const field of legacyDates) if (validDate(raw[field])) record[field] = raw[field];
  const demo = record.demonstratedEvidence && record.demonstratedAt && record.demonstratedAt <= today;
  const transfer = demo && record.transferEvidence && record.transferContext && record.transferredAt && record.transferredAt >= record.demonstratedAt! && record.transferredAt <= today;
  const due = transfer && record.retestDue && record.retestDue > record.transferredAt!;
  const retained = due && record.retestEvidence && record.retestPassedAt && record.retestPassedAt >= record.retestDue! && record.retestPassedAt <= today;
  if (["Demonstrated", "Transferred", "Retest Due", "Mastered"].includes(record.status)) {
    const claimed = record.status;
    record.status = demo ? "Demonstrated" : "Practised";
    if (transfer && claimed !== "Demonstrated") record.status = "Transferred";
    if (due && ["Retest Due", "Mastered"].includes(claimed)) record.status = "Retest Due";
    if (retained && claimed === "Mastered") record.status = "Mastered";
    if (claimed !== record.status) record.migrationNote = `Unsupported ${claimed} claim retained at ${record.status}; original evidence fields preserved where valid.`;
  }
  if (record.status === "Needs Repair" && !record.repairNote) record.migrationNote = "Legacy repair flag retained; describe the failed task before resuming.";
  if (record.status === "Skipped with reason" && !record.skipReason) { record.status = "Later"; record.migrationNote = "Legacy skip had no reason; downgraded to Later. Re-mark with a reason if intentional."; }
  return record;
}

export function importLearningState(input: string | unknown, curriculum: Curriculum, today = localDate()): { state?: LearningState; error?: string; warnings: string[] } {
  const warnings: string[] = [];
  try {
    if (!validDate(today)) throw new Error("Invalid import date.");
    const serialized = typeof input === "string" ? input : JSON.stringify(input);
    if (typeof serialized !== "string" || new TextEncoder().encode(serialized).length > MAX_IMPORT_BYTES) throw new Error("Import must be a JSON object no larger than 2 MB.");
    const raw: unknown = JSON.parse(serialized);
    if (!object(raw)) throw new Error("Import must contain a state object.");
    // v4.0-A used version 4.0 with schemaVersion 3.3. Schema wins over display version.
    const version = String(raw.schemaVersion || raw.version || "");
    if (!["3", "3.0", "3.1", "3.2", "3.3", "4.0", "5.0"].includes(version)) throw new Error("Unsupported or missing schema version; existing browser state was not changed.");
    const state = newLearningState();
    state.migration.from = version;
    const records = ["4.0", "5.0"].includes(version) ? raw.legacyTracks : raw.progress;
    if (records !== undefined && !object(records)) throw new Error("Progress must be an object, not a list or scalar.");
    if (object(records)) for (const [id, value] of Object.entries(records)) {
      // Legacy evidence applies only to the original 300-hour tracks, never to new material.
      if (!/^[ebas][0-7]$/.test(id) || !curriculum.levelByTrack.has(id)) { warnings.push(`Ignored unknown legacy track ${text(id, 80)}.`); continue; }
      const record = sanitizeLegacyRecord(value, today);
      if (record) state.legacyTracks[id] = record;
      else warnings.push(`Ignored malformed legacy evidence for ${id}.`);
      if (record?.migrationNote) warnings.push(`${id}: ${record.migrationNote}`);
    }
    if (version !== "4.0" && raw.statuses !== undefined) {
      if (!object(raw.statuses)) throw new Error("Legacy statuses must be an object.");
      for (const [id, value] of Object.entries(raw.statuses)) {
        if (state.legacyTracks[id] || !/^[ebas][0-7]$/.test(id) || !curriculum.levelByTrack.has(id) || typeof value !== "string") continue;
        const normalized = value === "Needs repair" ? "Needs Repair" : value === "Retest due" ? "Retest Due" : value;
        if (!legacyStatuses.includes(normalized)) continue;
        const advanced = ["Demonstrated", "Transferred", "Retest Due", "Mastered"].includes(normalized);
        state.legacyTracks[id] = { status: advanced ? "Practised" : normalized, migrationNote: advanced ? `Old ${value} claim has no dated evidence; retained as Practised.` : "Preserved legacy placement; no module mastery awarded." };
        warnings.push(`${id}: ${state.legacyTracks[id].migrationNote}`);
      }
    }
    if (["4.0", "5.0"].includes(version)) {
      if (raw.units !== undefined && !object(raw.units)) throw new Error("Module evidence must be an object.");
      if (object(raw.units)) for (const [id, value] of Object.entries(raw.units)) {
        const unit = curriculum.byId.get(id);
        if (!unit) { warnings.push(`Ignored unknown unit ${text(id, 80)}.`); continue; }
        if (!object(value) || !Array.isArray(value.events)) { warnings.push(`Ignored malformed evidence for ${id}.`); continue; }
        if (value.events.length > MAX_EVENTS) throw new Error(`Too many evidence entries for ${id}; import was not applied.`);
        const events: EvidenceEvent[] = [];
        for (const candidate of value.events) {
          const event = cleanEvent(candidate);
          const error = event ? eventError(events, event, unit, today) : "Malformed entry.";
          if (event && !error) events.push(event);
          else warnings.push(`${id}: ${error}`);
        }
        state.units[id] = { events };
      }
      if (learnerRoutes.includes(raw.route as LearnerRoute)) state.route = raw.route as LearnerRoute;
      if (raw.diagnostic !== undefined && !Array.isArray(raw.diagnostic)) throw new Error("Diagnostic placement must be a list.");
      if (Array.isArray(raw.diagnostic)) state.diagnostic = raw.diagnostic.filter((item): item is Placement => object(item) && typeof item.domain === "string" && curriculum.units.some(unit => unit.domains.includes(item.domain as string)) && Number.isInteger(item.score) && Number(item.score) >= 0 && Number(item.score) <= 4 && validDate(item.date) && item.date <= today && Boolean(text(item.note))).map(item => ({ domain: text(item.domain, 80), score: item.score, date: item.date, note: text(item.note) }));
      if (object(raw.preferences)) {
        if ([30, 60, 90, 120].includes(Number(raw.preferences.sessionMinutes))) state.preferences.sessionMinutes = Number(raw.preferences.sessionMinutes) as 30 | 60 | 90 | 120;
        if (typeof raw.preferences.currentUnit === "string" && curriculum.byId.has(raw.preferences.currentUnit)) state.preferences.currentUnit = raw.preferences.currentUnit;
        if (capstonePaths.includes(raw.preferences.capstonePath as typeof capstonePaths[number])) state.preferences.capstonePath = raw.preferences.capstonePath as string;
      }
      if (version === "5.0") state.publicLabs = sanitizePublicLabState(raw.publicLabs);
    } else {
      warnings.push("Original track evidence is retained separately. It does not populate new module assessments or establish v4 graduation.");
    }
    state.migration.notes = warnings.slice(0, 100);
    return { state, warnings };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Import could not be read; no changes applied.", warnings: [] };
  }
}

export const exportLearningState = (state: LearningState) => JSON.stringify(state, null, 2);
const creditOrder: Stage[] = ["Unseen", "Learned", "Practised", "Demonstrated", "Transferred", "Retest Due", "Mastered"];
export type Credits = { exposure: number; practice: number; demonstrated: number; transfer: number; mastered: number };
const zeroCredits = (): Credits => ({ exposure: 0, practice: 0, demonstrated: 0, transfer: 0, mastered: 0 });
const creditStages: Record<keyof Credits, Stage> = { exposure: "Learned", practice: "Practised", demonstrated: "Demonstrated", transfer: "Transferred", mastered: "Mastered" };
function stageCredits(stage: string, minutes: number): Credits {
  const result = zeroCredits();
  // Repair withdraws current competence credit, but preserves exposure and practice history.
  const rank = stage === "Needs Repair" ? 2 : creditOrder.indexOf(stage as Stage);
  for (const [key, threshold] of Object.entries(creditStages)) if (rank >= creditOrder.indexOf(threshold)) result[key as keyof Credits] = minutes;
  return result;
}
export function progressMinutes(state: LearningState, curriculum: Curriculum, today = localDate()) {
  const programme = zeroCredits();
  const byTrack: Record<string, Credits> = {};
  const byLevel = Object.fromEntries(levels.map(level => [level, zeroCredits()])) as Record<Level, Credits>;
  for (const [id, level] of curriculum.levelByTrack) {
    const total = programmeMap[level][id] * 60;
    const moduleCredits = zeroCredits();
    const trackUnits = curriculum.units.filter(unit => unit.trackId === id);
    const hasNewFailure = trackUnits.some(unit => state.units[unit.id]?.events.some(event => event.action === "fail"));
    for (const unit of trackUnits) {
      const credits = stageCredits(deriveProgress(state.units[unit.id], unit, today).stage, unit.minutes);
      for (const key of Object.keys(credits) as (keyof Credits)[]) moduleCredits[key] += credits[key];
    }
    const legacy = sanitizeLegacyRecord(state.legacyTracks[id], today);
    const oldCredits = stageCredits(legacy?.status || "Unseen", total);
    byTrack[id] = zeroCredits();
    for (const key of Object.keys(programme) as (keyof Credits)[]) {
      // Never sum a track award with the modules it already contains. A new failed attempt
      // suspends imported competence credit until repaired; it cannot be hidden by old mastery.
      const usableLegacy = hasNewFailure && ["demonstrated", "transfer", "mastered"].includes(key) ? 0 : oldCredits[key];
      const value = Math.min(total, Math.max(moduleCredits[key], usableLegacy));
      byTrack[id][key] = value; byLevel[level][key] += value; programme[key] += value;
    }
  }
  return { programme, byTrack, byLevel };
}

export function diagnosticRoute(score: number) {
  return score >= 3 ? "Skip instruction; complete the independent challenge" : score === 2 ? "Review the weak point, then attempt the challenge" : "Start with the worked example and guided task";
}
export type SessionRecommendation = { unitId: string; action: string; minutes: number; reason: string; challenge: boolean };
export function planSession(state: LearningState, curriculum: Curriculum, today = localDate()): SessionRecommendation | undefined {
  const routeDomains: Record<LearnerRoute, string[]> = {
    "Complete beginner": ["fundamentals"], "AI power user": ["context", "research", "routing"],
    "Student / researcher": ["learning", "research"], "Knowledge worker": ["documents", "data", "automation"],
    Developer: ["coding", "git", "apis"], "AI builder": ["rag", "agents", "mcp"], "Advanced practitioner": ["evaluation", "security", "systems"],
  };
  const candidates = curriculum.units.flatMap((unit, index) => {
    const progress = deriveProgress(state.units[unit.id], unit, today);
    if (progress.stage === "Mastered" && (!progress.maintenanceDue || progress.maintenanceDue > today)) return [];
    const challenge = unit.domains.some(domain => state.diagnostic.some(item => item.domain === domain && item.score >= 3));
    const eligible = unit.prerequisites.every(id => {
      const prerequisite = curriculum.byId.get(id)!;
      return ["Demonstrated", "Transferred", "Retest Due", "Mastered"].includes(deriveProgress(state.units[id], prerequisite, today).stage);
    });
    const maintenanceDue = progress.stage === "Mastered" && progress.maintenanceDue && progress.maintenanceDue <= today;
    const priority = progress.stage === "Needs Repair" ? 0 : progress.stage === "Retest Due" ? 1 : maintenanceDue ? 2 : progress.stage === "Demonstrated" ? 3 : ["Learned", "Practised"].includes(progress.stage) ? 4 : 5;
    // Diagnostics alter instruction routing, never prerequisite evidence or mastery.
    if (!eligible && priority >= 4) return [];
    if (progress.stage === "Transferred") return [];
    const action = progress.stage === "Needs Repair" ? "Repair the failed criterion, then record a fresh practice attempt" : progress.stage === "Retest Due" ? "Complete the unseen delayed retest without prior answers" : maintenanceDue ? "Complete the scheduled maintenance check on a fresh task" : progress.stage === "Demonstrated" ? "Attempt the materially different transfer task" : progress.stage === "Practised" ? "Produce and assess an independent result" : progress.stage === "Learned" ? "Complete the guided practice task" : challenge ? "Skip instruction and attempt the independent challenge; submit real evidence and the four-dimension rubric" : "Read the mental model and work through the example";
    return [{ unitId: unit.id, action, minutes: Math.min(state.preferences.sessionMinutes, unit.minutes), reason: progress.repair || (maintenanceDue ? `Long-term maintenance is due from ${progress.maintenanceDue}; it keeps a mastered skill current.` : progress.due ? `Retention check available from ${progress.due}; long breaks have no penalty.` : challenge ? "Diagnostic suggests probable familiarity, not demonstrated competence." : "Prerequisites are demonstrated; complete one useful artifact before adding tools."), challenge, priority, routePriority: unit.domains.some(domain => routeDomains[state.route].includes(domain)) ? 0 : 1, resume: state.preferences.currentUnit === unit.id ? 0 : 1, index }];
  });
  candidates.sort((a, b) => a.priority - b.priority || a.resume - b.resume || a.routePriority - b.routePriority || a.index - b.index);
  if (!candidates[0]) return;
  const { unitId, action, minutes, reason, challenge } = candidates[0];
  return { unitId, action, minutes, reason, challenge };
}

export function graduation(state: LearningState, curriculum: Curriculum, today = localDate()) {
  const unmet = curriculum.units.filter(unit => deriveProgress(state.units[unit.id], unit, today).stage !== "Mastered");
  return { achieved: unmet.length === 0 && Boolean(state.preferences.capstonePath), unmet: unmet.map(unit => unit.id), capstonePathRequired: !state.preferences.capstonePath, note: "Self-reported competence, not an accredited qualification or external artifact inspection. Hours alone and imported track claims cannot establish v4 graduation." };
}
