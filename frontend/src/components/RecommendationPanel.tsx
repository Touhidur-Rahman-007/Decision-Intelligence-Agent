import { AnalysisResult } from '@/lib/types';

export function RecommendationPanel({
  recommendation,
}: Pick<AnalysisResult, 'recommendation'>) {
  return (
    <div className="section-card">
      <div className="tag">Final recommendation</div>
      <h3 style={{ marginTop: 12 }}>{recommendation.best}</h3>
      <p style={{ marginTop: 8 }}>{recommendation.reasoning}</p>
      <div className="grid" style={{ marginTop: 18 }}>
        <div className="card">
          <strong>Alternative</strong>
          <p>{recommendation.alternative}</p>
        </div>
        <div className="card">
          <strong>Avoid</strong>
          <p>{recommendation.avoid}</p>
        </div>
        <div className="card">
          <strong>Confidence</strong>
          <p>{recommendation.confidence}%</p>
          <div className="meter">
            <span style={{ width: `${recommendation.confidence}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
