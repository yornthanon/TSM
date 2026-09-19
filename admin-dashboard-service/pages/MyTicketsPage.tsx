'use client';

import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, Ticket, Search, Download } from 'lucide-react';
import { useOrders, useEvents } from '../../lib/catalog';
import { useLanguage } from '../i18n';
import { EmptyState, Badge, Input, Button, Skeleton } from '../ui';
import { formatDate, formatMoney } from '../../lib/format';

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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{isKhmer ? 'សំបុត្ររបស់ខ្ញុំ' : 'My tickets'}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{isKhmer ? 'សំបុត្រ និងប័ណ្ណចូលរបស់អ្នក' : 'Your passes & tickets'}</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input className="pl-10 w-64" placeholder={isKhmer ? 'ស្វែងរក...' : 'Search...'} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : mine.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <EmptyState
            icon={Ticket}
            title={isKhmer ? 'មិនទាន់មានសំបុត្រ' : 'No tickets yet'}
            message={isKhmer ? 'ស្វែងរកកម្មវិធី ហើយកក់សំបុត្រដំបូងរបស់អ្នក!' : 'Find an event and grab your first ticket!'}
            action={
              <Link to="/events" className="inline-flex px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition">
                {isKhmer ? 'ស្វែងរកកម្មវិធី' : 'Browse events'}
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {mine.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition"
            >
              <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-950 h-2" />
              <div className="p-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge
                      variant={order.orderStatus === 'COMPLETED' ? 'success' : 'warning'}
                      className="gap-1"
                    >
                      {order.orderStatus}
                    </Badge>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{order.orderNumber}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition line-clamp-2">
                    {order.eventTitle}
                  </h3>
                  <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <CalendarDays className="w-3.5 h-3.5 text-orange-500" /> {formatDate(order.orderDate, true)}
                  </div>
                  {venueOf(order.eventId) && (
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{venueOf(order.eventId)}</div>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-orange-500/10 border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 text-[11px] font-bold">
                      {order.ticketCode}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">× {order.quantity}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{formatMoney(order.amount)}</div>
                  <div className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold mt-2 group-hover:underline">
                    {isKhmer ? 'មើលប័ណ្ណចូល →' : 'View pass →'}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <Skeleton className="h-2 w-full" variant="rectangular" />
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16" variant="rectangular" />
          <Skeleton className="h-4 w-20" variant="rectangular" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-1.5 w-full" variant="rectangular" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export default MyTicketsPage;