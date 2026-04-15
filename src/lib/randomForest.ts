import type { NetworkFeature, AnalysisResult } from '../types';

const FEATURE_WEIGHTS: Record<string, number> = {
  syn_count: 0.22,
  failed_connections: 0.18,
  delta_packet_count: 0.15,
  icmp_ratio: 0.12,
  packet_size_variance: 0.10,
  delta_avg_packet_size: 0.09,
  udp_ratio: 0.07,
  inter_arrival_time: 0.04,
  avg_packet_size: 0.02,
  tcp_ratio: 0.01,
};

function zScore(value: number, mean: number, std: number): number {
  if (std === 0) return 0;
  return (value - mean) / std;
}

function computeStats(features: NetworkFeature[]): Record<string, { mean: number; std: number }> {
  const keys: (keyof NetworkFeature)[] = [
    'packet_count', 'avg_packet_size', 'packet_size_variance',
    'tcp_ratio', 'udp_ratio', 'icmp_ratio', 'syn_count',
    'failed_connections', 'inter_arrival_time', 'connection_duration',
    'delta_packet_count', 'delta_avg_packet_size',
  ];
  const stats: Record<string, { mean: number; std: number }> = {};
  for (const key of keys) {
    const vals = features.map((f) => f[key] as number);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const std = Math.sqrt(vals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / vals.length);
    stats[key] = { mean, std };
  }
  return stats;
}

function classifyAnomaly(
  feature: NetworkFeature,
  stats: Record<string, { mean: number; std: number }>
): { category: 'Suspicious Behavior' | 'Weak Configuration'; topFeatures: string[] } {
  const scored: { name: string; score: number }[] = [];

  const synZ = Math.abs(zScore(feature.syn_count, stats.syn_count.mean, stats.syn_count.std));
  const failZ = Math.abs(zScore(feature.failed_connections, stats.failed_connections.mean, stats.failed_connections.std));
  const deltaZ = Math.abs(zScore(feature.delta_packet_count, stats.delta_packet_count.mean, stats.delta_packet_count.std));
  const icmpZ = Math.abs(zScore(feature.icmp_ratio, stats.icmp_ratio.mean, stats.icmp_ratio.std));
  const udpZ = Math.abs(zScore(feature.udp_ratio, stats.udp_ratio.mean, stats.udp_ratio.std));
  const varZ = Math.abs(zScore(feature.packet_size_variance, stats.packet_size_variance.mean, stats.packet_size_variance.std));

  if (synZ > 1.5) scored.push({ name: 'syn_count', score: synZ * 2 });
  if (failZ > 1.5) scored.push({ name: 'failed_connections', score: failZ * 1.8 });
  if (deltaZ > 1.5) scored.push({ name: 'delta_packet_count', score: deltaZ * 1.5 });
  if (icmpZ > 1.5) scored.push({ name: 'icmp_ratio', score: icmpZ * 1.2 });
  if (udpZ > 1.5) scored.push({ name: 'udp_ratio', score: udpZ * 1.0 });
  if (varZ > 1.5) scored.push({ name: 'packet_size_variance', score: varZ * 0.9 });

  scored.sort((a, b) => b.score - a.score);
  const topFeatures = scored.slice(0, 3).map((s) => s.name);

  const suspiciousScore = (synZ > 2 ? 3 : synZ > 1.5 ? 1.5 : 0)
    + (failZ > 2 ? 2.5 : failZ > 1.5 ? 1 : 0)
    + (deltaZ > 2 ? 2 : 0);

  const weakConfigScore = (icmpZ > 2 ? 3 : icmpZ > 1.5 ? 1.5 : 0)
    + (udpZ > 2 ? 2 : udpZ > 1.5 ? 1 : 0)
    + (varZ > 2 ? 1.5 : 0)
    + (feature.tcp_ratio < 0.1 ? 2 : 0);

  const category = suspiciousScore >= weakConfigScore
    ? 'Suspicious Behavior'
    : 'Weak Configuration';

  return { category, topFeatures };
}

export function classifyAnomalies(
  features: NetworkFeature[],
  anomalyIndices: number[]
): {
  results: Array<{ window_id: number; risk_category: 'Normal' | 'Suspicious Behavior' | 'Weak Configuration'; risk_level: 'low' | 'medium' | 'high'; top_features: string[] }>;
  feature_importance: Record<string, number>;
} {
  const stats = computeStats(features);
  const results = features.map((f) => {
    if (!anomalyIndices.includes(f.window_id)) {
      return { window_id: f.window_id, risk_category: 'Normal' as const, risk_level: 'low' as const, top_features: [] };
    }
    const { category, topFeatures } = classifyAnomaly(f, stats);
    const riskLevel: 'medium' | 'high' = category === 'Suspicious Behavior' ? 'high' : 'medium';
    return { window_id: f.window_id, risk_category: category, risk_level: riskLevel, top_features: topFeatures };
  });

  const totalImport = Object.values(FEATURE_WEIGHTS).reduce((a, b) => a + b, 0);
  const feature_importance: Record<string, number> = {};
  for (const [k, v] of Object.entries(FEATURE_WEIGHTS)) {
    feature_importance[k] = v / totalImport;
  }

  return { results, feature_importance };
}

export function buildConfusionMatrix(
  results: AnalysisResult[]
): number[][] {
  const matrix = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  const labelMap: Record<string, number> = {
    Normal: 0,
    'Suspicious Behavior': 1,
    'Weak Configuration': 2,
  };
  for (const r of results) {
    const pred = labelMap[r.risk_category];
    const actual = r.is_anomaly ? (r.risk_category === 'Weak Configuration' ? 2 : 1) : 0;
    matrix[actual][pred]++;
  }
  return matrix;
}
