import React, { useEffect, useState } from 'react';
import { api } from '../services/apiClient';
import { Ticket } from '../types/index';
import {
  Ticket as TicketIcon,
  Lock,
  Unlock,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  X,
  Layers,
  ArrowRight,
  Pencil,
  Trash2,
  ArrowUpDown,
} from 'lucide-react';

interface TicketsViewProps {
  onProceedToOrder?: (ticket: Ticket) => void;
}

export const TicketsView: React.FC<TicketsViewProps> = ({ onProceedToOrder }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventFilter, setSelectedEventFilter] = useState<number | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [lockingTicketId, setLockingTicketId] = useState<number | null>(null);
  const [lockDuration, setLockDuration] = useState<number>(120);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState<Ticket | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [editSeat, setEditSeat] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editType, setEditType] = useState<Ticket['ticketType']>('REGULAR');
  const [sortBy, setSortBy] = useState<'seat' | 'price' | 'status'>('seat');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.request<Ticket[]>('GET', '/api/v1/tickets');
      if (res.data) {
        setTickets(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(() => {
      api.request<Ticket[]>('GET', '/api/v1/tickets').then((res) => {
        if (res.data) setTickets(res.data);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAcquireLock = async (ticket: Ticket) => {
    setLockingTicketId(ticket.id);
    setFeedback(null);
    try {
      const res = await api.request<Ticket>('POST', `/api/v1/tickets/${ticket.id}/lock`, {
        eventId: ticket.eventId,
        quantity: 1,
        userId: api.getCurrentUser().username,
        lockDuration: Math.max(1, Math.ceil(lockDuration / 60)),
      });

      if (!res.error) {
        setFeedback({
          type: 'success',
          message: `Redis Lock acquired for seat ${ticket.seatNumber} (${ticket.ticketCode})! TTL: ${lockDuration}s`,
        });
        fetchTickets();
      } else {
        setFeedback({
          type: 'error',
          message: `Lock conflict: ${res.description}`,
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLockingTicketId(null);
    }
  };

  const handleUnlock = async (ticket: Ticket) => {
    setLockingTicketId(ticket.id);
    setFeedback(null);
    try {
      const res = await api.request<Ticket>('DELETE', `/api/v1/tickets/${ticket.id}/lock`, {
        ticketId: ticket.id,
      });
      if (!res.error) {
        setFeedback({
          type: 'success',
          message: `Seat ${ticket.seatNumber} unlocked and returned to inventory.`,
        });
        fetchTickets();
      }
    } finally {
      setLockingTicketId(null);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesEvent = selectedEventFilter === 'ALL' || t.eventId === selectedEventFilter;
    const matchesStatus = statusFilter === 'ALL' || t.ticketStatus === statusFilter;
    const matchesSearch =
      t.ticketCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.seatNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEvent && matchesStatus && matchesSearch;
  }).sort((a, b) => {
    const left = sortBy === 'price' ? a.price : sortBy === 'status' ? a.ticketStatus : a.seatNumber;
    const right = sortBy === 'price' ? b.price : sortBy === 'status' ? b.ticketStatus : b.seatNumber;
    const result = typeof left === 'number' ? left - (right as number) : String(left).localeCompare(String(right));
    return sortDirection === 'asc' ? result : -result;
  });

  const openEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setEditSeat(ticket.seatNumber);
    setEditPrice(String(ticket.price));
    setEditType(ticket.ticketType);
  };

  const saveTicket = async () => {
    if (!editingTicket) return;
    const res = await api.request('PUT', `/api/v1/tickets/${editingTicket.id}`, { eventId: editingTicket.eventId, seatNumber: editSeat, price: Number(editPrice), ticketType: editType, ticketStatus: editingTicket.ticketStatus });
    if (!res.error) { setFeedback({ type: 'success', message: 'Ticket updated successfully.' }); setEditingTicket(null); fetchTickets(); }
    else setFeedback({ type: 'error', message: res.description });
  };

  const deleteTicket = async (ticket: Ticket) => {
    if (!window.confirm(`Delete ticket ${ticket.ticketCode}?`)) return;
    const res = await api.request('DELETE', `/api/v1/tickets/${ticket.id}`);
    if (!res.error) { setFeedback({ type: 'success', message: 'Ticket deleted successfully.' }); fetchTickets(); }
    else setFeedback({ type: 'error', message: res.description });
  };

  return (
    <div id="tickets-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <TicketIcon className="w-5 h-5 text-indigo-600" />
            <span>Interactive Seat Map & Redis Lock</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time seat selection with high-concurrency protection powered by Redis SETNX (ticket-service :8083)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Lock TTL:</span>
            <select
              value={lockDuration}
              onChange={(e) => setLockDuration(Number(e.target.value))}
              className="bg-transparent font-semibold text-indigo-600 focus:outline-hidden"
            >
              <option value="60">60s (1m)</option>
              <option value="120">120s (2m)</option>
              <option value="300">300s (5m)</option>
            </select>
          </div>

          <button
            onClick={fetchTickets}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition shadow-xs"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between shadow-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Visual Theater Seat Map */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-200">Interactive Venue Seating:</span>
            <span className="text-slate-400">Click any seat to lock or buy</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500"></span>
              <span className="text-slate-300">Available</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-amber-500 animate-pulse"></span>
              <span className="text-slate-300">Redis Locked</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-slate-700"></span>
              <span className="text-slate-400">Sold Out</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-purple-500"></span>
              <span className="text-slate-300">VIP Tier</span>
            </div>
          </div>
        </div>

        {/* Stage Curved Indicator */}
        <div className="max-w-md mx-auto text-center">
          <div className="w-full h-8 bg-gradient-to-b from-indigo-500/20 to-transparent border-t-2 border-indigo-400 rounded-t-[100px] flex items-center justify-center text-[10px] uppercase font-bold tracking-widest text-indigo-300">
            • STAGE / PERFORMANCE AREA •
          </div>
        </div>

        {/* Seats Grid Matrix */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-w-2xl mx-auto py-2">
          {tickets.map((t) => {
            const isAvailable = t.ticketStatus === 'AVAILABLE';
            const isLocked = t.ticketStatus === 'LOCKED';
            const isSold = t.ticketStatus === 'SOLD';
            const isVip = t.ticketType === 'VIP';

            let seatClass = 'bg-slate-800 text-slate-500 cursor-not-allowed border-slate-700';
            if (isAvailable) {
              seatClass = isVip
                ? 'bg-purple-600/80 hover:bg-purple-500 text-white border-purple-400 shadow-xs'
                : 'bg-emerald-600/80 hover:bg-emerald-500 text-white border-emerald-400 shadow-xs';
            } else if (isLocked) {
              seatClass = 'bg-amber-600 text-white border-amber-400 animate-pulse';
            }

            return (
              <button
                key={t.id}
                id={`seat-btn-${t.id}`}
                onClick={() => setSelectedTicketForDetail(t)}
                className={`p-2 rounded-lg border flex flex-col items-center justify-center text-center transition ${seatClass}`}
              >
                <span className="font-bold text-xs">{t.seatNumber}</span>
                <span className="text-[9px] opacity-90">${t.price}</span>
                {isLocked && (
                  <span className="text-[8px] mt-0.5 font-mono">{t.lockRemainingSeconds}s</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="text-center text-[11px] text-slate-400 pt-1">
          Simulating real-time Redis key expiration: <code>ticket:lock:&#123;eventId&#125;:&#123;ticketId&#125;</code>
        </div>
      </div>

      {/* Selected Seat Quick Inspection & Action Drawer */}
      {selectedTicketForDetail && (
        <div className="bg-white border border-indigo-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
              {selectedTicketForDetail.seatNumber}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">
                  Seat {selectedTicketForDetail.seatNumber} ({selectedTicketForDetail.ticketType})
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                  {selectedTicketForDetail.ticketCode}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                  ${selectedTicketForDetail.price.toFixed(2)}
                </span>
              </div>
              <p className="text-slate-500 mt-0.5">
                Event: <strong>{selectedTicketForDetail.eventTitle}</strong> • Status:{' '}
                <span className="font-bold text-indigo-600">{selectedTicketForDetail.ticketStatus}</span>
                {selectedTicketForDetail.lockedBy && ` (Locked by ${selectedTicketForDetail.lockedBy})`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {selectedTicketForDetail.ticketStatus === 'AVAILABLE' && (
              <>
                <button
                  disabled={lockingTicketId === selectedTicketForDetail.id}
                  onClick={() => handleAcquireLock(selectedTicketForDetail)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition flex items-center space-x-1"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Seat (Redis)</span>
                </button>

                <button
                  onClick={() => onProceedToOrder && onProceedToOrder(selectedTicketForDetail)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-xs transition flex items-center space-x-1"
                >
                  <span>Checkout Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {selectedTicketForDetail.ticketStatus === 'LOCKED' && (
              <>
                <button
                  onClick={() => handleUnlock(selectedTicketForDetail)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition flex items-center space-x-1"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Unlock</span>
                </button>

                <button
                  onClick={() => onProceedToOrder && onProceedToOrder(selectedTicketForDetail)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow-xs transition flex items-center space-x-1"
                >
                  <span>Complete Purchase</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            <button
              onClick={() => setSelectedTicketForDetail(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Inventory Table with Quick Filters */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden text-xs">
        <div className="p-3.5 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ticket code or seat number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
              <option value="seat">Seat</option><option value="price">Price</option><option value="status">Status</option>
            </select>
            <button onClick={() => setSortDirection((value) => value === 'asc' ? 'desc' : 'asc')} className="px-2 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">{sortDirection === 'asc' ? '↑' : '↓'}</button>
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {['ALL', 'AVAILABLE', 'LOCKED', 'SOLD'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition ${
                  statusFilter === status
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Ticket Code</th>
                <th className="px-4 py-3">Event Title</th>
                <th className="px-4 py-3">Seat Number</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
                    {ticket.ticketCode}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {ticket.eventTitle}
                  </td>
                  <td className="px-4 py-3 font-bold text-indigo-600">
                    {ticket.seatNumber}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ticket.ticketType === 'VIP'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {ticket.ticketType}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    ${ticket.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {ticket.ticketStatus === 'AVAILABLE' && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>AVAILABLE</span>
                      </span>
                    )}
                    {ticket.ticketStatus === 'LOCKED' && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>LOCKED ({ticket.lockRemainingSeconds ?? 0}s)</span>
                      </span>
                    )}
                    {ticket.ticketStatus === 'SOLD' && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        <span>SOLD</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEditTicket(ticket)} className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteTicket(ticket)} className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      {ticket.ticketStatus === 'AVAILABLE' && <button onClick={() => onProceedToOrder && onProceedToOrder(ticket)} className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold shadow-xs">Book</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingTicket && <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
          <div className="flex items-center justify-between"><div><h3 className="text-base font-bold text-slate-900">Edit ticket</h3><p className="text-xs text-slate-500 mt-1">{editingTicket.ticketCode} · {editingTicket.eventTitle}</p></div><button onClick={() => setEditingTicket(null)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-4 h-4" /></button></div>
          <label className="block text-xs font-semibold text-slate-700">Seat number<input value={editSeat} onChange={(e) => setEditSeat(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg" /></label>
          <div className="grid grid-cols-2 gap-3"><label className="block text-xs font-semibold text-slate-700">Price<input type="number" min="0.01" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg" /></label><label className="block text-xs font-semibold text-slate-700">Tier<select value={editType} onChange={(e) => setEditType(e.target.value as Ticket['ticketType'])} className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg"><option value="REGULAR">REGULAR</option><option value="VIP">VIP</option><option value="EARLY_BIRD">EARLY_BIRD</option><option value="STUDENT">STUDENT</option></select></label></div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100"><button onClick={() => setEditingTicket(null)} className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100">Cancel</button><button onClick={saveTicket} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500">Save changes</button></div>
        </div>
      </div>}
    </div>
  );
};
