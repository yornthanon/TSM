import { ReactNode, useMemo, useState, SortDescriptor } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from './Button';

export interface Column<T> {
  key: string;
  header: string;
  render?: (value: unknown, row: T, index: number) => ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    pageSizeOptions?: number[];
  };
  rowClassName?: (row: T, index: number) => string;
  striped?: boolean;
  hoverable?: boolean;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No data available',
  sortBy,
  sortOrder,
  onSort,
  pagination,
  rowClassName,
  striped = true,
  hoverable = true,
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(sortBy || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(sortOrder || 'asc');

  const handleSort = (key: string) => {
    const column = columns.find((c) => c.key === key);
    if (!column?.sortable || !onSort) return;

    let newDirection: 'asc' | 'desc' = 'asc';
    if (sortColumn === key && sortDirection === 'asc') {
      newDirection = 'desc';
    }
    setSortColumn(key);
    setSortDirection(newDirection);
    onSort(key, newDirection);
  };

  const sortedData = useMemo(() => {
    if (!sortColumn || !onSort) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortColumn as keyof T];
      const bVal = b[sortColumn as keyof T];
      if (aVal === bVal) return 0;
      const comparison = aVal > bVal ? 1 : -1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection, onSort]);

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark">
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 text-left">
                  <div className="animate-pulse h-4 bg-dark-200 dark:bg-dark-700 rounded w-3/4" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border-light dark:border-border-dark">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    <div className="animate-pulse h-4 bg-dark-200 dark:bg-dark-700 rounded w-1/2" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (sortedData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-dark-500 dark:text-dark-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full" role="table">
        <thead>
          <tr className="bg-dark-50 dark:bg-dark-800/50 border-b border-border-light dark:border-border-dark">
            {columns.map((column) => (
              <th
                key={column.key}
                className={twMerge(clsx(
                  'px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider',
                  column.sortable && 'cursor-pointer select-none hover:bg-dark-100 dark:hover:bg-dark-700',
                  column.headerClassName
                ))}
                onClick={() => column.sortable && handleSort(column.key)}
                style={{ userSelect: column.sortable ? 'none' : 'auto' }}
              >
                <div className="flex items-center gap-1.5">
                  <span>{column.header}</span>
                  {column.sortable && (
                    <span className="flex flex-col -space-y-1">
                      {sortColumn === column.key && sortDirection === 'asc' ? (
                        <ChevronUp className="w-3 h-3 text-primary-500" />
                      ) : sortColumn === column.key && sortDirection === 'desc' ? (
                        <ChevronDown className="w-3 h-3 text-primary-500" />
                      ) : (
                        <ChevronsUpDown className="w-3 h-3 text-dark-300 dark:text-dark-600" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light dark:divide-border-dark">
          {sortedData.map((row, rowIndex) => (
            <tr
              key={keyExtractor(row)}
              className={twMerge(clsx(
                hoverable && 'hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors',
                striped && rowIndex % 2 === 1 && 'bg-dark-50/50 dark:bg-dark-800/30',
                rowClassName?.(row, rowIndex)
              ))}
            >
              {columns.map((column) => {
                const value = row[column.key as keyof T];
                return (
                  <td
                    key={column.key}
                    className={twMerge(clsx(
                      'px-4 py-3 text-sm text-dark-900 dark:text-dark-100',
                      column.cellClassName
                    ))}
                  >
                    {column.render ? column.render(value, row, rowIndex) : String(value ?? '')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 p-4 border-t border-border-light dark:border-border-dark">
          <div className="text-sm text-dark-500 dark:text-dark-400">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={pagination.pageSize.toString()}
              onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
              options={pagination.pageSizeOptions?.map((size) => ({ value: size.toString(), label: size.toString() })) || [
                { value: '10', label: '10' },
                { value: '25', label: '25' },
                { value: '50', label: '50' },
                { value: '100', label: '100' },
              ]}
              className="w-[100px]"
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-dark-600 dark:text-dark-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Need to import Select from Input
import { Select } from './Input';