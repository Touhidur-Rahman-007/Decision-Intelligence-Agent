import { AnalysisResult } from '@/lib/types';

export function TradeoffBars({
  tradeoffs,
}: Pick<AnalysisResult, 'tradeoffs'>) {
  if (!tradeoffs.length) {
    return <p>No trade-offs detected.</p>;
  }

  return (
    <div className="grid">
      {tradeoffs.map((tradeoff, index) => (
        <div key={`${tradeoff.option}-${index}`} className="card">
          <div className="pill">{tradeoff.option}</div>
          <div>
            <strong>Gains</strong>
            <p>{tradeoff.gains}</p>
          </div>
          <div>
            <strong>Loses</strong>
            <p>{tradeoff.loses}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
