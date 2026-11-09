import { criteria, verdict, type Evaluation } from "@/lib/evaluation-workbench";

export function EvaluationPair({ runs }: { runs: Evaluation[] }) {
  const pairs = runs.flatMap((baseline, index) =>
    runs.slice(index + 1).filter(challenger =>
      challenger.system !== baseline.system &&
      challenger.protocol?.repetition === baseline.protocol?.repetition
    ).map(challenger => [baseline, challenger] as const)
  ).slice(0, 10);

  if (!pairs.length) return <p>Record two distinct systems under the same setup and repetition number to compare their results.</p>;

  return <div>{pairs.map(([baseline, challenger]) => {
    const left = verdict(baseline);
    const right = verdict(challenger);
    const rows = [
      ...criteria.map((criterion, index) => [criterion, baseline.scores[index], challenger.scores[index]]),
      ["Rubric", left.label, right.label],
      ["Total effort (min)", baseline.minutes, challenger.minutes],
      ["Measured cost (USD)", baseline.cost ?? "Unknown", challenger.cost ?? "Unknown"],
      ["Retries", baseline.protocol?.retries, challenger.protocol?.retries],
    ];
    return <details key={JSON.stringify([baseline.id, challenger.id])}>
      <summary>{baseline.system} vs {challenger.system} · repetition {baseline.protocol?.repetition}</summary>
      <p>{left.pass && right.pass
        ? "Both meet the rubric on this fixture. Compare total effort and measured cost before choosing a default."
        : left.pass || right.pass
          ? "Only one run meets the rubric on this fixture. Repeat on a fresh case before changing your default."
          : "Neither run meets the rubric. Repair the failure and repeat the same test before attempting transfer."}</p>
      <div className="eval-pair-scroll" role="region" aria-label="Side-by-side scores" tabIndex={0}>
        <table>
          <caption>Recorded results for one matched repetition</caption>
          <thead><tr><th scope="col">Measure</th><th scope="col">{baseline.system}</th><th scope="col">{challenger.system}</th></tr></thead>
          <tbody>{rows.map(([label, leftValue, rightValue]) => <tr key={label}><th scope="row">{label}</th><td>{leftValue}</td><td>{rightValue}</td></tr>)}</tbody>
        </table>
      </div>
    </details>;
  })}</div>;
}
