const FEATURE_LABELS: Record<string, string> = {
  syn_count: 'SYN Count',
  failed_connections: 'Failed Connections',
  delta_packet_count: 'Delta Pkt Count',
  icmp_ratio: 'ICMP Ratio',
  packet_size_variance: 'Pkt Size Variance',
  delta_avg_packet_size: 'Delta Avg Pkt Size',
  udp_ratio: 'UDP Ratio',
  inter_arrival_time: 'Inter-Arrival Time',
  avg_packet_size: 'Avg Packet Size',
  tcp_ratio: 'TCP Ratio',
};

interface Props {
  importance: Record<string, number>;
}

export default function FeatureImportanceChart({ importance }: Props) {
  const sorted = Object.entries(importance)
    .map(([k, v]) => ({ key: k, label: FEATURE_LABELS[k] ?? k, value: v }))
    .sort((a, b) => b.value - a.value);

  const maxVal = Math.max(...sorted.map((s) => s.value));

  const W = 600;
  const barH = 28;
  const gap = 8;
  const PL = 148;
  const PR = 80;
  const PT = 16;
  const H = PT + sorted.length * (barH + gap) + 16;
  const plotW = W - PL - PR;

  const colors = ['#00d4ff', '#00c4ef', '#00b4df', '#00a4cf', '#0094bf', '#0084af', '#0074a0', '#006490', '#005480', '#004470'];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {sorted.map((item, i) => {
        const barWidth = (item.value / maxVal) * plotW;
        const y = PT + i * (barH + gap);
        return (
          <g key={item.key}>
            <text x={PL - 8} y={y + barH / 2 + 4} textAnchor="end" fontSize="11" fill="#94a3b8">
              {item.label}
            </text>
            <rect x={PL} y={y} width={barWidth} height={barH} rx="4" fill={colors[i % colors.length]} opacity="0.9" />
            <rect x={PL} y={y} width={plotW} height={barH} rx="4" fill="transparent" stroke="#1e3a5f" strokeWidth="1" />
            <text x={PL + barWidth + 6} y={y + barH / 2 + 4} fontSize="11" fill="#e2e8f0">
              {(item.value * 100).toFixed(1)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}
