import React, { useState } from 'react';
import { DashboardView } from './components/DashboardView';
import { EventsView } from './components/EventsView';
import { TicketsView } from './components/TicketsView';
import { OrdersView } from './components/OrdersView';
import { PaymentsView } from './components/PaymentsView';
import { UsersView } from './components/UsersView';
import { Ticket, EventItem, User, RoleType } from './types/index';
import {
  LayoutDashboard,
  Calendar,
  Ticket as TicketIcon,
  ShoppingCart,
  CreditCard,
  Users,
  ShieldCheck,
  Building2,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

interface AdminDashboardAppProps {
  onSwitchToApiService?: () => void;
}

export const AdminDashboardApp: React.FC<AdminDashboardAppProps> = ({ onSwitchToApiService }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [initialBookingTicket, setInitialBookingTicket] = useState<Ticket | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock current admin user
  const [currentUser, setCurrentUser] = useState<User>({
    id: 1,
    username: 'admin_business',
    email: 'admin@ticketmaster.com',
    phoneNumber: '+85512345678',
    role: 'ROLE_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-09-01T08:00:00Z',
  });

  const navItems = [
    { id: 'dashboard', label: 'ផ្ទាំងគ្រប់គ្រងការលក់ (Sales)', icon: LayoutDashboard },
    { id: 'events', label: 'កម្មវិធី & Shows (Events)', icon: Calendar },
    { id: 'tickets', label: 'ស្តុកសំបុត្រ & កៅអី (Tickets)', icon: TicketIcon },
    { id: 'orders', label: 'ការកុម្ម៉ង់ & Checkout (Orders)', icon: ShoppingCart },
    { id: 'payments', label: 'បញ្ជីទូទាត់ប្រាក់ (Payments)', icon: CreditCard },
    { id: 'users', label: 'អ្នកប្រើប្រាស់ & RBAC (Users)', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      {/* Dedicated Admin-Dashboards Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 fixed inset-y-0 z-30 hidden lg:flex">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white text-sm tracking-tight">Admin-Dashboards</div>
              <div className="text-[10px] text-indigo-400 font-mono">Business Operations Service</div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Business Portals (អាជីវកម្ម)
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom User Info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-xs">
              AD
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-white text-xs">{currentUser.username}</div>
              <div className="text-[10px] text-emerald-400 font-mono">{currentUser.role}</div>
            </div>
          </div>

          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            Admin UI
          </span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <header className="px-6 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3 text-xs">
            <span className="font-bold text-slate-900 text-sm">
              {navItems.find((n) => n.id === activeTab)?.label || 'Dashboard'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">
              សេវាគ្រប់គ្រងរដ្ឋបាល និងការលក់ (Admin-Dashboards Service)
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Admin-Dashboards: Active</span>
            </div>

            {onSwitchToApiService && (
              <button
                onClick={onSwitchToApiService}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition"
              >
                Switch to Admin-API-service →
              </button>
            )}
          </div>
        </header>

        {/* View Component */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
          {activeTab === 'events' && (
            <EventsView
              onSelectEventForBooking={() => setActiveTab('orders')}
              onNavigateToTickets={() => setActiveTab('tickets')}
            />
          )}
          {activeTab === 'tickets' && (
            <TicketsView
              onProceedToOrder={(tk) => {
                setInitialBookingTicket(tk);
                setActiveTab('orders');
              }}
            />
          )}
          {activeTab === 'orders' && (
            <OrdersView
              initialTicket={initialBookingTicket}
              onClearInitialTicket={() => setInitialBookingTicket(null)}
              onNavigateToNotifications={() => {}}
            />
          )}
          {activeTab === 'payments' && <PaymentsView />}
          {activeTab === 'users' && <UsersView />}
        </main>
      </div>
    </div>
  );
};
