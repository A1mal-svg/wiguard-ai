import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
  color?: 'cyan' | 'green' | 'red' | 'amber' | 'slate';
  pulse?: boolean;
}

const colorMap = {
  cyan: {
    border: 'border-[#00d4ff]/20',
    iconBg: 'bg-[#00d4ff]/10',
    iconColor: 'text-[#00d4ff]',
    valueColor: 'text-[#00d4ff]',
    glow: 'shadow-[0_0_20px_rgba(0,212,255,0.05)]',
  },
  green: {
    border: 'border-[#00ff88]/20',
    iconBg: 'bg-[#00ff88]/10',
    iconColor: 'text-[#00ff88]',
    valueColor: 'text-[#00ff88]',
    glow: 'shadow-[0_0_20px_rgba(0,255,136,0.05)]',
  },
  red: {
    border: 'border-[#ff4757]/20',
    iconBg: 'bg-[#ff4757]/10',
    iconColor: 'text-[#ff4757]',
    valueColor: 'text-[#ff4757]',
    glow: 'shadow-[0_0_20px_rgba(255,71,87,0.05)]',
  },
  amber: {
    border: 'border-[#ffb800]/20',
    iconBg: 'bg-[#ffb800]/10',
    iconColor: 'text-[#ffb800]',
    valueColor: 'text-[#ffb800]',
    glow: 'shadow-[0_0_20px_rgba(255,184,0,0.05)]',
  },
  slate: {
    border: 'border-[#1e3a5f]',
    iconBg: 'bg-[#0f2040]',
    iconColor: 'text-[#64748b]',
    valueColor: 'text-[#e2e8f0]',
    glow: '',
  },
};

export default function StatCard({ label, value, sub, icon, color = 'slate', pulse }: Props) {
  const c = colorMap[color];
  return (
    <div className={`relative rounded-xl bg-[#0a1628] border ${c.border} p-5 ${c.glow} overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[#475569] uppercase tracking-wider mb-2">{label}</p>
          <p className={`text-3xl font-bold ${c.valueColor} leading-none`}>
            {value}
            {pulse && (
              <span className={`inline-block ml-2 w-2 h-2 rounded-full ${color === 'red' ? 'bg-[#ff4757]' : 'bg-[#00d4ff]'} animate-pulse`} />
            )}
          </p>
          {sub && <p className="text-xs text-[#475569] mt-1.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
          <span className={c.iconColor}>{icon}</span>
        </div>
      </div>
    </div>
  );
}
