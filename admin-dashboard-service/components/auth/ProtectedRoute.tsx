import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { Spinner } from '../ui/Button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/login',
}) => {
  const { isAuthenticated, ready, isAdmin } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Spinner className="w-8 h-8 text-brand-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const { identity } = useAuth();
    if (identity && !allowedRoles.includes(identity.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

interface PublicOnlyRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({
  children,
  fallbackPath = '/',
}) => {
  const { isAuthenticated, ready } = useAuth();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Spinner className="w-8 h-8 text-brand-600" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

interface AdminRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({
  children,
  fallbackPath = '/',
}) => {
  const { isAuthenticated, ready, isAdmin } = useAuth();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Spinner className="w-8 h-8 text-brand-600" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};