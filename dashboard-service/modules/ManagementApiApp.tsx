import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, ExternalLink, Menu, Network, Server, ShieldCheck, Terminal, X } from 'lucide-react';
import { ApiLogDrawer } from '../components/ApiLogDrawer';
import { ApiServicesManagerView } from '../components/ApiServicesManagerView';
import { NotificationsView } from '../components/NotificationsView';
import { api } from '../services/apiClient';
import { ApiRequestLog } from '../types';
import { LanguageSwitcher, useLanguage } from '../i18n';

export const ManagementApiApp: React.FC = () => {
  const { isKhmer } = useLanguage();
  const [activeTab, setActiveTab] = useState<'api-manager' | 'notifications'>('api-manager');
  const [logs, setLogs] = useState<ApiRequestLog[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    setLogs(api.getLogs());
    const updateErrors = () => setErrorCount(api.getServiceErrors().filter((error) => !error.resolved).length);
    updateErrors();
    const offLog = api.onLog((log) => setLogs((previous) => [log, ...previous.slice(0, 49)]));
    const offError = api.onError(updateErrors);
    return () => { offLog(); offError(); };
  }, []);

  const go = (tab: 'api-manager' | 'notifications') => { setActiveTab(tab); setMobileOpen(false); };
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="lg:hidden sticky top-0 z-30 bg-slate-950 text-white px-4 py-3 flex items-center justify-between"><button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg bg-slate-800">{mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center font-black text-xs">TSM</div><span className="font-bold">{isKhmer ? 'គ្រប់គ្រង API' : 'Management API'}</span></div><LanguageSwitcher dark /></div>
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-950 text-white border-r border-slate-800 transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black">API</div><div><div className="font-bold tracking-tight">{isKhmer ? 'គ្រប់គ្រង API' : 'Management API'}</div><div className="text-[11px] text-slate-400 font-mono">{isKhmer ? 'ប្រតិបត្តិការប្រព័ន្ធ' : 'PLATFORM OPERATIONS'}</div></div></div><div className="mt-5 rounded-xl bg-cyan-500/10 border border-cyan-400/20 px-3 py-2.5"><div className="text-[10px] uppercase tracking-widest text-cyan-300 font-bold">{isKhmer ? 'កន្លែងធ្វើការ' : 'Workspace'}</div><div className="text-sm font-semibold mt-1">{isKhmer ? 'Gateway និង Diagnostics' : 'Gateway & Diagnostics'}</div></div></div>
        <nav className="p-4 space-y-1"><div className="px-3 pb-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">{isKhmer ? 'ម៉ូឌុល API' : 'API modules'}</div><button onClick={() => go('api-manager')} className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl ${activeTab === 'api-manager' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}><Server className="w-5 h-5" /><span><span className="block text-sm font-semibold">{isKhmer ? 'API និង Services' : 'API & Services'}</span><span className="block text-[10px] mt-0.5 opacity-70">{isKhmer ? 'សុខភាព, routes និង errors' : 'Health, routes & errors'}</span></span>{errorCount > 0 && <span className="ml-auto px-1.5 py-0.5 rounded bg-rose-500 text-white text-[10px] font-mono">{errorCount}</span>}</button><button onClick={() => go('notifications')} className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl ${activeTab === 'notifications' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}><Network className="w-5 h-5" /><span><span className="block text-sm font-semibold">{isKhmer ? 'Event Stream' : 'Event Stream'}</span><span className="block text-[10px] mt-0.5 opacity-70">{isKhmer ? 'ការជូនដំណឹង Kafka' : 'Kafka notifications'}</span></span></button></nav>
        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-slate-800"><button onClick={() => setDrawerOpen(true)} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300"><Activity className="w-5 h-5 text-cyan-400" /><span className="text-left"><span className="block text-sm font-semibold">Live API Traffic</span><span className="block text-[10px] text-slate-500 font-mono">{logs.length} captured requests</span></span></button></div>
      </aside>
      <main className="lg:pl-72 min-h-screen flex flex-col"><header className="hidden lg:flex h-20 bg-white border-b border-slate-200 items-center justify-between px-8 sticky top-0 z-20"><div><div className="text-xs uppercase tracking-widest text-cyan-600 font-bold">Management API Service</div><h1 className="text-xl font-bold text-slate-900 mt-1">{activeTab === 'api-manager' ? (isKhmer ? 'API Gateway និង Service Diagnostics' : 'API Gateway & Service Diagnostics') : (isKhmer ? 'តាមដាន Event Stream' : 'Event Stream Monitoring')}</h1></div><div className="flex items-center gap-3"><LanguageSwitcher /><a href="/admin-dashboard" className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition">{isKhmer ? '← Admin Dashboard' : '← Admin Dashboard'}</a><button onClick={() => setDrawerOpen(true)} className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold flex items-center gap-2"><Terminal className="w-4 h-4 text-cyan-600" />{isKhmer ? 'ចរាចរ API' : 'Live traffic'} <span className="font-mono text-cyan-700">{logs.length}</span></button><div className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />{isKhmer ? 'Gateway ដំណើរការ' : 'Gateway online'}</div></div></header><section className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{activeTab === 'api-manager' ? <ApiServicesManagerView /> : <NotificationsView />}</section><footer className="border-t border-slate-200 bg-white px-8 py-4 text-xs text-slate-500 flex items-center justify-between"><span>TSM Management API Service</span><span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600" />Spring Cloud Gateway · Redis · Kafka</span></footer></main><ApiLogDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} logs={logs} onClear={() => { api.clearLogs(); setLogs([]); }} />
    </div>
  );
};

void AlertTriangle;
void ExternalLink;
