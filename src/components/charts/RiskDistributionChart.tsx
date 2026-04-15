interface Props {
  normal: number;
  suspicious: number;
  weakConfig: number;
}

export default function RiskDistributionChart({ normal, suspicious, weakConfig }: Props) {
  const total = normal + suspicious + weakConfig;
  if (total === 0) return null;

  const W = 340;
  const H = 200;
  const cx = 120;
  const cy = 100;
  const r = 80;
  const innerR = 48;

  const segments = [
    { value: normal, color: '#00ff88', label: 'Normal' },
    { value: suspicious, color: '#ff4757', label: 'Suspicious' },
    { value: weakConfig, color: '#ffb800', label: 'Weak Config' },
  ].filter((s) => s.value > 0);

  let startAngle = -Math.PI / 2;
  const arcs = segments.map((seg) => {
    const angle = (seg.value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const mid = startAngle + angle / 2;
    const arc = {
      ...seg,
      startAngle,
      endAngle,
      midAngle: mid,
    };
    startAngle = endAngle;
    return arc;
  });

  function polarToXY(angle: number, radius: number) {
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  }

  function describeArc(sa: number, ea: number, outerR: number, innerRad: number): string {
    const o1 = polarToXY(sa, outerR);
    const o2 = polarToXY(ea, outerR);
    const i1 = polarToXY(ea, innerRad);
    const i2 = polarToXY(sa, innerRad);
    const largeArc = ea - sa > Math.PI ? 1 : 0;
    return [
      `M ${o1.x} ${o1.y}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${o2.x} ${o2.y}`,
      `L ${i1.x} ${i1.y}`,
      `A ${innerRad} ${innerRad} 0 ${largeArc} 0 ${i2.x} ${i2.y}`,
      'Z',
    ].join(' ');
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {arcs.map((arc) => (
        <path
          key={arc.label}
          d={describeArc(arc.startAngle, arc.endAngle, r, innerR)}
          fill={arc.color}
          opacity="0.9"
          stroke="#050d1a"
          strokeWidth="2"
        />
      ))}

      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="700" fill="#e2e8f0">
        {total}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#64748b">
        Windows
      </text>

      <g>
        {segments.map((seg, i) => {
          const ly = 30 + i * 48;
          const lx = 222;
          return (
            <g key={seg.label}>
              <rect x={lx} y={ly} width={14} height={14} rx="3" fill={seg.color} />
              <text x={lx + 20} y={ly + 11} fontSize="12" fill="#e2e8f0" fontWeight="600">
                {seg.label}
              </text>
              <text x={lx + 20} y={ly + 25} fontSize="11" fill="#64748b">
                {seg.value} ({((seg.value / total) * 100).toFixed(1)}%)
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
