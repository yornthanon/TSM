import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useEvents } from '../lib/catalog';
import { useLanguage } from '../i18n';
import { EventCard } from '../components/store/EventCard';
import { EmptyState, Input, Select } from '../components/ui';
import { Spinner } from '../components/ui/Button';
import { EventType, EventStatus } from '../types';

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
          <h1 className="font-display text-3xl font-bold text-ink">{isKhmer ? 'រកកម្មវិធី' : 'Explore events'}</h1>
          <p className="text-sm text-ink-soft mt-1">
            {isKhmer ? `${filtered.length} កម្មវិធីកំពុងមាន` : `${filtered.length} events available`}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-line shadow-card p-4 mb-8">
        <div className="flex items-center gap-2 text-ink-soft text-xs font-semibold uppercase tracking-wider mb-3">
          <SlidersHorizontal className="w-4 h-4" /> {isKhmer ? 'ស្វែងរក និងតម្រង' : 'Search & filter'}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
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
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24"><Spinner className="w-8 h-8 text-brand-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-line shadow-card">
          <EmptyState
            title={isKhmer ? 'រកមិនឃើញកម្មវិធី' : 'No events found'}
            message={isKhmer ? 'សាកល្បងស្វែងរកឬតម្រងផ្សេងទៀត' : 'Try a different search or clear the filters.'}
            action={
              <button onClick={() => setParams({}, { replace: true })} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
                <X className="w-4 h-4" /> {isKhmer ? 'សម្អាតតម្រង' : 'Clear filters'}
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} isKhmer={isKhmer} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;