import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DashboardView } from '../components/DashboardView';
import { EventsView } from '../components/EventsView';
import { TicketsView } from '../components/TicketsView';
import { OrdersView } from '../components/OrdersView';
import { PaymentsView } from '../components/PaymentsView';
import { UsersView } from '../components/UsersView';
import { NotificationsView } from '../components/NotificationsView';
import { AdminOperationId, AdminOperationsView } from '../components/AdminOperationsView';
import { EventItem, Ticket as TicketType } from '../types';
import { useLanguage } from '../i18n';

const items = [
  { path: '/admin-dashboard', id: 'dashboard', km: 'ផ្ទាំងសង្ខេប', en: 'Overview', captionKm: 'សេចក្តីសង្ខេបការលក់', captionEn: 'Sales overview' },
  { path: '/admin-dashboard/events', id: 'events', km: 'កម្មវិធី & Shows', en: 'Events', captionKm: 'កាតាឡុកកម្មវិធី', captionEn: 'Events catalog' },
  { path: '/admin-dashboard/tickets', id: 'tickets', km: 'សំបុត្រ & កៅអី', en: 'Tickets', captionKm: 'ស្តុកសំបុត្រ', captionEn: 'Ticket inventory' },
  { path: '/admin-dashboard/orders', id: 'orders', km: 'ការកុម្ម៉ង់', en: 'Orders', captionKm: 'ការកុម្ម៉ង់ និង checkout', captionEn: 'Orders & checkout' },
  { path: '/admin-dashboard/payments', id: 'payments', km: 'ការទូទាត់', en: 'Payments', captionKm: 'បញ្ជីទូទាត់ប្រាក់', captionEn: 'Payment ledger' },
  { path: '/admin-dashboard/users', id: 'users', km: 'អ្នកប្រើប្រាស់', en: 'Users', captionKm: 'អ្នកប្រើប្រាស់ និង RBAC', captionEn: 'Users & RBAC' },
  { path: '/admin-dashboard/notifications', id: 'notifications', km: 'ការជូនដំណឹង', en: 'Notifications', captionKm: 'អ៊ីមែល និង SMS', captionEn: 'Email & SMS delivery' },
  { path: '/admin-dashboard/reports', id: 'reports', km: 'របាយការណ៍ និងវិភាគ', en: 'Reports & Analytics', captionKm: 'ចំណូល និងលទ្ធផល', captionEn: 'Revenue & performance' },
  { path: '/admin-dashboard/settings', id: 'settings', km: 'ការកំណត់ប្រព័ន្ធ', en: 'System Settings', captionKm: 'ចំណូលចិត្ត និងសុវត្ថិភាព', captionEn: 'Preferences & security' },
];

const adminOperationIds: AdminOperationId[] = ['reports', 'refunds', 'promotions', 'organizers', 'checkin', 'audit', 'settings'];

export const AdminDashboardApp: React.FC = () => {
  const { isKhmer } = useLanguage();
  const location = useLocation();
  const [initialTicket, setInitialTicket] = useState<TicketType | null>(null);

  const handleSelectEvent = (_event: EventItem) => {
    // Navigate to orders tab
  };
  const handleProceed = (ticket: TicketType) => {
    setInitialTicket(ticket);
  };

  // Determine active tab from location
  const getActiveTab = () => {
    const pathname = location.pathname;
    if (pathname.startsWith('/admin-dashboard/events')) return 'events';
    if (pathname.startsWith('/admin-dashboard/tickets')) return 'tickets';
    if (pathname.startsWith('/admin-dashboard/orders')) return 'orders';
    if (pathname.startsWith('/admin-dashboard/payments')) return 'payments';
    if (pathname.startsWith('/admin-dashboard/users')) return 'users';
    if (pathname.startsWith('/admin-dashboard/notifications')) return 'notifications';
    if (pathname.startsWith('/admin-dashboard/reports')) return 'reports';
    if (pathname.startsWith('/admin-dashboard/settings')) return 'settings';
    if (pathname.startsWith('/admin-dashboard/refunds')) return 'refunds';
    if (pathname.startsWith('/admin-dashboard/promotions')) return 'promotions';
    if (pathname.startsWith('/admin-dashboard/organizers')) return 'organizers';
    if (pathname.startsWith('/admin-dashboard/checkin')) return 'checkin';
    if (pathname.startsWith('/admin-dashboard/audit')) return 'audit';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  return (
    <>
      {activeTab === 'dashboard' && <DashboardView onNavigate={() => {}} />}
      {activeTab === 'events' && <EventsView onSelectEventForBooking={handleSelectEvent} onNavigateToTickets={() => {}} />}
      {activeTab === 'tickets' && <TicketsView onProceedToOrder={handleProceed} />}
      {activeTab === 'orders' && <OrdersView initialTicket={initialTicket} onClearInitialTicket={() => setInitialTicket(null)} onNavigateToNotifications={() => {}} />}
      {activeTab === 'payments' && <PaymentsView />}
      {activeTab === 'users' && <UsersView />}
      {activeTab === 'notifications' && <NotificationsView />}
      {adminOperationIds.includes(activeTab as AdminOperationId) && <AdminOperationsView feature={activeTab as AdminOperationId} />}
    </>
  );
};