export interface NetworkFeature {
  window_id: number;
  packet_count: number;
  avg_packet_size: number;
  packet_size_variance: number;
  tcp_ratio: number;
  udp_ratio: number;
  icmp_ratio: number;
  syn_count: number;
  failed_connections: number;
  inter_arrival_time: number;
  connection_duration: number;
  delta_packet_count: number;
  delta_avg_packet_size: number;
}

export interface AnalysisResult {
  window_id: number;
  anomaly_score: number;
  is_anomaly: boolean;
  risk_category: 'Normal' | 'Suspicious Behavior' | 'Weak Configuration';
  risk_level: 'low' | 'medium' | 'high';
  top_features: string[];
}

export interface PipelineOutput {
  features: NetworkFeature[];
  results: AnalysisResult[];
  threshold: number;
  feature_importance: Record<string, number>;
  stats: {
    total_windows: number;
    anomaly_count: number;
    normal_count: number;
    suspicious_count: number;
    weak_config_count: number;
    mean_score: number;
    std_score: number;
  };
  confusion_matrix: number[][];
}

export type AppView = 'upload' | 'analyzing' | 'dashboard';

export interface SessionRecord {
  id: string;
  filename: string;
  created_at: string;
  total_windows: number;
  anomaly_count: number;
  suspicious_count: number;
  weak_config_count: number;
  mean_score: number;
  threshold: number;
}
