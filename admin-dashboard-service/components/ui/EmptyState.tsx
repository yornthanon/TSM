'use client';

import React from 'react';
import { cn } from './utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, message, action, className }: EmptyStateProps) {
  return (
    <div className={cn('card p-12 text-center', className)}>
      {icon && (
        <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-400 mb-6">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
      {message && <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}