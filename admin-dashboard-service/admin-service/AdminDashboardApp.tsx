import React, { useState } from 'react';
import { BarChart3, Bell, Calendar, CreditCard, LayoutDashboard, LogOut, Menu, Settings2, ShoppingCart, Ticket, Users, X } from 'lucide-react';
import { DashboardView } from '../components/DashboardView';
import { EventsView } from '../components/EventsView';
import { TicketsView } from '../components/TicketsView';
import { OrdersView } from '../components/OrdersView';
import { PaymentsView } from '../components/PaymentsView';
import { UsersView } from '../components/UsersView';
import { NotificationsView } from '../components/NotificationsView';
import { AdminOperationId, AdminOperationsView } from '../components/AdminOperationsView';
import { EventItem, Ticket as TicketType } from '../types';
import { LanguageSwitcher, useLanguage } from '../i18n';

const items = [
  { id: 'dashboard', km: 'ផ្ទាំងសង្ខេប', en: 'Overview', captionKm: 'សេចក្តីសង្ខេបការលក់', captionEn: 'Sales overview', icon: LayoutDashboard },
  { id: 'events', km: 'កម្មវិធី & Shows', en: 'Events', captionKm: 'កាតាឡុកកម្មវិធី', captionEn: 'Events catalog', icon: Calendar },
  { id: 'tickets', km: 'សំបុត្រ & កៅអី', en: 'Tickets', captionKm: 'ស្តុកសំបុត្រ', captionEn: 'Ticket inventory', icon: Ticket },
  { id: 'orders', km: 'ការកុម្ម៉ង់', en: 'Orders', captionKm: 'ការកុម្ម៉ង់ និង checkout', captionEn: 'Orders & checkout', icon: ShoppingCart },
  { id: 'payments', km: 'ការទូទាត់', en: 'Payments', captionKm: 'បញ្ជីទូទាត់ប្រាក់', captionEn: 'Payment ledger', icon: CreditCard },
  { id: 'users', km: 'អ្នកប្រើប្រាស់', en: 'Users', captionKm: 'អ្នកប្រើប្រាស់ និង RBAC', captionEn: 'Users & RBAC', icon: Users },
  { id: 'notifications', km: 'ការជូនដំណឹង', en: 'Notifications', captionKm: 'អ៊ីមែល និង SMS', captionEn: 'Email & SMS delivery', icon: Bell },
  { id: 'reports', km: 'របាយការណ៍ និងវិភាគ', en: 'Reports & Analytics', captionKm: 'ចំណូល និងលទ្ធផល', captionEn: 'Revenue & performance', icon: BarChart3 },
  { id: 'settings', km: 'ការកំណត់ប្រព័ន្ធ', en: 'System Settings', captionKm: 'ចំណូលចិត្ត និងសុវត្ថិភាព', captionEn: 'Preferences & security', icon: Settings2 },
];

const adminOperationIds: AdminOperationId[] = ['reports', 'settings'];

