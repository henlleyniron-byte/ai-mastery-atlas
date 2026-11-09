import { deriveProgress, type Curriculum, type DerivedProgress, type LearningState, type Unit } from "./learning-state";
import type { UnitDetail } from "../components/v4-command-centre";

// The same stage-specific brief is used by the recommendation and evidence desk.
export function stageBrief(progress: DerivedProgress, detail: UnitDetail, today: string) {
  if (progress.stage === "Needs Repair") return { label: "Repair the observed failure", task: `${progress.repair || "Inspect the failed evidence."} Then repeat the narrow guided exercise: ${detail.activity}`, boundary: "Preserve the first failure. A corrected note alone does not establish an independent pass." };
  if (progress.stage === "Demonstrated") return { label: "Transfer to a changed context", task: detail.transfer, boundary: "Change a meaningful constraint, work independently and retain the new artifact." };
  if (progress.stage === "Transferred") return { label: "Wait for the delayed check", task: detail.check, boundary: `Do not record retention before ${progress.due}. Use a fresh task when the full delay has elapsed.` };
  if (progress.stage === "Retest Due") return { label: "Run the delayed independent check", task: detail.check, boundary: "Close earlier answers, use fresh material and record the actual observed result." };
  if (progress.stage === "Mastered") return { label: progress.maintenanceDue && progress.maintenanceDue <= today ? "Check maintenance of the skill" : "Maintain the demonstrated skill", task: detail.check, boundary: progress.maintenanceDue && progress.maintenanceDue > today ? `The next maintenance check is scheduled for ${progress.maintenanceDue}. Do not award it early.` : "Use a fresh independent task. A later failure reopens the repair loop." };
  if (progress.stage === "Practised") return { label: "Demonstrate independently", task: detail.check, boundary: "Hide the worked output. Disclose assistance and retain an inspectable artifact." };
  return { label: progress.stage === "Learned" ? "Apply the guided exercise" : "Understand the task, then try it", task: detail.activity, boundary: "Instruction and practice prepare you for an independent demonstration; they do not certify mastery." };
}

export function buildSkillMap(state: LearningState, curriculum: Curriculum, today: string) {
  return curriculum.units.map(unit => ({ unit, ...unitAccess(state, unit, curriculum, today) }));
}

export function sessionBrief(unit: Unit, detail: UnitDetail, state: LearningState, curriculum: Curriculum, today: string) {
  const access=unitAccess(state,unit,curriculum,today),brief=stageBrief(access.progress,detail,today);
  return [`# Atlas session brief: ${unit.title}`,`${detail.trackCode} · ${detail.trackTitle} · ${today}`,`Current evidence stage: ${access.progress.stage}`,`Suggested scope: ${Math.min(state.preferences.sessionMinutes,unit.minutes)} minutes`,"",`## ${brief.label}`,brief.task,"", "## Acceptance criterion",detail.passCriterion,"", "## Evidence boundary",brief.boundary,access.unmet.length?`Prerequisites to inspect: ${access.unmet.map(id=>curriculum.byId.get(id)?.title||id).join('; ')}.`:"",!access.canRecord?"No new passing evidence can currently be recorded. Inspect prerequisites or the waiting date first.":"Record the observed result in the existing task and evidence desk.","", "## Close the session","Retain the artifact reference, actual result, assistance used, one exposed failure and the next check.","This is a planning brief. Downloading it awards no progress; Atlas has not inspected any external artifact.","Keep this file private if it contains your repair notes."].filter(Boolean).join('\n\n');
}

export function unitAccess(state: LearningState, unit: Unit, curriculum: Curriculum, today: string) {
  const progress = deriveProgress(state.units[unit.id], unit, today);
  const unmet = unit.prerequisites.filter(id => {
    const prior = curriculum.byId.get(id);
    return !prior || !["Demonstrated", "Transferred", "Retest Due", "Mastered"].includes(deriveProgress(state.units[id], prior, today).stage);
  });
  const maintenanceDue = progress.stage === "Mastered" && Boolean(progress.maintenanceDue && progress.maintenanceDue <= today);
  const waiting = progress.stage === "Transferred" || (progress.stage === "Mastered" && !maintenanceDue);
  // The existing planner allows repair and checks on previously demonstrated work.
  const recovery = ["Needs Repair", "Retest Due", "Demonstrated"].includes(progress.stage) || maintenanceDue;
  return { progress, unmet, maintenanceDue, canRecord: !waiting && (!unmet.length || recovery) };
}

export function buildReviewQueue(state: LearningState, curriculum: Curriculum, today: string) {
  return curriculum.units.flatMap((unit, index) => {
    const progress = deriveProgress(state.units[unit.id], unit, today);
    const priority = progress.stage === "Needs Repair" ? 0 : progress.stage === "Retest Due" ? 1 : progress.stage === "Mastered" && progress.maintenanceDue && progress.maintenanceDue <= today ? 2 : progress.stage === "Demonstrated" ? 3 : -1;
    return priority < 0 ? [] : [{ unit, progress, priority, index }];
  }).sort((a,b) => a.priority-b.priority || (a.progress.due||a.progress.maintenanceDue||"9999").localeCompare(b.progress.due||b.progress.maintenanceDue||"9999") || a.index-b.index);
}
