'use client';

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Grid, List } from 'lucide-react';
import { useEvents } from '../../lib/catalog';
import { useLanguage } from '../../i18n';
import { EventCard } from '../store/EventCard';
import { EmptyState, Input, Select, Badge, Button, Skeleton } from '../ui';
import { EventType, EventStatus } from '../../types';

const eventTypes: EventType[] = ['CONCERT', 'SPORTS', 'CONFERENCE', 'WORKSHOP', 'FESTIVAL'];
const categoriesLabel: Record<EventType, { en: string; km: string }> = {
  CONCERT: { en: 'Concerts', km: 'ប្រគំតន្ត្រី' },
  SPORTS: { en: 'Sports', km: 'កីឡា' },
  CONFERENCE: { en: 'Conferences', km: 'សន្និសីទ' },
  WORKSHOP: { en: 'Workshops', km: 'សិក្ខាសាលា' },
  FESTIVAL: { en: 'Festivals', km: 'ពិធីបុណ្យ' },
};

export const EventsPage: React.FC = () => {
  const { isKhmer } = useLanguage();
  const [params, setParams] = useSearchParams();
  const { data: events = [], isLoading } = useEvents();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const q = params.get('q') ?? '';
  const category = (params.get('category') ?? 'ALL') as EventType | 'ALL';
  const status = (params.get('status') ?? 'ALL') as EventStatus | 'ALL';
  const sort = params.get('sort') ?? 'date';

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'ALL') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    let list = [...events];
    if (q) list = list.filter((e) => `${e.title} ${e.location} ${e.eventType}`.toLowerCase().includes(q.toLowerCase()));
    if (category !== 'ALL') list = list.filter((e) => e.eventType === category);
    if (status !== 'ALL') list = list.filter((e) => e.eventStatus === status);
    switch (sort) {
      case 'priceAsc': list.sort((a, b) => a.basePrice - b.basePrice); break;
      case 'priceDesc': list.sort((a, b) => b.basePrice - a.basePrice); break;
      case 'recent': list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)); break;
      default: list.sort((a, b) => +new Date(a.eventDate) - +new Date(b.eventDate));
    }
    return list;
  }, [events, q, category, status, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{isKhmer ? 'រកកម្មវិធី' : 'Explore events'}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isKhmer ? `${filtered.length} កម្មវិធីកំពុងមាន` : `${filtered.length} events available`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className={viewMode === 'grid' ? 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' : ''} onClick={() => setViewMode('grid')} aria-label="Grid view">
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className={viewMode === 'list' ? 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' : ''} onClick={() => setViewMode('list')} aria-label="List view">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 mb-8">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <SlidersHorizontal className="w-4 h-4" /> {isKhmer ? 'ស្វែងរក និងតម្រង' : 'Search & filter'}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-10"
              placeholder={isKhmer ? 'ស្វែងរកតាមឈ្មោះ ឬទីតាំង...' : 'Search by title or venue...'}
              value={q}
              onChange={(e) => setParam('q', e.target.value)}
            />
          </div>
          <Select value={category} onChange={(e) => setParam('category', e.target.value)}>
            <option value="ALL">{isKhmer ? 'គ្រប់ប្រភេទ' : 'All categories'}</option>
            {eventTypes.map((t) => (
              <option key={t} value={t}>{isKhmer ? categoriesLabel[t].km : categoriesLabel[t].en}</option>
            ))}
          </Select>
          <Select value={status} onChange={(e) => setParam('status', e.target.value)}>
            <option value="ALL">{isKhmer ? 'គ្រប់ស្ថានភាព' : 'All status'}</option>
            <option value="UPCOMING">{isKhmer ? 'មកដល់ឆាប់ៗ' : 'Upcoming'}</option>
            <option value="ONGOING">{isKhmer ? 'កំពុងប្រព្រឹត្តទៅ' : 'Ongoing'}</option>
            <option value="COMPLETED">{isKhmer ? 'បានបញ្ចប់' : 'Completed'}</option>
          </Select>
          <Select value={sort} onChange={(e) => setParam('sort', e.target.value)}>
            <option value="date">{isKhmer ? 'តាមកាលបរិច្ឆេទ' : 'By date'}</option>
            <option value="priceAsc">{isKhmer ? 'តម្លៃទាបបំផុត' : 'Price: low to high'}</option>
            <option value="priceDesc">{isKhmer ? 'តម្លៃខ្ពស់បំផុត' : 'Price: high to low'}</option>
            <option value="recent">{isKhmer ? 'ថ្មីបំផុត' : 'Newest'}</option>
          </Select>
        </div>
        {(q || category !== 'ALL' || status !== 'ALL') && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Active filters:</span>
            {q && <Badge variant="neutral" className="gap-1">{q} <X className="w-3 h-3" onClick={() => setParam('q', '')} /></Badge>}
            {category !== 'ALL' && <Badge variant="neutral" className="gap-1">{isKhmer ? categoriesLabel[category].km : categoriesLabel[category].en} <X className="w-3 h-3" onClick={() => setParam('category', '')} /></Badge>}
            {status !== 'ALL' && <Badge variant="neutral" className="gap-1">{status} <X className="w-3 h-3" onClick={() => setParam('status', '')} /></Badge>}
            <Button variant="ghost" size="xs" onClick={() => setParams({}, { replace: true })}>
              {isKhmer ? 'សម្អាតតម្រង' : 'Clear all'}
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <EmptyState
            icon={Search}
            title={isKhmer ? 'រកមិនឃើញកម្មវិធី' : 'No events found'}
            message={isKhmer ? 'សាកល្បងស្វែងរកឬតម្រងផ្សេងទៀត' : 'Try a different search or clear the filters.'}
            action={
              <Button variant="outline" onClick={() => setParams({}, { replace: true })}>
                <X className="w-4 h-4" /> {isKhmer ? 'សម្អាតតម្រង' : 'Clear filters'}
              </Button>
            }
          />
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-3'}>
          {filtered.map((event) => (
            viewMode === 'grid' ? (
              <EventCard key={event.id} event={event} isKhmer={isKhmer} />
            ) : (
              <EventCardList key={event.id} event={event} isKhmer={isKhmer} />
            )
          ))}
        </div>
      )}
    </div>
  );
};

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <Skeleton className="h-36 w-full" variant="rectangular" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-1.5 w-full" variant="rectangular" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

