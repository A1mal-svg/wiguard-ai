import { useState } from 'react';
import {
  Shield, AlertTriangle, Activity, CheckCircle,
  TrendingUp, BarChart2, Eye, ChevronDown, ChevronUp, FileText
} from 'lucide-react';
import type { PipelineOutput } from '../types';
import StatCard from './StatCard';
import AnomalyScoreChart from './charts/AnomalyScoreChart';
import FeatureImportanceChart from './charts/FeatureImportanceChart';
import ConfusionMatrixChart from './charts/ConfusionMatrixChart';
import RiskDistributionChart from './charts/RiskDistributionChart';
import DeltaTrendChart from './charts/DeltaTrendChart';

interface Props {
  output: PipelineOutput;
  filename: string;
}

const RISK_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  Normal: { bg: 'bg-[#00ff88]/10', text: 'text-[#00ff88]', border: 'border-[#00ff88]/20' },
  'Suspicious Behavior': { bg: 'bg-[#ff4757]/10', text: 'text-[#ff4757]', border: 'border-[#ff4757]/20' },
  'Weak Configuration': { bg: 'bg-[#ffb800]/10', text: 'text-[#ffb800]', border: 'border-[#ffb800]/20' },
};

const FEATURE_LABELS: Record<string, string> = {
  syn_count: 'High SYN Count',
  failed_connections: 'Failed Connections',
  delta_packet_count: 'Traffic Spike',
  icmp_ratio: 'ICMP Flood',
  udp_ratio: 'UDP Anomaly',
  packet_size_variance: 'Size Variance',
  delta_avg_packet_size: 'Size Shift',
};

