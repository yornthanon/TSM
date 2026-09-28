import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  Bell,
  CalendarDays,
  ChevronDown,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Server,
  ShoppingCart,
  Ticket,
  Users,
  X,
} from 'lucide-react';
import { cn } from '../utils';
import { auth } from '../lib/auth';
import type { User as AppUser } from '../types/api';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/events', icon: CalendarDays, label: 'Events' },
  { to: '/admin/inventory', icon: Ticket, label: 'Inventory' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { to: '/admin/users', icon: Users, label: 'Users' },
];

const manageItems = [
  { to: '/admin/access', icon: KeyRound, label: 'Access control' },
  { to: '/admin/system', icon: Server, label: 'System' },
];

/** Longest-prefix match so nested routes such as /admin/events/12 keep the Events tab lit. */
function titleFor(pathname: string): string {
  const all = [...navItems, ...manageItems];
  const match = all
    .filter((item) => (item.to === '/admin' ? pathname === '/admin' : pathname.startsWith(item.to)))
    .sort((a, b) => b.to.length - a.to.length)[0];
  return match?.label ?? 'Overview';
}

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.getUser() as AppUser | null;
  const title = titleFor(location.pathname);
  const initials = (user?.email || user?.username || 'A').slice(0, 2).toUpperCase();
  const isAdmin = user?.role === 'ADMIN';

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
            <Ticket className="h-[19px] w-[19px] fill-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold tracking-[-0.02em]">TicketDesk</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">Admin</p>
          </div>
          <button aria-label="Close menu" className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white lg:hidden" onClick={() => setSidebarOpen(false)}><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto pb-4">
          <div className="px-3 pt-5">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">Ticketing</p>
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

          {isAdmin && (
            <div className="px-3 pt-7">
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">Manage</p>
              <nav className="space-y-1">
                {manageItems.map((item) => (
                  <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)} className={({ isActive }) => cn(
                    'flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-colors',
                    isActive ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/[0.07] hover:text-white'
                  )}>
                    <item.icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
                    <span className="flex-1">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>

        <div className="mt-auto space-y-3 border-t border-white/[0.08] p-4">
          <div className="flex items-center gap-2.5 rounded-[10px] px-2 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d8cfff] text-[11px] font-bold text-[#5540b7]">{initials}</div>
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-white/85">{user?.email || user?.username || 'Admin user'}</p><p className="text-[10px] text-white/40">{user?.role ?? 'USER'}</p></div>
            <button aria-label="Log out" onClick={handleLogout} className="rounded-md p-1.5 text-white/35 hover:bg-white/10 hover:text-white"><LogOut className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-[#17171d]/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-[248px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#e8e8ec] bg-white/90 px-4 backdrop-blur sm:px-7">
          <div className="flex items-center gap-3">
            <button aria-label="Open menu" className="rounded-lg p-2 text-[#777783] hover:bg-[#f3f3f5] lg:hidden" onClick={() => setSidebarOpen(true)}><Menu className="h-5 w-5" /></button>
            <div className="hidden items-center gap-2 text-xs text-[#9b9ba6] sm:flex"><span>Ticketing</span><span>/</span><span className="font-medium text-[#50505c]">{title}</span></div>
            <h1 className="text-[15px] font-semibold tracking-[-0.02em] text-[#292933] sm:hidden">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/system" className="hidden items-center gap-2 rounded-lg border border-[#e7e7eb] bg-white px-3 py-2 text-xs text-[#94949e] shadow-sm transition hover:border-[#d3d0e8] hover:text-[#5c5c68] md:flex"><Activity className="h-3.5 w-3.5" /> System status</Link>
            <Link to="/admin/events" className="inline-flex items-center gap-1.5 rounded-[9px] bg-[#7c5cff] px-3 py-2 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(124,92,255,.2)] transition hover:bg-[#6d4feb]"><Plus className="h-3.5 w-3.5" /> New event</Link>
            <div className="relative ml-1">
              <button aria-label="Open profile menu" className="flex items-center gap-1.5 rounded-lg p-1 hover:bg-[#f5f5f7]" onClick={() => setUserMenuOpen((open) => !open)}><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e6e1ff] text-[11px] font-bold text-[#5c46c4]">{initials}</div><ChevronDown className="hidden h-3.5 w-3.5 text-[#9999a3] sm:block" /></button>
              {userMenuOpen && <><div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} /><div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-[#e8e8ec] bg-white py-1 shadow-[0_12px_30px_rgba(30,30,45,.12)]"><Link to="/admin/users" onClick={() => setUserMenuOpen(false)} className="block px-3.5 py-2.5 text-xs text-[#545461] hover:bg-[#f7f7f9]">Manage users</Link><button onClick={handleLogout} className="w-full px-3.5 py-2.5 text-left text-xs text-[#d34c62] hover:bg-[#fff5f6]">Log out</button></div></>}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto px-4 py-6 sm:px-7 sm:py-8"><div className="mx-auto w-full max-w-[1380px]"><Outlet /></div></main>
      </div>
    </div>
  );
};

export default AdminLayout;
