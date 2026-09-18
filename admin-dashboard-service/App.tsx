import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminDashboardApp } from './admin-service/AdminDashboardApp';
import { ManagementApiApp } from './management-api-service/ManagementApiApp';
import { StoreLayout } from './components/store/StoreLayout';
import { PublicLayout } from './components/store/PublicLayout';
import { ProtectedRoute, PublicOnlyRoute, AdminRoute } from './components/auth/ProtectedRoute';
import { useLanguage } from './i18n';
import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

const Store: React.FC = () => {
  const { isKhmer } = useLanguage();
  return (
    <StoreLayout isKhmer={isKhmer}>
      <ProtectedRoute>
        <Routes>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders/:id" element={<OrderSuccessPage />} />
          <Route path="/tickets" element={<MyTicketsPage />} />
        </Routes>
      </ProtectedRoute>
    </StoreLayout>
  );
};

const Public: React.FC = () => (
  <PublicLayout>
    <PublicOnlyRoute>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </PublicOnlyRoute>
  </PublicLayout>
);

const Admin: React.FC = () => (
  <AdminRoute>
    <AdminDashboardApp />
  </AdminRoute>
);

export const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<Store />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
      </Route>
      <Route element={<Public />} />
      <Route path="/admin-dashboard/*" element={<Admin />} />
      <Route path="/management-api/*" element={<ManagementApiApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);