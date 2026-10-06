import React from 'react';
import { RefreshCw, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDeleteNotification, useNotificationStats, useNotifications, useResendNotification } from '../../hooks/useApi';
import { usePagedRows } from '../../hooks/usePagedRows';
import {
  PageHeader,
  Pager,
  QueryState,
  StatCard,
  Table,
  Td,
  Th,
} from '../../components/QueryState';
import { Badge, Card, ConfirmDialog, Input, SelectField } from '../../components/ui';
import { formatStatusLabel, truncate } from '../../utils';
import { NOTIFICATION_STATUSES, NOTIFICATION_TYPES, type Notification } from '../../types/api';

const Notifications: React.FC = () => {
  const notifications = useNotifications();
  const stats = useNotificationStats();
  const resend = useResendNotification();
  const remove = useDeleteNotification();

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');
  const [deleteTarget, setDeleteTarget] = React.useState<Notification | null>(null);

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return (notifications.data ?? []).filter((n) => {
      const matchesTerm =
        !term ||
        n.subject?.toLowerCase().includes(term) ||
        n.message?.toLowerCase().includes(term) ||
        n.recipient?.toLowerCase().includes(term) ||
        n.username?.toLowerCase().includes(term);
      const matchesStatus = !statusFilter || n.status === statusFilter;
      const matchesType = !typeFilter || n.notificationType === typeFilter;
      return matchesTerm && matchesStatus && matchesType;
    });
  }, [notifications.data, search, statusFilter, typeFilter]);

  const paged = usePagedRows(filtered, 10);
  const byStatus = stats.data?.byStatus ?? {};

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Order and event notifications raised by the notification service."
      />

      <div className="mb-4 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Notifications" value={stats.data?.total ?? notifications.data?.length ?? 0} />
        <StatCard label="Sent" value={byStatus.SENT ?? 0} tone="good" />
        <StatCard label="Pending" value={byStatus.PENDING ?? 0} tone="warn" />
        <StatCard label="Failed" value={byStatus.FAILED ?? 0} tone={byStatus.FAILED ? 'bad' : 'default'} />
      </div>

      <Card className="mb-4 p-3 shadow-sm">
        <div className="flex flex-col gap-2 lg:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Search subject, message or recipient"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={Search}
              aria-label="Search notifications"
            />
          </div>
          <SelectField
            value={typeFilter}
            onChange={setTypeFilter}
            ariaLabel="Filter by channel"
            className="w-full px-3 py-2 text-[13px] lg:w-44"
            options={[
              { value: '', label: 'All channels' },
              ...NOTIFICATION_TYPES.map((type) => ({ value: type, label: formatStatusLabel(type) })),
            ]}
          />
          <SelectField
            value={statusFilter}
            onChange={setStatusFilter}
            ariaLabel="Filter by status"
            className="w-full px-3 py-2 text-[13px] lg:w-44"
            options={[
              { value: '', label: 'All statuses' },
              ...NOTIFICATION_STATUSES.map((status) => ({ value: status, label: formatStatusLabel(status) })),
            ]}
          />
        </div>
      </Card>

      <QueryState
        isLoading={notifications.isLoading}
        error={notifications.error}
        isEmpty={filtered.length === 0}
        onRetry={() => void notifications.refetch()}
        emptyTitle={search || statusFilter || typeFilter ? 'No notifications match your filters' : 'No notifications yet'}
        emptyDescription="Notifications appear here when an order or event triggers one."
      >
        <Table>
          <thead>
            <tr>
              <Th>Subject</Th>
              <Th>Channel</Th>
              <Th>Recipient</Th>
              <Th>Order</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {paged.visible.map((n) => (
              <tr key={n.id} className="border-t border-[#3c3f41]">
                <Td>
                  <p className="font-medium">{n.subject ?? '-'}</p>
                  {n.message && (
                    <p className="mt-0.5 max-w-md text-[12px] text-[#9da0a8]">
                      {truncate(n.message, 90)}
                    </p>
                  )}
                </Td>
                <Td className="text-[#9da0a8]">{formatStatusLabel(n.notificationType)}</Td>
                <Td className="text-[#9da0a8]">{n.recipient ?? n.username ?? '-'}</Td>
                <Td className="text-[#9da0a8]">{n.orderId ? `#${n.orderId}` : '-'}</Td>
                <Td>
                  <Badge status={n.status ?? 'UNKNOWN'} />
                </Td>
                <Td>
                  <div className="flex justify-end">
                    {n.status === 'FAILED' && <button
                      type="button"
                      title="Resend"
                      aria-label={`Resend notification ${n.id}`}
                      disabled={resend.isPending}
                      onClick={() =>
                        resend.mutate(n.id, {
                          onSuccess: () => toast.success('Notification queued for resend'),
                          onError: (e) => toast.error(e.message),
                        })
                      }
                      className="rounded-md p-1.5 text-[#9da0a8] hover:bg-[#313335] disabled:opacity-40"
                      >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>}
                    <button
                      type="button"
                      title="Delete"
                      aria-label={`Delete notification ${n.id}`}
                      disabled={remove.isPending}
                      onClick={() => setDeleteTarget(n)}
                      className="rounded-md p-1.5 text-[#9da0a8] hover:bg-[#313335] disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Pager
          page={paged.page}
          totalPages={paged.totalPages}
          total={paged.total}
          onChange={paged.setPage}
        />
      </QueryState>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          remove.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success('Notification deleted');
              setDeleteTarget(null);
            },
            onError: (e) => toast.error(e.message),
          });
        }}
        title="Delete notification?"
        description={`Notification #${deleteTarget?.id ?? ''} will be removed from the activity log. This cannot be undone.`}
        confirmLabel="Delete notification"
        loading={remove.isPending}
      />
    </>
  );
};

export default Notifications;
