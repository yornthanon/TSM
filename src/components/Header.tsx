import React, { useState } from 'react';
import { api } from '../services/apiClient';
import {
  Ticket as TicketIcon,
  Server,
  Activity,
  Shield,
  Radio,
  CheckCircle2,
  AlertCircle,
  Settings2,
  X,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenLogs: () => void;
  logCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenLogs,
  logCount,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [gatewayUrlInput, setGatewayUrlInput] = useState(api.getGatewayUrl());
  const [selectedMode, setSelectedMode] = useState<'live' | 'simulator'>(api.getMode());
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const currentUser = api.getCurrentUser();

  const handleSaveConfig = () => {
    api.setGatewayUrl(gatewayUrlInput);
    api.setMode(selectedMode);
    setShowConfigModal(false);
    window.location.reload();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus(null);
    try {
      const res = await fetch(`${gatewayUrlInput}/public/users/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok || res.status === 401 || res.status === 403 || res.status === 400) {
        setTestStatus('Gateway is REACHABLE (Spring Boot Gateway answered)');
      } else {
        setTestStatus(`Gateway responded with HTTP ${res.status}`);
      }
    } catch (e: any) {
      setTestStatus(`Cannot reach Gateway (${e.message}). Simulator mode recommended for preview.`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <header id="app-header" className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <TicketIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white font-sans">
                  TicketManagement
                </span>
                <span className="text-xs bg-indigo-900/80 text-indigo-300 px-2 py-0.5 rounded font-mono border border-indigo-700">
                  Microservices v4.1
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Spring Cloud Gateway • Kafka • Redis • PostgreSQL
              </p>
            </div>
          </div>

          {/* Center Actions / Mode badge */}
          <div className="flex items-center space-x-3">
            <button
              id="header-mode-toggle-btn"
              onClick={() => setShowConfigModal(true)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              title="Click to configure API Gateway endpoint & mode"
            >
              <Radio
                className={`w-3.5 h-3.5 ${
                  selectedMode === 'live' ? 'text-emerald-400 animate-pulse' : 'text-amber-400'
                }`}
              />
              <span className="text-slate-300">
                Mode:{' '}
                <strong className={selectedMode === 'live' ? 'text-emerald-400' : 'text-amber-300'}>
                  {selectedMode === 'live' ? 'Live Gateway (:8080)' : 'Microservices Simulator'}
                </strong>
              </span>
              <Settings2 className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {/* Live Logs Trigger Button */}
            <button
              id="header-live-logs-btn"
              onClick={onOpenLogs}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 transition text-slate-300"
            >
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>API Traffic</span>
              <span className="ml-1 bg-indigo-600/60 text-white px-1.5 py-0.2 rounded-full font-mono text-[10px]">
                {logCount}
              </span>
            </button>

            {/* User Profile */}
            <div className="hidden md:flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                {currentUser.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-left text-xs">
                <div className="font-semibold text-slate-200">{currentUser.username}</div>
                <div className="text-[10px] text-emerald-400 flex items-center space-x-1">
                  <Shield className="w-2.5 h-2.5" />
                  <span>{currentUser.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none text-xs font-medium">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'events', label: 'Events' },
            { id: 'tickets', label: 'Tickets & Redis Lock' },
            { id: 'orders', label: 'Orders & Kafka' },
            { id: 'payments', label: 'Payments' },
            { id: 'notifications', label: 'Notifications' },
            { id: 'users', label: 'Users & RBAC' },
            { id: 'gateway', label: 'API Gateway Explorer' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            id="gateway-config-modal"
            className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 text-slate-200 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-white">Backend Connection Settings</h3>
              </div>
              <button
                id="close-config-modal-btn"
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Connection Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMode('simulator')}
                    className={`p-3 rounded-lg border text-left transition ${
                      selectedMode === 'simulator'
                        ? 'border-indigo-500 bg-indigo-950/40 text-white'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-slate-200 mb-0.5">Simulator Mode</div>
                    <div className="text-[11px] text-slate-400">
                      In-memory full fidelity microservices, instant responses, Redis locks & Kafka flow.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMode('live')}
                    className={`p-3 rounded-lg border text-left transition ${
                      selectedMode === 'live'
                        ? 'border-emerald-500 bg-emerald-950/40 text-white'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-emerald-400 mb-0.5">Live Spring Boot</div>
                    <div className="text-[11px] text-slate-400">
                      Dispatches direct HTTP calls to your running Spring Cloud API Gateway (:8080).
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  API Gateway Base URL
                </label>
                <input
                  type="text"
                  value={gatewayUrlInput}
                  onChange={(e) => setGatewayUrlInput(e.target.value)}
                  placeholder="http://localhost:8080/api"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Default Spring Cloud Gateway port is <code className="text-indigo-300">8080</code> (Base path: <code className="text-indigo-300">/api</code>).
                </p>
              </div>

              {testStatus && (
                <div
                  className={`p-2.5 rounded-lg border text-[11px] flex items-start space-x-2 ${
                    testStatus.includes('REACHABLE')
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-amber-950/40 border-amber-800 text-amber-300'
                  }`}
                >
                  {testStatus.includes('REACHABLE') ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{testStatus}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                >
                  {isTesting ? 'Pinging Gateway...' : 'Ping Gateway'}
                </button>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveConfig}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md transition"
                  >
                    Save & Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
