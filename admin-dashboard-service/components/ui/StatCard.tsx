'use client';

import React from 'react';
import { cn } from './utils';

export interface StatCardProps {
  label: string;
  value: string | number;
  detail?: string;
  icon?: React.ReactNode;
  trend?: { value: string; positive?: boolean };
  className?: string;
}

export function StatCard({ label, value, detail, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn('card p-6', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400 truncate">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-100 tabular-nums">{value}</p>
          {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
          {trend && (
            <p className={cn('mt-1 text-xs font-medium flex items-center gap-1', trend.positive ? 'text-emerald-400' : 'text-rose-400')}>
              {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}