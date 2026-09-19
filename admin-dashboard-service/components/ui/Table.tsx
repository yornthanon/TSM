'use client';

import React, { forwardRef } from 'react';
import { cn } from './utils';

export interface Column<T = unknown> {
  id: string;
  header?: React.ReactNode;
  cell?: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface TableProps<T = unknown> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  className?: string;
  emptyMessage?: string;
  striped?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  rowClassName?: (row: T) => string;
}

export function Table<T = unknown>({
  columns,
  data,
  keyExtractor,
  className,
  emptyMessage = 'No data available',
  striped = true,
  hoverable = true,
  loading = false,
  rowClassName,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className={cn('table-container overflow-hidden', className)}>
        <table className="w-full">
          <thead className="bg-slate-950 border-b border-slate-800">
            <tr>
              {columns.map((col) => (
                <th key={col.id} className={cn('px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider', col.headerClassName)}>
                  <div className="skeleton h-4 w-3/4" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className={cn('border-b border-slate-800/50', striped && i % 2 === 0 && 'bg-slate-950/50')}>
                {columns.map((col) => (
                  <td key={col.id} className="px-4 py-3">
                    <div className="skeleton h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('table-container', className)}>
        <div className="bg-slate-900 border border-slate-800 rounded-xl">
          <div className="px-6 py-12 text-center">
            <p className="text-slate-400">{emptyMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('table-container overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead className="bg-slate-950 border-b border-slate-800">
          <tr>
            {columns.map((col) => (
              <th
                key={col.id}
                className={cn(
                  'px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left',
                  col.headerClassName
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {data.map((row, rowIndex) => (
            <tr
              key={keyExtractor(row)}
              className={cn(
                'transition-colors duration-100',
                hoverable && 'hover:bg-slate-800/50',
                striped && rowIndex % 2 === 0 && 'bg-slate-950/50',
                rowClassName?.(row)
              )}
            >
              {columns.map((col) => (
                <td key={col.id} className={cn('px-4 py-3 text-slate-100', col.className)}>
                  {col.cell ? col.cell(row) : (row as Record<string, unknown>)[col.id] as React.ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}