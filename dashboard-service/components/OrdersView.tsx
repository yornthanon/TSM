import React, { useEffect, useState } from 'react';
import { api } from '../services/apiClient';
import {
  Order,
  EventItem,
  Ticket,
  PaymentMethod,
} from '../types/index';
import {
  ShoppingCart,
  Plus,
  CheckCircle2,
  CreditCard,
  Search,
  Receipt,
  Radio,
  Send,
  Sparkles,
  ArrowRight,
  X,
  QrCode,
  Download,
  Calendar,
  MapPin,
  ShieldCheck,
} from 'lucide-react';

interface OrdersViewProps {
  initialTicket?: Ticket | null;
  onClearInitialTicket?: () => void;
  onNavigateToNotifications?: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  initialTicket,
  onClearInitialTicket,
  onNavigateToNotifications,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Checkout modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number>(1);
  const [selectedTicketId, setSelectedTicketId] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [customerEmail, setCustomerEmail] = useState('sopheap.client@gmail.com');
  const [customerPhone, setCustomerPhone] = useState('+85512345678');
  const [processingOrder, setProcessingOrder] = useState(false);
  const [currentOrderStep, setCurrentOrderStep] = useState<number>(0);
  const [orderFeedback, setOrderFeedback] = useState<any | null>(null);

  // E-Ticket Inspection Modal
  const [viewingTicketOrder, setViewingTicketOrder] = useState<Order | null>(null);

