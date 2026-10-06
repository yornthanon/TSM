import React from 'react';
import { Ban, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useCancelOrder, useEvents, useOrderStats, useOrders } from '../../hooks/useApi';
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
import { formatCurrency, formatDateTime, formatStatusLabel } from '../../utils';
import { ORDER_STATUSES, type Order } from '../../types/api';
import { auth } from '../../lib/auth';

const CANCELLABLE_ORDER_STATUSES = new Set(['PENDING', 'PROCESSING']);

const Orders: React.FC = () => {
  const activeRole = auth.getUser()?.role;
  const canCancelOrders = activeRole === 'TENANT_ADMIN';
  const orders = useOrders();
  const orderStats = useOrderStats();
  const events = useEvents();
  const cancelOrder = useCancelOrder();

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [cancelTarget, setCancelTarget] = React.useState<Order | null>(null);

  const eventTitleById = React.useMemo(() => {
    const map = new Map<number, string>();
    (events.data ?? []).forEach((event) => map.set(event.id, event.title));
    return map;
  }, [events.data]);

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return (orders.data ?? []).filter((order) => {
      const matchesTerm =
        !term ||
        String(order.id) === term ||
        eventTitleById.get(order.eventId)?.toLowerCase().includes(term) ||
        order.username?.toLowerCase().includes(term);
      const matchesStatus = !statusFilter || order.orderStatus === statusFilter;
      return matchesTerm && matchesStatus;
    });
  }, [orders.data, search, statusFilter, eventTitleById]);

  const paged = usePagedRows(filtered, 10);
  const byStatus = orderStats.data?.byStatus ?? {};

  return (
    <>
      <PageHeader
        title="Orders"
        description={canCancelOrders
          ? 'Monitor bookings and cancel eligible orders in this workspace.'
          : 'Platform-wide read-only view. Open a workspace from Users to manage orders with an audited session.'}
      />

      <div className="mb-4 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Orders" value={orderStats.data?.total ?? orders.data?.length ?? 0} />
        <StatCard label="Completed" value={byStatus.COMPLETED ?? 0} tone="good" />
        <StatCard label="Processing" value={byStatus.PROCESSING ?? 0} tone="warn" />
        <StatCard
          label="Booked value"
          value={formatCurrency(orderStats.data?.totalAmount)}
        />
      </div>

      <Card className="mb-4 p-3 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Search by order id, event or customer"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={Search}
              aria-label="Search orders"
            />
          </div>
          <SelectField
            value={statusFilter}
            onChange={setStatusFilter}
            ariaLabel="Filter by status"
            className="w-full px-3 py-2 text-[13px] sm:w-44"
            options={[
              { value: '', label: 'All statuses' },
              ...ORDER_STATUSES.map((status) => ({ value: status, label: formatStatusLabel(status) })),
            ]}
          />
        </div>
      </Card>

      <QueryState
        isLoading={orders.isLoading}
        error={orders.error}
        isEmpty={filtered.length === 0}
        onRetry={() => void orders.refetch()}
        emptyTitle={search || statusFilter ? 'No orders match your filters' : 'No orders yet'}
        emptyDescription="Orders appear here once a checkout completes."
      >
        <Table>
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Event</Th>
              <Th>Seat</Th>
              <Th>Qty</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Payment</Th>
              <Th>Placed</Th>
            <Th className="text-right">{canCancelOrders ? 'Actions' : ''}</Th>
            </tr>
          </thead>
          <tbody>
            {paged.visible.map((order) => (
              <tr key={order.id} className="border-t border-[#3c3f41]">
                <Td className="font-medium">#{order.id}</Td>
                <Td className="text-[#9da0a8]">
                  {eventTitleById.get(order.eventId) ?? `Event #${order.eventId}`}
                </Td>
                <Td className="text-[#9da0a8]">#{order.ticketId}</Td>
                <Td className="text-[#9da0a8]">{order.quantity}</Td>
                <Td className="font-medium">{formatCurrency(order.amount)}</Td>
                <Td>
                  <Badge status={order.orderStatus ?? 'UNKNOWN'} />
                </Td>
                <Td className="text-[#9da0a8]">
                  {order.paymentId ? `#${order.paymentId}` : '-'}
                </Td>
                <Td className="whitespace-nowrap text-[#9da0a8]">
                  {formatDateTime(order.orderDate)}
                </Td>
                <Td>
                  <div className="flex justify-end">
                    {canCancelOrders && CANCELLABLE_ORDER_STATUSES.has(order.orderStatus ?? '') && <button
                      type="button"
                      title="Cancel pending order"
                      aria-label={`Cancel order ${order.id}`}
                      disabled={cancelOrder.isPending}
                      onClick={() => setCancelTarget(order)}
                      className="rounded-md p-1.5 text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Ban className="h-3.5 w-3.5" />
                    </button>}
                    {canCancelOrders && !CANCELLABLE_ORDER_STATUSES.has(order.orderStatus ?? '') && (
                      <span className="px-1.5 text-[11px] text-[#6f737c]" title="Only pending or processing orders can be cancelled">
                        —
                      </span>
                    )}
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
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => {
          if (!cancelTarget) return;
          cancelOrder.mutate(cancelTarget.id, {
            onSuccess: () => {
              toast.success(`Order #${cancelTarget.id} cancelled`);
              setCancelTarget(null);
            },
            onError: (e) => {
              toast.error(e.message);
              setCancelTarget(null);
            },
          });
        }}
        title={`Cancel order #${cancelTarget?.id ?? ''}?`}
        description={cancelTarget
          ? `This will mark the ${formatStatusLabel(cancelTarget.orderStatus)} order for ${formatCurrency(cancelTarget.amount)} as cancelled. The current backend does not automatically issue a payment refund.`
          : 'Review the order before cancelling it.'}
        confirmLabel="Yes, cancel order"
        loading={cancelOrder.isPending}
      />
    </>
  );
};

export default Orders;
