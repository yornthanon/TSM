import React, { useMemo, useState } from 'react';
import { clsx } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Lock, Check } from 'lucide-react';
import { TicketStatus, TicketType } from '../../types';

export interface SeatView {
  id: number;
  code: string;
  status: TicketStatus;
  tier: TicketType;
  price: number;
}

interface SeatMapProps {
  seats: SeatView[];
  isKhmer: boolean;
  onBook: (selected: SeatView[]) => void;
}

const tierStyles: Record<TicketType, string> = {
  VIP: 'bg-brand-100 text-brand-800 border-brand-300',
  REGULAR: 'bg-white text-ink border-line',
  STUDENT: 'bg-amber-50 text-amber-700 border-amber-200',
  EARLY_BIRD: 'bg-teal-50 text-teal-700 border-teal-200',
};

const tierPrices: Record<TicketType, { label: string; labelKm: string }> = {
  VIP: { label: 'VIP', labelKm: 'VIP' },
  REGULAR: { label: 'Regular', labelKm: 'ធម្មតា' },
  STUDENT: { label: 'Student', labelKm: 'និស្សិត' },
  EARLY_BIRD: { label: 'Early Bird', labelKm: 'បញ្ចុះតម្លៃ' },
};

export const SeatMap: React.FC<SeatMapProps> = ({ seats, isKhmer, onBook }) => {
  const [selected, setSelected] = useState<number[]>([]);

  const grid = useMemo(() => {
    const rows: SeatView[][] = [];
    const perRow = 10;
    seats.forEach((seat, index) => {
      const rowIndex = Math.floor(index / perRow);
      if (!rows[rowIndex]) rows[rowIndex] = [];
      rows[rowIndex].push(seat);
    });
    return rows;
  }, [seats]);

  const toggle = (seat: SeatView) => {
    if (seat.status !== 'AVAILABLE') return;
    setSelected((prev) =>
      prev.includes(seat.id) ? prev.filter((id) => id !== seat.id) : [...prev, seat.id]
    );
  };

  const selectedSeats = seats.filter((s) => selected.includes(s.id));
  const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="bg-gradient-to-b from-brand-50/60 to-surface rounded-2xl border border-line p-5 sm:p-7">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-ink-soft mb-5">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-md bg-white border border-line" /> {isKhmer ? 'ទំនេរ' : 'Available'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-md bg-brand-600" /> {isKhmer ? 'បានជ្រើស' : 'Selected'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-md bg-rose-100 border border-rose-200" /> {isKhmer ? 'រក្សាទុក' : 'Locked'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-md bg-brand-50 border border-brand-200" /> {isKhmer ? 'លក់អស់' : 'Sold'}
        </span>
        <div className="ml-auto flex gap-2">
          {Object.entries(tierStyles).map(([tier, cls]) => (
            <span key={tier} className={clsx('px-2 py-0.5 rounded-full border text-[10px] font-semibold', tierStyles[tier as TicketType])}>
              {isKhmer ? tierPrices[tier as TicketType].labelKm : tierPrices[tier as TicketType].label}
            </span>
          ))}
        </div>
      </div>

      {/* Stage */}
      <div className="mx-auto max-w-md mb-8">
        <div className="h-2.5 rounded-full bg-gradient-brand mx-8 opacity-90" />
        <div className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700/70 mt-1.5">
          {isKhmer ? '— ឆាក —' : '— STAGE —'}
        </div>
      </div>

      {/* Seats */}
      <div className="flex flex-col items-center gap-1.5">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-1.5">
            <span className="w-4 text-[10px] font-bold text-ink-soft text-right mr-1">
              {String.fromCharCode(65 + rowIndex)}
            </span>
            {row.map((seat) => {
              const isSelected = selected.includes(seat.id);
              const unavailable = seat.status === 'LOCKED' || seat.status === 'SOLD' || seat.status === 'CANCELLED';
              const statusCls =
                seat.status === 'LOCKED'
                  ? 'bg-rose-100 border-rose-200 text-rose-400 cursor-not-allowed'
                  : unavailable
                    ? 'bg-brand-50 border-brand-100 text-brand-200 cursor-not-allowed'
                    : isSelected
                      ? 'bg-brand-600 border-brand-600 text-white shadow-glow'
                      : tierStyles[seat.tier];
              return (
                <button
                  key={seat.id}
                  title={`${seat.code} · $${seat.price}`}
                  onClick={() => toggle(seat)}
                  className={clsx(
                    'w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center text-[10px] font-bold transition',
                    statusCls,
                    seat.status === 'AVAILABLE' && !isSelected && 'hover:scale-110 hover:border-brand-400 hover:shadow-sm'
                  )}
                >
                  {seat.status === 'LOCKED' ? (
                    <Lock className="w-3 h-3" />
                  ) : unavailable ? (
                    <span className="opacity-60">×</span>
                  ) : isSelected ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    seat.code.split('-').pop()
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Booking bar */}
      <div className="mt-7 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur border border-line rounded-2xl p-4 shadow-card">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
            {isKhmer ? 'កៅអីបានជ្រើស' : 'Selected seats'}
          </div>
          <div className="font-display text-xl font-bold text-ink mt-0.5">
            {selectedSeats.length === 0 ? (
              <span className="text-sm font-medium text-ink-soft">—</span>
            ) : (
              <span className="flex items-center gap-1.5 flex-wrap">
                {selectedSeats.map((s) => (
                  <Badge key={s.id} tone="brand">{s.code}</Badge>
                ))}
              </span>
            )}
          </div>
          <div className="text-xs text-ink-soft mt-1">
            {isKhmer ? 'សរុប' : 'Total'}: <span className="font-bold text-ink">${total.toFixed(2)}</span>
          </div>
        </div>
        <button
          onClick={() => selectedSeats.length > 0 && onBook(selectedSeats)}
          disabled={selectedSeats.length === 0}
          className={clsx(
            'px-6 py-3 rounded-xl font-semibold transition whitespace-nowrap',
            selectedSeats.length === 0
              ? 'bg-line text-ink-soft cursor-not-allowed'
              : 'bg-gradient-brand text-white shadow-glow hover:brightness-110'
          )}
        >
          {isKhmer ? `កក់សំបុត្រ (${selectedSeats.length})` : `Book selected (${selectedSeats.length})`}
        </button>
      </div>
    </div>
  );
};

export default SeatMap;