export const AdminDashboardApp: React.FC = () => {
  const { isKhmer } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [initialTicket, setInitialTicket] = useState<TicketType | null>(null);
  const go = (tab: string) => { setActiveTab(tab); setMobileOpen(false); };
  const handleSelectEvent = (_event: EventItem) => go('orders');
  const handleProceed = (ticket: TicketType) => { setInitialTicket(ticket); go('orders'); };

  return (
    <div className="admin-shell min-h-screen bg-slate-50 text-slate-800">
      <div className="lg:hidden sticky top-0 z-30 bg-slate-950 text-white px-4 py-3 flex items-center justify-between">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg bg-slate-800">{mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
        <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-xs">TSM</div><span className="font-bold">{isKhmer ? 'ផ្ទាំង Admin' : 'Admin Dashboard'}</span></div><LanguageSwitcher dark />
      </div>
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-slate-950 text-white border-r border-slate-800 transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black">TSM</div><div><div className="font-bold tracking-tight">{isKhmer ? 'ផ្ទាំងគ្រប់គ្រង Admin' : 'Admin Dashboard'}</div><div className="text-[11px] text-slate-400 font-mono">{isKhmer ? 'ការគ្រប់គ្រងអាជីវកម្ម' : 'BUSINESS OPERATIONS'}</div></div></div><div className="mt-5 rounded-xl bg-indigo-500/10 border border-indigo-400/20 px-3 py-2.5"><div className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold">{isKhmer ? 'កន្លែងធ្វើការ' : 'Workspace'}</div><div className="text-sm font-semibold mt-1">{isKhmer ? 'ការលក់ និងចំណូល' : 'Sales & Revenue Portal'}</div></div></div>
        <nav className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1"><div className="px-3 pb-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">{isKhmer ? 'ម៉ូឌុល Admin' : 'Admin modules'}</div>{items.map(({ id, km, en, captionKm, captionEn, icon: Icon }, index) => <React.Fragment key={id}>{index === 7 && <div className="px-3 pt-5 pb-2 text-[10px] uppercase tracking-widest text-indigo-300/70 font-bold border-t border-slate-800 mt-3">{isKhmer ? 'ប្រតិបត្តិការអាជីវកម្ម' : 'Business operations'}</div>}<button onClick={() => go(id)} className={`group w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}><span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activeTab === id ? 'bg-white/15' : 'bg-slate-900 group-hover:bg-slate-800'}`}><Icon className="w-4 h-4" /></span><span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold truncate">{isKhmer ? km : en}</span><span className={`block text-[10px] mt-0.5 truncate ${activeTab === id ? 'text-indigo-100' : 'text-slate-500 group-hover:text-slate-400'}`}>{isKhmer ? captionKm : captionEn}</span></span>{activeTab === id && <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />}</button></React.Fragment>)}</nav>
        <div className="mt-auto shrink-0 p-3 border-t border-slate-800 bg-slate-950"><div className="flex items-center gap-3 px-2"><div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">AD</div><div className="flex-1"><div className="text-sm font-semibold">admin</div><div className="text-[10px] text-emerald-400 font-mono">ROLE_ADMIN · ONLINE</div></div><LogOut className="w-4 h-4 text-slate-500" /></div></div>
      </aside>
      <main className="lg:pl-64 min-h-screen flex flex-col"><header className="hidden lg:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-6 sticky top-0 z-20"><div><div className="text-[10px] uppercase tracking-widest text-indigo-600 font-bold">Admin Dashboard Service</div><h1 className="text-lg font-bold text-slate-900 mt-0.5">{items.find((item) => item.id === activeTab)?.[isKhmer ? 'km' : 'en']}</h1></div><div className="flex items-center gap-2"><LanguageSwitcher /><a href="/management-api" className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition">{isKhmer ? 'គ្រប់គ្រង API →' : 'Management API →'}</a><div className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{isKhmer ? 'សេវាកម្មដំណើរការ' : 'Business services healthy'}</div><div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center"><Bell className="w-3.5 h-3.5" /></div></div></header><section className="flex-1 p-4 max-w-6xl w-full mx-auto">{activeTab === 'dashboard' && <DashboardView onNavigate={go} />}{activeTab === 'events' && <EventsView onSelectEventForBooking={handleSelectEvent} onNavigateToTickets={() => go('tickets')} />}{activeTab === 'tickets' && <TicketsView onProceedToOrder={handleProceed} />}{activeTab === 'orders' && <OrdersView initialTicket={initialTicket} onClearInitialTicket={() => setInitialTicket(null)} onNavigateToNotifications={() => go('notifications')} />}{activeTab === 'payments' && <PaymentsView />}{activeTab === 'users' && <UsersView />}{activeTab === 'notifications' && <NotificationsView />}{adminOperationIds.includes(activeTab as AdminOperationId) && <AdminOperationsView feature={activeTab as AdminOperationId} />}</section><footer className="border-t border-slate-200 bg-white px-6 py-3 text-[11px] text-slate-500 flex items-center justify-between"><span>TSM Admin Dashboard Service</span><span className="font-mono">business-api · v1.0</span></footer></main>
    </div>
  );
};
