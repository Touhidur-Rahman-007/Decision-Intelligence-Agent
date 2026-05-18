import { AnalysisResult } from '@/lib/types';

const palette = ['#1f6fff', '#f5a05d', '#1e9b7a', '#12355b'];

function getPoint(
  index: number,
  total: number,
  value: number,
  radius: number,
  center: number,
) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const scaled = (value / 10) * radius;
  return {
    x: center + scaled * Math.cos(angle),
    y: center + scaled * Math.sin(angle),
  };
}

export function RadarChart({
  options,
  criteria,
  scores,
}: Pick<AnalysisResult, 'options' | 'criteria' | 'scores'>) {
  if (criteria.length === 0) {
    return null;
  }

  const size = 300;
  const center = size / 2;
  const radius = 110;
  const total = criteria.length;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {criteria.map((_, index) => {
        const point = getPoint(index, total, 10, radius, center);
        return (
          <line
            key={`axis-${index}`}
            x1={center}
            y1={center}
            x2={point.x}
            y2={point.y}
            stroke="rgba(15, 18, 22, 0.1)"
            strokeWidth="1"
          />
        );
      })}
      {[2, 4, 6, 8, 10].map((ring) => (
        <circle
          key={`ring-${ring}`}
          cx={center}
          cy={center}
          r={(ring / 10) * radius}
          fill="none"
          stroke="rgba(15, 18, 22, 0.08)"
        />
      ))}
      {options.map((option, optionIndex) => {
        const points = criteria
          .map((criterion, index) => {
            const value = scores[option]?.[criterion] ?? 0;
            const point = getPoint(index, total, value, radius, center);
            return `${point.x},${point.y}`;
          })
          .join(' ');

        return (
          <polygon
            key={option}
            points={points}
            fill={palette[optionIndex % palette.length] + '33'}
            stroke={palette[optionIndex % palette.length]}
            strokeWidth="2"
          />
        );
      })}
      {criteria.map((label, index) => {
        const point = getPoint(index, total, 11.2, radius, center);
        return (
          <text
            key={`label-${label}`}
            x={point.x}
            y={point.y}
            fill="#5c6672"
            fontSize="10"
            textAnchor={point.x < center ? 'end' : 'start'}
            dominantBaseline="middle"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
