export type StageEvidence = { artifact?: string; transfer?: string; retestDue?: string; retest?: string };
export type ClaudeLabState = { stages: Record<string, StageEvidence>; arena: Record<string, string | number> };
export type GeminiLabState = { stages: Record<string, StageEvidence>; planAudit: Record<string, boolean> };
export type BenchmarkRun = {
  id: string; date: string; task: string; model: string; version: string; tools: string;
  latencySeconds?: number; estimatedCost?: number; score?: number; failure?: string; correction?: string;
};
export type PublicLabState = { claude: ClaudeLabState; gemini: GeminiLabState; benchmarks: BenchmarkRun[] };

export const newPublicLabState = (): PublicLabState => ({
  claude: { stages: {}, arena: {} },
  gemini: { stages: {}, planAudit: {} },
  benchmarks: [],
});

const object = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown, max = 4000) => typeof value === "string" ? value.trim().slice(0, max) : "";
const validDate = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());

const cleanStage = (value: unknown): StageEvidence | undefined => {
  if (!object(value)) return;
  const result: StageEvidence = {};
  if (text(value.artifact)) result.artifact = text(value.artifact);
  if (text(value.transfer)) result.transfer = text(value.transfer);
  if (validDate(value.retestDue)) result.retestDue = String(value.retestDue);
  if (text(value.retest)) result.retest = text(value.retest);
  return result;
};

export function sanitizeClaudeLab(value: unknown): ClaudeLabState {
  const result: ClaudeLabState = { stages: {}, arena: {} };
  if (!object(value)) return result;
  if (object(value.stages)) for (const [id, raw] of Object.entries(value.stages).slice(0, 15)) {
    if (!/^C(?:[0-9]|1[0-4])$/.test(id)) continue;
    const stage = cleanStage(raw);
    if (stage) result.stages[id] = stage;
  }
  if (object(value.arena)) for (const [key, raw] of Object.entries(value.arena).slice(0, 40)) {
    if (["task", "criteria", "route"].includes(key) && text(raw)) result.arena[key] = text(raw);
    if (/^[gcm][0-9]$/.test(key) && (typeof raw === "string" || typeof raw === "number")) {
      const score = Number(raw);
      if (Number.isFinite(score) && score >= 0 && score <= 4) result.arena[key] = raw;
    }
  }
  return result;
}

export function sanitizeGeminiLab(value: unknown): GeminiLabState {
  const result: GeminiLabState = { stages: {}, planAudit: {} };
  if (!object(value)) return result;
  if (object(value.stages)) for (const [id, raw] of Object.entries(value.stages).slice(0, 15)) {
    if (!/^G(?:[0-9]|1[0-4])$/.test(id)) continue;
    const stage = cleanStage(raw);
    if (stage) result.stages[id] = stage;
  }
  if (object(value.planAudit)) for (const [key, raw] of Object.entries(value.planAudit).slice(0, 20)) {
    if (typeof raw === "boolean") result.planAudit[text(key, 80)] = raw;
  }
  return result;
}

export function sanitizePublicLabState(value: unknown): PublicLabState {
  const clean = newPublicLabState();
  if (!object(value)) return clean;
  clean.claude = sanitizeClaudeLab(value.claude);
  clean.gemini = sanitizeGeminiLab(value.gemini);
  if (Array.isArray(value.benchmarks)) clean.benchmarks = value.benchmarks.slice(0, 100).flatMap((raw): BenchmarkRun[] => {
    if (!object(raw) || !text(raw.id, 100) || !validDate(raw.date) || !text(raw.task) || !text(raw.model, 160)) return [];
    const run: BenchmarkRun = { id: text(raw.id, 100), date: String(raw.date), task: text(raw.task), model: text(raw.model, 160), version: text(raw.version, 160), tools: text(raw.tools, 500) };
    for (const key of ["latencySeconds", "estimatedCost", "score"] as const) {
      const number = Number(raw[key]);
      if (Number.isFinite(number) && number >= 0 && (key !== "score" || number <= 4)) run[key] = number;
    }
    if (text(raw.failure)) run.failure = text(raw.failure);
    if (text(raw.correction)) run.correction = text(raw.correction);
    return [run];
  });
  return clean;
}

export function migrateLegacyPublicLabs(claude: unknown, gemini: unknown): PublicLabState {
  return { ...newPublicLabState(), claude: sanitizeClaudeLab(claude), gemini: sanitizeGeminiLab(gemini) };
}
