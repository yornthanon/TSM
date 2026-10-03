import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  Mail,
  ShoppingCart,
  Ticket as TicketIcon,
} from 'lucide-react';
import { useEventStats, useNotificationStats, useOrderStats, usePayments, useRevenueSummary, useTicketStats } from '../../hooks/useApi';
import { PageHeader, QueryState, StatCard, Table, Td, Th } from '../../components/QueryState';
import { Badge, Card } from '../../components/ui';
import { formatCurrency, formatDateTime } from '../../utils';

/** Latest activity across orders and payments, the two streams with timestamps. */
const Dashboard: React.FC = () => {
  const events = useEventStats();
  const tickets = useTicketStats();
  const orders = useOrderStats();
  const payments = usePayments();
  const revenue = useRevenueSummary();
  const notifications = useNotificationStats();

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
    events.isLoading || tickets.isLoading || orders.isLoading || payments.isLoading;
  const anyError =
    events.error ?? tickets.error ?? orders.error ?? payments.error ?? null;

  return (
    <>
      <PageHeader
        title="Overview"
        description="Live figures read directly from each service's stats endpoint."
      />

      <QueryState
        isLoading={isLoading}
        error={anyError}
        isEmpty={false}
        emptyTitle="No data yet"
        rows={4}
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
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
          <StatCard
            label="Notifications"
            value={notifications.data?.total ?? 0}
            icon={Mail}
          />
          <StatCard
            label="Tickets sold"
            value={tickets.data?.byStatus?.SOLD ?? 0}
            tone="warn"
            icon={LayoutDashboard}
          />
        </div>

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
