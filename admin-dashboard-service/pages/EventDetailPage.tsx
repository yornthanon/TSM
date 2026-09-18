import React, { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, MapPin, Ticket, Users, Clock } from 'lucide-react';
import { useEventTickets, buildSeatMap, useEvents } from '../lib/catalog';
import { useLanguage } from '../i18n';
import { useBooking } from '../lib/booking';
import { SeatMap } from '../components/store/SeatMap';
import { Badge, Card, CardContent, CardHeader, StatCard } from '../components/ui';
import { Spinner } from '../components/ui/Button';
import { EventCard } from '../components/store/EventCard';
import { formatDate, formatMoney } from '../lib/format';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isKhmer } = useLanguage();
  const navigate = useNavigate();
  const eventId = Number(id);
  const { event, tickets, isLoading } = useEventTickets(eventId);
  const { data: allEvents = [] } = useEvents();
  const { setPending } = useBooking();

  const seatMap = useMemo(() => buildSeatMap(event, tickets), [event, tickets]);

  const related = useMemo(
    () => (event ? allEvents.filter((e) => e.eventType === event.eventType && e.id !== event.id).slice(0, 3) : []),
    [event, allEvents]
  );

  const available = seatMap.filter((s) => s.status === 'AVAILABLE').length;
  const sold = seatMap.filter((s) => s.status === 'SOLD').length;
  const locked = seatMap.filter((s) => s.status === 'LOCKED').length;

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-24 flex justify-center"><Spinner className="w-8 h-8 text-brand-600" /></div>;
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="text-4xl mb-3">😔</div>
        <h1 className="font-display text-xl font-bold text-ink">{isKhmer ? 'រកមិនឃើញកម្មវិធី' : 'Event not found'}</h1>
        <Link to="/events" className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline">← {isKhmer ? 'ត្រលប់ទៅកម្មវិធី' : 'Back to events'}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink transition mb-6">
        <ArrowLeft className="w-4 h-4" /> {isKhmer ? 'ត្រលប់ក្រោយ' : 'Back'}
      </button>

      {/* Hero */}
      <div className="bg-hero-grid text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.9),transparent_45%)]" />
        <div className="relative max-w-3xl">
          <Badge tone="violet" className="bg-white/15 border-white/25 backdrop-blur text-white mb-4">{event.eventType} · {event.eventStatus}</Badge>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight leading-tight">{event.title}</h1>
          <p className="mt-4 text-white/70 text-sm sm:text-base leading-relaxed max-w-2xl">{event.description}</p>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/85">
            <span className="inline-flex items-center gap-2"><CalendarDays className="w-4 h-4 text-violet-300" /> {formatDate(event.eventDate, true)}</span>
            <span className="inline-flex items-center gap-2"><MapPin className="w-4 h-4 text-violet-300" /> {event.location}</span>
            <span className="inline-flex items-center gap-2"><Users className="w-4 h-4 text-violet-300" /> {event.availableTickets} {isKhmer ? 'កន្លែងនៅសល់' : 'seats left'}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard label={isKhmer ? 'សំបុត្រទំនេរ' : 'Available'} value={available} icon={Ticket} tone="green" detail={isKhmer ? 'កៅអីអាចជ្រើសបាន' : 'selectable seats'} />
        <StatCard label={isKhmer ? 'លក់រួច' : 'Sold'} value={sold} icon={Ticket} tone="brand" detail={isKhmer ? 'បានបញ្ជាទិញ' : 'purchased'} />
        <StatCard label={isKhmer ? 'កំពុងរក្សាទុក' : 'Locked'} value={locked} icon={Clock} tone="amber" detail={isKhmer ? 'ដោយ Redis lock' : 'held via Redis'} />
        <StatCard label={isKhmer ? 'តម្លៃចាប់ផ្ដើម' : 'From'} value={formatMoney(event.basePrice)} icon={Ticket} tone="sky" detail={isKhmer ? 'ក្នុងមួយសំបុត្រ' : 'per ticket'} />
      </div>

      {/* Book + details */}
      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-ink mb-4">{isKhmer ? 'ជ្រើសរើសកៅអី' : 'Choose your seat'}</h2>
          <SeatMap
            seats={seatMap}
            isKhmer={isKhmer}
            onBook={(selected) => {
              setPending({ event, seats: selected });
              navigate('/checkout');
            }}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title={isKhmer ? 'ព័ត៌មានអំពីកម្មវិធី' : 'About this event'} />
            <CardContent className="space-y-4 text-sm">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft mb-1">{isKhmer ? 'ប្រភេទ' : 'Category'}</div>
                <div className="font-semibold text-ink">{event.eventType}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft mb-1">{isKhmer ? 'ទីតាំង' : 'Venue'}</div>
                <div className="font-semibold text-ink">{event.location}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft mb-1">{isKhmer ? 'ចំណុះ' : 'Capacity'}</div>
                <div className="font-semibold text-ink">{event.totalTickets} {isKhmer ? 'កន្លែង' : 'seats'}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft mb-1">{isKhmer ? 'តម្លៃចាប់ផ្ដើម' : 'Starting price'}</div>
                <div className="font-display text-xl font-bold text-brand-700">{formatMoney(event.basePrice)}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title={isKhmer ? 'ជំហានទិញ' : 'How booking works'} subtitle={isKhmer ? 'សាមញ្ញ និងមានសុវត្ថិភាព' : 'Simple & secure'} />
            <CardContent className="space-y-4">
              {[
                { n: '1', en: 'Pick your seats on the map', km: 'ជ្រើសរើសកៅអីលើផែនទី' },
                { n: '2', en: 'Fill in your details & pay', km: 'បំពេញព័ត៌មាន និងបង់ប្រាក់' },
                { n: '3', en: 'Get your e-ticket instantly', km: 'ទទួលបានសំបុត្រអេឡិចត្រូនិកភ្លាមៗ' },
              ].map((step) => (
                <div key={step.n} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center">{step.n}</div>
                  <span className="text-sm text-ink">{isKhmer ? step.km : step.en}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-xl font-bold text-ink mb-5">{isKhmer ? 'កម្មវិធីស្រដៀងគ្នា' : 'You may also like'}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((e) => (
              <EventCard key={e.id} event={e} isKhmer={isKhmer} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default EventDetailPage;