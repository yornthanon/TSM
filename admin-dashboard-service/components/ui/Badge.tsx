'use client';

import React, { forwardRef } from 'react';
import { cn } from './utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
      success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      neutral: 'bg-slate-800 text-slate-300 border border-slate-700',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';