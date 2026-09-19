'use client';

import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Ticket, Sparkles, LayoutDashboard, MapPin } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useLanguage } from '../../i18n';
import { Button, ThemeToggle } from '../ui';
import { cn } from '../ui/utils';

const navItems = [
  { to: '/', label: 'Home', labelKm: 'ទំព័រដើម', end: true },
  { to: '/events', label: 'Events', labelKm: 'កម្មវិធី', end: false },
  { to: '/tickets', label: 'My Tickets', labelKm: 'សំបុត្ររបស់ខ្ញុំ', end: true },
];

export function StoreLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { identity, logout } = useAuth();
  const { isKhmer } = useLanguage();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white">
                <Ticket className="w-4.5 h-4.5" />
              </div>
              <div className="leading-tight hidden sm:block">
                <div className="font-semibold text-slate-900 dark:text-slate-100 tracking-tight text-[15px]">TicketPlatform</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5">
                  {isKhmer ? 'វេទិកាលក់សំបុត្រ' : 'Cambodia Events & Shows'}
                </div>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )
                  }
                >
                  {isKhmer ? item.labelKm : item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2.5">
              <ThemeToggle />

              {identity ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/checkout"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden lg:inline">{isKhmer ? 'កក់សំបុត្រ' : 'Booking'}</span>
                  </Link>
                  <Link
                    to="/admin-dashboard"
                    className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin
                  </Link>
                  <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                      {identity.username.slice(0, 2).toUpperCase()}
                    </div>
                    <button onClick={logout} className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                      {isKhmer ? 'ចាកចេញ' : 'Sign out'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                    {isKhmer ? 'ចូលប្រើ' : 'Sign in'}
                  </Link>
                  <Link to="/register" className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors">
                    {isKhmer ? 'ចុះឈ្មោះ' : 'Register'}
                  </Link>
                </div>
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <nav className="md:hidden border-t border-slate-200 dark:border-slate-800 py-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn('block px-3 py-2.5 rounded-lg text-sm font-medium', isActive ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400')
                  }
                >
                  {isKhmer ? item.labelKm : item.label}
                </NavLink>
              ))}
              {identity && (
                <NavLink to="/admin-dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400">
                  Admin Dashboard
                </NavLink>
              )}
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                <Ticket className="w-4 h-4" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">TicketPlatform</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed max-w-xs">
              {isKhmer
                ? 'វេទិកាលក់សំបុត្រកម្មវិធី និងការកម្សាន្តឈានមុខគេក្នុងប្រទេសកម្ពុជា។'
                : 'The leading events & entertainment ticketing platform in Cambodia.'}
            </p>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">{isKhmer ? 'ការរុករក' : 'Explore'}</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/events" className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Events</Link></li>
              <li><Link to="/tickets" className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">My Tickets</Link></li>
              <li><Link to="/admin-dashboard" className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">{isKhmer ? 'ទំនាក់ទំនង' : 'Contact'}</div>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" /> Phnom Penh, Cambodia
            </p>
          </div>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-[11px] text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} TicketPlatform · Spring Cloud · React · Redis
        </div>
      </footer>
    </div>
  );
}