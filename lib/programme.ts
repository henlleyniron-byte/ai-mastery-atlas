export const levels = ["Foundations", "Practitioner", "Builder", "Advanced Systems", "Mastery + Portfolio"] as const;
export type Level = typeof levels[number];
export const levelTargets: Record<Level, number> = { Foundations: 80, Practitioner: 110, Builder: 140, "Advanced Systems": 100, "Mastery + Portfolio": 70 };
export const programmeMap: Record<Level, Record<string, number>> = {
  Foundations: { e0:5,e1:10,e2:10,e3:8,e4:8,e5:6,e7:6,s4:8,f0:9,f1:10 },
  Practitioner: { e6:7,s0:12,s5:10,a2:6,astra:18,p0:18,p1:21,p2:18 },
  Builder: { b0:15,b1:10,b2:10,b3:8,b4:15,b5:7,b6:10,b7:5,s1:16,s2:14,s3:10,d0:20 },
  "Advanced Systems": { a0:10,a1:8,a3:8,a4:8,a5:10,a6:4,s6:14,r0:18,g0:20 },
  "Mastery + Portfolio": { a7:6,s7:16,pr0:28,c0:20 },
};
export const additionalHours = [
  ["f0",9,"Prediction, learning and uncertainty: hand-worked classification, leakage checks and tiny numerical examples."],
  ["f1",10,"Independent AI fluency: calculation audits, file literacy, confidence calibration and tool-free transfer."],
  ["astra",18,"Eight Astra modules, Practice Studio and Mission Control capstone; the capstone time is included."],
  ["p0",18,"Documents: source reconciliation, PDF/table extraction, reports and accessible presentation review."],
  ["p1",21,"Data: cleaning, formulas, aggregation, uncertainty and a reproducible spreadsheet analysis."],
  ["p2",18,"Professional work: communications, connected-app delegation, decision analysis and operational handover."],
  ["d0",20,"Databases and typed applications: SQL, keys, transactions, migrations and tested integration."],
  ["r0",18,"A working RAG system: ingestion, hybrid retrieval, grounding, failure evaluation and measured repair."],
  ["g0",20,"A constrained agent/MCP/automation system: permissions, idempotency, observability and failure drills."],
  ["pr0",28,"Four integrated portfolio projects with independent acceptance, transfer and evidence review."],
  ["c0",20,"One required core capstone with a chosen specialisation, defence and delayed transfer assessment."],
] as const;
export const levelFor = (id: string): Level => levels.find(level => id in programmeMap[level]) || "Foundations";
export const learnerRoutes = ["Complete beginner", "AI power user", "Student / researcher", "Knowledge worker", "Developer", "AI builder", "Advanced practitioner"] as const;
export const competencies = ["KNOW", "DO", "EXPLAIN", "DEBUG", "TRANSFER", "RETAIN"] as const;
export const competencyScale = ["Unable", "Heavily assisted", "Partially independent", "Independent", "Robust + transferable"] as const;
const trackDomains: Record<string, string[]> = {
  e0:["fundamentals"], e1:["fundamentals"], e2:["context","evaluation"], e3:["context","routing"],
  e4:["research"], e5:["research","routing"], e6:["research"], e7:["learning"],
  f0:["fundamentals","evaluation"], f1:["fundamentals","learning"], astra:["context","routing","systems"],
  p0:["documents","research"], p1:["data"], p2:["documents","automation","routing"],
  b0:["coding"], b1:["coding","git"], b2:["coding"], b3:["coding","apis"], b4:["coding","git"],
  b5:["automation"], b6:["agents","mcp"], b7:["coding","git"], d0:["coding","data","apis"],
  s1:["coding","git","evaluation"], s2:["coding","apis","systems"], s3:["coding","systems"],
  a0:["systems"], a1:["rag"], a2:["context","systems"], a3:["evaluation"], a4:["agents","systems"],
  a5:["security"], a6:["security","systems"], s0:["research","evaluation"], s4:["systems"],
  s5:["learning"], s6:["security","evaluation"], r0:["rag","evaluation"], g0:["agents","mcp","automation","security"],
  a7:["rag","evaluation","security"], s7:["learning","systems"], pr0:["research","data","coding","evaluation"],
  c0:["systems","evaluation","security"],
};
export const domainsFor = (trackId: string) => trackDomains[trackId] || [];
export const reviewNotice = "REVIEWED: authored and checked within this Atlas; no external expert review is claimed. Product features are VOLATILE. Sources support teaching; following a link does not prove competence.";
