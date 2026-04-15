/*
  # WiGuard AI - Analysis Sessions Table

  1. New Tables
    - `analysis_sessions`
      - `id` (uuid, primary key)
      - `filename` (text) - name of uploaded file
      - `created_at` (timestamptz)
      - `total_windows` (int) - number of time windows analyzed
      - `anomaly_count` (int) - number of detected anomalies
      - `suspicious_count` (int) - suspicious behavior classifications
      - `weak_config_count` (int) - weak configuration classifications
      - `mean_score` (float8) - mean anomaly score
      - `threshold` (float8) - adaptive threshold value
      - `results_json` (jsonb) - full analysis results

  2. Security
    - Enable RLS
    - Allow anyone to insert and read (no auth required for this tool)
*/

CREATE TABLE IF NOT EXISTS analysis_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  total_windows integer DEFAULT 0,
  anomaly_count integer DEFAULT 0,
  suspicious_count integer DEFAULT 0,
  weak_config_count integer DEFAULT 0,
  mean_score float8 DEFAULT 0,
  threshold float8 DEFAULT 0,
  results_json jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert sessions"
  ON analysis_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read sessions"
  ON analysis_sessions FOR SELECT
  USING (true);
