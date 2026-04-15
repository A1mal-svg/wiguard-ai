import { useState, useCallback } from 'react';
import type { PipelineOutput } from './types';
import Header from './components/Header';
import UploadPage from './components/UploadPage';
import AnalyzingPage from './components/AnalyzingPage';
import Dashboard from './components/Dashboard';
import { runPipeline } from './lib/pipeline';
import { supabase } from './lib/supabase';

type View = 'upload' | 'analyzing' | 'dashboard';

export default function App() {
  const [view, setView] = useState<View>('upload');
  const [output, setOutput] = useState<PipelineOutput | null>(null);
  const [filename, setFilename] = useState('');
  const [error, setError] = useState('');

  const handleStart = useCallback(async (csvText: string, fname: string) => {
    setFilename(fname);
    setError('');
    setView('analyzing');

    await new Promise((r) => setTimeout(r, 2600));

    try {
      const result = await runPipeline(csvText);
      setOutput(result);
      setView('dashboard');

      await supabase.from('analysis_sessions').insert({
        filename: fname,
        total_windows: result.stats.total_windows,
        anomaly_count: result.stats.anomaly_count,
        suspicious_count: result.stats.suspicious_count,
        weak_config_count: result.stats.weak_config_count,
        mean_score: result.stats.mean_score,
        threshold: result.threshold,
        results_json: {
          anomaly_count: result.stats.anomaly_count,
          normal_count: result.stats.normal_count,
          threshold: result.threshold,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setView('upload');
    }
  }, []);

  const handleReset = useCallback(() => {
    setView('upload');
    setOutput(null);
    setFilename('');
    setError('');
  }, []);

  return (
    <div className="min-h-screen bg-[#050d1a]">
      <Header onReset={handleReset} showReset={view === 'dashboard'} />

      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="p-4 rounded-xl bg-[#ff4757]/10 border border-[#ff4757]/20 text-[#ff4757] text-sm">
            {error}
          </div>
        </div>
      )}

      {view === 'upload' && <UploadPage onStart={handleStart} />}
      {view === 'analyzing' && <AnalyzingPage filename={filename} />}
      {view === 'dashboard' && output && <Dashboard output={output} filename={filename} />}
    </div>
  );
}
