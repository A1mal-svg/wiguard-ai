import type { NetworkFeature } from '../types';

const REQUIRED_COLUMNS = [
  'packet_count', 'avg_packet_size', 'packet_size_variance',
  'tcp_ratio', 'udp_ratio', 'icmp_ratio', 'syn_count',
  'failed_connections', 'inter_arrival_time', 'connection_duration',
];

function parseFloat2(val: string): number {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

export function parseCSV(text: string): NetworkFeature[] {
  const lines = text.trim().split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row.');

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
  if (missing.length > 0) throw new Error(`Missing columns: ${missing.join(', ')}`);

  const rows: NetworkFeature[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const get = (col: string) => parseFloat2(values[headers.indexOf(col)] ?? '0');

    const packet_count = get('packet_count') || 1;
    const avg_packet_size = get('avg_packet_size');
    const prev_count = i > 1 ? parseFloat2(lines[i - 1].split(',')[headers.indexOf('packet_count')]) : packet_count;
    const prev_size = i > 1 ? parseFloat2(lines[i - 1].split(',')[headers.indexOf('avg_packet_size')]) : avg_packet_size;

    rows.push({
      window_id: i - 1,
      packet_count,
      avg_packet_size,
      packet_size_variance: get('packet_size_variance'),
      tcp_ratio: get('tcp_ratio'),
      udp_ratio: get('udp_ratio'),
      icmp_ratio: get('icmp_ratio'),
      syn_count: get('syn_count'),
      failed_connections: get('failed_connections'),
      inter_arrival_time: get('inter_arrival_time'),
      connection_duration: get('connection_duration'),
      delta_packet_count: packet_count - prev_count,
      delta_avg_packet_size: avg_packet_size - prev_size,
    });
  }
  return rows;
}

export function featuresToMatrix(features: NetworkFeature[]): number[][] {
  return features.map((f) => [
    f.packet_count,
    f.avg_packet_size,
    f.packet_size_variance,
    f.tcp_ratio,
    f.udp_ratio,
    f.icmp_ratio,
    f.syn_count,
    f.failed_connections,
    f.inter_arrival_time,
    f.connection_duration,
    f.delta_packet_count,
    f.delta_avg_packet_size,
  ]);
}

export function normalizeMatrix(matrix: number[][]): number[][] {
  if (matrix.length === 0) return [];
  const numFeatures = matrix[0].length;
  const means = new Array(numFeatures).fill(0);
  const stds = new Array(numFeatures).fill(1);

  for (let j = 0; j < numFeatures; j++) {
    const col = matrix.map((r) => r[j]);
    means[j] = col.reduce((a, b) => a + b, 0) / col.length;
    const variance = col.reduce((s, v) => s + Math.pow(v - means[j], 2), 0) / col.length;
    stds[j] = Math.sqrt(variance) || 1;
  }

  return matrix.map((row) => row.map((v, j) => (v - means[j]) / stds[j]));
}
