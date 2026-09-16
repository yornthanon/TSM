import React from 'react';
import { AdminDashboardApp } from './admin-service/AdminDashboardApp';
import { ManagementApiApp } from './management-api-service/ManagementApiApp';

export const App: React.FC = () => {
  const path = window.location.pathname.toLowerCase();
  if (path.startsWith('/management-api') || path.startsWith('/api-management')) {
    return <ManagementApiApp />;
  }
  return <AdminDashboardApp />;
};