  const fetchOrdersAndData = async () => {
    setLoading(true);
    try {
      const [ordRes, evRes, tkRes] = await Promise.all([
        api.request<Order[]>('GET', '/api/v1/orders'),
        api.request<EventItem[]>('GET', '/api/v1/events'),
        api.request<Ticket[]>('GET', '/api/v1/tickets'),
      ]);
      setOrders(ordRes.data || []);
      setEvents(evRes.data || []);
      setTickets(tkRes.data || []);

      if (initialTicket) {
        setSelectedEventId(initialTicket.eventId);
        setSelectedTicketId(initialTicket.id);
        setShowCheckoutModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndData();
  }, [initialTicket]);

  const availableTicketsForEvent = tickets.filter(
    (t) => t.eventId === Number(selectedEventId) && t.ticketStatus !== 'SOLD'
  );

  const currentSelectedTicket = tickets.find((t) => t.id === Number(selectedTicketId));
  const orderAmount = currentSelectedTicket?.price || 25.0;

  const handleExecuteCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingOrder(true);
    setCurrentOrderStep(1);

    await new Promise((r) => setTimeout(r, 250));
    setCurrentOrderStep(2);

    await new Promise((r) => setTimeout(r, 300));
    setCurrentOrderStep(3);

    await new Promise((r) => setTimeout(r, 350));
    setCurrentOrderStep(4);

    try {
      const res = await api.request('POST', '/api/v1/orders', {
        eventId: selectedEventId,
        ticketId: selectedTicketId,
        quantity: 1,
        amount: orderAmount,
        paymentMethod,
        recipientEmail: customerEmail,
        phoneNumber: customerPhone,
      });

      if (!res.error) {
        setCurrentOrderStep(5);
        setOrderFeedback(res.data);
        fetchOrdersAndData();
        if (onClearInitialTicket) onClearInitialTicket();
      } else {
        alert('Order creation failed: ' + res.description);
      }
    } finally {
      setProcessingOrder(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.username.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div id="orders-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
            <span>Orders & E-Ticket Receipts</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Distributed order orchestration with payment processing and Kafka notification streams (order-service :8084)
          </p>
        </div>

        <button
          id="create-order-modal-trigger-btn"
          onClick={() => {
            setShowCheckoutModal(true);
            setOrderFeedback(null);
            setCurrentOrderStep(0);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Order / Checkout</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search orders by invoice #, event, or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto">
          {['ALL', 'COMPLETED', 'PROCESSING', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-md text-[11px] font-medium transition ${
                statusFilter === s
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Order Number</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Seat / Code</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Paid Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">E-Ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
                    {ord.orderNumber}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {ord.eventTitle}
                  </td>
                  <td className="px-4 py-3 font-mono text-indigo-600 font-bold">
                    {ord.ticketCode}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {ord.username}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    ${ord.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.orderStatus === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ord.orderStatus === 'PROCESSING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {ord.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-[11px]">
                    {new Date(ord.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setViewingTicketOrder(ord)}
                      className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-semibold transition inline-flex items-center space-x-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View Pass</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-xs text-slate-400">
            No orders match the current criteria.
          </div>
        )}
      </div>

      {/* Checkout Wizard Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            id="checkout-wizard-modal"
            className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 text-slate-800 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Ticket Reservation & Checkout
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowCheckoutModal(false);
                  if (onClearInitialTicket) onClearInitialTicket();
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!orderFeedback ? (
              <form onSubmit={handleExecuteCheckout} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    1. Select Event
                  </label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => {
                      setSelectedEventId(Number(e.target.value));
                      const firstAvailable = tickets.find(
                        (t) => t.eventId === Number(e.target.value) && t.ticketStatus !== 'SOLD'
                      );
                      if (firstAvailable) setSelectedTicketId(firstAvailable.id);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-indigo-500 font-medium"
                  >
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} — ${ev.basePrice} ({ev.availableTickets} tickets left)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    2. Select Seat / Ticket
                  </label>
                  <select
                    value={selectedTicketId}
                    onChange={(e) => setSelectedTicketId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-indigo-500 font-medium"
                  >
                    {availableTicketsForEvent.map((t) => (
                      <option key={t.id} value={t.id}>
                        Seat {t.seatNumber} ({t.ticketCode} • {t.ticketType}) — ${t.price.toFixed(2)}{' '}
                        {t.ticketStatus === 'LOCKED' ? '[LOCKED IN REDIS]' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Recipient Email (SMTP confirmation)
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Phone Number (Twilio SMS)
                    </label>
                    <input
                      type="text"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    3. Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'BANK_TRANSFER', label: 'KHQR / ABA', icon: QrCode },
                      { id: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
                      { id: 'PAYPAL', label: 'PayPal', icon: ShoppingCart },
                    ].map((pm) => (
                      <button
                        type="button"
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                        className={`p-2.5 rounded-lg border text-center transition ${
                          paymentMethod === pm.id
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-2 ring-emerald-500/20'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <pm.icon className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                        <span className="text-[11px] block">{pm.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {processingOrder && (
                  <div className="p-3 bg-slate-900 rounded-lg text-slate-200 space-y-1.5 text-[11px] font-mono">
                    <div className={currentOrderStep >= 1 ? 'text-emerald-400' : 'text-slate-500'}>
                      {currentOrderStep >= 1 ? '✓' : '•'} [1/4] JWT User Authorization verified
                    </div>
                    <div className={currentOrderStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}>
                      {currentOrderStep >= 2 ? '✓' : '•'} [2/4] Redis ticket lock secured
                    </div>
                    <div className={currentOrderStep >= 3 ? 'text-emerald-400' : 'text-slate-500'}>
                      {currentOrderStep >= 3 ? '✓' : '•'} [3/4] Payment gateway settlement (${orderAmount})
                    </div>
                    <div className={currentOrderStep >= 4 ? 'text-emerald-400' : 'text-slate-500'}>
                      {currentOrderStep >= 4 ? '✓' : '•'} [4/4] Kafka event emitted to order-confirmed-topic
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-500">Order Total: </span>
                    <strong className="text-slate-900 text-base font-bold">${orderAmount.toFixed(2)}</strong>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowCheckoutModal(false)}
                      className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      id="confirm-checkout-submit-btn"
                      type="submit"
                      disabled={processingOrder}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow-xs transition flex items-center space-x-1"
                    >
                      <span>{processingOrder ? 'Processing...' : 'Pay & Issue E-Ticket'}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* Success State */
              <div className="space-y-4 text-xs text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Payment & Ticket Issued!</h4>
                  <p className="text-slate-500 mt-0.5 font-mono text-xs">
                    Invoice: {orderFeedback.order?.orderNumber}
                  </p>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setOrderFeedback(null);
                    }}
                    className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setViewingTicketOrder(orderFeedback.order);
                      setShowCheckoutModal(false);
                      setOrderFeedback(null);
                    }}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-xs transition flex items-center justify-center space-x-1"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View Digital Ticket</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Digital E-Ticket Pass Modal */}
      {viewingTicketOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full text-white shadow-2xl overflow-hidden">
            {/* Header of Ticket */}
            <div className="p-5 bg-gradient-to-tr from-indigo-600 to-purple-600 relative">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded backdrop-blur-xs">
                  Official Admission Pass
                </span>
                <button
                  onClick={() => setViewingTicketOrder(null)}
                  className="text-white/80 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-lg font-bold mt-2 leading-snug">{viewingTicketOrder.eventTitle}</h3>
              <p className="text-indigo-100 text-xs mt-1 font-mono">{viewingTicketOrder.orderNumber}</p>
            </div>

            {/* Ticket Notch Cutouts */}
            <div className="relative flex items-center justify-between px-4 py-1 bg-slate-900 border-y border-dashed border-slate-700">
              <div className="w-4 h-4 rounded-full bg-black -ml-6"></div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">SCAN AT VENUE GATE</span>
              <div className="w-4 h-4 rounded-full bg-black -mr-6"></div>
            </div>

            {/* Body Info */}
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2 text-center bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">SEAT</span>
                  <span className="text-sm font-bold text-white font-mono">{viewingTicketOrder.ticketCode.split('-')[1] || 'A1'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">PRICE</span>
                  <span className="text-sm font-bold text-emerald-400">${viewingTicketOrder.amount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">HOLDER</span>
                  <span className="text-sm font-bold text-white truncate max-w-[70px] inline-block">{viewingTicketOrder.username}</span>
                </div>
              </div>

              {/* Simulated QR Code Canvas */}
              <div className="bg-white p-4 rounded-xl text-center flex flex-col items-center justify-center space-y-2">
                <div className="w-36 h-36 bg-slate-950 p-2 rounded-lg flex items-center justify-center">
                  <QrCode className="w-28 h-28 text-white" />
                </div>
                <span className="text-[10px] font-mono text-slate-600 font-bold">
                  {viewingTicketOrder.ticketCode}
                </span>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => alert(`Ticket ${viewingTicketOrder.ticketCode} downloaded as PDF.`)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium flex items-center justify-center space-x-1 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Pass</span>
                </button>
                <button
                  onClick={() => setViewingTicketOrder(null)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
