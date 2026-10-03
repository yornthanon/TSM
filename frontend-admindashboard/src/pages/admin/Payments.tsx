import React from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { toast } from 'sonner';
import { usePayments, useRefundPayment, useRevenueSummary } from '../../hooks/useApi';
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
import { Badge, Card, ConfirmDialog, Input } from '../../components/ui';
import { formatCurrency, formatDateTime } from '../../utils';
import {
  PAYMENT_STATUSES,
  type Payment,
} from '../../types/api';

/** Only a completed payment that the server identified can be refunded. */
const canRefund = (payment: Payment) =>
  payment.paymentId !== null && payment.paymentStatus === 'COMPLETED';

const refundDisabledReason = (payment: Payment) => {
  if (payment.paymentId === null) return 'This payment has no id, so it cannot be refunded';
  if (payment.paymentStatus !== 'COMPLETED') {
    return `Only COMPLETED payments can be refunded (this one is ${payment.paymentStatus ?? 'unknown'})`;
  }
  return 'Refund';
};

const Payments: React.FC = () => {
  const payments = usePayments();
  const revenue = useRevenueSummary();
  const refundPayment = useRefundPayment();

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [refundTarget, setRefundTarget] = React.useState<Payment | null>(null);

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return (payments.data ?? []).filter((payment) => {
      const matchesTerm =
        !term ||
        payment.transactionId?.toLowerCase().includes(term) ||
        String(payment.orderId) === term;
      const matchesStatus = !statusFilter || payment.paymentStatus === statusFilter;
      return matchesTerm && matchesStatus;
    });
  }, [payments.data, search, statusFilter]);

  const paged = usePagedRows(filtered, 10);

  const summary = revenue.data;
  const byStatus = summary?.byStatus ?? {};

  return (
    <>
      <PageHeader
        title="Payments"
        description="Every payment transaction recorded by the payment service."
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Revenue" value={formatCurrency(summary?.totalRevenue)} tone="good" />
        <StatCard label="Transactions" value={summary?.totalTransactions ?? payments.data?.length ?? 0} />
        <StatCard label="Completed" value={byStatus.COMPLETED ?? '-'} tone="good" />
        <StatCard
          label="Failed"
          value={byStatus.FAILED ?? '-'}
          tone={byStatus.FAILED ? 'bad' : 'default'}
        />
      </div>

      <Card className="mb-4 p-3 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Search by transaction id or order"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={Search}
              aria-label="Search payments"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="rounded-lg border border-[#3c3f41] bg-white px-3 py-2 text-[13px] text-[#c4c7ce]"
          >
            <option value="">All statuses</option>
            {PAYMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <QueryState
        isLoading={payments.isLoading}
        error={payments.error}
        isEmpty={filtered.length === 0}
        onRetry={() => void payments.refetch()}
        emptyTitle={search || statusFilter ? 'No payments match your filters' : 'No payments yet'}
        emptyDescription="Payments appear here once an order is paid."
      >
        <Table>
          <thead>
            <tr>
              <Th>Transaction</Th>
              <Th>Order</Th>
              <Th>Amount</Th>
              <Th>Currency</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {paged.visible.map((payment) => (
              <tr key={payment.paymentId ?? `${payment.orderId}-${payment.paymentDate}`} className="border-t border-[#3c3f41]">
                <Td className="font-mono text-[11px] text-[#9da0a8]">
                  {payment.transactionId ?? '-'}
                </Td>
                <Td className="font-medium">#{payment.orderId}</Td>
                <Td className="font-medium">
                  {formatCurrency(payment.amount, payment.currency || 'USD')}
                </Td>
                <Td className="text-[#9da0a8]">{payment.currency ?? '-'}</Td>
                <Td>
                  <Badge status={payment.paymentStatus ?? 'UNKNOWN'} />
                </Td>
                <Td className="whitespace-nowrap text-[#9da0a8]">
                  {formatDateTime(payment.paymentDate)}
                </Td>
                <Td>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      title={refundDisabledReason(payment)}
                      aria-label={`Refund payment ${payment.transactionId ?? payment.orderId}`}
                      disabled={refundPayment.isPending || !canRefund(payment)}
                      onClick={() => setRefundTarget(payment)}
                      className="rounded-md p-1.5 text-[#9da0a8] hover:bg-[#313335] disabled:cursor-not-allowed disabled:text-[#9da0a8]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
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
        open={refundTarget !== null}
        onClose={() => setRefundTarget(null)}
        onConfirm={() => {
          // The action is only reachable for rows that pass canRefund().
          if (!refundTarget || refundTarget.paymentId === null) return;
          const { paymentId } = refundTarget;
          refundPayment.mutate(paymentId, {
            onSuccess: () => {
              toast.success(`Refunded ${formatCurrency(refundTarget.amount, refundTarget.currency)}`);
              setRefundTarget(null);
            },
            onError: (e) => {
              toast.error(e.message);
              setRefundTarget(null);
            },
          });
        }}
        title="Refund payment"
        description={`Refund ${formatCurrency(refundTarget?.amount, refundTarget?.currency)} from transaction ${refundTarget?.transactionId ?? ''}?`}
        confirmLabel="Refund"
        loading={refundPayment.isPending}
      />
    </>
  );
};

export default Payments;
