import React from 'react';
import { Skeleton } from './ui';
import { ErrorState, EmptyState } from './ui';
import { cn } from 'frontend-shared/utils';

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
  /** Use metric-card placeholders instead of table-row placeholders. */
  loadingVariant?: 'rows' | 'cards';
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
  loadingVariant = 'rows',
  children,
}) => {
  if (isLoading) {
    if (loadingVariant === 'cards') {
      return (
        <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-live="polite">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-[108px] w-full rounded-xl" />
          ))}
        </div>
      );
    }
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
  default: 'text-[#dfe1e5]',
  good: 'text-[#4ec9b0]',
  warn: 'text-[#ffc66d]',
  bad: 'text-[#f07178]',
};

const ICON_TONES: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'bg-[#3574f0]/10 text-[#3574f0]',
  good: 'bg-[#4ec9b0]/10 text-[#4ec9b0]',
  warn: 'bg-[#ffc66d]/10 text-[#ffc66d]',
  bad: 'bg-[#f07178]/10 text-[#f07178]',
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
}) => (
  <div className="min-w-0 rounded-xl border border-[#27292d] bg-[#18191c] p-4 shadow-sm transition-colors hover:border-[#393b40]">
    <div className="flex items-center justify-between gap-2">
      <p className="min-w-0 break-words text-xs font-medium text-[#868a91]">
        {label}
      </p>
      {Icon && <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', ICON_TONES[tone])}><Icon className="h-3.5 w-3.5" strokeWidth={1.8} /></span>}
    </div>
    <p className={cn('mt-2 min-w-0 break-words font-jetbrains text-xl font-semibold tracking-[-0.03em] tabular-nums sm:text-2xl', TONES[tone])}>
      {value}
    </p>
    {hint && <p className="mt-1 text-[11px] text-[#868a91]">{hint}</p>}
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
      <h1 className="text-xl font-semibold tracking-[-0.02em] text-[#d7dae0]">{title}</h1>
      {description && <p className="mt-1 text-[13px] text-[#9da0a8]">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

interface ThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}
interface TdProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export const Th: React.FC<ThProps> = ({ className, ...props }) => (
  <th
    className={cn(
      'px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9da0a8]',
      className
    )}
    {...props}
  />
);

export const Td: React.FC<TdProps> = ({ className, ...props }) => (
  <td className={cn('px-3 py-3 text-[13px] text-[#c4c7ce]', className)} {...props} />
);

export const Table: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className="overflow-x-auto rounded-xl border border-[#3c3f41] bg-white shadow-sm">
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
  <div className="mt-3 flex items-center justify-between text-xs text-[#9da0a8]">
    <span>
      {total === 0
        ? 'No rows'
        : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, total)} of ${total}`}
    </span>
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="rounded-lg border border-[#3c3f41] px-2.5 py-1 disabled:opacity-40"
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
        className="rounded-lg border border-[#3c3f41] px-2.5 py-1 disabled:opacity-40"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  </div>
);
