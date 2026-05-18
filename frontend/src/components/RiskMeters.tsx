import { AnalysisResult } from '@/lib/types';

export function RiskMeters({ risks }: Pick<AnalysisResult, 'risks'>) {
  const entries = Object.entries(risks);
  if (!entries.length) {
    return <p>No risk data available.</p>;
  }

  return (
    <div className="grid">
      {entries.map(([option, risk]) => (
        <div key={option} className="card">
          <div className="pill">{option}</div>
          <div>
            <strong>{risk.level} risk</strong>
          </div>
          <div className="meter">
            <span style={{ width: `${(risk.score / 10) * 100}%` }} />
          </div>
          <ul style={{ paddingLeft: 16, color: 'var(--muted)' }}>
            {risk.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
