interface Props {
  scores: number[];
  threshold: number;
  labels: boolean[];
}

export default function AnomalyScoreChart({ scores, threshold, labels }: Props) {
  const W = 900;
  const H = 260;
  const PL = 52;
  const PR = 20;
  const PT = 20;
  const PB = 40;
  const plotW = W - PL - PR;
  const plotH = H - PT - PB;

  const maxScore = Math.max(...scores, threshold * 1.1);
  const minScore = Math.min(...scores) * 0.95;
  const range = maxScore - minScore || 1;

  const toX = (i: number) => PL + (i / (scores.length - 1)) * plotW;
  const toY = (v: number) => PT + plotH - ((v - minScore) / range) * plotH;

  const polyPoints = scores
    .map((s, i) => `${toX(i)},${toY(s)}`)
    .join(' ');

  const areaPoints = [
    `${PL},${PT + plotH}`,
    ...scores.map((s, i) => `${toX(i)},${toY(s)}`),
    `${PL + plotW},${PT + plotH}`,
  ].join(' ');

  const threshY = toY(threshold);
  const yTicks = 5;
  const meanY = scores.reduce((a, b) => a + b, 0) / scores.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {Array.from({ length: yTicks }).map((_, i) => {
        const frac = i / (yTicks - 1);
        const val = minScore + frac * range;
        const y = PT + plotH - frac * plotH;
        return (
          <g key={i}>
            <line x1={PL} y1={y} x2={PL + plotW} y2={y} stroke="#1e3a5f" strokeWidth="1" strokeDasharray="4 4" />
            <text x={PL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#475569">
              {val.toFixed(3)}
            </text>
          </g>
        );
      })}

      {scores.length > 1 &&
        Array.from({ length: Math.min(10, scores.length) }).map((_, i) => {
          const idx = Math.round((i / 9) * (scores.length - 1));
          const x = toX(idx);
          return (
            <g key={i}>
              <line x1={x} y1={PT + plotH} x2={x} y2={PT + plotH + 5} stroke="#475569" strokeWidth="1" />
              <text x={x} y={PT + plotH + 16} textAnchor="middle" fontSize="10" fill="#475569">
                {idx}
              </text>
            </g>
          );
        })}

      <polygon points={areaPoints} fill="url(#areaGrad)" />
      <polyline points={polyPoints} fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinejoin="round" />

      {scores.map((s, i) => (
        <circle
          key={i}
          cx={toX(i)}
          cy={toY(s)}
          r={labels[i] ? 5 : 3}
          fill={labels[i] ? '#ff4757' : '#00d4ff'}
          stroke={labels[i] ? '#ff000088' : 'transparent'}
          strokeWidth="2"
        />
      ))}

      <line x1={PL} y1={threshY} x2={PL + plotW} y2={threshY} stroke="#ffb800" strokeWidth="1.5" strokeDasharray="8 4" />
      <rect x={PL + plotW - 120} y={threshY - 16} width={116} height={16} rx="3" fill="#1a2744" />
      <text x={PL + plotW - 62} y={threshY - 4} textAnchor="middle" fontSize="10" fill="#ffb800">
        Threshold: {threshold.toFixed(4)}
      </text>

      <line x1={PL} y1={toY(meanY)} x2={PL + plotW} y2={toY(meanY)} stroke="#00ff88" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />

      <text x={PL + plotW / 2} y={H - 4} textAnchor="middle" fontSize="11" fill="#64748b">
        Time Window Index
      </text>

      <g>
        <circle cx={PL + 8} cy={PT + 8} r={4} fill="#00d4ff" />
        <text x={PL + 16} y={PT + 12} fontSize="10" fill="#94a3b8">Normal</text>
        <circle cx={PL + 72} cy={PT + 8} r={4} fill="#ff4757" />
        <text x={PL + 80} y={PT + 12} fontSize="10" fill="#94a3b8">Anomaly</text>
        <line x1={PL + 130} y1={PT + 8} x2={PL + 150} y2={PT + 8} stroke="#ffb800" strokeWidth="1.5" strokeDasharray="5 3" />
        <text x={PL + 154} y={PT + 12} fontSize="10" fill="#94a3b8">Threshold</text>
        <line x1={PL + 222} y1={PT + 8} x2={PL + 242} y2={PT + 8} stroke="#00ff88" strokeWidth="1" strokeDasharray="4 4" />
        <text x={PL + 246} y={PT + 12} fontSize="10" fill="#94a3b8">Mean</text>
      </g>
    </svg>
  );
}
