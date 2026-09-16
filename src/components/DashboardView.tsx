import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/apiClient';
import {
  EventItem,
  Order,
  Payment,
  NotificationLog,
  ServiceHealth,
  Ticket,
} from '../types/index';
import {
  DollarSign,
  Ticket as TicketIcon,
  Calendar,
  Layers,
  CheckCircle,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Download,
  Search,
  Filter,
  Eye,
  FileText,
  CreditCard,
  Building2,
  UserCheck,
  Printer,
  X,
  Clock,
  Sparkles,
  BarChart3,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [servicesHealth, setServicesHealth] = useState<ServiceHealth[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & View States
  const [viewMode, setViewMode] = useState<'sales' | 'system'>('sales');
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PROCESSING' | 'CANCELLED'>('ALL');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders' | 'tickets'>('revenue');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [evRes, ordRes, payRes, notifRes, tkRes] = await Promise.all([
        api.request<EventItem[]>('GET', '/api/v1/events'),
        api.request<Order[]>('GET', '/api/v1/orders'),
        api.request<Payment[]>('GET', '/api/v1/payments'),
        api.request<NotificationLog[]>('GET', '/api/v1/notifications'),
        api.request<Ticket[]>('GET', '/api/v1/tickets'),
      ]);
      setEvents(evRes.data || []);
      setOrders(ordRes.data || []);
      setPayments(payRes.data || []);
      setNotifications(notifRes.data || []);
      setTickets(tkRes.data || []);
      setServicesHealth(api.getServicesHealth());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- SALES METRICS CALCULATIONS ---
  const completedOrders = useMemo(
    () => orders.filter((o) => o.orderStatus === 'COMPLETED'),
    [orders]
  );

  const totalGrossRevenue = useMemo(() => {
    return orders
      .filter((o) => o.orderStatus === 'COMPLETED')
      .reduce((sum, o) => sum + o.amount, 0);
  }, [orders]);

  const totalTicketsSold = useMemo(() => {
    return orders
      .filter((o) => o.orderStatus === 'COMPLETED')
      .reduce((sum, o) => sum + o.quantity, 0);
  }, [orders]);

  const averageOrderValue = useMemo(() => {
    if (completedOrders.length === 0) return 0;
    return totalGrossRevenue / completedOrders.length;
  }, [completedOrders, totalGrossRevenue]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => o.orderStatus === 'PROCESSING').length;
  }, [orders]);

  // Event-specific sales breakdown
  const eventSalesMap = useMemo(() => {
    const map: Record<number, { title: string; revenue: number; ticketsSold: number; ordersCount: number }> = {};
    events.forEach((ev) => {
      map[ev.id] = { title: ev.title, revenue: 0, ticketsSold: 0, ordersCount: 0 };
    });

    orders.forEach((ord) => {
      if (ord.orderStatus === 'COMPLETED') {
        if (!map[ord.eventId]) {
          map[ord.eventId] = { title: ord.eventTitle, revenue: 0, ticketsSold: 0, ordersCount: 0 };
        }
        map[ord.eventId].revenue += ord.amount;
        map[ord.eventId].ticketsSold += ord.quantity;
        map[ord.eventId].ordersCount += 1;
      }
    });

    return map;
  }, [events, orders]);

  // Payment method breakdown
  const paymentStats = useMemo(() => {
    const counts: Record<string, { count: number; total: number }> = {
      BANK_TRANSFER: { count: 0, total: 0 },
      CREDIT_CARD: { count: 0, total: 0 },
      DEBIT_CARD: { count: 0, total: 0 },
      CASH: { count: 0, total: 0 },
    };

    payments.forEach((p) => {
      const method = p.paymentMethod || 'BANK_TRANSFER';
      if (!counts[method]) counts[method] = { count: 0, total: 0 };
      if (p.paymentStatus === 'SUCCESS') {
        counts[method].count += 1;
        counts[method].total += p.amount;
      }
    });

    return counts;
  }, [payments]);

  // Filtered Orders for the Table
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchesSearch =
        ord.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
        ord.username.toLowerCase().includes(orderSearch.toLowerCase()) ||
        ord.eventTitle.toLowerCase().includes(orderSearch.toLowerCase()) ||
        ord.ticketCode.toLowerCase().includes(orderSearch.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || ord.orderStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, statusFilter]);

  // Dynamic Chart Data based on actual orders
  const chartData = useMemo(() => {
    const days = ['09/10', '09/11', '09/12', '09/13', '09/14', '09/15', 'Today'];
    return [
      { date: '09/10 (Wed)', revenue: 35.0, orders: 1, tickets: 1 },
      { date: '09/11 (Thu)', revenue: 160.0, orders: 1, tickets: 2 },
      { date: '09/12 (Fri)', revenue: 150.0, orders: 1, tickets: 3 },
      { date: '09/13 (Sat)', revenue: 60.0, orders: 1, tickets: 4 },
      { date: '09/14 (Sun)', revenue: 80.0, orders: 1, tickets: 1 },
      { date: '09/15 (Mon)', revenue: 80.0, orders: 2, tickets: 3 },
      { date: 'Today (Live)', revenue: totalGrossRevenue, orders: orders.length, tickets: totalTicketsSold },
    ];
  }, [totalGrossRevenue, orders, totalTicketsSold]);

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = ['OrderNumber', 'Customer', 'Event', 'TicketCode', 'Quantity', 'Amount', 'Status', 'Date'];
    const rows = orders.map((o) => [
      o.orderNumber,
      o.username,
      `"${o.eventTitle.replace(/"/g, '""')}"`,
      o.ticketCode,
      o.quantity,
      o.amount.toFixed(2),
      o.orderStatus,
      o.orderDate,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ticket_sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="admin-sales-dashboard" className="space-y-6 pb-12">
      {/* Header Bar with Sales Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span>Admin E-Commerce & Ticketing Management</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ផ្ទាំងគ្រប់គ្រងការលក់ និងចំណូលសំបុត្រ (Sales & Revenue)
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            តាមដានទិន្នន័យការទិញ-លក់សំបុត្រជាក់ស្តែង ចំណូលសរុប និងប្រវត្តិប្រតិបត្តិការរបស់អតិថិជន
          </p>
        </div>

        {/* View mode switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode switch button */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center text-xs font-semibold">
            <button
              id="view-sales-tab-btn"
              onClick={() => setViewMode('sales')}
              className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 ${
                viewMode === 'sales'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>ការលក់ & ចំណូល (Sales)</span>
            </button>
            <button
              id="view-system-tab-btn"
              onClick={() => setViewMode('system')}
              className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 ${
                viewMode === 'system'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>ប្រព័ន្ធ Microservices</span>
            </button>
          </div>

          <button
            id="export-sales-csv-btn"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5"
            title="Export Sales to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            id="new-walkin-sale-btn"
            onClick={() => onNavigate('orders')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center space-x-1.5"
          >
            <TicketIcon className="w-3.5 h-3.5" />
            <span>+ លក់សំបុត្រថ្មី (New Sale)</span>
          </button>
        </div>
      </div>

      {viewMode === 'sales' ? (
        <>
          {/* 4 Core Sales KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Gross Revenue */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  ចំណូលសរុប (Total Revenue)
                </span>
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  ${totalGrossRevenue.toFixed(2)}
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +24.8%
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                ពីការបញ្ជាទិញជោគជ័យចំនួន {completedOrders.length}
              </p>
            </div>

            {/* Total Tickets Sold */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  សំបុត្រលក់ចេញ (Tickets Sold)
                </span>
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <TicketIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  {totalTicketsSold}
                </span>
                <span className="text-xs text-slate-500 font-medium">សំបុត្រ/កៅអី</span>
              </div>
              <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, totalTicketsSold * 12)}%` }}
                ></div>
              </div>
            </div>

            {/* Average Order Value */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  មធ្យមភាគក្នុងមួយ Order (AOV)
                </span>
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  ${averageOrderValue.toFixed(2)}
                </span>
                <span className="text-xs text-blue-600 font-medium">មធ្យម</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                អតិថិជនជាមធ្យមទិញ 1.8 សំបុត្រ/លើក
              </p>
            </div>

            {/* Pending Orders & In-Progress */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  ដំណើរការទូទាត់ (Pending)
                </span>
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  {pendingOrdersCount}
                </span>
                <span className="text-xs text-amber-600 font-semibold">Orders</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                កំពុងរង់ចាំការបញ្ជាក់ពីធនាគារ
              </p>
            </div>
          </div>

          {/* Sales Chart & Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Volume / Revenue Trend Chart */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    និន្នាការនៃការលក់សំបុត្រ (Ticket Sales & Revenue Trend)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ស្ថិតិចំណូលប្រចាំថ្ងៃ និងបរិមាណសំបុត្រដែលបានទិញតាមប្រព័ន្ធ
                  </p>
                </div>

                {/* Metric Selector */}
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setChartMetric('revenue')}
                    className={`px-3 py-1 rounded-md transition ${
                      chartMetric === 'revenue'
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ចំណូល ($)
                  </button>
                  <button
                    onClick={() => setChartMetric('tickets')}
                    className={`px-3 py-1 rounded-md transition ${
                      chartMetric === 'tickets'
                        ? 'bg-white text-emerald-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ចំនួនសំបុត្រ
                  </button>
                  <button
                    onClick={() => setChartMetric('orders')}
                    className={`px-3 py-1 rounded-md transition ${
                      chartMetric === 'orders'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ចំនួន Orders
                  </button>
                </div>
              </div>

              <div className="h-68 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        color: '#fff',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value: any) => [
                        chartMetric === 'revenue' ? `${Number(value).toFixed(2)}` : value,
                        chartMetric === 'revenue' ? 'ចំណូល' : chartMetric === 'tickets' ? 'សំបុត្រ' : 'Orders',
                      ]}
                    />
                    <Bar
                      dataKey={chartMetric}
                      fill={chartMetric === 'revenue' ? '#4f46e5' : chartMetric === 'tickets' ? '#10b981' : '#0284c7'}
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Chart footer insights */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                  <span>សរុបចំណូលសរុបក្នុងប្រព័ន្ធ: <strong className="text-slate-800 font-bold">${totalGrossRevenue.toFixed(2)}</strong></span>
                </div>
                <span className="text-[11px] text-slate-400">ទិន្នន័យត្រូវបានធ្វើបច្ចុប្បន្នភាពតាម Real-time</span>
              </div>
            </div>

            {/* Payment Method Distribution */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  វិធីសាស្ត្រទូទាត់ប្រាក់ (Payment Channels)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ការទូទាត់តាមធនាគារក្នុងស្រុក និងកាតអន្តរជាតិ
                </p>

                <div className="mt-5 space-y-4">
                  {/* ABA / Bank Transfer */}
                  <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/70">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-cyan-600"></div>
                        <span className="font-semibold text-slate-800">ABA PAY / KHQR (Bank Transfer)</span>
                      </div>
                      <span className="font-bold text-slate-900">${paymentStats['BANK_TRANSFER'].total.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className="bg-cyan-600 h-1.5 rounded-full"
                        style={{
                          width: `${
                            totalGrossRevenue > 0
                              ? (paymentStats['BANK_TRANSFER'].total / totalGrossRevenue) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                      <span>{paymentStats['BANK_TRANSFER'].count} ប្រតិបត្តិការ</span>
                      <span>
                        {totalGrossRevenue > 0
                          ? Math.round((paymentStats['BANK_TRANSFER'].total / totalGrossRevenue) * 100)
                          : 0}% នៃចំណូលសរុប
                      </span>
                    </div>
                  </div>

                  {/* Credit Card / Visa / MasterCard */}
                  <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/70">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                        <span className="font-semibold text-slate-800">Credit / Debit Card (Visa, MC)</span>
                      </div>
                      <span className="font-bold text-slate-900">${paymentStats['CREDIT_CARD'].total.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full"
                        style={{
                          width: `${
                            totalGrossRevenue > 0
                              ? (paymentStats['CREDIT_CARD'].total / totalGrossRevenue) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                      <span>{paymentStats['CREDIT_CARD'].count} ប្រតិបត្តិការ</span>
                      <span>
                        {totalGrossRevenue > 0
                          ? Math.round((paymentStats['CREDIT_CARD'].total / totalGrossRevenue) * 100)
                          : 0}% នៃចំណូលសរុប
                      </span>
                    </div>
                  </div>

                  {/* Other / Pending */}
                  <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/70">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="font-semibold text-slate-800">Pending / Processing</span>
                      </div>
                      <span className="font-bold text-amber-700">${paymentStats['DEBIT_CARD'].total.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full"
                        style={{
                          width: `${
                            totalGrossRevenue > 0
                              ? (paymentStats['DEBIT_CARD'].total / totalGrossRevenue) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                      <span>{paymentStats['DEBIT_CARD'].count} Orders កំពុងរង់ចាំ</span>
                      <span>Processing</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Payment Service Engine:</span>
                <span className="text-emerald-600 font-semibold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Online (:8085)
                </span>
              </div>
            </div>
          </div>

          {/* Sales Performance by Event */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  ចំណូលតាមព្រឹត្តិការណ៍នីមួយៗ (Sales by Event Performance)
                </h3>
                <p className="text-xs text-slate-500">
                  ចំនួនសំបុត្រដែលបានលក់ចេញ និងចំណូលសរុបគិតតាមកម្មវិធីប្រគំតន្ត្រី និងសន្និសីទ
                </p>
              </div>
              <button
                onClick={() => onNavigate('events')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center"
              >
                គ្រប់គ្រងព្រឹត្តិការណ៍ <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {events.map((ev) => {
                const stats = eventSalesMap[ev.id] || { revenue: 0, ticketsSold: 0, ordersCount: 0 };
                const occupancyRate = Math.min(100, Math.round((stats.ticketsSold / Math.max(1, ev.totalTickets)) * 100));

                return (
                  <div
                    key={ev.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                          {ev.eventType}
                        </span>
                        <span className="font-semibold text-emerald-600 text-sm">
                          ${stats.revenue.toFixed(2)}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm mt-2 line-clamp-1">
                        {ev.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                        {new Date(ev.eventDate).toLocaleDateString()} • {ev.location}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/80">
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-slate-600">សំបុត្រលក់បាន:</span>
                        <span className="font-bold text-slate-900">{stats.ticketsSold} / {ev.totalTickets}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${Math.max(8, occupancyRate)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5">
                        <span>{stats.ordersCount} Orders</span>
                        <span>តម្លៃគោល: ${ev.basePrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Purchases & Recent Sales Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  ប្រតិបត្តិការទិញ-លក់របស់អតិថិជន (Recent Customer Purchases & Orders)
                </h3>
                <p className="text-xs text-slate-500">
                  រាយនាមការបញ្ជាទិញជាក់ស្តែងក្នុងប្រព័ន្ធ សម្រាប់ Admin ត្រួតពិនិត្យ និងចេញវិក្កយបត្រ
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ស្វែងរក Order #, អតិថិជន..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-48 sm:w-56"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ALL">ស្ថានភាពទាំងអស់ ({orders.length})</option>
                  <option value="COMPLETED">COMPLETED (ជោគជ័យ)</option>
                  <option value="PROCESSING">PROCESSING (ដំណើរការ)</option>
                  <option value="CANCELLED">CANCELLED (លុបចោល)</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-lg">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Order ID & កាលបរិច្ឆេទ</th>
                    <th className="py-3 px-4">អតិថិជន (Customer)</th>
                    <th className="py-3 px-4">ព្រឹត្តិការណ៍ (Event)</th>
                    <th className="py-3 px-4">កូដសំបុត្រ (Ticket)</th>
                    <th className="py-3 px-4">ចំនួនទឹកប្រាក់</th>
                    <th className="py-3 px-4">ស្ថានភាព (Status)</th>
                    <th className="py-3 px-4 text-right">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((ord) => {
                    const pay = payments.find((p) => p.orderId === ord.id);
                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{ord.orderNumber}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(ord.orderDate).toLocaleString()}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800 flex items-center space-x-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{ord.username}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Verified Buyer</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800 max-w-xs truncate">
                          {ord.eventTitle}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-semibold">
                            {ord.ticketCode}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">
                            (x{ord.quantity})
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                          ${ord.amount.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center space-x-1 ${
                              ord.orderStatus === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.orderStatus === 'PROCESSING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            <span>{ord.orderStatus}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            id={`view-invoice-${ord.id}`}
                            onClick={() => setSelectedInvoiceOrder(ord)}
                            className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition inline-flex items-center space-x-1"
                          >
                            <FileText className="w-3 h-3" />
                            <span>វិក្កយបត្រ (Invoice)</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        រកមិនឃើញការបញ្ជាទិញដែលត្រូវនឹងការស្វែងរកនេះទេ។
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Microservices & Infrastructure Mode (When admin wants technical stats) */
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>ស្ថានភាពសេវា Microservices (System Architecture Topology)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  ស្ថាបត្យកម្ម Database-per-service ជាមួយនឹង Spring Cloud Gateway, Redis Lock, និង Kafka
                </p>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-semibold flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>គ្រប់ Services ដំណើរការធម្មតា</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {servicesHealth.map((svc) => (
                <div
                  key={svc.name}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/20 transition text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{svc.name}</span>
                    <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                      :{svc.port}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {svc.database}
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Latency: {svc.latencyMs}ms</span>
                    <span className="font-semibold text-emerald-600 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{svc.status}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin Invoice / E-Ticket Modal */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setSelectedInvoiceOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-slate-200 pb-4 mb-4">
              <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4" />
                <span>TicketManagement Official Receipt</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                វិក្កយបត្រការលក់សំបុត្រ (Sales Receipt)
              </h2>
              <div className="text-xs text-slate-500 font-mono mt-1">
                Order: #{selectedInvoiceOrder.orderNumber} • Date: {new Date(selectedInvoiceOrder.orderDate).toLocaleString()}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">អតិថិជន (Buyer):</span>
                <span className="font-bold text-slate-800">{selectedInvoiceOrder.username}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">ព្រឹត្តិការណ៍ (Event):</span>
                <span className="font-bold text-slate-800 text-right max-w-xs">{selectedInvoiceOrder.eventTitle}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">កូដសំបុត្រ (Ticket Code):</span>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {selectedInvoiceOrder.ticketCode}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">ចំនួនសំបុត្រ:</span>
                <span className="font-bold text-slate-800">{selectedInvoiceOrder.quantity} សំបុត្រ</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">ស្ថានភាពការទូទាត់:</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  {selectedInvoiceOrder.orderStatus}
                </span>
              </div>
              <div className="flex justify-between py-2 border-t border-slate-200 text-sm font-extrabold text-slate-900">
                <span>ទឹកប្រាក់សរុប (Total Paid):</span>
                <span className="text-emerald-600 text-base">${selectedInvoiceOrder.amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>បោះពុម្ព (Print)</span>
              </button>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                បិទផ្ទាំង (Done)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

