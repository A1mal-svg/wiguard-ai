import { Shield, Wifi, Activity } from 'lucide-react';

interface Props {
  onReset?: () => void;
  showReset?: boolean;
}

export default function Header({ onReset, showReset }: Props) {
  return (
    <header className="border-b border-[#1e3a5f] bg-[#050d1a]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#00d4ff]" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00ff88] rounded-full border-2 border-[#050d1a] animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#e2e8f0] tracking-tight leading-none">
              WiGuard <span className="text-[#00d4ff]">AI</span>
            </h1>
            <p className="text-[10px] text-[#475569] leading-none mt-0.5 font-mono">
              Wi-Fi Intrusion Detection System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-xs text-[#475569]">
            <span className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3 text-[#00d4ff]" />
              Metadata Analysis
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-[#00ff88]" />
              Isolation Forest + Random Forest
            </span>
          </div>

          {showReset && onReset && (
            <button
              onClick={onReset}
              className="px-4 py-1.5 text-xs font-medium text-[#94a3b8] border border-[#1e3a5f] rounded-lg hover:border-[#00d4ff]/40 hover:text-[#00d4ff] transition-all duration-200"
            >
              New Analysis
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
