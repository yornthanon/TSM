import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminLayout } from './layouts/AdminLayout';
import { RequireAuth } from './components/RequireAuth';
import { Navigate } from 'react-router-dom';

const Login = lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback').then((module) => ({ default: module.OAuthCallback })));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Events = lazy(() => import('./pages/admin/Events'));
const EventDetail = lazy(() => import('./pages/admin/EventDetail'));
const Inventory = lazy(() => import('./pages/admin/Inventory'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const Payments = lazy(() => import('./pages/admin/Payments'));
const Notifications = lazy(() => import('./pages/admin/Notifications'));
const Users = lazy(() => import('./pages/admin/Users'));
const Access = lazy(() => import('./pages/admin/Access'));
const System = lazy(() => import('./pages/admin/System'));

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
          <Suspense fallback={<div className="flex min-h-[45vh] items-center justify-center text-sm text-gray-400">Opening TicketDesk workspace…</div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/oauth/callback" element={<OAuthCallback />} />
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
          </Suspense>
        </HashRouter>
        <Toaster richColors position="bottom-right" />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
