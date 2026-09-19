'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from './utils';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showFirstLast?: boolean;
  showPageNumbers?: boolean;
  maxPageNumbers?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showFirstLast = true,
  showPageNumbers = true,
  maxPageNumbers = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = React.useMemo(() => {
    if (!showPageNumbers) return [];

    const half = Math.floor(maxPageNumbers / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxPageNumbers - 1);

    if (end - start + 1 < maxPageNumbers) {
      start = Math.max(1, end - maxPageNumbers + 1);
    }

    const result: (number | 'ellipsis')[] = [];

    if (start > 1) {
      result.push(1);
      if (start > 2) result.push('ellipsis');
    }

    for (let i = start; i <= end; i++) {
      result.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) result.push('ellipsis');
      result.push(totalPages);
    }

    return result;
  }, [currentPage, totalPages, maxPageNumbers, showPageNumbers]);

  return (
    <nav
      className={cn('flex items-center justify-center gap-1', className)}
      aria-label="Pagination"
    >
      {showFirstLast && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
          aria-disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        aria-disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {showPageNumbers && (
        <div className="flex items-center gap-1" role="group" aria-label="Page numbers">
          {pages.map((page, index) =>
            page === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-slate-400" aria-hidden="true">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? 'primary' : 'ghost'}
                size="icon"
                className="h-9 w-9 min-w-[36px]"
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </Button>
            )
          )}
        </div>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        aria-disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {showFirstLast && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
          aria-disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      )}
    </nav>
  );
}

interface PaginationInfoProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  className?: string;
}

export function PaginationInfo({ currentPage, totalPages, totalItems, itemsPerPage, className }: PaginationInfoProps) {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className={cn('text-sm text-slate-400', className)} aria-live="polite">
      Showing {start} to {end} of {totalItems} results
    </div>
  );
}