import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminLayout } from './layouts/AdminLayout';
import { RequireAuth } from './components/RequireAuth';
import { Login } from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import Events from './pages/admin/Events';
import EventDetail from './pages/admin/EventDetail';
import Inventory from './pages/admin/Inventory';
import Orders from './pages/admin/Orders';
import Payments from './pages/admin/Payments';
import Notifications from './pages/admin/Notifications';
import Users from './pages/admin/Users';
import Access from './pages/admin/Access';
import System from './pages/admin/System';
import { Navigate } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="events" element={<Events />} />
              <Route path="events/:id" element={<EventDetail />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="orders" element={<Orders />} />
              <Route path="payments" element={<Payments />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="users" element={<Users />} />
              <Route path="access" element={<Access />} />
              <Route path="system" element={<System />} />
            </Route>
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </HashRouter>
        <Toaster richColors position="bottom-right" />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
