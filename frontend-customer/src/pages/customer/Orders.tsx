import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Ticket } from 'lucide-react';
import { QueryState } from 'frontend-shared/components/QueryState';
import { useUserOrders } from 'frontend-shared/hooks/useApi';
import type { Order } from 'frontend-shared/types/api';

const money = (value: number | null) =>
  value == null ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const statusClass = (status: string | null | undefined) => {
  const base = 'inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider';
  const map: Record<string, string> = {
    PENDING: 'border-[#f0c040]/40 bg-[#3d3218] text-[#f0c040]',
    PROCESSING: 'border-[#8fb3ff]/40 bg-[#1b3158] text-[#b8d0ff]',
    COMPLETED: 'border-[#4ec9b0]/40 bg-[#15302a] text-[#4ec9b0]',
    CANCELLED: 'border-[#737b8a]/40 bg-[#1f2228] text-[#868a91]',
  };
  return `${base} ${map[status ?? ''] ?? 'border-[#303844] bg-[#141920] text-[#aeb6c3]'}`;
};

export default function CustomerOrders() {
  const ordersQuery = useUserOrders();
  const orders = ordersQuery.data ?? [];

  const total = useMemo(() => orders.reduce((sum: number, order: Order) => sum + (order.amount ?? 0), 0), [orders]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/events" className="inline-flex items-center gap-2 text-xs text-[#9da0a8] hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Browse events
        </Link>
      </div>
      <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white">My orders</h1>
      <p className="mt-2 text-sm leading-6 text-[#9da0a8]">Your purchase history for this workspace.</p>

      <QueryState
        isLoading={ordersQuery.isLoading}
        error={ordersQuery.error as Error | null}
        isEmpty={!orders.length}
        onRetry={() => void ordersQuery.refetch()}
        emptyTitle="No orders yet"
        emptyDescription="When you reserve tickets, your order history will appear here."
      >
        <div className="mt-5 space-y-3">
          {orders.map((order: Order) => (
            <div key={order.id} className="rounded-2xl border border-[#2b3038] bg-[#181d25] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#2b3d60] bg-[#1b3158] text-[#8fb3ff]">
                    <Ticket className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Order #{order.id}</p>
                    <p className="text-xs text-[#868a91]">Event #{order.eventId} · Ticket #{order.ticketId}</p>
                  </div>
                </div>
                <span className={statusClass(order.orderStatus)}>{order.orderStatus ?? '—'}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#737b8a]">Quantity</p>
                  <p className="mt-1 text-sm font-semibold text-white">{order.quantity}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#737b8a]">Amount</p>
                  <p className="mt-1 text-sm font-semibold text-[#ffc66d]">{money(order.amount)}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#737b8a]">Payment</p>
                  <p className="mt-1 text-sm font-semibold text-white">{String(order.paymentId ?? '—')}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#737b8a]">Date</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {order.orderDate ? new Date(order.orderDate).toLocaleString() : '—'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {orders.length > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#2b3038] bg-[#181d25] px-5 py-3 text-xs text-[#9da0a8]">
            <span>{orders.length} order{orders.length === 1 ? '' : 's'} total</span>
            <span className="text-sm font-semibold text-[#ffc66d]">Total {money(total)}</span>
          </div>
        )}
      </QueryState>
    </div>
  );
}
