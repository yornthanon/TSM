import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  Kanban,
  Mail,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  Plus,
} from 'lucide-react';
import { cn } from '../utils';
import { auth } from '../lib/auth';
import type { User as AppUser } from '../types/api';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/tickets', icon: Ticket, label: 'Tickets' },
  { to: '/admin/kanban', icon: Kanban, label: 'Kanban board' },
  { to: '/admin/contacts', icon: Mail, label: 'Contacts' },
  { to: '/admin/api-monitor', icon: Activity, label: 'API Monitor' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/tickets': 'Tickets',
  '/admin/kanban': 'Kanban board',
  '/admin/contacts': 'Contacts',
  '/admin/api-monitor': 'API Monitor',
  '/admin/settings': 'Settings',
};

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.getUser() as AppUser | null;
  const title = pageTitles[location.pathname] || 'Ticket Manager';
  const initials = (user?.email || user?.username || 'U').charAt(0).toUpperCase();

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-white transform transition-transform duration-200 lg:translate-x-0 shadow-xl',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-20 flex items-center gap-3 px-6 border-b border-white/10">
          <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-extrabold shadow-lg shadow-orange-500/20">TM</div>
          <div>
            <p className="font-bold tracking-tight">Ticket Manager</p>
            <p className="text-[11px] text-slate-400">ADMIN CONSOLE</p>
          </div>
          <button aria-label="Close menu" className="lg:hidden ml-auto p-2 text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 pt-6 pb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Workspace</div>
        <nav className="px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                isActive ? 'bg-orange-500 text-white shadow-md shadow-orange-950/30' : 'text-slate-400 hover:bg-white/10 hover:text-white'
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
            <div className="h-9 w-9 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-300 font-bold text-sm">{initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.email || user?.username || 'Admin'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.role || 'Administrator'}</p>
            </div>
            <button aria-label="Log out" onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-red-300" title="Log out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-30 h-20 bg-white/95 backdrop-blur border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button aria-label="Open menu" className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg" onClick={() => setSidebarOpen(true)}><Menu className="h-5 w-5" /></button>
            <div>
              <p className="text-xs font-medium text-slate-400">Ticket Manager</p>
              <h1 className="text-lg font-bold text-slate-900">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/admin/tickets" className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-sm">
              <Plus className="h-4 w-4" /> New ticket
            </Link>
            <div className="relative">
              <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">{initials}</div>
                <span className="hidden md:block text-sm font-semibold text-slate-700 max-w-32 truncate">{user?.email || user?.username || 'Admin'}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-20">
                    <Link to="/admin/settings" className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setUserMenuOpen(false)}><User className="h-4 w-4" /> Profile settings</Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" /> Logout</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="mx-auto w-full max-w-[1440px]"><Outlet /></div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
