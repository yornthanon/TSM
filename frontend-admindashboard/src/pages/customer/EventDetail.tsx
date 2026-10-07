import { useMemo } from 'react';
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, MapPin, Ticket as TicketIcon } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { QueryState } from '../../components/QueryState';
import { useEvent, useTickets } from '../../hooks/useApi';
import type { Ticket } from '../../types/api';
import { Button } from '../../components/ui';

const dateLabel = (value: string | null) => value ? new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(value)) : 'Date to be announced';
const money = (value: number | null) => value == null ? 'Price to be announced' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export default function CustomerEventDetail() {
  const { id = '' } = useParams();
  const eventQuery = useEvent(id);
  const ticketsQuery = useTickets();
  const event = eventQuery.data;
  const tickets = useMemo(() => (ticketsQuery.data ?? []).filter((ticket) => String(ticket.eventId) === String(id)), [ticketsQuery.data, id]);
  const available = tickets.filter((ticket) => ticket.ticketStatus === 'AVAILABLE');
  const byType = tickets.reduce<Record<string, Ticket[]>>((groups, ticket) => { const type = ticket.ticketType ?? 'STANDARD'; (groups[type] ??= []).push(ticket); return groups; }, {});
  const unavailable = event && !['APPROVED', 'UPCOMING', 'ACTIVE', 'ONGOING'].includes(event.status ?? '');

  return <div>
    <Link to="/events" className="mb-6 inline-flex items-center gap-2 text-xs text-[#9da0a8] hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to events</Link>
    <QueryState isLoading={eventQuery.isLoading} error={eventQuery.error as Error | null} isEmpty={!event} onRetry={() => void eventQuery.refetch()} emptyTitle="Event not found" emptyDescription="This event may have been removed or is not available in your workspace.">
      {event && <>
        <section className="overflow-hidden rounded-2xl border border-[#2b3038] bg-[#181d25]">
          <div className="relative h-56 bg-gradient-to-br from-[#243657] to-[#18202d] sm:h-72">{event.imageUrl ? <img src={event.imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[#6ea0ff]/50"><CalendarDays className="h-20 w-20" /></div>}<div className="absolute inset-0 bg-gradient-to-t from-[#11161e] via-transparent to-transparent" /></div>
          <div className="relative -mt-16 px-5 pb-6 sm:px-8"><span className="inline-flex rounded-full border border-[#8fb3ff]/30 bg-[#182d4e] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#b8d0ff]">{event.status ?? 'Published'}</span><h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-white">{event.title}</h1><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#b5bdc9]"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#6ea0ff]" />{dateLabel(event.eventDate)}</span><span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#4ec9b0]" />{event.location || 'Location to be announced'}</span></div></div>
        </section>
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
          <article className="rounded-2xl border border-[#2b3038] bg-[#181d25] p-5 sm:p-7"><h2 className="text-lg font-semibold text-white">About this event</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#aeb6c3]">{event.description || 'The organizer has not added a description yet.'}</p></article>
          <aside className="rounded-2xl border border-[#2b3038] bg-[#181d25] p-5"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-white">Tickets</h2><span className="text-xs text-[#4ec9b0]">{available.length} available</span></div><QueryState isLoading={ticketsQuery.isLoading} error={ticketsQuery.error as Error | null} isEmpty={!tickets.length} onRetry={() => void ticketsQuery.refetch()} emptyTitle="No ticket inventory" emptyDescription="Ticket options have not been published for this event yet."><div className="mt-4 space-y-3">{Object.entries(byType).map(([type, typeTickets]) => { const open = typeTickets.filter((ticket) => ticket.ticketStatus === 'AVAILABLE'); const price = typeTickets[0]?.price ?? null; return <div key={type} className="rounded-xl border border-[#303844] bg-[#141920] p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-white">{type}</p><p className="mt-1 text-xs text-[#868a91]">{open.length} of {typeTickets.length} available</p></div><p className="text-sm font-semibold text-[#ffc66d]">{money(price)}</p></div><div className="mt-3 flex items-center gap-2 text-xs">{open.length ? <><CheckCircle2 className="h-4 w-4 text-[#4ec9b0]" /><span className="text-[#aeb6c3]">Available to reserve</span></> : <><Clock3 className="h-4 w-4 text-[#868a91]" /><span className="text-[#868a91]">Currently unavailable</span></>}</div></div>; })}</div></QueryState><Link to={`/public/events/${id}/checkout`}><Button className="mt-5 w-full" leftIcon={<TicketIcon className="h-4 w-4" />} disabled={Boolean(unavailable || !available.length)}>{unavailable ? 'Event unavailable' : available.length ? 'Checkout' : 'No seats available'}</Button></Link><p className="mt-3 text-center text-[11px] leading-5 text-[#737b88]">Seat reservation and payment checkout will be enabled in the next Phase 2 step.\</p>\</aside>
        </div>
      </>}
    </QueryState>
  </div>;
}
