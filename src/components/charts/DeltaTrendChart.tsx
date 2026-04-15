import type { NetworkFeature } from '../../types';

interface Props {
  features: NetworkFeature[];
  anomalyIndices: Set<number>;
}

export default function DeltaTrendChart({ features, anomalyIndices }: Props) {
  const W = 900;
  const H = 240;
  const PL = 60;
  const PR = 20;
  const PT = 20;
  const PB = 36;
  const plotW = W - PL - PR;
  const plotH = (H - PT - PB - 20) / 2;
  const midGap = 20;

  const delta1 = features.map((f) => f.delta_packet_count);
  const delta2 = features.map((f) => f.delta_avg_packet_size);

  function renderLine(values: number[], offsetY: number, color: string, label: string) {
    const max = Math.max(...values.map(Math.abs), 1);
    const toX = (i: number) => PL + (i / (values.length - 1 || 1)) * plotW;
    const toY = (v: number) => offsetY + plotH / 2 - (v / max) * (plotH / 2 - 4);

    const zeroY = offsetY + plotH / 2;
    const points = values.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
    const areaAbove = [
      `${PL},${zeroY}`,
      ...values.filter((v) => v >= 0).length === values.length
        ? values.map((v, i) => `${toX(i)},${toY(v)}`)
        : values.map((v, i) => `${toX(i)},${toY(Math.max(v, 0))}`),
      `${PL + plotW},${zeroY}`,
    ].join(' ');

    return (
      <g>
        <line x1={PL} y1={offsetY} x2={PL + plotW} y2={offsetY} stroke="#1e3a5f" strokeWidth="1" strokeDasharray="3 3" />
        <line x1={PL} y1={offsetY + plotH} x2={PL + plotW} y2={offsetY + plotH} stroke="#1e3a5f" strokeWidth="1" strokeDasharray="3 3" />
        <line x1={PL} y1={zeroY} x2={PL + plotW} y2={zeroY} stroke="#1e3a5f" strokeWidth="1" />

        <text x={PL - 4} y={offsetY + 4} textAnchor="end" fontSize="9" fill="#475569">+{max.toFixed(0)}</text>
        <text x={PL - 4} y={zeroY + 4} textAnchor="end" fontSize="9" fill="#475569">0</text>
        <text x={PL - 4} y={offsetY + plotH + 4} textAnchor="end" fontSize="9" fill="#475569">-{max.toFixed(0)}</text>

        <polygon
          points={areaAbove}
          fill={color}
          opacity="0.08"
        />
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />

        {values.map((v, i) => {
          const isAnomaly = anomalyIndices.has(i);
          return (
            <circle
              key={i}
              cx={toX(i)}
              cy={toY(v)}
              r={isAnomaly ? 4 : 2}
              fill={isAnomaly ? '#ff4757' : color}
            />
          );
        })}

        <text x={PL + 6} y={offsetY + 12} fontSize="10" fill={color} fontWeight="600">
          {label}
        </text>
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {renderLine(delta1, PT, '#00d4ff', 'Delta Packet Count')}
      {renderLine(delta2, PT + plotH + midGap, '#00ff88', 'Delta Avg Packet Size')}

      {Array.from({ length: Math.min(10, features.length) }).map((_, i) => {
        const idx = Math.round((i / 9) * (features.length - 1));
        const x = PL + (idx / (features.length - 1 || 1)) * plotW;
        return (
          <text key={i} x={x} y={H - 6} textAnchor="middle" fontSize="10" fill="#475569">
            {idx}
          </text>
        );
      })}

      <text x={W / 2} y={H - 2} textAnchor="middle" fontSize="10" fill="#475569">
        Time Window Index
      </text>
    </svg>
  );
}
