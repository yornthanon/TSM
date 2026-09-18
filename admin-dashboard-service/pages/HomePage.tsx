import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Search, Ticket, TrendingUp, Sparkles, ShieldCheck, ArrowRight, Music, Trophy, Mic2, GraduationCap, PartyPopper, ChevronRight, Star, Zap, Users } from 'lucide-react';
import { useEvents } from '../lib/catalog';
import { useLanguage } from '../i18n';
import { EventCard } from '../components/store/EventCard';
import { Spinner, Badge } from '../components/ui';

const categories = [
  { type: 'CONCERT', label: 'Concerts', labelKm: 'ប្រគំតន្ត្រី', icon: Music, gradient: 'from-violet-600 to-fuchsia-500' },
  { type: 'SPORTS', label: 'Sports', labelKm: 'កីឡា', icon: Trophy, gradient: 'from-emerald-600 to-cyan-500' },
  { type: 'CONFERENCE', label: 'Conferences', labelKm: 'សន្និសីទ', icon: Mic2, gradient: 'from-sky-600 to-indigo-500' },
  { type: 'WORKSHOP', label: 'Workshops', labelKm: 'សិក្ខាសាលា', icon: GraduationCap, gradient: 'from-amber-500 to-rose-500' },
  { type: 'FESTIVAL', label: 'Festivals', labelKm: 'ពិធីបុណ្យ', icon: PartyPopper, gradient: 'from-pink-500 to-orange-400' },
];

export const HomePage: React.FC = () => {
  const { isKhmer } = useLanguage();
  const navigate = useNavigate();
  const { data: events = [], isLoading } = useEvents();
  const [query, setQuery] = useState('');

  const featured = events.slice(0, 3);
  const upcoming = events.slice(0, 8);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(query.trim() ? `/events?q=${encodeURIComponent(query.trim())}` : '/events');
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-hero-grid text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.9),transparent_40%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-violet-300" />
              {isKhmer ? 'ជួបបទពិសោធន៍ និងកម្មវិធីកម្សាន្តល្អបំផុត' : 'Discover the best experiences & shows'}
            </div>
            <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight leading-[1.08]">
              {isKhmer ? (
                <>ស្វែងរក និង <span className="text-gradient">កក់សំបុត្រ</span><br />កម្មវិធីដែលអ្នកស្រឡាញ់</>
              ) : (
                <>Find & <span className="text-gradient">book tickets</span><br />for events you'll love</>
              )}
            </h1>
            <p className="mt-5 text-sm sm:text-base text-white/70 max-w-xl leading-relaxed">
              {isKhmer
                ? 'ពីការប្រគំតន្ត្រី ការប្រកួតកីឡា រហូតដល់សន្និសីទបច្ចេកវិទ្យា — កក់កៅអីរបស់អ្នកបានយ៉ាងឆាប់រហ័ស និងមានសុវត្ថិភាព។'
                : 'From live concerts and sports finals to tech summits — reserve your seat in seconds, securely.'}
            </p>

            {/* Search */}
            <form onSubmit={submitSearch} className="mt-8 flex items-center gap-2 bg-white rounded-2xl p-2 shadow-soft max-w-xl">
              <div className="flex items-center gap-2 flex-1 px-3">
                <Search className="w-5 h-5 text-ink-soft" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={isKhmer ? 'ស្វែងរកកម្មវិធី ទីតាំង...' : 'Search events, venues...'}
                  className="w-full bg-transparent text-ink placeholder:text-ink-soft/60 focus:outline-none text-sm py-2"
                />
              </div>
              <button className="px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-semibold shadow-glow hover:brightness-110 transition whitespace-nowrap">
                {isKhmer ? 'ស្វែងរក' : 'Search'}
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/60">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> {isKhmer ? 'ការបង់ប្រាក់មានសុវត្ថិភាព' : 'Secure payments'}</span>
              <span className="inline-flex items-center gap-1.5"><Ticket className="w-4 h-4 text-violet-300" /> {isKhmer ? 'ការទទួលសំបុត្រភ្លាមៗ' : 'Instant e-tickets'}</span>
              <span className="inline-flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-amber-300" /> {isKhmer ? 'ការគ្រប់គ្រងកៅអីផ្ទាល់' : 'Live seat management'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.type}
                onClick={() => navigate(`/events?category=${cat.type}`)}
                className="group flex items-center gap-3 bg-white rounded-2xl border border-line shadow-card p-4 hover:shadow-soft hover:-translate-y-0.5 transition text-left"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.gradient} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-ink truncate">{isKhmer ? cat.labelKm : cat.label}</div>
                  <div className="text-[10px] text-ink-soft mt-0.5 flex items-center gap-0.5">
                    {isKhmer ? 'ចូលមើល' : 'Explore'} <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              {isKhmer ? 'កម្មវិធីលេចធ្លោ' : 'Featured events'}
            </h2>
            <p className="text-sm text-ink-soft mt-1">{isKhmer ? 'ជ្រើសរើសដោយក្រុមការងាររបស់យើង' : 'Hand-picked by our team'}</p>
          </div>
          <button onClick={() => navigate('/events')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
            {isKhmer ? 'មើលទាំងអស់' : 'View all'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner className="w-8 h-8 text-brand-600" /></div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((event) => (
              <EventCard key={event.id} event={event} isKhmer={isKhmer} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming strip */}
      {upcoming.length > 0 && (
        <section className="border-t border-line bg-white/60 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-ink">{isKhmer ? 'មកដល់ឆាប់ៗ' : 'Coming soon'}</h2>
              <span className="text-xs text-ink-soft">{isKhmer ? `កម្មវិធីសរុប ${events.length}` : `${events.length} total events`}</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {upcoming.map((event) => (
                <button
                  key={event.id}
                  onClick={() => navigate(`/events/${event.id}`)}
                  className="text-left group bg-white rounded-2xl border border-line shadow-card p-4 hover:shadow-soft transition"
                >
                  <div className="text-[10px] font-bold uppercase tracking-widest text-brand-700">
                    {isKhmer ? 'កម្មវិធី' : 'Event'} · {event.eventType}
                  </div>
                  <h3 className="font-display font-semibold text-ink mt-2 line-clamp-2 group-hover:text-brand-700 transition">
                    {event.title}
                  </h3>
                  <div className="mt-3 space-y-1 text-xs text-ink-soft flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-brand-500" />
                    {event.eventDate}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-ink rounded-3xl px-8 py-12 sm:px-12 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                {isKhmer ? 'ត្រៀមខ្លួនរីករាយហើយឬនៅ?' : 'Ready to go to your next event?'}
              </h3>
              <p className="text-white/60 text-sm mt-2 max-w-md">
                {isKhmer
                  ? 'ចុះឈ្មោះឥឡូវនេះ ដើម្បីទទួលបានប័ណ្ណចូល និងព័ត៌មានកម្មវិធីថ្មីៗ។'
                  : 'Create your account now to get passes and hear about new events first.'}
              </p>
            </div>
            <button
              onClick={() => navigate('/register')}
              className="px-7 py-3.5 rounded-2xl bg-gradient-brand text-white font-semibold shadow-glow hover:brightness-110 transition whitespace-nowrap"
            >
              {isKhmer ? 'ចាប់ផ្តើមឥឡូវនេះ →' : 'Get started →'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;