import React, { useEffect, useState } from 'react';
import { api } from '../services/apiClient';
import { NotificationLog, NotificationType } from '../types/index';
import {
  Send,
  Mail,
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [resendingId, setResendingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.request<NotificationLog[]>('GET', '/api/v1/notifications');
      if (res.data) {
        setNotifications(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleResend = async (id: number) => {
    setResendingId(id);
    try {
      const res = await api.request('POST', `/api/v1/notifications/${id}/resend`);
      if (!res.error) {
        setFeedback(`Notification #${id} successfully re-queued and dispatched via SMTP/Twilio!`);
        fetchNotifications();
      }
    } finally {
      setResendingId(null);
    }
  };

  const emailCount = notifications.filter((n) => n.notificationType === 'EMAIL').length;
  const smsCount = notifications.filter((n) => n.notificationType === 'SMS').length;
  const sentCount = notifications.filter((n) => n.notificationStatus === 'SENT').length;

  const filteredNotifications = notifications.filter((n) => {
    const matchesType = typeFilter === 'ALL' || n.notificationType === typeFilter;
    const matchesSearch =
      n.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.recipientEmail && n.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (n.phoneNumber && n.phoneNumber.includes(searchQuery));
    return matchesType && matchesSearch;
  });

  return (
    <div id="notifications-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Send className="w-5 h-5 text-indigo-600" />
            <span>Kafka Notification Consumer (notification-service :8086)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Consumes <code className="text-indigo-600 font-mono">order-confirmed-topic</code> and delivers real-time confirmation via SMTP Email & Twilio SMS
          </p>
        </div>

        <button
          onClick={fetchNotifications}
          className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          title="Refresh Notifications"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-600 hover:text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 uppercase font-semibold">Total Delivered</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{sentCount}</div>
          <span className="text-[11px] text-emerald-600">100% Delivery Success</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 uppercase font-semibold">Emails (SMTP)</span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{emailCount}</div>
          <span className="text-[11px] text-slate-400">JavaMailSender HTML</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 uppercase font-semibold">SMS (Twilio)</span>
          <div className="text-2xl font-bold text-purple-600 mt-1">{smsCount}</div>
          <span className="text-[11px] text-slate-400">Twilio REST API</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 uppercase font-semibold">Kafka Group ID</span>
          <div className="text-sm font-mono font-bold text-slate-800 mt-2 truncate">
            notification-group
          </div>
          <span className="text-[11px] text-emerald-600 flex items-center space-x-1 mt-1">
            <Sparkles className="w-3 h-3" />
            <span>Active Consumer</span>
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search recipient email, phone, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          {['ALL', 'EMAIL', 'SMS'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-md text-[11px] font-medium transition ${
                typeFilter === t
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notif) => (
          <div
            key={notif.id}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-indigo-300 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs"
          >
            <div className="flex items-start space-x-3 flex-1">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  notif.notificationType === 'EMAIL'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'bg-purple-50 text-purple-600'
                }`}
              >
                {notif.notificationType === 'EMAIL' ? (
                  <Mail className="w-4 h-4" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{notif.subject}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      notif.notificationType === 'EMAIL'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {notif.notificationType}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    {notif.notificationStatus}
                  </span>
                </div>

                <p className="text-slate-600 text-xs bg-slate-50 p-2 rounded border border-slate-100 font-mono">
                  {notif.message}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span>To: <strong>{notif.recipient}</strong></span>
                  {notif.recipientEmail && <span>Email: {notif.recipientEmail}</span>}
                  {notif.phoneNumber && <span>Phone: {notif.phoneNumber}</span>}
                  <span>Sent: {new Date(notif.sentAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <button
              disabled={resendingId === notif.id}
              onClick={() => handleResend(notif.id)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition flex items-center space-x-1 shrink-0"
            >
              <RefreshCw className={`w-3 h-3 ${resendingId === notif.id ? 'animate-spin' : ''}`} />
              <span>{resendingId === notif.id ? 'Resending...' : 'Resend'}</span>
            </button>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-10 bg-white border border-slate-200 rounded-xl text-xs text-slate-400">
            No notifications recorded yet. Complete an order to trigger Kafka email/SMS delivery!
          </div>
        )}
      </div>
    </div>
  );
};
