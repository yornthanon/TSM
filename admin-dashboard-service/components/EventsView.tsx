import React, { useEffect, useState } from 'react';
import { api } from '../services/apiClient';
import { EventItem, EventType } from '../types/index';
import {
  Calendar,
  Plus,
  MapPin,
  DollarSign,
  Ticket as TicketIcon,
  Search,
  CheckCircle2,
  X,
  Sparkles,
  Users,
  Layers,
  ArrowRight,
  Pencil,
  Trash2,
  ArrowUpDown,
  Upload,
} from 'lucide-react';
import { useLanguage } from '../i18n';

interface EventsViewProps {
  onSelectEventForBooking?: (event: EventItem) => void;
  onNavigateToTickets?: () => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  onSelectEventForBooking,
  onNavigateToTickets,
}) => {
  const { isKhmer } = useLanguage();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'price'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDate, setFormDate] = useState('2026-11-25T19:00');
  const [formType, setFormType] = useState<EventType>('CONCERT');
  const [formTickets, setFormTickets] = useState('300');
  const [formPrice, setFormPrice] = useState('25.0');
  const [formImageUrl, setFormImageUrl] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.request<EventItem[]>('GET', '/api/v1/events');
      if (res.data) {
        setEvents(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openEditEvent = (event: EventItem) => {
    setEditingEvent(event);
    setFormTitle(event.title);
    setFormDesc(event.description || '');
    setFormLocation(event.location || '');
    setFormDate(event.eventDate.slice(0, 16));
    setFormType(event.eventType);
    setFormTickets(String(event.totalTickets));
    setFormPrice(String(event.basePrice));
    setFormImageUrl(event.imageUrl || '');
    setShowCreateModal(true);
  };

  const handleDeleteEvent = async (event: EventItem) => {
    if (!window.confirm(isKhmer ? `លុបកម្មវិធី «${event.title}» មែនទេ?` : `Delete “${event.title}”?`)) return;
    const res = await api.request('DELETE', `/api/v1/events/${event.id}`);
    if (!res.error) { setFeedback(isKhmer ? 'លុបកម្មវិធីបានជោគជ័យ' : 'Event deleted successfully'); fetchEvents(); }
    else setFeedback(`${isKhmer ? 'លុបមិនបានសម្រេច' : 'Delete failed'}: ${res.description}`);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setCreating(true);
    setFeedback(null);
    try {
      const payload = {
        title: formTitle,
        description: formDesc,
        imageUrl: formImageUrl || null,
        location: formLocation || 'Phnom Penh, Cambodia',
        eventDate: new Date(formDate).toISOString(),
        eventType: formType,
        totalTickets: Number(formTickets),
        capacity: Number(formTickets),
        basePrice: Number(formPrice),
        status: editingEvent?.eventStatus || 'UPCOMING',
      };
      const res = await api.request<EventItem>(editingEvent ? 'PUT' : 'POST', editingEvent ? `/api/v1/events/${editingEvent.id}` : '/api/v1/events', payload);

      if (!res.error) {
        setFeedback(editingEvent ? (isKhmer ? 'បានកែប្រែកម្មវិធីជោគជ័យ' : 'Event updated successfully') : `Event "${formTitle}" has been published to event-service!`);
        setShowCreateModal(false);
        setEditingEvent(null);
        setFormTitle('');
        setFormDesc('');
        setFormImageUrl('');
        fetchEvents();
      } else {
        setFeedback(`${isKhmer ? 'មានបញ្ហា' : 'Error'}: ${res.description}`);
      }
    } catch (err: any) {
      setFeedback(`Creation failed: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  const getEventBadgeColor = (type: EventType) => {
    switch (type) {
      case 'CONCERT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CONFERENCE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SPORTS':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'FESTIVAL':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'WORKSHOP':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getEventBannerGradient = (type: EventType) => {
    switch (type) {
      case 'CONCERT':
        return 'from-indigo-900 via-purple-900 to-slate-900';
      case 'CONFERENCE':
        return 'from-slate-900 via-blue-950 to-indigo-950';
      case 'SPORTS':
        return 'from-amber-950 via-slate-900 to-emerald-950';
      case 'FESTIVAL':
        return 'from-rose-950 via-purple-950 to-slate-900';
      default:
        return 'from-slate-900 to-slate-800';
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'ALL' || ev.eventType === selectedType;
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    const left = sortBy === 'title' ? a.title : sortBy === 'price' ? a.basePrice : new Date(a.eventDate).getTime();
    const right = sortBy === 'title' ? b.title : sortBy === 'price' ? b.basePrice : new Date(b.eventDate).getTime();
    const result = typeof left === 'string' ? left.localeCompare(right as string) : (left as number) - (right as number);
    return sortDirection === 'asc' ? result : -result;
  });

  return (
    <div id="events-view" className="space-y-6">
      {/* Top Header & Fast Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>{isKhmer ? 'កម្មវិធី និងកាតាឡុកសំបុត្រ' : 'Events & ticket catalog'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isKhmer ? 'ស្វែងរកកម្មវិធី កក់កៅអី និងបង្កើតកម្មវិធីថ្មី' : 'Discover shows, reserve seats, and publish new events'}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="bg-slate-100 p-1 rounded-lg flex items-center text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isKhmer ? 'កាតកម្មវិធី' : 'Cards'}
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isKhmer ? 'តារាង' : 'Table'}
            </button>
          </div>

          <button
            id="create-event-modal-trigger-btn"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{isKhmer ? 'បង្កើតកម្មវិធី' : 'Publish event'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modern Filter & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="event-search-input"
            type="text"
            placeholder={isKhmer ? 'ស្វែងរកតាមឈ្មោះ ឬទីតាំង...' : 'Search by title, artist, or venue...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
            <option value="date">{isKhmer ? 'កាលបរិច្ឆេទ' : 'Date'}</option>
            <option value="title">{isKhmer ? 'ឈ្មោះ' : 'Title'}</option>
            <option value="price">{isKhmer ? 'តម្លៃ' : 'Price'}</option>
          </select>
          <button onClick={() => setSortDirection((value) => value === 'asc' ? 'desc' : 'asc')} className="px-2 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50" title="Toggle sort direction">{sortDirection === 'asc' ? '↑' : '↓'}</button>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'CONCERT', 'CONFERENCE', 'SPORTS', 'FESTIVAL', 'WORKSHOP'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition whitespace-nowrap ${
                selectedType === t
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid View (Customer Perspective) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading && [1, 2, 3].map((item) => <div key={item} className="h-80 rounded-xl bg-white border border-slate-200 animate-pulse" />)}
          {!loading && filteredEvents.length === 0 && <div className="md:col-span-2 lg:col-span-3 bg-white border border-dashed border-slate-300 rounded-xl p-14 text-center"><Calendar className="w-9 h-9 mx-auto text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-700">{isKhmer ? 'រកមិនឃើញកម្មវិធី' : 'No events found'}</p><p className="mt-1 text-xs text-slate-400">{isKhmer ? 'សាកល្បងលុប filter ឬស្វែងរកពាក្យផ្សេង' : 'Try clearing filters or searching another term'}</p></div>}
          {filteredEvents.map((ev) => {
            const percentSold = Math.round(
              ((ev.totalTickets - ev.availableTickets) / ev.totalTickets) * 100
            );

            return (
              <div
                key={ev.id}
                id={`event-card-${ev.id}`}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Visual Header Banner */}
                  <div className={`h-32 bg-gradient-to-tr ${getEventBannerGradient(ev.eventType)} p-4 flex flex-col justify-between text-white relative overflow-hidden`}>
                    <div className="flex items-center justify-between z-10">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-xs ${getEventBadgeColor(ev.eventType)}`}>
                        {ev.eventType}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        {ev.eventStatus}
                      </span>
                    </div>

                    <div className="z-10">
                      <span className="text-[11px] text-slate-300 font-mono flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(ev.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </span>
                      <h3 className="text-base font-bold text-white leading-snug line-clamp-1 group-hover:text-indigo-200 transition">
                        {ev.title}
                      </h3>
                    </div>

                    {/* Subtle decorative circles */}
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/5 pointer-events-none"></div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {ev.description || 'Join us for this exciting live event featuring premier performances and guest speakers.'}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{ev.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Starting from <strong className="text-slate-900 font-bold">${ev.basePrice.toFixed(2)}</strong></span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>Available: <strong>{ev.availableTickets}</strong> tickets</span>
                        <span className="font-semibold text-slate-700">{percentSold}% booked</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${percentSold}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={onNavigateToTickets}
                    className="text-slate-600 hover:text-indigo-600 font-semibold flex items-center space-x-1"
                  >
                    <TicketIcon className="w-3.5 h-3.5" />
                    <span>{isKhmer ? 'មើលកៅអី' : 'View seats'}</span>
                  </button>

                  <button
                    id={`book-now-btn-${ev.id}`}
                    onClick={() => onSelectEventForBooking && onSelectEventForBooking(ev)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-xs transition flex items-center space-x-1"
                  >
                    <span>{isKhmer ? 'កក់សំបុត្រ' : 'Book ticket'}</span>
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View (Organizer Perspective) */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Event Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Base Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {ev.title}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getEventBadgeColor(ev.eventType)}`}>
                        {ev.eventType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(ev.eventDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-slate-600 truncate max-w-[150px]">
                      {ev.location}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800">{ev.availableTickets}</span> / {ev.totalTickets}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      ${ev.basePrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {ev.eventStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEditEvent(ev)} className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600" title={isKhmer ? 'កែប្រែ' : 'Edit'}><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteEvent(ev)} className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600" title={isKhmer ? 'លុប' : 'Delete'}><Trash2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => onSelectEventForBooking && onSelectEventForBooking(ev)} className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-medium">{isKhmer ? 'កុម្ម៉ង់' : 'Order'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 text-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">{editingEvent ? (isKhmer ? 'កែប្រែកម្មវិធី' : 'Edit event') : (isKhmer ? 'បង្កើតកម្មវិធីថ្មី' : 'Publish new event')}</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phnom Penh Music Festival 2026"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Event details, artists, timing..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cover image</label>
                <label className="flex items-center gap-3 px-3 py-2.5 border border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span className="text-slate-600">{formImageUrl ? 'Replace cover image' : 'Upload cover image'}</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) { setFeedback('Cover image must be 5MB or smaller'); return; }
                    const reader = new FileReader();
                    reader.onload = () => setFormImageUrl(String(reader.result || ''));
                    reader.readAsDataURL(file);
                  }} />
                </label>
                {formImageUrl && <img src={formImageUrl} alt="Event cover preview" className="mt-2 h-24 w-full object-cover rounded-lg border border-slate-200" />}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Event Category</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as EventType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-indigo-500 font-semibold"
                  >
                    <option value="CONCERT">CONCERT</option>
                    <option value="CONFERENCE">CONFERENCE</option>
                    <option value="SPORTS">SPORTS</option>
                    <option value="FESTIVAL">FESTIVAL</option>
                    <option value="WORKSHOP">WORKSHOP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Venue Location</label>
                <input
                  type="text"
                  placeholder="e.g. Diamond Island Hall A, Phnom Penh"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Total Capacity</label>
                  <input
                    type="number"
                    min="10"
                    value={formTickets}
                    onChange={(e) => setFormTickets(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-xs transition"
                >
                  {creating ? (isKhmer ? 'កំពុងរក្សាទុក...' : 'Saving...') : editingEvent ? (isKhmer ? 'រក្សាទុកការកែប្រែ' : 'Save changes') : (isKhmer ? 'បង្កើតកម្មវិធី' : 'Publish event')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
