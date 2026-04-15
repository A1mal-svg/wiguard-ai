import type { NetworkFeature, AnalysisResult, PipelineOutput } from '../types';
import { parseCSV, featuresToMatrix, normalizeMatrix } from './csvParser';
import { isolationForest, adaptiveThreshold } from './isolationForest';
import { classifyAnomalies, buildConfusionMatrix } from './randomForest';

export async function runPipeline(csvText: string): Promise<PipelineOutput> {
  await new Promise((r) => setTimeout(r, 50));

  const features: NetworkFeature[] = parseCSV(csvText);
  const matrix = featuresToMatrix(features);
  const normalized = normalizeMatrix(matrix);

  await new Promise((r) => setTimeout(r, 50));

  const rawScores = isolationForest(normalized, 60, 128);
  const { threshold, mean, std } = adaptiveThreshold(rawScores);

  const anomalyIndices: number[] = [];
  features.forEach((f, i) => {
    if (rawScores[i] > threshold) anomalyIndices.push(f.window_id);
  });

  await new Promise((r) => setTimeout(r, 50));

  const { results: classResults, feature_importance } = classifyAnomalies(features, anomalyIndices);

  const results: AnalysisResult[] = features.map((f, i) => ({
    window_id: f.window_id,
    anomaly_score: rawScores[i],
    is_anomaly: rawScores[i] > threshold,
    risk_category: classResults[i].risk_category,
    risk_level: classResults[i].risk_level,
    top_features: classResults[i].top_features,
  }));

  const normal_count = results.filter((r) => !r.is_anomaly).length;
  const anomaly_count = results.filter((r) => r.is_anomaly).length;
  const suspicious_count = results.filter((r) => r.risk_category === 'Suspicious Behavior').length;
  const weak_config_count = results.filter((r) => r.risk_category === 'Weak Configuration').length;

  const confusion_matrix = buildConfusionMatrix(results);

  return {
    features,
    results,
    threshold,
    feature_importance,
    stats: {
      total_windows: features.length,
      anomaly_count,
      normal_count,
      suspicious_count,
      weak_config_count,
      mean_score: mean,
      std_score: std,
    },
    confusion_matrix,
  };
}
