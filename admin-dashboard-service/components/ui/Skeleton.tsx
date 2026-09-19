'use client';

import React from 'react';
import { cn } from './utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className, variant = 'text', ...props }: SkeletonProps) {
  const variants = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-slate-800',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className, ...props }: Omit<SkeletonProps, 'variant'> & { lines?: number }) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton key={i} variant="text" className={i === lines - 1 ? 'w-3/4' : 'w-full'} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn('card p-6 space-y-4', className)} {...props}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-10 rounded-xl" variant="rectangular" />
      </div>
      <SkeletonText lines={2} />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-lg" variant="rectangular" />
        <Skeleton className="h-8 w-20 rounded-lg" variant="rectangular" />
        <Skeleton className="h-8 w-20 rounded-lg" variant="rectangular" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4, className, ...props }: SkeletonProps & { rows?: number; columns?: number }) {
  return (
    <div className={cn('table-container overflow-hidden', className)} {...props}>
      <table className="w-full">
        <thead className="bg-slate-950 border-b border-slate-800">
          <tr>
            {[...Array(columns)].map((_, i) => (
              <th key={i} className="px-4 py-3">
                <Skeleton className="h-4 w-3/4" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, i) => (
            <tr key={i} className="border-b border-slate-800/50">
              {[...Array(columns)].map((_, j) => (
                <td key={j} className="px-4 py-3">
                  <Skeleton className="h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}