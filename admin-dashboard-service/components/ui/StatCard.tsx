import React from 'react';
import { clsx } from './Button';

export const StatCard: React.FC<{
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
  icon: React.ElementType;
  tone?: 'brand' | 'green' | 'amber' | 'rose' | 'sky' | 'slate';
  trend?: number;
}> = ({ label, value, detail, icon: Icon, tone = 'brand', trend }) => {
  const tones = {
    brand: 'bg-brand-50 text-brand-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    sky: 'bg-sky-50 text-sky-700',
    slate: 'bg-slate-100 text-slate-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-line shadow-card p-5 flex items-start gap-4">
      <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', tones[tone])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{label}</div>
        <div className="font-display text-2xl font-bold text-ink mt-1 truncate">{value}</div>
        <div className="flex items-center gap-2 mt-1 text-xs text-ink-soft">
          {detail}
          {typeof trend === 'number' && trend !== 0 && (
            <span className={clsx('font-semibold', trend > 0 ? 'text-emerald-600' : 'text-rose-600')}>
              {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;