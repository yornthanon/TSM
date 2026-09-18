import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, MapPin, Sparkles, Ticket } from 'lucide-react';
import { LanguageSwitcher } from '../../i18n';
import { useAuth } from '../../lib/auth';
import { clsx } from '../ui/Button';

const navItems = [
  { to: '/', label: 'Home', labelKm: 'ទំព័រដើម', end: true },
  { to: '/events', label: 'Events', labelKm: 'កម្មវិធី', end: false },
  { to: '/tickets', label: 'My Tickets', labelKm: 'សំបុត្ររបស់ខ្ញុំ', end: true },
];

export const StoreLayout: React.FC<{ isKhmer: boolean; children: React.ReactNode }> = ({ isKhmer, children }) => {
  const [open, setOpen] = useState(false);
  const { identity, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Top navigation */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-glow">
                <Ticket className="w-4.5 h-4.5" />
              </div>
              <div className="leading-tight">
                <div className="font-display font-bold text-ink tracking-tight text-[15px]">TicketPlatform</div>
                <div className="text-[10px] text-ink-soft font-medium -mt-0.5">{isKhmer ? 'វេទិកាលក់សំបុត្រ' : 'Cambodia Events & Shows'}</div>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    clsx(
                      'px-4 py-2 rounded-xl text-sm font-semibold transition',
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-soft hover:text-ink hover:bg-line/60'
                    )
                  }
                >
                  {isKhmer ? item.labelKm : item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2.5">
              <LanguageSwitcher />
              {identity ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/checkout"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-ink-soft hover:text-brand-700 transition"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden lg:inline">{isKhmer ? 'កក់សំបុត្រ' : 'Booking'}</span>
                  </Link>
                  <Link
                    to="/admin-dashboard"
                    className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-ink text-white hover:bg-ink-soft transition"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin
                  </Link>
                  <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-line">
                    <div className="w-8 h-8 rounded-full bg-gradient-brand text-white flex items-center justify-center text-xs font-bold">
                      {identity.username.slice(0, 2).toUpperCase()}
                    </div>
                    <button onClick={logout} className="text-[11px] font-semibold text-ink-soft hover:text-rose-600 transition">
                      {isKhmer ? 'ចាកចេញ' : 'Sign out'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-3 py-2 rounded-xl text-sm font-semibold text-ink-soft hover:text-ink transition">
                    {isKhmer ? 'ចូលប្រើ' : 'Sign in'}
                  </Link>
                  <Link to="/register" className="px-4 py-2 rounded-xl bg-gradient-brand text-white text-sm font-semibold shadow-glow hover:brightness-110 transition">
                    {isKhmer ? 'ចុះឈ្មោះ' : 'Register'}
                  </Link>
                </div>
              )}
              <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-xl text-ink-soft hover:bg-line/70">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  {open ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <nav className="md:hidden border-t border-line bg-white px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  clsx('block px-3 py-2.5 rounded-xl text-sm font-semibold', isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-soft')
                }
              >
                {isKhmer ? item.labelKm : item.label}
              </NavLink>
            ))}
            {identity && (
              <NavLink to="/admin-dashboard" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-ink-soft">
                Admin Dashboard
              </NavLink>
            )}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-line bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center text-white">
                <Ticket className="w-4 h-4" />
              </div>
              <span className="font-display font-bold text-ink">TicketPlatform</span>
            </div>
            <p className="text-xs text-ink-soft mt-3 leading-relaxed max-w-xs">
              {isKhmer
                ? 'វេទិកាលក់សំបុត្រកម្មវិធី និងការកម្សាន្តឈានមុខគេក្នុងប្រទេសកម្ពុជា។'
                : 'The leading events & entertainment ticketing platform in Cambodia.'}
            </p>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-ink-soft mb-3">{isKhmer ? 'ការរុករក' : 'Explore'}</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/events" className="text-ink-soft hover:text-brand-700 transition">Events</Link></li>
              <li><Link to="/tickets" className="text-ink-soft hover:text-brand-700 transition">My Tickets</Link></li>
              <li><Link to="/admin-dashboard" className="text-ink-soft hover:text-brand-700 transition">Admin Dashboard</Link></li>
              <li><Link to="/management-api" className="text-ink-soft hover:text-brand-700 transition">API Console</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-ink-soft mb-3">{isKhmer ? 'ទំនាក់ទំនង' : 'Contact'}</div>
            <p className="text-sm text-ink-soft flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-500" /> Phnom Penh, Cambodia
            </p>
          </div>
        </div>
        <div className="border-t border-line py-4 text-center text-[11px] text-ink-soft">
          © {new Date().getFullYear()} TicketPlatform · Spring Cloud · React · Redis
        </div>
      </footer>
    </div>
  );
};