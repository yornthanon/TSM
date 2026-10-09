import React, { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CustomerLayout } from './layouts/CustomerLayout';
import { RequireAuth } from './components/RequireAuth';
import { AUTH_CHANGED_EVENT } from 'frontend-shared/lib/auth';

const Login = lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback').then((module) => ({ default: module.OAuthCallback })));
const CustomerEvents = lazy(() => import('./pages/customer/Events'));
const CustomerEventDetail = lazy(() => import('./pages/customer/EventDetail'));
const CustomerOrders = lazy(() => import('./pages/customer/Orders'));
const PublicEvents = lazy(() => import('./pages/public/PublicEvents'));
const PublicEventDetail = lazy(() => import('./pages/public/PublicEventDetail'));
const CustomerCheckout = lazy(() => import('./pages/public/CustomerCheckout'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AUTH_STORAGE_KEYS = new Set([
  'auth_token', 'user', 'act_as_token', 'act_as_user', 'act_as_session_id', 'act_as_expires_at',
]);

const App: React.FC = () => {
  useEffect(() => {
    const clearPrivateCache = () => queryClient.clear();
    const clearOnStorageChange = (event: StorageEvent) => {
      if (event.key === null || AUTH_STORAGE_KEYS.has(event.key)) clearPrivateCache();
    };
    window.addEventListener(AUTH_CHANGED_EVENT, clearPrivateCache);
    window.addEventListener('storage', clearOnStorageChange);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, clearPrivateCache);
      window.removeEventListener('storage', clearOnStorageChange);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <Suspense fallback={<div className="flex min-h-[45vh] items-center justify-center text-sm text-gray-400">Opening KORA Cambodia…</div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/oauth/callback" element={<OAuthCallback />} />
              <Route path="/public/events" element={<PublicEvents />} />
              <Route path="/public/events/:id" element={<PublicEventDetail />} />
              <Route path="/public/events/:id/checkout" element={<CustomerCheckout />} />
              <Route
                path="/events"
                element={
                  <RequireAuth>
                    <CustomerLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<CustomerEvents />} />
                <Route path=":id" element={<CustomerEventDetail />} />
              </Route>
              <Route
                path="/orders"
                element={
                  <RequireAuth>
                    <CustomerLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<CustomerOrders />} />
              </Route>
              <Route path="*" element={<Navigate to="/events" replace />} />
            </Routes>
          </Suspense>
        </HashRouter>
        <Toaster richColors position="bottom-right" />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
