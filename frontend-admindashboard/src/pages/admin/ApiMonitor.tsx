import React, { useState, useEffect } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { useApiErrors } from '../../hooks/useApi';
import { Card, Skeleton, EmptyState, Button, Input, Modal } from '../../components/ui';
import { formatDateTime, cn, getStatusCodeColor } from '../../utils';
import type { ApiError } from '../../types/api';

const statusCodes = [400, 401, 403, 404, 500, 502, 503];

export const ApiMonitor: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ statusCode: '', endpoint: '', startDate: '', endDate: '' });
  const [selectedError, setSelectedError] = useState<ApiError | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const { data, isLoading, error, refetch } = useApiErrors(page, 20, filters);
  const errors = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => refetch(), 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  if (error) return <div className="text-center py-12 text-red-600">Failed to load API errors.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Monitor</h1>
          <p className="text-gray-500 mt-1">Monitor and troubleshoot API errors.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-[#F6821F] focus:ring-[#F6821F]"
            />
            Auto-refresh (30s)
          </label>
          <Button variant="secondary" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw className="h-4 w-4" />}>
            Refresh
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Filter by endpoint..."
              value={filters.endpoint}
              onChange={(e) => { setFilters((f) => ({ ...f, endpoint: e.target.value })); setPage(1); }}
              className="pl-10"
            />
          </div>
          <select
            value={filters.statusCode}
            onChange={(e) => { setFilters((f) => ({ ...f, statusCode: e.target.value })); setPage(1); }}
            className="input"
          >
            <option value="">All Status Codes</option>
            {statusCodes.map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} width="100%" height={48} />
            ))}
          </div>
        ) : errors.length === 0 ? (
          <EmptyState title="No errors found" description="Great job! No API errors to report." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 font-medium text-gray-500">Timestamp</th>
                  <th className="pb-3 font-medium text-gray-500">Endpoint</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500">Error</th>
                  <th className="pb-3 font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {errors.map((err) => (
                  <tr key={err.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 text-gray-600 whitespace-nowrap">{formatDateTime(err.timestamp)}</td>
                    <td className="py-3 text-gray-900 font-mono text-xs">{err.endpoint}</td>
                    <td className="py-3">
                      <span className={cn('badge', getStatusCodeColor(err.statusCode))}>{err.statusCode}</span>
                    </td>
                    <td className="py-3 text-gray-600 max-w-xs truncate">{err.errorMessage}</td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedError(err)}>View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      <Modal open={!!selectedError} onClose={() => setSelectedError(null)} title="Error Details" footer={
        <Button variant="secondary" onClick={() => setSelectedError(null)}>Close</Button>
      }>
        {selectedError && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Timestamp</p>
                <p className="font-medium text-gray-900 mt-1">{formatDateTime(selectedError.timestamp)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Status Code</p>
                <span className={cn('badge', getStatusCodeColor(selectedError.statusCode))}>{selectedError.statusCode}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Method</p>
                <p className="font-medium text-gray-900 mt-1">{selectedError.method}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Endpoint</p>
                <p className="font-medium text-gray-900 mt-1 font-mono text-xs">{selectedError.endpoint}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Error Message</p>
              <p className="mt-1 text-gray-900">{selectedError.errorMessage}</p>
            </div>
            {selectedError.stackTrace && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Stack Trace</p>
                <pre className="mt-2 p-4 rounded-lg bg-gray-900 text-gray-100 text-xs overflow-x-auto max-h-64">
                  {selectedError.stackTrace}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
