import React from 'react';
import { clsx } from './Button';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

export const Table = <T,>({
  columns,
  rows,
  keyExtractor,
  emptyTitle = 'No data',
  emptyMessage,
  onRowClick,
  maxHeight,
}: {
  columns: Column<T>[];
  rows: T[];
  keyExtractor: (row: T, index: number) => string;
  emptyTitle?: string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  maxHeight?: number;
}) => (
  <div className={clsx('overflow-x-auto', maxHeight && 'overflow-y-auto')} style={maxHeight ? { maxHeight } : undefined}>
    <table className="w-full text-sm min-w-full">
      <thead>
        <tr className="border-b border-line">
          {columns.map((col) => (
            <th
              key={col.key}
              className={clsx(
                'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-soft whitespace-nowrap',
                col.className
              )}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-4 py-12 text-center">
              <div className="text-sm font-semibold text-ink-soft">{emptyTitle}</div>
              {emptyMessage && <div className="text-xs text-ink-soft/70 mt-1">{emptyMessage}</div>}
            </td>
          </tr>
        ) : (
          rows.map((row, index) => (
            <tr
              key={keyExtractor(row, index)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={clsx('border-b border-line last:border-0 transition', onRowClick && 'cursor-pointer hover:bg-brand-50/40')}
            >
              {columns.map((col) => (
                <td key={col.key} className={clsx('px-4 py-3 text-ink whitespace-nowrap', col.className)}>
                  {col.render ? col.render(row, index) : String((row as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default Table;