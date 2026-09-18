import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { AdminDashboardApp } from './admin-service/AdminDashboardApp';
import { ManagementApiApp } from './management-api-service/ManagementApiApp';
import { StoreLayout } from './components/store/StoreLayout';
import { useLanguage } from './i18n';
import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

/** Wraps storefront routes in the shared customer layout (bilingual). */
const Store: React.FC = () => {
  const { isKhmer } = useLanguage();
  return (
    <StoreLayout isKhmer={isKhmer}>
      <Outlet />
    </StoreLayout>
  );
};

export const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<Store />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders/:id" element={<OrderSuccessPage />} />
        <Route path="/tickets" element={<MyTicketsPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin-dashboard/*" element={<AdminDashboardApp />} />
      <Route path="/management-api/*" element={<ManagementApiApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);