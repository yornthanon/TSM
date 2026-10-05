import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  CreditCard,
  Mail,
  ShoppingCart,
  Ticket as TicketIcon,
} from 'lucide-react';
import { useAdminWorkspaceOverview, useEventStats, useNotificationStats, useOrderStats, usePayments, useRevenueSummary, useTicketStats } from '../../hooks/useApi';
import { PageHeader, QueryState, StatCard, Table, Td, Th } from '../../components/QueryState';
import { Badge, Card } from '../../components/ui';
import { formatCurrency, formatDateTime } from '../../utils';
import { auth } from '../../lib/auth';

/** Latest activity across orders and payments, the two streams with timestamps. */
const Dashboard: React.FC = () => {
  const isPlatformAdmin = auth.getUser()?.role === 'ADMIN';
  const workspaceOverview = useAdminWorkspaceOverview(isPlatformAdmin);
  const events = useEventStats();
  const tickets = useTicketStats();
  const orders = useOrderStats();
  const payments = usePayments();
  const revenue = useRevenueSummary();
  // This endpoint is ADMIN-only on the backend; a tenant dashboard must not
  // turn the expected 403 into a full-page dashboard error.
  const notifications = useNotificationStats({ queryKey: ['notifications', 'stats'], enabled: isPlatformAdmin });

  const recentPayments = React.useMemo(
    () =>
      [...(payments.data ?? [])]
        .sort((a, b) => (b.paymentDate ?? '').localeCompare(a.paymentDate ?? ''))
        .slice(0, 6),
    [payments.data]
  );

  const revenueTotal = React.useMemo(() => {
    const summary = revenue.data as unknown as Record<string, unknown> | undefined;
    const value = summary?.totalRevenue ?? summary?.revenue;
    if (typeof value === 'number') return value;
    return orders.data?.totalAmount ?? 0;
  }, [revenue.data, orders.data]);

  const isLoading =
    events.isLoading || tickets.isLoading || orders.isLoading || payments.isLoading || revenue.isLoading || notifications.isLoading;
  const anyError =
    events.error ?? tickets.error ?? orders.error ?? payments.error ?? revenue.error ?? notifications.error ?? null;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={isPlatformAdmin
          ? 'Platform-wide snapshot across all user workspaces.'
          : 'Live operations snapshot from your private workspace.'}
      />

      <QueryState
        isLoading={isLoading}
        error={anyError}
        loadingVariant="cards"
        onRetry={() => {
          void Promise.all([
            events.refetch(), tickets.refetch(), orders.refetch(), payments.refetch(),
            revenue.refetch(), notifications.refetch(),
          ]);
        }}
        isEmpty={false}
        emptyTitle="No data yet"
        rows={4}
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Events"
            value={events.data?.total ?? 0}
            hint={`${events.data?.upcoming ?? 0} upcoming`}
            icon={CalendarDays}
          />
          <StatCard label="Tickets" value={tickets.data?.total ?? 0} icon={TicketIcon} />
          <StatCard
            label="Orders"
            value={orders.data?.total ?? 0}
            icon={ShoppingCart}
          />
          <StatCard
            label="Revenue"
            value={formatCurrency(revenueTotal)}
            tone="good"
            icon={CreditCard}
          />
        </div>

        <div className="mt-3 grid max-w-xl grid-cols-2 gap-3">
          {isPlatformAdmin && <div className="flex items-center justify-between rounded-lg border border-[#27292d] bg-[#18191c] px-3 py-2.5">
            <span className="flex items-center gap-2 text-xs text-[#868a91]"><Mail className="h-3.5 w-3.5 text-[#3574f0]" />Notifications</span>
            <span className="font-jetbrains text-sm font-semibold text-[#dfe1e5]">{notifications.data?.total ?? 0}</span>
          </div>}
          <div className="flex items-center justify-between rounded-lg border border-[#27292d] bg-[#18191c] px-3 py-2.5">
            <span className="flex items-center gap-2 text-xs text-[#868a91]"><TicketIcon className="h-3.5 w-3.5 text-[#ffc66d]" />Tickets sold</span>
            <span className="font-jetbrains text-sm font-semibold text-[#ffc66d]">{tickets.data?.byStatus?.SOLD ?? 0}</span>
          </div>
        </div>

        {isPlatformAdmin && (
          <section className="mt-6" aria-label="CEO workspace totals">
            <div className="mb-2 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[#d7dae0]">All workspaces</h2>
                <p className="mt-0.5 text-[11px] text-[#9da0a8]">CEO view · totals are isolated by workspace before aggregation.</p>
              </div>
              <Link to="/admin/users" className="text-xs font-medium text-[#3574f0] hover:underline">User directory</Link>
            </div>
            <QueryState
              isLoading={workspaceOverview.isLoading}
              error={workspaceOverview.error}
              isEmpty={(workspaceOverview.data ?? []).length === 0}
              onRetry={() => { void workspaceOverview.refetch(); }}
              emptyTitle="No workspaces yet"
              emptyDescription="Workspace totals will appear after users sign in with Google."
              rows={3}
            >
              <Table>
                <thead><tr>
                  <Th>Workspace / owner</Th><Th>Users</Th><Th>Events</Th><Th>Tickets</Th>
                  <Th>Orders</Th><Th>Order value</Th><Th>Payments</Th><Th>Paid</Th>
                </tr></thead>
                <tbody>
                  {(workspaceOverview.data ?? []).map((workspace) => (
                    <tr key={workspace.workspaceId} className="border-t border-[#3c3f41]">
                      <Td>
                        <p className="font-medium">{workspace.workspaceName}</p>
                        <p className="mt-0.5 text-[11px] text-[#9da0a8]">{workspace.ownerEmail ?? workspace.ownerUsername ?? 'No owner'} · {workspace.status}</p>
                      </Td>
                      <Td>{workspace.userCount}</Td>
                      <Td>{workspace.eventCount}</Td>
                      <Td>{workspace.ticketCount}</Td>
                      <Td>{workspace.orderCount}</Td>
                      <Td>{formatCurrency(workspace.orderAmount)}</Td>
                      <Td>{workspace.paymentCount}</Td>
                      <Td className="font-medium text-[#4ec9b0]">{formatCurrency(workspace.completedPaymentAmount)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </QueryState>
          </section>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card className="p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-[#d7dae0]">Events by status</h2>
            <p className="mt-0.5 text-[11px] text-[#9da0a8]">
              {events.data?.total ?? 0} total
            </p>
            <dl className="mt-3 space-y-1.5">
              {Object.entries(events.data?.byStatus ?? {}).length === 0 && (
                <li className="text-xs text-[#9da0a8]">No status data yet.</li>
              )}
              {Object.entries(events.data?.byStatus ?? {}).map(([status, count]) => (
                <li key={status} className="flex items-center justify-between gap-2">
                  <Badge status={status} />
                  <span className="text-xs font-medium text-[#c4c7ce]">{count}</span>
                </li>
              ))}
            </dl>
          </Card>

          <Card className="p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-[#d7dae0]">Orders by status</h2>
            <p className="mt-0.5 text-[11px] text-[#9da0a8]">
              {formatCurrency(orders.data?.totalAmount)} booked
            </p>
            <dl className="mt-3 space-y-1.5">
              {Object.entries(orders.data?.byStatus ?? {}).length === 0 && (
                <li className="text-xs text-[#9da0a8]">No orders yet.</li>
              )}
              {Object.entries(orders.data?.byStatus ?? {}).map(([status, count]) => (
                <li key={status} className="flex items-center justify-between gap-2">
                  <Badge status={status} />
                  <span className="text-xs font-medium text-[#c4c7ce]">{count}</span>
                </li>
              ))}
            </dl>
          </Card>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#d7dae0]">Recent payments</h2>
            <Link to="/admin/payments" className="text-xs font-medium text-[#3574f0] hover:underline">
              View all
            </Link>
          </div>
          <QueryState
            isLoading={payments.isLoading}
            error={payments.error}
            onRetry={() => { void payments.refetch(); }}
            isEmpty={recentPayments.length === 0}
            emptyTitle="No payments yet"
            emptyDescription="Payments appear here once an order is completed."
            rows={3}
          >
            <Table>
              <thead>
                <tr>
                  <Th>Transaction</Th>
                  <Th>Order</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr key={payment.paymentId} className="border-t border-[#3c3f41]">
                    <Td className="font-mono text-[11px] text-[#9da0a8]">
                      {payment.transactionId}
                    </Td>
                    <Td>#{payment.orderId}</Td>
                    <Td className="font-medium">
                      {formatCurrency(payment.amount, payment.currency || 'USD')}
                    </Td>
                    <Td>
                      <Badge status={payment.paymentStatus ?? 'UNKNOWN'} />
                    </Td>
                    <Td className="text-[#9da0a8]">{formatDateTime(payment.paymentDate)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </QueryState>
        </div>
      </QueryState>
    </>
  );
};

export default Dashboard;