export default function Dashboard({ output, filename }: Props) {
  const { features, results, threshold, feature_importance, stats, confusion_matrix } = output;
  const [showAll, setShowAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'anomaly' | 'importance' | 'delta' | 'confusion'>('anomaly');

  const anomalyScores = results.map((r) => r.anomaly_score);
  const anomalyLabels = results.map((r) => r.is_anomaly);
  const anomalySet = new Set(results.filter((r) => r.is_anomaly).map((r) => r.window_id));

  const displayResults = showAll ? results : results.slice(0, 12);

  const detectionRate = ((stats.anomaly_count / stats.total_windows) * 100).toFixed(1);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#050d1a] py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-[#475569]" />
              <span className="text-xs text-[#475569] font-mono">{filename}</span>
            </div>
            <h2 className="text-2xl font-bold text-[#e2e8f0]">Analysis Results</h2>
            <p className="text-sm text-[#475569] mt-0.5">
              Adaptive threshold: <span className="text-[#ffb800] font-mono">{threshold.toFixed(4)}</span>
              <span className="mx-2 text-[#1e3a5f]">|</span>
              Mean score: <span className="text-[#94a3b8] font-mono">{stats.mean_score.toFixed(4)}</span>
              <span className="mx-2 text-[#1e3a5f]">|</span>
              Std: <span className="text-[#94a3b8] font-mono">{stats.std_score.toFixed(4)}</span>
            </p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
            stats.anomaly_count > 0
              ? 'bg-[#ff4757]/10 border-[#ff4757]/20'
              : 'bg-[#00ff88]/10 border-[#00ff88]/20'
          }`}>
            {stats.anomaly_count > 0 ? (
              <AlertTriangle className="w-4 h-4 text-[#ff4757]" />
            ) : (
              <CheckCircle className="w-4 h-4 text-[#00ff88]" />
            )}
            <span className={`text-sm font-semibold ${stats.anomaly_count > 0 ? 'text-[#ff4757]' : 'text-[#00ff88]'}`}>
              {stats.anomaly_count > 0 ? `${stats.anomaly_count} Anomalies Detected` : 'Network Appears Normal'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Time Windows"
            value={stats.total_windows}
            sub="10-second intervals"
            icon={<Activity className="w-5 h-5" />}
            color="cyan"
          />
          <StatCard
            label="Anomalies"
            value={stats.anomaly_count}
            sub={`${detectionRate}% detection rate`}
            icon={<AlertTriangle className="w-5 h-5" />}
            color={stats.anomaly_count > 0 ? 'red' : 'green'}
            pulse={stats.anomaly_count > 0}
          />
          <StatCard
            label="Suspicious"
            value={stats.suspicious_count}
            sub="SYN flood / scanning"
            icon={<Shield className="w-5 h-5" />}
            color={stats.suspicious_count > 0 ? 'amber' : 'slate'}
          />
          <StatCard
            label="Weak Config"
            value={stats.weak_config_count}
            sub="Protocol anomalies"
            icon={<TrendingUp className="w-5 h-5" />}
            color={stats.weak_config_count > 0 ? 'amber' : 'slate'}
          />
        </div>

        <div className="rounded-2xl bg-[#0a1628] border border-[#1e3a5f] overflow-hidden">
          <div className="flex border-b border-[#1e3a5f]">
            {[
              { key: 'anomaly', label: 'Anomaly Scores', icon: Activity },
              { key: 'importance', label: 'Feature Importance', icon: BarChart2 },
              { key: 'delta', label: 'Delta Trends', icon: TrendingUp },
              { key: 'confusion', label: 'Confusion Matrix', icon: Eye },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as typeof activeTab)}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-medium transition-all duration-150 border-b-2 ${
                  activeTab === key
                    ? 'text-[#00d4ff] border-[#00d4ff] bg-[#00d4ff]/5'
                    : 'text-[#475569] border-transparent hover:text-[#94a3b8] hover:bg-[#0f2040]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'anomaly' && (
              <div>
                <p className="text-xs text-[#475569] mb-4 leading-relaxed">
                  Isolation Forest anomaly scores per time window. Points above the{' '}
                  <span className="text-[#ffb800]">amber threshold line</span>{' '}
                  (mean + std = <span className="font-mono">{threshold.toFixed(4)}</span>) are flagged as anomalies.
                </p>
                <AnomalyScoreChart scores={anomalyScores} threshold={threshold} labels={anomalyLabels} />
              </div>
            )}
            {activeTab === 'importance' && (
              <div>
                <p className="text-xs text-[#475569] mb-4 leading-relaxed">
                  Random Forest feature importance scores. Higher values indicate stronger contribution to risk classification.
                </p>
                <FeatureImportanceChart importance={feature_importance} />
              </div>
            )}
            {activeTab === 'delta' && (
              <div>
                <p className="text-xs text-[#475569] mb-4 leading-relaxed">
                  Delta features comparing each window to the previous one. Sudden spikes may indicate attacks or configuration changes.
                  <span className="text-[#ff4757] ml-1">Red dots</span> indicate anomalous windows.
                </p>
                <DeltaTrendChart features={features} anomalyIndices={anomalySet} />
              </div>
            )}
            {activeTab === 'confusion' && (
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-auto">
                  <p className="text-xs text-[#475569] mb-4 leading-relaxed">
                    Classification performance across three risk categories.
                    Diagonal values represent correct predictions.
                  </p>
                  <ConfusionMatrixChart matrix={confusion_matrix} />
                </div>
                <div className="flex-1 space-y-3">
                  <RiskDistributionChart
                    normal={stats.normal_count}
                    suspicious={stats.suspicious_count}
                    weakConfig={stats.weak_config_count}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-[#0a1628] border border-[#1e3a5f] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1e3a5f] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#e2e8f0]">Detection Results</h3>
              <p className="text-xs text-[#475569] mt-0.5">Per-window anomaly labels and risk classification</p>
            </div>
            <span className="text-xs text-[#475569] font-mono">
              {stats.total_windows} windows
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1e3a5f]">
                  {['Window', 'Anomaly Score', 'Threshold', 'Label', 'Risk Category', 'Key Features'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[#475569] font-medium uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayResults.map((r) => {
                  const badge = RISK_BADGE[r.risk_category];
                  return (
                    <tr
                      key={r.window_id}
                      className={`border-b border-[#0f2040] transition-colors hover:bg-[#0f2040]/50 ${
                        r.is_anomaly ? 'bg-[#ff4757]/[0.03]' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-[#64748b]">W-{String(r.window_id).padStart(3, '0')}</td>
                      <td className={`px-4 py-3 font-mono font-semibold ${r.is_anomaly ? 'text-[#ff4757]' : 'text-[#00d4ff]'}`}>
                        {r.anomaly_score.toFixed(5)}
                      </td>
                      <td className="px-4 py-3 font-mono text-[#ffb800]">{threshold.toFixed(5)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          r.is_anomaly ? 'bg-[#ff4757]/10 text-[#ff4757] border-[#ff4757]/20' : 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20'
                        }`}>
                          {r.is_anomaly ? '⚠ ANOMALY' : '✓ NORMAL'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {r.risk_category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {r.top_features.map((f) => (
                            <span key={f} className="px-1.5 py-0.5 rounded bg-[#0f2040] text-[#64748b] text-[10px] font-mono">
                              {FEATURE_LABELS[f] ?? f}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {results.length > 12 && (
            <div className="px-6 py-3 border-t border-[#1e3a5f]">
              <button
                onClick={() => setShowAll((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-[#475569] hover:text-[#00d4ff] transition-colors"
              >
                {showAll ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showAll ? 'Show less' : `Show all ${results.length} windows`}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
