import { AnalysisResult } from '@/lib/types';

export function OutcomeCards({
  simulation,
}: Pick<AnalysisResult, 'simulation'>) {
  const entries = Object.entries(simulation);
  if (!entries.length) {
    return <p>No simulation data available.</p>;
  }

  return (
    <div className="grid">
      {entries.map(([option, outcomes]) => (
        <div key={option} className="card">
          <div className="pill">{option}</div>
          <div>
            <strong>Best case</strong>
            <p>{outcomes.best}</p>
          </div>
          <div>
            <strong>Average case</strong>
            <p>{outcomes.average}</p>
          </div>
          <div>
            <strong>Worst case</strong>
            <p>{outcomes.worst}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
