import { useQuery } from '@tanstack/react-query';
import { api } from '../services/apiClient';
import { EventItem, Order, Ticket, TicketStatus, TicketType } from '../types';
import { SeatView } from '../components/store/SeatMap';

export const QUERY_KEYS = {
  events: ['events'] as const,
  tickets: ['tickets'] as const,
  orders: ['orders'] as const,
  payments: ['payments'] as const,
  users: ['users'] as const,
  notifications: ['notifications'] as const,
  routes: ['routes'] as const,
  services: ['services'] as const,
  errors: ['errors'] as const,
};

async function get<T>(endpoint: string, fallback: T): Promise<T> {
  try {
    const res = await api.request<T>('GET', endpoint);
    return (res.data as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export const useEvents = () =>
  useQuery<EventItem[]>({ queryKey: QUERY_KEYS.events, queryFn: () => get<EventItem[]>('/api/v1/events', []) });

export const useTickets = () =>
  useQuery<Ticket[]>({ queryKey: QUERY_KEYS.tickets, queryFn: () => get<Ticket[]>('/api/v1/tickets', []) });

export const useOrders = () =>
  useQuery<Order[]>({ queryKey: QUERY_KEYS.orders, queryFn: () => get<Order[]>('/api/v1/orders', []) });

export const useEventTickets = (eventId: number | undefined) => {
  const events = useEvents();
  const tickets = useTickets();
  const event = events.data?.find((e) => e.id === eventId);
  const eventTickets = event ? tickets.data?.filter((t) => t.eventId === event.id) ?? [] : [];
  return { event, tickets: eventTickets, isLoading: events.isLoading || tickets.isLoading };
};

const tierByIndex = (index: number, total: number): TicketType => {
  const ratio = index / Math.max(1, total);
  if (ratio < 0.18) return 'VIP';
  if (ratio < 0.6) return 'REGULAR';
  return 'STUDENT';
};

const priceForTier = (base: number, tier: TicketType): number => {
  if (tier === 'VIP') return Math.round(base * 2.2);
  if (tier === 'REGULAR') return base;
  return Math.round(base * 0.6);
};

const statusIndex = ['AVAILABLE', 'LOCKED', 'SOLD', 'SOLD', 'AVAILABLE', 'AVAILABLE', 'LOCKED', 'AVAILABLE', 'SOLD', 'AVAILABLE'];

/**
 * Build a deterministic, full venue seat grid for an event.
 * Real tickets are preferred; remaining seats are generated so every event
 * shows a rich interactive map.
 */
export function buildSeatMap(event: EventItem | undefined, tickets: Ticket[]): SeatView[] {
  const base = event?.basePrice ?? 25;
  const capacity = Math.max(0, event?.totalTickets ?? tickets.length);

  const real: SeatView[] = tickets.map((t, index) => ({
    id: t.id,
    code: t.seatNumber || t.ticketCode,
    status: t.ticketStatus as TicketStatus,
    tier: t.ticketType,
    price: t.price || priceForTier(base, t.ticketType),
  }));

  const needed = Math.max(capacity, real.length);
  const generated: SeatView[] = [];
  for (let i = real.length; i < needed; i++) {
    const row = Math.floor(i / 10);
    const seatInRow = i % 10;
    const letter = String.fromCharCode(65 + row);
    const index = i % statusIndex.length;
    generated.push({
      id: -(i + 1),
      code: `${letter}${String(seatInRow + 1).padStart(2, '0')}`,
      status: (statusIndex[index % (row === 0 ? 5 : statusIndex.length)] as TicketStatus) ||
        ('AVAILABLE' as TicketStatus),
      tier: tierByIndex(i, needed),
      price: priceForTier(base, tierByIndex(i, needed)),
    });
  }

  return [...real, ...generated];
}

/** Canonical order for grouping seats. */
export const tierWeight: Record<TicketType, number> = { VIP: 0, REGULAR: 1, STUDENT: 2, EARLY_BIRD: 3 };