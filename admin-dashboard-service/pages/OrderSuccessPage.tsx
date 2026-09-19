'use client';

import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Printer, Home, Mail, CalendarDays, MapPin, Ticket, Download } from 'lucide-react';
import { useOrders } from '../../lib/catalog';
import { useBooking } from '../../lib/booking';
import { useLanguage } from '../../i18n';
import { Button, Card, CardContent, Badge } from '../ui';
import { formatDate, formatMoney } from '../../lib/format';
import { Order } from '../../types';

const PseudoQR: React.FC<{ seed: string; size?: number }> = ({ seed, size = 12 }) => {
  const cells = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    let x = hash;
    const rand = () => {
      x = (x * 1103515245 + 12345) >>> 0;
      return x / 4294967296;
    };
    const grid: boolean[][] = [];
    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        const isFinder = (r < 4 && c < 4) || (r < 4 && c >= size - 4) || (r >= size - 4 && c < 4);
        row.push(isFinder ? !((r + c) % 3 === 0) : rand() > 0.52);
      }
      grid.push(row);
    }
    return grid;
  }, [seed, size]);

  return (
    <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${size}, minmax(0,1fr))`, width: 132, height: 132 }}>
      {cells.map((row, r) => row.map((on, c) => (
        <div key={`${r}-${c}`} className={on ? 'bg-slate-900 dark:bg-slate-100 rounded-[1.5px]' : 'bg-transparent'} />
      )))}
    </div>
  );
};

const seatCodes = (order: Order): string[] => {
  const code = order.ticketCode || '';
  return code.split(',').map((s) => s.trim()).filter(Boolean);
};

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isKhmer } = useLanguage();
  const navigate = useNavigate();
  const { lastOrder } = useBooking();
  const { data: orders = [] } = useOrders();

  const order = useMemo(
    () => lastOrder?.order ?? orders.find((o) => String(o.id) === id) ?? null,
    [lastOrder, orders, id]
  );

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="text-4xl mb-3">🔍</div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{isKhmer ? 'រកមិនឃើញការកុម្ម៉ង់' : 'Order not found'}</h1>
        <Button className="mt-6" onClick={() => navigate('/')}>{isKhmer ? 'ទៅទំព័រដើម' : 'Go home'}</Button>
      </div>
    );
  }

  const codes = seatCodes(order);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Success banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{isKhmer ? 'ការទិញទទួលបានជោគជ័យ!' : 'Purchase confirmed!'}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          {isKhmer
            ? `ការកុម្ម៉ង់ ${order.orderNumber} ត្រូវបានផ្ទៀងផ្ទាត់។ សំបុត្រអេឡិចត្រូនិកត្រូវបានផ្ញើទៅកាន់អ៊ីមែលរបស់អ្នក។`
            : `Order ${order.orderNumber} verified. Your e-ticket has been emailed to you.`}
        </p>
      </div>

      {/* E-ticket */}
      <div className="relative bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 text-white px-8 py-6">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-slate-300 mb-2">
            <Ticket className="w-4 h-4" /> {isKhmer ? 'ប័ណ្ណចូលអេឡិចត្រូនិក' : 'E-TICKET'} · {order.orderNumber}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">{order.eventTitle}</h2>
        </div>

        <div className="px-8 py-6 grid sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{isKhmer ? 'កាលបរិច្ឆេទ' : 'Date & time'}</div>
              <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-1">
                <CalendarDays className="w-4 h-4 text-orange-500" /> {formatDate(order.orderDate, true)}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{isKhmer ? 'កៅអី' : 'Seats'}</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {codes.map((code) => (
                  <span key={code} className="px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 text-xs font-bold">
                    {code}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{isKhmer ? 'អ្នកទិញ' : 'Buyer'}</div>
              <div className="font-semibold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500" /> {order.username}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 border-l border-dashed border-slate-200 dark:border-slate-700 pl-6">
            <PseudoQR seed={`${order.orderNumber}-${order.ticketCode}-${order.id}`} />
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{order.orderNumber}</span>
          </div>
        </div>

        <div className="mx-8 h-px bg-dashed bg-slate-200 dark:bg-slate-700" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #e2e8f0 0 8px, transparent 8px 16px)' }} />

        <div className="px-8 py-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {isKhmer ? 'បង្ហាញសំបុត្រនេះត្រង់ច្រកចូល' : 'Show this pass at the entrance'}</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">{formatMoney(order.amount)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3 mt-8">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4" /> {isKhmer ? 'បោះពុម្ព' : 'Print'}
        </Button>
        <Button onClick={() => navigate('/tickets')}>
          <Ticket className="w-4 h-4" /> {isKhmer ? 'សំបុត្ររបស់ខ្ញុំ' : 'My tickets'}
        </Button>
        <Button variant="ghost" onClick={() => navigate('/')}>
          <Home className="w-4 h-4" /> {isKhmer ? 'ទំព័រដើម' : 'Home'}
        </Button>
      </div>
    </div>
  );
};

export default OrderSuccessPage;