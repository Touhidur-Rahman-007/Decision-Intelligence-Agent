import { AnalysisResult } from '@/lib/types';

export function ScoreMatrix({
  options,
  criteria,
  scores,
}: Pick<AnalysisResult, 'options' | 'criteria' | 'scores'>) {
  return (
    <table className="matrix">
      <thead>
        <tr>
          <th>Option</th>
          {criteria.map((criterion) => (
            <th key={criterion}>{criterion}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {options.map((option) => (
          <tr key={option}>
            <td>{option}</td>
            {criteria.map((criterion) => (
              <td key={`${option}-${criterion}`}>
                {scores[option]?.[criterion] ?? '-'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
