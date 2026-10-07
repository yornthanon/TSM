import React from 'react';

/**
 * Client-side pagination for the list endpoints, which all return the whole
 * collection at once.
 *
 * Callers pass a memoised array, so a new identity means the filters changed and
 * the page counter is reset during render rather than in an effect, which would
 * render the old page once before correcting itself.
 */
export function usePagedRows<T>(rows: T[], pageSize = 10) {
  const [page, setPage] = React.useState(1);
  const [previousRows, setPreviousRows] = React.useState(rows);

  if (rows !== previousRows) {
    setPreviousRows(rows);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  // Guards against a stale page after a filter change shrinks the result set.
  const current = Math.min(page, totalPages);
  const visible = rows.slice((current - 1) * pageSize, current * pageSize);

  return { visible, page: current, totalPages, setPage, total: rows.length };
}
