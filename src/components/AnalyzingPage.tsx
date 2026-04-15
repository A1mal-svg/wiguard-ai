import { useEffect, useState } from 'react';

const STEPS = [
  { label: 'Parsing CSV features', detail: 'Extracting 12 metadata features per time window' },
  { label: 'Normalizing with StandardScaler', detail: 'Zero mean, unit variance across all features' },
  { label: 'Training Isolation Forest', detail: 'Building 60 isolation trees, sample size: 128' },
  { label: 'Applying adaptive threshold', detail: 'threshold = mean(scores) + std(scores)' },
  { label: 'Classifying with Random Forest', detail: 'Normal / Suspicious Behavior / Weak Configuration' },
  { label: 'Computing feature importance', detail: 'Ranking features by classification contribution' },
];

interface Props {
  filename: string;
}

export default function AnalyzingPage({ filename }: Props) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = 2400;
    const stepDuration = totalDuration / STEPS.length;

    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + 1;
        setStep(Math.min(Math.floor((next / 100) * STEPS.length), STEPS.length - 1));
        return Math.min(next, 99);
      });
    }, totalDuration / 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#050d1a] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-[#1e3a5f]" />
            <div
              className="absolute inset-0 rounded-full border-2 border-[#00d4ff] border-t-transparent transition-transform duration-100"
              style={{ transform: `rotate(${progress * 3.6}deg)` }}
            />
            <div className="absolute inset-2 rounded-full bg-[#0a1628] flex items-center justify-center">
              <span className="text-sm font-bold text-[#00d4ff] font-mono">{progress}%</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-[#e2e8f0] mb-1">Analyzing Traffic</h3>
          <p className="text-sm text-[#475569] font-mono truncate px-4">{filename}</p>
        </div>

        <div className="rounded-2xl bg-[#0a1628] border border-[#1e3a5f] overflow-hidden mb-6">
          <div className="h-1 bg-[#0f2040]">
            <div
              className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00ff88] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="p-5 space-y-3">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <div key={i} className={`flex items-center gap-3 transition-opacity duration-300 ${i > step + 1 ? 'opacity-30' : ''}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    done ? 'bg-[#00ff88] text-[#050d1a]' : active ? 'bg-[#00d4ff]/20 border border-[#00d4ff]' : 'bg-[#0f2040] border border-[#1e3a5f]'
                  }`}>
                    {done ? (
                      <svg width="10" height="10" viewBox="0 0 10 10">
                        <path d="M2 5l2.5 2.5 3.5-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                      </svg>
                    ) : active ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-medium ${done ? 'text-[#64748b]' : active ? 'text-[#e2e8f0]' : 'text-[#334155]'}`}>
                      {s.label}
                    </p>
                    {active && (
                      <p className="text-[10px] text-[#475569] font-mono mt-0.5">{s.detail}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-xs text-[#334155]">
          No payload inspection — privacy-preserving analysis
        </p>
      </div>
    </div>
  );
}
