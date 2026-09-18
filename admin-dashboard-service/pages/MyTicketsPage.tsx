import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, Ticket, Search } from 'lucide-react';
import { useOrders, useEvents } from '../lib/catalog';
import { useLanguage } from '../i18n';
import { EmptyState, Badge, Input } from '../components/ui';
import { Spinner } from '../components/ui/Button';
import { formatDate, formatMoney } from '../lib/format';

export const MyTicketsPage: React.FC = () => {
  const { isKhmer } = useLanguage();
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useOrders();
  const { data: events = [] } = useEvents();
  const [q, setQ] = useState('');

  const mine = useMemo(() => {
    const purchased = orders.filter((o) => o.orderStatus === 'COMPLETED' || o.orderStatus === 'PROCESSING');
    if (!q) return purchased;
    return purchased.filter((o) => `${o.eventTitle} ${o.orderNumber}`.toLowerCase().includes(q.toLowerCase()));
  }, [orders, q]);

  const venueOf = (eventId: number) => events.find((e) => e.id === eventId)?.location ?? '';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">{isKhmer ? 'សំបុត្ររបស់ខ្ញុំ' : 'My tickets'}</h1>
          <p className="text-sm text-ink-soft mt-1">{isKhmer ? 'សំបុត្រ និងប័ណ្ណចូលរបស់អ្នក' : 'Your passes & tickets'}</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
          <Input className="pl-10 w-64" placeholder={isKhmer ? 'ស្វែងរក...' : 'Search...'} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24"><Spinner className="w-8 h-8 text-brand-600" /></div>
      ) : mine.length === 0 ? (
        <div className="bg-white rounded-2xl border border-line shadow-card">
          <EmptyState
            icon={Ticket}
            title={isKhmer ? 'មិនទាន់មានសំបុត្រ' : 'No tickets yet'}
            message={isKhmer ? 'ស្វែងរកកម្មវិធី ហើយកក់សំបុត្រដំបូងរបស់អ្នក!' : 'Find an event and grab your first ticket!'}
            action={
              <Link to="/events" className="inline-flex px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-semibold shadow-glow hover:brightness-110 transition">
                {isKhmer ? 'ស្វែងរកកម្មវិធី' : 'Browse events'}
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {mine.map((order) => (
            <button
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="group relative bg-white rounded-2xl border border-line shadow-card overflow-hidden text-left hover:shadow-soft hover:-translate-y-0.5 transition"
            >
              <div className="bg-hero-grid h-2" />
              <div className="p-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge tone={order.orderStatus === 'COMPLETED' ? 'green' : 'amber'} dot pulse={order.orderStatus === 'PROCESSING'}>
                      {order.orderStatus}
                    </Badge>
                    <span className="text-[10px] font-mono text-ink-soft">{order.orderNumber}</span>
                  </div>
                  <h3 className="font-display font-semibold text-ink leading-snug group-hover:text-brand-700 transition line-clamp-2">
                    {order.eventTitle}
                  </h3>
                  <div className="mt-2.5 flex items-center gap-2 text-xs text-ink-soft">
                    <CalendarDays className="w-3.5 h-3.5 text-brand-500" /> {formatDate(order.orderDate, true)}
                  </div>
                  {venueOf(order.eventId) && (
                    <div className="mt-1 text-xs text-ink-soft">{venueOf(order.eventId)}</div>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-brand-50 border border-brand-100 text-brand-700 text-[11px] font-bold">
                      {order.ticketCode}
                    </span>
                    <span className="text-[11px] text-ink-soft">× {order.quantity}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display text-lg font-bold text-ink">{formatMoney(order.amount)}</div>
                  <div className="text-[11px] text-brand-700 font-semibold mt-2 group-hover:underline">
                    {isKhmer ? 'មើលប័ណ្ណចូល →' : 'View pass →'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;