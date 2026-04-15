function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

export function generateSampleCSV(): string {
  const headers = [
    'packet_count', 'avg_packet_size', 'packet_size_variance',
    'tcp_ratio', 'udp_ratio', 'icmp_ratio', 'syn_count',
    'failed_connections', 'inter_arrival_time', 'connection_duration',
  ];

  const rows: string[][] = [];

  for (let i = 0; i < 80; i++) {
    const tcp = rand(0.55, 0.80);
    const udp = rand(0.10, 0.30);
    const icmp = parseFloat((1 - tcp - udp).toFixed(4));
    rows.push([
      String(randInt(120, 350)),
      rand(200, 500).toFixed(2),
      rand(1000, 8000).toFixed(2),
      tcp.toFixed(4),
      udp.toFixed(4),
      Math.max(0, icmp).toFixed(4),
      String(randInt(5, 25)),
      String(randInt(0, 8)),
      rand(0.002, 0.015).toFixed(6),
      rand(0.5, 3.5).toFixed(3),
    ]);
  }

  const anomalyConfigs = [
    { type: 'syn_flood', count: 6 },
    { type: 'icmp_flood', count: 4 },
    { type: 'weak_config', count: 5 },
    { type: 'port_scan', count: 5 },
  ];

  for (const cfg of anomalyConfigs) {
    for (let i = 0; i < cfg.count; i++) {
      if (cfg.type === 'syn_flood') {
        rows.push([
          String(randInt(800, 2000)),
          rand(40, 80).toFixed(2),
          rand(100, 500).toFixed(2),
          rand(0.90, 0.99).toFixed(4),
          rand(0.01, 0.05).toFixed(4),
          rand(0.00, 0.01).toFixed(4),
          String(randInt(600, 1800)),
          String(randInt(400, 1200)),
          rand(0.0001, 0.0005).toFixed(6),
          rand(0.01, 0.1).toFixed(3),
        ]);
      } else if (cfg.type === 'icmp_flood') {
        rows.push([
          String(randInt(600, 1500)),
          rand(56, 100).toFixed(2),
          rand(50, 200).toFixed(2),
          rand(0.01, 0.05).toFixed(4),
          rand(0.01, 0.05).toFixed(4),
          rand(0.88, 0.98).toFixed(4),
          String(randInt(0, 5)),
          String(randInt(0, 3)),
          rand(0.0002, 0.001).toFixed(6),
          rand(0.01, 0.05).toFixed(3),
        ]);
      } else if (cfg.type === 'weak_config') {
        rows.push([
          String(randInt(50, 150)),
          rand(1200, 1500).toFixed(2),
          rand(50, 200).toFixed(2),
          rand(0.01, 0.08).toFixed(4),
          rand(0.88, 0.98).toFixed(4),
          rand(0.01, 0.05).toFixed(4),
          String(randInt(0, 3)),
          String(randInt(0, 2)),
          rand(0.05, 0.2).toFixed(6),
          rand(10, 30).toFixed(3),
        ]);
      } else {
        rows.push([
          String(randInt(400, 1000)),
          rand(60, 80).toFixed(2),
          rand(200, 600).toFixed(2),
          rand(0.60, 0.80).toFixed(4),
          rand(0.15, 0.30).toFixed(4),
          rand(0.01, 0.05).toFixed(4),
          String(randInt(80, 250)),
          String(randInt(60, 200)),
          rand(0.0005, 0.002).toFixed(6),
          rand(0.1, 0.5).toFixed(3),
        ]);
      }
    }
  }

  rows.sort(() => Math.random() - 0.5);

  const csvLines = [headers.join(',')];
  for (const row of rows) {
    csvLines.push(row.join(','));
  }
  return csvLines.join('\n');
}
