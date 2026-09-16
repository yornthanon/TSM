import React, { useState, useEffect } from 'react';
import { SidebarNav } from './components/SidebarNav';
import { DashboardView } from './components/DashboardView';
import { EventsView } from './components/EventsView';
import { TicketsView } from './components/TicketsView';
import { OrdersView } from './components/OrdersView';
import { PaymentsView } from './components/PaymentsView';
import { NotificationsView } from './components/NotificationsView';
import { UsersView } from './components/UsersView';
import { ApiGatewayView } from './components/ApiGatewayView';
import { ApiServicesManagerView } from './components/ApiServicesManagerView';
import { ApiLogDrawer } from './components/ApiLogDrawer';
import { api } from './services/apiClient';
import { Ticket, EventItem, ApiRequestLog } from './types/index';
import {
  Activity,
  ShieldCheck,
  Server,
  Zap,
  CheckCircle,
  LayoutDashboard,
  AlertTriangle,
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState<boolean>(false);
  const [logs, setLogs] = useState<ApiRequestLog[]>([]);
  const [initialBookingTicket, setInitialBookingTicket] = useState<Ticket | null>(null);
  const [unresolvedErrorsCount, setUnresolvedErrorsCount] = useState<number>(0);

  const refreshErrorsCount = () => {
    const errs = api.getServiceErrors().filter((e) => !e.resolved);
    setUnresolvedErrorsCount(errs.length);
  };

  useEffect(() => {
    setLogs(api.getLogs());
    refreshErrorsCount();

    const unsubLogs = api.onLog((newLog) => {
      setLogs((prev) => [newLog, ...prev.slice(0, 49)]);
    });

    const unsubErrors = api.onError(() => {
      refreshErrorsCount();
    });

    return () => {
      unsubLogs();
      unsubErrors();
    };
  }, []);

  const handleSelectEventForBooking = (event: EventItem) => {
    setActiveTab('orders');
  };

  const handleProceedToOrderFromTicket = (ticket: Ticket) => {
    setInitialBookingTicket(ticket);
    setActiveTab('orders');
  };

  const isApiView = activeTab === 'api-manager' || activeTab === 'gateway';

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      {/* Sidebar Navigation */}
      <SidebarNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenLogs={() => setIsLogDrawerOpen(true)}
        logCount={logs.length}
      />

      {/* Main Content Layout with Sidebar Offset */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Desktop Context Bar with Direct Dual Portal Switcher */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            {/* Direct Switcher: Admin Business vs API Management */}
            <div className="bg-slate-100 p-1 rounded-lg flex items-center text-xs font-semibold">
              <button
                id="portal-switch-admin-btn"
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 ${
                  !isApiView
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Admin Business Dashboard</span>
              </button>

              <button
                id="portal-switch-api-btn"
                onClick={() => setActiveTab('api-manager')}
                className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 ${
                  isApiView
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>គ្រប់គ្រង API & Error Diagnostics</span>
                {unresolvedErrorsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-mono animate-pulse">
                    {unresolvedErrorsCount}
                  </span>
                )}
              </button>
            </div>

            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-mono text-[11px]">
              {activeTab === 'dashboard'
                ? 'Sales & Revenue Portal'
                : isApiView
                ? 'API Diagnostics & Error Monitor'
                : activeTab.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="topbar-live-traffic-btn"
              onClick={() => setIsLogDrawerOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center space-x-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
              <span>API Traffic</span>
              <span className="px-1.5 py-0.2 bg-indigo-600 text-white rounded text-[10px] font-mono">
                {logs.length}
              </span>
            </button>

            <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All 7 Services Connected</span>
            </div>
          </div>
        </header>

        {/* Dynamic Main Body Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}

          {activeTab === 'events' && (
            <EventsView
              onSelectEventForBooking={handleSelectEventForBooking}
              onNavigateToTickets={() => setActiveTab('tickets')}
            />
          )}

          {activeTab === 'tickets' && (
            <TicketsView onProceedToOrder={handleProceedToOrderFromTicket} />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              initialTicket={initialBookingTicket}
              onClearInitialTicket={() => setInitialBookingTicket(null)}
              onNavigateToNotifications={() => setActiveTab('notifications')}
            />
          )}

          {activeTab === 'payments' && <PaymentsView />}

          {activeTab === 'notifications' && <NotificationsView />}

          {activeTab === 'users' && <UsersView />}

          {(activeTab === 'api-manager' || activeTab === 'gateway') && (
            <ApiServicesManagerView />
          )}
        </main>

        {/* Clean Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-6 lg:px-8 mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>TicketManagement Microservices Frontend Connected</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
              <span>Spring Boot 3</span>
              <span>•</span>
              <span>Spring Cloud Gateway</span>
              <span>•</span>
              <span>Redis Lock</span>
              <span>•</span>
              <span>Kafka Event-Driven</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Network Traffic Inspector Drawer */}
      <ApiLogDrawer
        isOpen={isLogDrawerOpen}
        onClose={() => setIsLogDrawerOpen(false)}
        logs={logs}
        onClear={() => {
          api.clearLogs();
          setLogs([]);
        }}
      />
    </div>
  );
};
