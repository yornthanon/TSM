import React from 'react';
import { CalendarDays, LogOut, LayoutDashboard, Ticket } from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { auth } from '../lib/auth';
import { cn } from '../utils';

export const CustomerLayout: React.FC = () => {
  const navigate = useNavigate();
  const user = auth.getUser();

  const logout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0f141b] text-[#dfe1e5]">
      <header className="sticky top-0 z-20 border-b border-[#2b2d30] bg-[#15191f]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/events" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3574f0] text-white shadow-lg shadow-[#3574f0]/20">
              <Ticket className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-wide text-white">TicketDesk</span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-[#7f8794]">Customer space</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Customer navigation">
            <NavLink to="/events" className={({ isActive }) => cn('flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors', isActive ? 'bg-[#243657] text-white' : 'text-[#9da0a8] hover:bg-[#202630] hover:text-white')}>
              <CalendarDays className="h-4 w-4" /> Browse events
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => cn('flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors', isActive ? 'bg-[#243657] text-white' : 'text-[#9da0a8] hover:bg-[#202630] hover:text-white')}>
              <Ticket className="h-4 w-4" /> My orders
            </NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-[180px] truncate text-xs text-[#9da0a8] sm:block">{user?.email ?? user?.username}</span>
            <Link to="/admin" title="Open staff dashboard" className="rounded-lg border border-[#343a45] p-2 text-[#9da0a8] hover:border-[#4b74b9] hover:text-white">
              <LayoutDashboard className="h-4 w-4" />
            </Link>
            <button type="button" onClick={logout} title="Sign out" className="rounded-lg border border-[#343a45] p-2 text-[#9da0a8] hover:border-[#f07178] hover:text-[#f07178]">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex gap-1 border-t border-[#20242b] px-4 py-2 sm:hidden">
          <NavLink to="/events" className={({ isActive }) => cn('flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs', isActive ? 'bg-[#243657] text-white' : 'text-[#9da0a8]')}><CalendarDays className="h-4 w-4" /> Events</NavLink>
          <NavLink to="/orders" className={({ isActive }) => cn('flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs', isActive ? 'bg-[#243657] text-white' : 'text-[#9da0a8]')}><Ticket className="h-4 w-4" /> Orders</NavLink>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><Outlet /></main>
    </div>
  );
};
