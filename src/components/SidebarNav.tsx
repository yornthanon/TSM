import React, { useState, useEffect } from 'react';
import { api } from '../services/apiClient';
import { User, RoleType } from '../types/index';
import {
  LayoutDashboard,
  Calendar,
  Ticket as TicketIcon,
  ShoppingCart,
  CreditCard,
  Bell,
  Users,
  Server,
  Activity,
  Settings,
  ChevronRight,
  Shield,
  Menu,
  X,
  Sparkles,
  ExternalLink,
  Check,
} from 'lucide-react';

interface SidebarNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenLogs: () => void;
  logCount: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenLogs,
  logCount,
}) => {
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string }>(api.getCurrentUser());
  const [mode, setMode] = useState<'simulator' | 'live'>(api.getMode());
  const [gatewayUrl, setGatewayUrl] = useState<string>(api.getGatewayUrl());
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeErrorsCount, setActiveErrorsCount] = useState(0);

  useEffect(() => {
    const updateErrorCount = () => {
      const errs = api.getServiceErrors().filter((e) => !e.resolved);
      setActiveErrorsCount(errs.length);
    };
    updateErrorCount();
    const unsub = api.onError(() => updateErrorCount());
    return () => unsub();
  }, []);

  const isApiPortal = activeTab === 'api-manager' || activeTab === 'gateway';

  const navSections = [
    {
      title: 'ADMIN BUSINESS PORTAL (អាជីវកម្ម & រដ្ឋបាល)',
      items: [
        { id: 'dashboard', label: 'ផ្ទាំងគ្រប់គ្រងការលក់ (Sales Dashboard)', icon: LayoutDashboard, badge: 'Admin' },
        { id: 'events', label: 'កម្មវិធី & Shows (Events Catalog)', icon: Calendar, badge: '8082' },
        { id: 'tickets', label: 'ស្តុកសំបុត្រ & កៅអី (Ticket Inventory)', icon: TicketIcon, badge: 'Redis' },
        { id: 'orders', label: 'ការកុម្ម៉ង់ & Checkout (Orders)', icon: ShoppingCart, badge: '8084' },
        { id: 'payments', label: 'បញ្ជីទូទាត់ប្រាក់ (Payment Ledger)', icon: CreditCard, badge: '8085' },
        { id: 'users', label: 'អ្នកប្រើប្រាស់ & RBAC (Users)', icon: Users, badge: '8081' },
      ],
    },
    {
      title: 'API & SERVICES HUB (គ្រប់គ្រង API & ERROR)',
      items: [
        {
          id: 'api-manager',
          label: 'គ្រប់គ្រង API & Error Diagnostics',
          icon: Server,
          badge: activeErrorsCount > 0 ? `${activeErrorsCount} ERR` : '8080',
          badgeColor: activeErrorsCount > 0 ? 'bg-rose-500 text-white animate-pulse' : undefined,
        },
        { id: 'notifications', label: 'Kafka Event Stream (Notifications)', icon: Bell, badge: 'Kafka' },
      ],
    },
  ];

  const handleSaveConfig = () => {
    api.setMode(mode);
    api.setGatewayUrl(gatewayUrl);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setShowConfigModal(false);
    }, 600);
  };

  const handleSwitchRole = (newRole: RoleType) => {
    const nextUser = {
      ...currentUser,
      role: newRole,
      username: newRole === 'ROLE_ADMIN' ? 'admin' : newRole === 'ROLE_ORGANIZER' ? 'organizer_sreymom' : 'buyer_channa',
    };
    api.setCurrentUser(nextUser);
    setCurrentUser(nextUser);
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs text-white">
              TSM
            </div>
            <span className="font-bold text-sm tracking-tight">TicketManagement</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenLogs}
            className="px-2 py-1 rounded bg-slate-800 text-[11px] font-mono text-indigo-300 flex items-center space-x-1"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>{logCount}</span>
          </button>
          <button
            onClick={() => setShowConfigModal(true)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sidebar navigation */}
      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & App Branding */}
          <div className="p-5 border-b border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-md shadow-indigo-600/30 flex items-center justify-center text-white font-black text-sm">
                  TSM
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white tracking-tight flex items-center space-x-1.5">
                    <span>Ticket Platform</span>
                  </h1>
                  <p className="text-[11px] text-slate-400 font-mono">Microservices v1.0</p>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Active Mode Badge */}
            <div className="mt-3.5 flex items-center justify-between bg-slate-950/70 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${mode === 'simulator' ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'}`}></span>
                <span className="text-slate-300 font-medium capitalize text-[11px]">
                  {mode === 'simulator' ? 'Simulator Active' : 'Live Gateway :8080'}
                </span>
              </div>
              <button
                id="sidebar-config-open-btn"
                onClick={() => setShowConfigModal(true)}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold uppercase tracking-wider"
              >
                Config
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-5">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      id={`nav-item-${item.id}`}
                      onClick={() => {
                        onSelectTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                        isActive
                          ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                            (item as any).badgeColor
                              ? (item as any).badgeColor
                              : isActive
                              ? 'bg-indigo-700/80 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* User Profile & Role Switcher */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/50 space-y-2">
            <div className="flex items-center justify-between px-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-bold flex items-center justify-center text-[11px]">
                  {currentUser.username.substring(0, 2).toUpperCase()}
                </div>
                <div className="leading-tight">
                  <div className="font-semibold text-white text-[12px] truncate max-w-[100px]">
                    {currentUser.username}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono">
                    {currentUser.role}
                  </div>
                </div>
              </div>

              <button
                id="sidebar-traffic-btn"
                onClick={onOpenLogs}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white relative"
                title="Open Live API Network Traffic"
              >
                <Activity className="w-4 h-4 text-indigo-400" />
                {logCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center">
                    {logCount > 9 ? '9+' : logCount}
                  </span>
                )}
              </button>
            </div>

            {/* Fast Role Quick Toggle */}
            <div className="grid grid-cols-3 gap-1 pt-1 text-[9px]">
              <button
                onClick={() => handleSwitchRole('ROLE_ADMIN')}
                className={`py-1 rounded text-center transition font-semibold ${
                  currentUser.role === 'ROLE_ADMIN'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => handleSwitchRole('ROLE_ORGANIZER')}
                className={`py-1 rounded text-center transition font-semibold ${
                  currentUser.role === 'ROLE_ORGANIZER'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Organizer
              </button>
              <button
                onClick={() => handleSwitchRole('ROLE_USER')}
                className={`py-1 rounded text-center transition font-semibold ${
                  currentUser.role === 'ROLE_USER'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Buyer
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
        ></div>
      )}

      {/* Connection & Mode Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">API Gateway & Backend Setup</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-2">Operating Mode:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('simulator')}
                    className={`p-3 rounded-lg border text-left transition ${
                      mode === 'simulator'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold">Simulator Mode</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Works 100% in browser with Redis lock & Kafka simulators.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('live')}
                    className={`p-3 rounded-lg border text-left transition ${
                      mode === 'live'
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold">Live Gateway Mode</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Sends real HTTP calls to Spring Cloud Gateway (:8080).
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  API Gateway URL
                </label>
                <input
                  type="text"
                  value={gatewayUrl}
                  onChange={(e) => setGatewayUrl(e.target.value)}
                  placeholder="http://localhost:8080/api"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-xs focus:outline-hidden focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Routes all microservices requests through the Spring Cloud Gateway.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-[11px] text-slate-600">
                <div className="font-semibold text-slate-800">Docker Compose Quick Start:</div>
                <code className="block bg-slate-900 text-slate-100 p-2 rounded font-mono text-[10px]">
                  docker-compose -f Deployment/infrastructure/docker-compose.yaml up -d
                </code>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-xs flex items-center space-x-1"
                >
                  {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : null}
                  <span>{savedSuccess ? 'Saved!' : 'Apply Settings'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