function EventCardList({ event, isKhmer }: { event: any; isKhmer: boolean }) {
  const typeColors: Record<string, string> = {
    CONCERT: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
    SPORTS: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    CONFERENCE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    WORKSHOP: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    FESTIVAL: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  };

  const soldOut = event.availableTickets <= 0;
  const percentSold = Math.round(((event.totalTickets - event.availableTickets) / event.totalTickets) * 100);

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition flex items-center gap-4">
      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${event.eventType === 'CONCERT' ? 'from-violet-600 to-fuchsia-500' : event.eventType === 'SPORTS' ? 'from-emerald-600 to-cyan-500' : event.eventType === 'CONFERENCE' ? 'from-sky-600 to-indigo-500' : event.eventType === 'WORKSHOP' ? 'from-amber-500 to-rose-500' : 'from-pink-500 to-orange-400'} flex items-center justify-center shrink-0 shadow-sm`}>
        <span className="text-3xl">🎤</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="neutral" className={typeColors[event.eventType]}>{event.eventType}</Badge>
          <span className="text-xs text-slate-500 dark:text-slate-400">{event.eventStatus}</span>
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">{event.title}</h3>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{event.location}</span>
          <span>·</span>
          <span>{event.eventDate}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div className="h-full rounded-full bg-orange-500" style={{ width: `${percentSold}%` }} />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">{event.availableTickets} left</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-bold text-slate-900 dark:text-slate-100">${event.basePrice.toFixed(2)}</div>
        <Button size="sm" variant={soldOut ? 'outline' : 'primary'} disabled={soldOut} className="mt-2 w-full sm:w-auto">
          {isKhmer ? (soldOut ? 'លក់អស់' : 'កក់') : (soldOut ? 'Sold Out' : 'Book')}
        </Button>
      </div>
    </div>
  );
}

export default EventsPage;