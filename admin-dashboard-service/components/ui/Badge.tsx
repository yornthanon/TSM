'use client';

import React, { forwardRef } from 'react';
import { cn } from './utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  tone?: 'slate' | 'brand' | 'green' | 'amber' | 'rose' | 'violet';
  dot?: boolean;
  pulse?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', tone, dot, pulse, ...props }, ref) => {
    const toneVariants = {
      slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      brand: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    };

    const variantStyles = {
      default: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
      success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      neutral: 'bg-slate-800 text-slate-300 border border-slate-700',
    };

    const baseStyle = tone && toneVariants[tone] ? toneVariants[tone] : variantStyles[variant];

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
          baseStyle,
          dot && 'relative pl-5',
          pulse && 'animate-pulse',
          className
        )}
        {...props}
      >
        {dot && (
          <span className={cn('absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full', pulse && 'animate-pulse', tone === 'brand' && 'bg-orange-500', tone === 'green' && 'bg-emerald-500', tone === 'amber' && 'bg-amber-500', tone === 'rose' && 'bg-rose-500', tone === 'violet' && 'bg-violet-500', tone === 'slate' && 'bg-slate-500')} />
        )}
        {props.children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';