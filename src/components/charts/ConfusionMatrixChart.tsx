interface Props {
  matrix: number[][];
}

const LABELS = ['Normal', 'Suspicious', 'Weak Config'];

export default function ConfusionMatrixChart({ matrix }: Props) {
  const W = 400;
  const cellSize = 80;
  const PL = 90;
  const PT = 70;
  const H = PT + 3 * cellSize + 50;

  const maxVal = Math.max(...matrix.flat(), 1);

  function cellColor(row: number, col: number, val: number): string {
    const intensity = val / maxVal;
    if (row === col) {
      const g = Math.round(40 + intensity * 180);
      return `rgb(0, ${g}, ${Math.round(g * 0.5)})`;
    }
    if (val === 0) return '#0a1628';
    const r = Math.round(60 + intensity * 180);
    return `rgb(${r}, ${Math.round(r * 0.2)}, ${Math.round(r * 0.2)})`;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-sm mx-auto">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fill="#64748b">
        Predicted
      </text>
      <text x={18} y={PT + (3 * cellSize) / 2} textAnchor="middle" fontSize="11" fill="#64748b"
        transform={`rotate(-90, 18, ${PT + (3 * cellSize) / 2})`}>
        Actual
      </text>

      {LABELS.map((label, i) => (
        <g key={`col-${i}`}>
          <text
            x={PL + i * cellSize + cellSize / 2}
            y={PT - 10}
            textAnchor="middle"
            fontSize="10"
            fill="#94a3b8"
          >
            {label}
          </text>
        </g>
      ))}

      {LABELS.map((label, i) => (
        <g key={`row-${i}`}>
          <text
            x={PL - 6}
            y={PT + i * cellSize + cellSize / 2 + 4}
            textAnchor="end"
            fontSize="10"
            fill="#94a3b8"
          >
            {label}
          </text>
        </g>
      ))}

      {matrix.map((row, ri) =>
        row.map((val, ci) => {
          const x = PL + ci * cellSize;
          const y = PT + ri * cellSize;
          return (
            <g key={`${ri}-${ci}`}>
              <rect
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                fill={cellColor(ri, ci, val)}
                stroke="#0f2040"
                strokeWidth="2"
                rx="2"
              />
              <text
                x={x + cellSize / 2}
                y={y + cellSize / 2 + 5}
                textAnchor="middle"
                fontSize="18"
                fontWeight="700"
                fill="#e2e8f0"
              >
                {val}
              </text>
            </g>
          );
        })
      )}
    </svg>
  );
}
