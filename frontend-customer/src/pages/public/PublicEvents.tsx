import { useMemo, useState } from 'react';
import { CalendarDays, MapPin, Search, Ticket, ArrowRight, Share2 } from 'lucide-react';
import { QueryState } from 'frontend-shared/components/QueryState';
import { useEvents } from 'frontend-shared/hooks/useApi';
import type { Event } from 'frontend-shared/types/api';

const dateLabel = (value: string | null) => value ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Date to be announced';
const money = (value: number | null) => value == null ? 'Price to be announced' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const browseable = (event: Event) => ['APPROVED', 'UPCOMING', 'ACTIVE', 'ONGOING'].includes(event.status ?? '');

export default function PublicEvents() {
  const [search, setSearch] = useState('');
  const { data = [], isLoading, error, refetch } = useEvents();
  const events = useMemo(() => data
    .filter(browseable)
    .filter((event) => {
      const haystack = [event.title, event.description, event.location, event.eventType].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(search.trim().toLowerCase());
    })
    .sort((a, b) => (a.eventDate ?? '').localeCompare(b.eventDate ?? '')), [data, search]);

  const handleShare = async (eventId: number) => {
    const url = `${window.location.origin}/#/public/events/${eventId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Event', url });
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div>
      <section className="mb-8 overflow-hidden rounded-2xl border border-[#2b3d60] bg-gradient-to-br from-[#1b3158] via-[#172438] to-[#15191f] px-5 py-8 sm:px-8">
        <div className="max-w-2xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6ea0ff]">Find your next experience</p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">Discover events worth showing up for.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#b8c7df]">Browse approved events, compare ticket options, and reserve your seat when checkout is ready.</p>
        </div>
        <label className="mt-6 flex max-w-xl items-center gap-3 rounded-xl border border-[#415b84] bg-[#101a2a]/80 px-4 py-3 text-sm text-[#9da0a8] focus-within:border-[#6ea0ff]">
          <Search className="h-4 w-4 shrink-0" />
          <input aria-label="Search events" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, location or event type" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#71809a]" />
        </label>
      </section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div><h2 className="text-lg font-semibold text-white">Upcoming events</h2><p className="mt-1 text-xs text-[#868a91]">{events.length} event{events.length === 1 ? '' : 's'} available</p></div>
      </div>
      <QueryState isLoading={isLoading} error={error as Error | null} isEmpty={!events.length} onRetry={() => void refetch()} emptyTitle="No events found" emptyDescription={search ? 'Try a different search term.' : 'Approved events will appear here when they are published.'} loadingVariant="cards" rows={6}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => <EventCard key={event.id} event={event} onShare={() => handleShare(event.id)} />)}
        </div>
      </QueryState>
    </div>
  );
}

function EventCard({ event, onShare }: { event: Event; onShare: () => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#2b3038] bg-[#181d25] transition-all hover:-translate-y-0.5 hover:border-[#4b74b9] hover:shadow-xl hover:shadow-black/20">
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#243657] to-[#18202d]">
        {event.imageUrl ? <img src={event.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-[#6ea0ff]/60"><CalendarDays className="h-14 w-14" /></div>}
        <span className="absolute left-3 top-3 rounded-full border border-[#8fb3ff]/30 bg-[#10213d]/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#b8d0ff]">{event.status ?? 'Published'}</span>
        <button
          type="button"
          onClick={onShare}
          className="absolute right-3 top-3 rounded-full border border-[#8fb3ff]/30 bg-[#10213d]/90 p-1.5 text-[#b8d0ff] transition-colors hover:bg-[#1b3158]"
          title="Share event"
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 min-h-12 text-base font-semibold text-white">{event.title}</h3>
        <div className="mt-3 space-y-2 text-xs text-[#9da0a8]">
          <div className="flex items-start gap-2"><CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6ea0ff]" /><span>{dateLabel(event.eventDate)}</span></div>
          <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4ec9b0]" /><span className="truncate">{event.location || 'Location to be announced'}</span></div>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-[#2b3038] pt-3"><span className="flex items-center gap-1.5 text-sm font-semibold text-[#dfe1e5]"><Ticket className="h-4 w-4 text-[#ffc66d]" /> {money(event.basePrice)}</span><span className="flex items-center gap-1 text-xs font-medium text-[#8fb3ff]">Details <ArrowRight className="h-3.5 w-3.5" /></span></div>
      </div>
    </div>
  );
}
