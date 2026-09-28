import React from 'react';
import { Skeleton } from './ui';
import { ErrorState, EmptyState } from './ui';
import { cn } from '../utils';

interface QueryStateProps {
  isLoading: boolean;
  error: Error | null;
  isEmpty: boolean;
  onRetry?: () => void;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  /** Number of skeleton rows to show while loading a table. */
  rows?: number;
  children: React.ReactNode;
}

/**
 * Uniform loading / error / empty handling.
 *
 * The api client rejects on `is_error` bodies, so `error` already covers both
 * transport failures and HTTP-200 error envelopes.
 */
export const QueryState: React.FC<QueryStateProps> = ({
  isLoading,
  error,
  isEmpty,
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyAction,
  rows = 5,
  children,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2.5" aria-busy="true" aria-live="polite">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load data"
        description={error.message}
        {...(onRetry ? { onRetry } : {})}
      />
    );
  }

  if (isEmpty) {
    return (
      <EmptyState title={emptyTitle} {...(emptyDescription ? { description: emptyDescription } : {})} {...(emptyAction ? { action: emptyAction } : {})} />
    );
  }

  return <>{children}</>;
};

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ElementType;
  tone?: 'default' | 'good' | 'warn' | 'bad';
}

const TONES: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-[#292933]',
  good: 'text-emerald-600',
  warn: 'text-amber-600',
  bad: 'text-rose-600',
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
}) => (
  <div className="rounded-xl border border-[#e8e8ec] bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9b9ba6]">
        {label}
      </p>
      {Icon && <Icon className="h-4 w-4 text-[#b6b6c0]" strokeWidth={1.8} />}
    </div>
    <p className={cn('mt-1.5 text-2xl font-semibold tracking-[-0.03em]', TONES[tone])}>
      {value}
    </p>
    {hint && <p className="mt-0.5 text-[11px] text-[#9b9ba6]">{hint}</p>}
  </div>
);

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => (
  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h1 className="text-xl font-semibold tracking-[-0.02em] text-[#292933]">{title}</h1>
      {description && <p className="mt-1 text-[13px] text-[#777783]">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

interface ThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}
interface TdProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export const Th: React.FC<ThProps> = ({ className, ...props }) => (
  <th
    className={cn(
      'px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9b9ba6]',
      className
    )}
    {...props}
  />
);

export const Td: React.FC<TdProps> = ({ className, ...props }) => (
  <td className={cn('px-3 py-3 text-[13px] text-[#3d3d47]', className)} {...props} />
);

export const Table: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className="overflow-x-auto rounded-xl border border-[#e8e8ec] bg-white shadow-sm">
    <table className={cn('w-full min-w-[640px] border-collapse', className)}>{children}</table>
  </div>
);

export const Pager: React.FC<{
  page: number;
  totalPages: number;
  total: number;
  pageSize?: number;
  onChange: (page: number) => void;
}> = ({ page, totalPages, total, pageSize = 10, onChange }) => (
  <div className="mt-3 flex items-center justify-between text-xs text-[#777783]">
    <span>
      {total === 0
        ? 'No rows'
        : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, total)} of ${total}`}
    </span>
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="rounded-lg border border-[#e7e7eb] px-2.5 py-1 disabled:opacity-40"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Prev
      </button>
      <span>
        {page} / {totalPages}
      </span>
      <button
        type="button"
        className="rounded-lg border border-[#e7e7eb] px-2.5 py-1 disabled:opacity-40"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  </div>
);
