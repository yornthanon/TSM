import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  BarChart3,
  ChevronDown,
  CircleHelp,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Settings,
  Ticket,
  Users,
  X,
} from 'lucide-react';
import { cn } from '../utils';
import { auth } from '../lib/auth';
import type { User as AppUser } from '../types/api';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/tickets', icon: Inbox, label: 'Inbox' },
  { to: '/admin/kanban', icon: Ticket, label: 'Tickets' },
  { to: '/admin/contacts', icon: Users, label: 'Contacts' },
  { to: '/admin/api-monitor', icon: BarChart3, label: 'Reports' },
];

const pageTitles: Record<string, string> = {
  '/admin': 'Overview',
  '/admin/tickets': 'Inbox',
  '/admin/kanban': 'Tickets',
  '/admin/contacts': 'Contacts',
  '/admin/api-monitor': 'Reports',
  '/admin/settings': 'Settings',
};

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.getUser() as AppUser | null;
  const title = pageTitles[location.pathname] || 'Workspace';
  const initials = (user?.email || user?.username || 'A').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#292933] flex">
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col bg-[#24242d] text-white transition-transform duration-200 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-[72px] items-center gap-3 border-b border-white/[0.08] px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#7c5cff] shadow-[0_6px_18px_rgba(124,92,255,.35)]">
            <MessageCircle className="h-[19px] w-[19px] fill-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold tracking-[-0.02em]">Supportly</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">Workspace</p>
          </div>
          <button aria-label="Close menu" className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white lg:hidden" onClick={() => setSidebarOpen(false)}><X className="h-4 w-4" /></button>
        </div>

        <div className="px-3 pt-5">
          <button className="flex w-full items-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.06] px-3 py-2.5 text-left hover:bg-white/[0.1]">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#f8b84e] text-[10px] font-bold text-[#50320b]">A</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">Acme workspace</span><span className="block text-[10px] text-white/40">Team inbox</span></span>
            <ChevronDown className="h-3.5 w-3.5 text-white/40" />
          </button>
        </div>

        <div className="px-3 pt-7">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">Workspace</p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setSidebarOpen(false)} className={({ isActive }) => cn(
                'group flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-colors',
                isActive ? 'bg-[#7c5cff] text-white shadow-[0_5px_16px_rgba(124,92,255,.25)]' : 'text-white/55 hover:bg-white/[0.07] hover:text-white'
              )}>
                <item.icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
                <span className="flex-1">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="px-3 pt-7">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">Manage</p>
          <NavLink to="/admin/settings" className={({ isActive }) => cn('flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-colors', isActive ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/[0.07] hover:text-white')}>
            <Settings className="h-[17px] w-[17px]" strokeWidth={1.8} /> Settings
          </NavLink>
        </div>

        <div className="mt-auto space-y-3 border-t border-white/[0.08] p-4">
          <div className="flex items-center gap-2.5 rounded-[10px] px-2 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d8cfff] text-[11px] font-bold text-[#5540b7]">{initials}</div>
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-white/85">{user?.email || user?.username || 'Admin user'}</p><p className="text-[10px] text-white/40">Administrator</p></div>
            <button aria-label="Log out" onClick={handleLogout} className="rounded-md p-1.5 text-white/35 hover:bg-white/10 hover:text-white"><LogOut className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-[#17171d]/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-[248px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#e8e8ec] bg-white/90 px-4 backdrop-blur sm:px-7">
          <div className="flex items-center gap-3">
            <button aria-label="Open menu" className="rounded-lg p-2 text-[#777783] hover:bg-[#f3f3f5] lg:hidden" onClick={() => setSidebarOpen(true)}><Menu className="h-5 w-5" /></button>
            <div className="hidden items-center gap-2 text-xs text-[#9b9ba6] sm:flex"><span>Workspace</span><span>/</span><span className="font-medium text-[#50505c]">{title}</span></div>
            <h1 className="text-[15px] font-semibold tracking-[-0.02em] text-[#292933] sm:hidden">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="hidden items-center gap-2 rounded-lg border border-[#e7e7eb] bg-white px-3 py-2 text-xs text-[#94949e] shadow-sm transition hover:border-[#d3d0e8] hover:text-[#5c5c68] md:flex"><Search className="h-3.5 w-3.5" /> Search <span className="ml-5 rounded border border-[#e8e8ed] px-1.5 py-0.5 text-[10px]">⌘ K</span></button>
            <button aria-label="Help" className="rounded-lg p-2 text-[#8b8b96] hover:bg-[#f5f5f7] hover:text-[#575762]"><CircleHelp className="h-[17px] w-[17px]" /></button>
            <Link to="/admin/tickets" className="inline-flex items-center gap-1.5 rounded-[9px] bg-[#7c5cff] px-3 py-2 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(124,92,255,.2)] transition hover:bg-[#6d4feb]"><Plus className="h-3.5 w-3.5" /> New conversation</Link>
            <div className="relative ml-1">
              <button aria-label="Open profile menu" className="flex items-center gap-1.5 rounded-lg p-1 hover:bg-[#f5f5f7]" onClick={() => setUserMenuOpen((open) => !open)}><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e6e1ff] text-[11px] font-bold text-[#5c46c4]">{initials}</div><ChevronDown className="hidden h-3.5 w-3.5 text-[#9999a3] sm:block" /></button>
              {userMenuOpen && <><div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} /><div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-[#e8e8ec] bg-white py-1 shadow-[0_12px_30px_rgba(30,30,45,.12)]"><Link to="/admin/settings" onClick={() => setUserMenuOpen(false)} className="block px-3.5 py-2.5 text-xs text-[#545461] hover:bg-[#f7f7f9]">Profile settings</Link><button onClick={handleLogout} className="w-full px-3.5 py-2.5 text-left text-xs text-[#d34c62] hover:bg-[#fff5f6]">Log out</button></div></>}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto px-4 py-6 sm:px-7 sm:py-8"><div className="mx-auto w-full max-w-[1380px]"><Outlet /></div></main>
      </div>
    </div>
  );
};

export default AdminLayout;
