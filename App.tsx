import React, { useState } from 'react';
import { AdminDashboardApp } from './Admin-Dashboards/AdminDashboardApp';
import { AdminApiServiceApp } from './Admin-API-service/AdminApiServiceApp';
import { Building2, Server, ArrowLeftRight, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  // Select which independent service to view
  const [activeService, setActiveService] = useState<'admin-dashboards' | 'admin-api-service'>('admin-dashboards');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Universal Microservices Switcher Bar */}
      <div className="bg-slate-950 text-white border-b border-slate-800 px-4 py-2.5 shrink-0 z-40 sticky top-0 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-900 border border-slate-700/60 rounded-md text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-white">TSM Ecosystem</span>
            </div>

            <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400">
              <span>សេវាដាច់ដោយឡែកពីគ្នា (Separate Services):</span>
            </div>
          </div>

          {/* Direct Service Switcher Buttons */}
          <div className="flex items-center space-x-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            {/* Service 1 Button */}
            <button
              id="switch-to-admin-dashboards-btn"
              onClick={() => setActiveService('admin-dashboards')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeService === 'admin-dashboards'
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Admin-Dashboards</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-800/80 text-indigo-200 font-mono hidden md:inline">
                Business & Sales
              </span>
            </button>

            {/* Service 2 Button */}
            <button
              id="switch-to-admin-api-service-btn"
              onClick={() => setActiveService('admin-api-service')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeService === 'admin-api-service'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Admin-API-service</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-800/80 text-emerald-200 font-mono hidden md:inline">
                Port :8087
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Render the Active Independent Service */}
      <div className="flex-1">
        {activeService === 'admin-dashboards' ? (
          <AdminDashboardApp onSwitchToApiService={() => setActiveService('admin-api-service')} />
        ) : (
          <AdminApiServiceApp onSwitchToDashboard={() => setActiveService('admin-dashboards')} />
        )}
      </div>
    </div>
  );
};
export default App;
