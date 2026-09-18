import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { EventItem, Order, Payment, PaymentMethod } from '../types';
import { SeatView } from '../components/store/SeatMap';

export interface PendingBooking {
  event: EventItem;
  seats: SeatView[];
}

export interface OrderResult {
  order: Order;
  payment?: Payment;
  notifiedAt?: string;
}

interface BookingContextValue {
  pending: PendingBooking | null;
  lastOrder: OrderResult | null;
  setPending: (booking: PendingBooking | null) => void;
  setLastOrder: (result: OrderResult | null) => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

function loadPersisted(): PendingBooking | null {
  try {
    const raw = localStorage.getItem('tsm_pending_booking');
    return raw ? (JSON.parse(raw) as PendingBooking) : null;
  } catch {
    return null;
  }
}

export const BookingProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [pending, setPendingState] = useState<PendingBooking | null>(loadPersisted);
  const [lastOrder, setLastOrder] = useState<OrderResult | null>(null);

  const setPending = useCallback((booking: PendingBooking | null) => {
    setPendingState(booking);
    if (booking) localStorage.setItem('tsm_pending_booking', JSON.stringify(booking));
    else localStorage.removeItem('tsm_pending_booking');
  }, []);

  const value = useMemo<BookingContextValue>(
    () => ({ pending, lastOrder, setPending, setLastOrder }),
    [pending, lastOrder, setPending]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBooking = (): BookingContextValue => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider');
  return ctx;
};

export type { PaymentMethod };