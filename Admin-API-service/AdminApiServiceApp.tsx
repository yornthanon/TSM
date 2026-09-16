import React, { useState, useEffect } from 'react';
import { ApiServicesManagerView } from './components/ApiServicesManagerView';
import { ApiGatewayView } from './components/ApiGatewayView';
import { ApiLogDrawer } from './components/ApiLogDrawer';
import { api } from './services/apiClient';
import { ApiRequestLog } from './types/index';
import {
  Server,
  Activity,
  AlertTriangle,
  Sliders,
  Terminal,
  ShieldCheck,
  RefreshCw,
  Radio,
  Building2,
  CheckCircle,
} from 'lucide-react';

interface AdminApiServiceAppProps {
  onSwitchToDashboard?: () => void;
}

export const AdminApiServiceApp: React.FC<AdminApiServiceAppProps> = ({ onSwitchToDashboard }) => {
  const [activeTab, setActiveTab] = useState<'manager' | 'gateway' | 'routes'>('manager');
  const [logs, setLogs] = useState<ApiRequestLog[]>([]);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
  const [unresolvedErrorCount, setUnresolvedErrorCount] = useState(0);

  const refreshErrors = () => {
    const errs = api.getServiceErrors().filter((e) => !e.resolved);
    setUnresolvedErrorCount(errs.length);
  };

  useEffect(() => {
    setLogs(api.getLogs());
    refreshErrors();

    const unsubLogs = api.onLog((l) => setLogs((prev) => [l, ...prev.slice(0, 49)]));
    const unsubErrors = api.onError(() => refreshErrors());

    return () => {
      unsubLogs();
      unsubErrors();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      {/* Dedicated Admin-API-service Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 fixed inset-y-0 z-30 hidden lg:flex">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white text-sm tracking-tight">Admin-API-service</div>
              <div className="text-[10px] text-emerald-400 font-mono">Port :8087 • Diagnostic Hub</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            API & Services Management
          </div>

          <button
            onClick={() => setActiveTab('manager')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'manager'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4" />
              <span>គ្រប់គ្រង API & Service Errors</span>
            </div>
            {unresolvedErrorCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono animate-pulse">
                {unresolvedErrorCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('gateway')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'gateway'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Spring Cloud Gateway Routes</span>
          </button>
        </nav>

        {/* Bottom Health Status */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Actuator Health:</span>
            <span className="text-emerald-400 font-mono font-semibold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>UP</span>
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Gateway: 8080 • Redis: 6379
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <header className="px-6 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3 text-xs">
            <span className="font-bold text-slate-900 text-sm">
              {activeTab === 'manager'
                ? 'គ្រប់គ្រង API & តាមដាន Error តាម Service នីមួយៗ'
                : 'Spring Cloud Gateway Topology'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-mono text-[11px]">Admin-API-service (:8087)</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsLogDrawerOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center space-x-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
              <span>Live Traffic</span>
              <span className="px-1.5 py-0.2 bg-indigo-600 text-white rounded text-[10px] font-mono">
                {logs.length}
              </span>
            </button>

            {onSwitchToDashboard && (
              <button
                onClick={onSwitchToDashboard}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition"
              >
                Switch to Admin-Dashboards →
              </button>
            )}
          </div>
        </header>

        {/* Main View */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'manager' && <ApiServicesManagerView />}
          {activeTab === 'gateway' && <ApiGatewayView />}
        </main>

        {/* Log Drawer */}
        <ApiLogDrawer
          isOpen={isLogDrawerOpen}
          onClose={() => setIsLogDrawerOpen(false)}
          logs={logs}
          onClear={() => setLogs([])}
        />
      </div>
    </div>
  );
};
