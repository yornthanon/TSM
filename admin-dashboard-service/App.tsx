import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { AdminDashboardApp } from './admin-service/AdminDashboardApp';
import { ManagementApiApp } from './management-api-service/ManagementApiApp';
import { StoreLayout } from './components/layout/StoreLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute, PublicOnlyRoute, AdminRoute } from './components/auth/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

const PublicRoutes = () => (
  <StoreLayout>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:id" element={<EventDetailPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders/:id" element={<OrderSuccessPage />} />
        <Route path="/tickets" element={<MyTicketsPage />} />
      </Route>
    </Routes>
  </StoreLayout>
);

const AuthRoutes = () => (
  <StoreLayout>
    <PublicOnlyRoute>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </PublicOnlyRoute>
  </StoreLayout>
);

const AdminRoutes = () => (
  <AdminRoute>
    <AdminLayout>
      <Routes>
        <Route path="/admin-dashboard" element={<AdminDashboardApp />} />
        <Route path="/admin-dashboard/events" element={<AdminDashboardApp />} />
        <Route path="/admin-dashboard/tickets" element={<AdminDashboardApp />} />
        <Route path="/admin-dashboard/orders" element={<AdminDashboardApp />} />
        <Route path="/admin-dashboard/payments" element={<AdminDashboardApp />} />
        <Route path="/admin-dashboard/users" element={<AdminDashboardApp />} />
        <Route path="/admin-dashboard/notifications" element={<AdminDashboardApp />} />
        <Route path="/admin-dashboard/reports" element={<AdminDashboardApp />} />
        <Route path="/admin-dashboard/refunds" element={<AdminDashboardApp />} />
        <Route path="/admin-dashboard/promotions" element={<AdminDashboardApp />} />
        <Route path="/admin-dashboard/organizers" element={<AdminDashboardApp />} />
        <Route path="/admin-dashboard/checkin" element={<AdminDashboardApp />} />
        <Route path="/admin-dashboard/audit" element={<AdminDashboardApp />} />
        <Route path="/admin-dashboard/settings" element={<AdminDashboardApp />} />
      </Routes>
    </AdminLayout>
  </AdminRoute>
);

export const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<PublicRoutes />} />
      <Route element={<AuthRoutes />} />
      <Route element={<AdminRoutes />} />
      <Route path="/management-api/*" element={<ManagementApiApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);