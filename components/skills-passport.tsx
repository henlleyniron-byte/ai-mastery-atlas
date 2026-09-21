"use client";

import { useMemo } from "react";
import { AlertTriangle, BadgeCheck, ShieldCheck } from "lucide-react";
import { evidenceStrengthForStage, resolveCompetencyGraph, type EvidenceStrength } from "@/lib/competency-graph";
import { deriveProgress, type Curriculum, type EvidenceEvent, type LearningState } from "@/lib/learning-state";

const strengthRank = { E0: 0, E1: 1, E2: 2, E3: 3, E4: 4 } as const;
const latest = (events: EvidenceEvent[]) => [...events].filter(event => ["demonstrate", "challenge", "transfer", "retest"].includes(event.action)).at(-1);

export function SkillsPassport({ curriculum, state, today }: { curriculum: Curriculum; state: LearningState; today: string }) {
  const rows = useMemo(() => resolveCompetencyGraph(curriculum).map(item => {
    const units = item.associatedModules.map(id => curriculum.byId.get(id)).filter(Boolean);
    const progress = units.map(unit => ({ unit: unit!, derived: deriveProgress(state.units[unit!.id], unit!, today) }));
    const repair = progress.find(item => item.derived.stage === "Needs Repair");
    const strength: EvidenceStrength = progress.length ? progress.reduce<EvidenceStrength>((lowest, item) => {
      const candidate = evidenceStrengthForStage(item.derived.stage);
      return strengthRank[candidate] < strengthRank[lowest] ? candidate : lowest;
    }, "E4") : "E0";
    const events = units.flatMap(unit => state.units[unit!.id]?.events || []);
    const last = latest(events);
    const transferred = progress.length > 0 && progress.every(item => ["Transferred", "Retest Due", "Mastered"].includes(item.derived.stage));
    const retained = progress.length > 0 && progress.every(item => item.derived.stage === "Mastered");
    return { item, repair, strength, last, transferred, retained };
  }), [curriculum, state, today]);

  const core = rows.filter(row => row.item.criticality === "core");
  const masteredCore = core.filter(row => row.strength === "E4" && !row.repair).length;
  return <section id="skills-passport" className="page-section skills-passport" aria-labelledby="skills-passport-title">
    <div className="passport-heading"><div><div className="section-kicker">Skills passport · browser-local</div><h2 id="skills-passport-title" className="section-title">Hours are not capability.</h2><p className="section-intro">This passport traces durable competencies to their module assessments, projects and capstone links. Evidence is learner-recorded unless its evaluator type says otherwise; the Atlas does not inspect your external artifacts.</p></div><div className="passport-summary"><strong>{masteredCore}/{core.length}</strong><span>core competencies at E4</span><small>Graduation also requires the programme’s project and capstone rules.</small></div></div>
    <div className="strength-legend" aria-label="Evidence strength legend"><span><b>E0</b> no meaningful evidence</span><span><b>E1</b> exposure or guided practice</span><span><b>E2</b> independent performance</span><span><b>E3</b> transfer</span><span><b>E4</b> delayed retention</span></div>
    <div className="passport-grid">{rows.map(({ item, repair, strength, last, transferred, retained }) => <article key={item.competencyId} className={repair ? "passport-card repair" : "passport-card"}>
      <div className="passport-card-title"><div><span>{item.criticality}</span><h3>{item.name}</h3></div><strong className={`evidence-${strength.toLowerCase()}`}>{strength}</strong></div>
      <p>{item.description}</p>
      <dl><div><dt>Assessment route</dt><dd>{item.assessmentIds.length} module assessment{item.assessmentIds.length === 1 ? "" : "s"}</dd></div><div><dt>Transfer</dt><dd>{transferred ? "Recorded across mapped modules" : item.transferRequirement ? "Still required" : "Proportionate review"}</dd></div><div><dt>Retention</dt><dd>{retained ? "Delayed evidence recorded" : item.retestRequirement ? "Still required" : "Review on change"}</dd></div><div><dt>Last evidence</dt><dd>{last ? `${last.date} · ${last.evaluator || "SELF"}` : "No independent evidence recorded"}</dd></div><div><dt>Project / capstone</dt><dd>{[...item.projectLinks, ...item.capstoneLinks].length ? `${[...item.projectLinks, ...item.capstoneLinks].length} linked requirement${[...item.projectLinks, ...item.capstoneLinks].length === 1 ? "" : "s"}` : "Programme-level integration"}</dd></div></dl>
      {repair ? <p className="passport-repair"><AlertTriangle /> Needs Repair: {repair.derived.repair || "Classify the narrow failure, practise the smallest gap, then reattempt independently."}</p> : <p className="passport-status">{strength === "E4" ? <BadgeCheck /> : <ShieldCheck />} {strength === "E4" ? "Retention evidence recorded; keep the capability current as tools change." : "Advance only through independent work, transfer and delayed retest."}</p>}
    </article>)}</div>
  </section>;
}
