import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Music, Mic2, Trophy, Store, GraduationCap, PartyPopper } from 'lucide-react';
import { EventItem, EventType } from '../../types';
import { formatDate, formatMoney } from '../../lib/format';
import { Badge } from '../ui/Badge';

const typeMeta: Record<EventType, { gradient: string; icon: React.ElementType; emoji: string }> = {
  CONCERT: { gradient: 'from-violet-600 via-brand-500 to-fuchsia-500', icon: Music, emoji: '🎤' },
  SPORTS: { gradient: 'from-emerald-600 via-teal-500 to-cyan-500', icon: Trophy, emoji: '🏆' },
  CONFERENCE: { gradient: 'from-sky-600 via-blue-500 to-indigo-500', icon: Mic2, emoji: '💼' },
  WORKSHOP: { gradient: 'from-amber-500 via-orange-500 to-rose-500', icon: GraduationCap, emoji: '🛠️' },
  FESTIVAL: { gradient: 'from-pink-500 via-rose-400 to-orange-400', icon: PartyPopper, emoji: '🎉' },
};

export const EventCard: React.FC<{ event: EventItem; isKhmer: boolean }> = ({ event, isKhmer }) => {
  const meta = typeMeta[event.eventType] ?? typeMeta.CONCERT;
  const Icon = meta.icon;
  const soldOut = event.availableTickets <= 0;
  const fill = Math.max(0, Math.min(100, ((event.totalTickets - event.availableTickets) / event.totalTickets) * 100));

  return (
    <Link
      to={`/events/${event.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-line shadow-card overflow-hidden transition hover:shadow-soft hover:-translate-y-0.5"
    >
      {/* Cover */}
      <div className={`relative h-36 bg-gradient-to-br ${meta.gradient} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,white,transparent_45%)]" />
        <span className="text-5xl drop-shadow-lg transition group-hover:scale-110">{meta.emoji}</span>
        <div className="absolute top-3 left-3">
          <Badge tone="slate" className="bg-white/85 border-white/40 backdrop-blur text-ink">{event.eventType}</Badge>
        </div>
        <div className="absolute bottom-3 right-3 text-white font-display font-bold text-xl drop-shadow-md">
          {formatMoney(event.basePrice)}
        </div>
        {soldOut && (
          <div className="absolute inset-0 bg-ink/55 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-full bg-rose-500 text-white text-xs font-bold uppercase tracking-wider">
              {isKhmer ? 'លក់អស់' : 'Sold out'}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display text-[15px] font-bold text-ink leading-snug line-clamp-2 group-hover:text-brand-700 transition">
          {event.title}
        </h3>
        <div className="mt-2.5 space-y-1.5 text-xs text-ink-soft">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span>{formatDate(event.eventDate, true)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <div className="mt-auto pt-3.5">
          <div className="h-1.5 rounded-full bg-line overflow-hidden">
            <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${fill}%` }} />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="text-ink-soft">
              {isKhmer
                ? `${event.availableTickets} សំបុត្រនៅសល់`
                : `${event.availableTickets} tickets left`}
            </span>
            <span className="font-semibold text-brand-700 group-hover:underline">
              {isKhmer ? 'មើលបន្ត →' : 'Book now →'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;