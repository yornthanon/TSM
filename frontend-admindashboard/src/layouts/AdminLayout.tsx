import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Server,
  ShoppingCart,
  Ticket,
  Users,
  X,
} from 'lucide-react';
import { cn } from '../utils';
import { auth } from '../lib/auth';
import { api } from '../lib/api';
import type { User as AppUser } from '../types/api';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', shortcut: '⌘1', badge: 'Overview', end: true },
  { to: '/admin/events', icon: CalendarDays, label: 'Events', shortcut: '⌘2', badge: 'Calendar' },
  { to: '/admin/inventory', icon: Ticket, label: 'Inventory', shortcut: '⌘3', badge: 'Seats' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders', shortcut: '⌘4', badge: 'Live' },
  { to: '/admin/payments', icon: CreditCard, label: 'Payments', shortcut: '⌘5', badge: 'Mock' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications', shortcut: '⌘6', badge: 'Queue' },
  { to: '/admin/users', icon: Users, label: 'Users', shortcut: '⌘7', badge: 'Team' },
  { to: '/admin/access', icon: KeyRound, label: 'Access control', shortcut: '⌘8', badge: 'Policy', adminOnly: true },
  { to: '/admin/system', icon: Server, label: 'System', shortcut: '⌘9', badge: 'API', adminOnly: true },
  { to: '/admin/workspaces', icon: Building2, label: 'Workspaces', shortcut: '⌘0', badge: 'Platform', adminOnly: true },
];

function titleFor(pathname: string, items: typeof navItems): string {
  const match = items
    .filter((item) => (item.to === '/admin' ? pathname === '/admin' : pathname.startsWith(item.to)))
    .sort((a, b) => b.to.length - a.to.length)[0];
  return match?.label ?? 'Dashboard';
}

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const commandInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.getUser() as AppUser | null;
  const isAdmin = user?.role === 'ADMIN';
  const isTenantAdmin = user?.role === 'TENANT_ADMIN';
  const initials = (user?.email || user?.username || 'A').slice(0, 2).toUpperCase();
  const currentWorkspace = useQuery({
    queryKey: ['current-workspace', user?.tenantId],
    queryFn: () => api.get<{ name: string }>('/workspaces/current'),
    enabled: Boolean(user && !isAdmin),
    staleTime: 5 * 60 * 1000,
  });
  const workspaceName = currentWorkspace.data?.name
    ?? (currentWorkspace.isError ? 'Workspace unavailable' : 'Workspace');

  const visibleItems = useMemo(
    () => navItems.filter((item) => (!item.adminOnly || isAdmin)
      && (item.to !== '/admin/users' || isAdmin || isTenantAdmin)),
    [isAdmin, isTenantAdmin],
  );
  const title = titleFor(location.pathname, visibleItems);
  const filteredItems = useMemo(
    () => visibleItems.filter((item) => item.label.toLowerCase().includes(commandQuery.trim().toLowerCase())),
    [visibleItems, commandQuery],
  );

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  const goTo = useCallback((path: string) => {
    navigate(path);
    setCommandOpen(false);
    setCommandQuery('');
    setSidebarOpen(false);
    setUserMenuOpen(false);
  }, [navigate]);

  const handleSidebarToggle = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      setSidebarCollapsed((collapsed) => !collapsed);
    } else {
      setSidebarOpen((open) => !open);
    }
  };

  useEffect(() => {
    if (commandOpen) commandInputRef.current?.focus();
  }, [commandOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCommandOpen(false);
        setUserMenuOpen(false);
        setSidebarOpen(false);
        return;
      }
      const target = event.target as HTMLElement | null;
      const editing = Boolean(target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)));
      if (editing) return;

      const modifier = event.metaKey || event.ctrlKey;
      if (modifier && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen(true);
        return;
      }
      if (modifier && /^[1-9]$/.test(event.key)) {
        const item = visibleItems.find((candidate) => candidate.shortcut.endsWith(event.key));
        if (item) {
          event.preventDefault();
          goTo(item.to);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [visibleItems, goTo]);

  return (
    <div className="min-h-screen bg-[#0f141b] text-[#dfe1e5] flex">
      <aside
        id="ticketdesk-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-56 flex-col overflow-hidden border-r border-[#2b2d30] bg-[#18191b] text-[#dfe1e5] transition-[width,transform] duration-200 select-none',
          sidebarCollapsed ? 'lg:w-12' : 'lg:w-56',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex h-8 shrink-0 items-center justify-between border-b border-[#2b2d30] px-3 text-[11px] font-semibold uppercase tracking-wider text-[#868a91]">
          {!sidebarCollapsed && <span className="font-jetbrains">Tool Windows</span>}
          <button
            aria-label={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            title={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            aria-expanded={!sidebarCollapsed}
            onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
            className="ml-auto hidden rounded p-1 text-[#868a91] transition-colors hover:bg-[#2b2d30] hover:text-[#dfe1e5] lg:flex"
          >
            {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
          <button
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded p-1 text-[#868a91] hover:bg-[#2b2d30] hover:text-[#dfe1e5] lg:hidden"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <nav aria-label="Ticket management" className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1.5">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  title={`${item.label} (${item.shortcut})`}
                  className={({ isActive }) => cn(
                    'group relative flex w-full items-center rounded-lg py-2 text-xs transition-colors',
                    sidebarCollapsed ? 'justify-center px-0 lg:px-0' : 'gap-2.5 px-2.5',
                    isActive
                      ? 'border-l-2 border-[#3574f0] bg-[#2b2d30] font-medium text-[#dfe1e5]'
                      : 'border-l-2 border-transparent text-[#868a91] hover:bg-[#1e1f22] hover:text-[#dfe1e5]',
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-[#3574f0]' : 'text-[#868a91] group-hover:text-[#dfe1e5]')} strokeWidth={1.8} />
                      {!sidebarCollapsed && (
                        <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                          <span className="truncate">{item.label}</span>
                          <span className={cn(
                            'shrink-0 rounded px-1.5 py-0.5 font-jetbrains text-[9px] leading-none',
                            isActive ? 'bg-[#18191b] text-[#4ec9b0]' : 'text-[#6c707e]',
                          )}>{item.badge}</span>
                        </span>
                      )}
                      {sidebarCollapsed && (
                        <span className="pointer-events-none absolute left-full z-50 ml-2 hidden whitespace-nowrap rounded border border-[#2b2d30] bg-[#1e1f22] px-2 py-1 text-xs text-[#dfe1e5] opacity-0 shadow-xl transition-opacity group-hover:opacity-100 lg:block">
                          {item.label}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="shrink-0 border-t border-[#2b2d30] p-2 text-[10px] text-[#868a91]">
          {!sidebarCollapsed ? (
            <div className="space-y-1.5 font-jetbrains">
              <div className="flex items-center justify-between"><span>Runtime</span><span className="text-[#a9b7c6]">Spring</span></div>
              <div className="flex items-center justify-between"><span>Database</span><span className="text-[#4ec9b0]">PostgreSQL</span></div>
            </div>
          ) : (
            <div className="flex justify-center" title="Spring Boot · PostgreSQL">
              <span className="h-2 w-2 rounded-full bg-[#4ec9b0]" />
            </div>
          )}
        </div>
      </aside>

      {sidebarOpen && (
        <button
          aria-label="Close navigation backdrop"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={cn('flex min-h-screen min-w-0 flex-1 flex-col transition-[margin] duration-200', sidebarCollapsed ? 'lg:ml-12' : 'lg:ml-56')}>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-[#2b2d30] bg-[#1e1f22] px-3 text-xs text-[#bcbec4] shadow-[0_4px_18px_rgba(0,0,0,.14)] sm:px-5">
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              aria-label="Toggle sidebar"
              aria-controls="ticketdesk-sidebar"
              onClick={handleSidebarToggle}
              className="flex items-center justify-center rounded-md p-1.5 text-[#bcbec4] transition-colors hover:bg-[#2b2d30] hover:text-white"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#3574f0]/40 bg-[#3574f0]/15 text-[#6f9bff]">
                <Ticket className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <p className="font-semibold tracking-tight text-[#dfe1e5]">TicketDesk</p>
                <p className="hidden max-w-[180px] truncate text-[9px] uppercase tracking-[0.14em] text-[#6c707e] sm:block">{isAdmin ? 'Platform administration' : workspaceName || 'Workspace'}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => { setCommandQuery(''); setCommandOpen(true); }}
            className="mx-3 hidden min-w-0 max-w-[320px] flex-1 items-center gap-2 rounded border border-[#2b2d30] bg-[#141416] px-3 py-1.5 text-[11px] text-[#868a91] transition-colors hover:border-[#393b40] hover:text-[#dfe1e5] sm:flex"
            aria-label="Search menu with command palette"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 text-left">Search workspace menu...</span>
            <kbd className="rounded border border-[#393b40] bg-[#2b2d30] px-1.5 py-0.5 font-jetbrains text-[9px] text-[#a8adbd]">⌘K</kbd>
          </button>

          <div className="flex items-center gap-2">
            {!isAdmin && <Link
              to="/admin/events"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#3574f0] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#3062d4]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New event</span>
            </Link>}
            <div className="relative ml-1">
              <button
                aria-label="Open profile menu"
                aria-expanded={userMenuOpen}
                onClick={() => setUserMenuOpen((open) => !open)}
                className="flex items-center gap-1.5 rounded border border-[#2b2d30] bg-[#141416] px-2 py-1 transition-colors hover:bg-[#2b2d30]"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#3574f0] text-[9px] font-bold text-white">{initials}</span>
                <span className="hidden max-w-[100px] truncate font-medium text-[#dfe1e5] sm:inline">{user?.email || user?.username || 'Admin user'}</span>
                <span className="h-2 w-2 rounded-full bg-[#4ec9b0]" title="Signed in" />
                <ChevronDown className="hidden h-3 w-3 text-[#868a91] sm:block" />
              </button>
              {userMenuOpen && (
                <>
                  <button aria-label="Close profile menu" className="fixed inset-0 z-10 cursor-default" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-[#2b2d30] bg-[#1e1f22] py-1 shadow-xl">
                    <div className="border-b border-[#2b2d30] px-3.5 py-2.5">
                      <p className="truncate text-xs font-medium text-[#dfe1e5]">{user?.email || user?.username || 'Admin user'}</p>
                      <p className="mt-0.5 font-jetbrains text-[10px] text-[#868a91]">{user?.role ?? 'USER'}</p>
                    </div>
                    {(isAdmin || isTenantAdmin) && <Link to="/admin/users" onClick={() => setUserMenuOpen(false)} className="block px-3.5 py-2.5 text-xs text-[#bcbec4] hover:bg-[#2b2d30]">Manage users</Link>}
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-xs text-[#f07178] hover:bg-[#2b2d30]">
                      <LogOut className="h-3.5 w-3.5" /> Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-4 py-6 sm:px-7 sm:py-8">
          <div key={location.pathname} className="mx-auto w-full max-w-[1380px]"><Outlet /></div>
        </main>

        <footer className="ide-statusbar flex min-h-7 shrink-0 items-center justify-between gap-3 px-3 text-[10px] text-[#868a91] sm:px-5">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex shrink-0 items-center gap-1.5 text-[#dfe1e5]"><Activity className="h-3 w-3 text-[#3574f0]" /><span>TicketDesk</span></div>
            <div className="hidden items-center gap-1.5 sm:flex"><span>Spring Boot API</span></div>
            <div className="hidden items-center gap-1.5 md:flex"><span>PostgreSQL</span></div>
          </div>
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <span className="hidden sm:inline">{isAdmin ? 'ADMIN' : isTenantAdmin ? 'TENANT ADMIN' : 'USER'} SESSION</span>
            <span className="text-[#4ec9b0]">UTF-8</span>
            <span className="hidden text-[#868a91] sm:inline">{title}</span>
          </div>
        </footer>
      </div>

      {commandOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/55 px-4 pt-[14vh] backdrop-blur-sm" role="presentation" onClick={() => setCommandOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Search workspace menu"
            className="w-full max-w-lg overflow-hidden rounded-xl border border-[#393b40] bg-[#1e1f22] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-[#2b2d30] px-4">
              <Search className="h-4 w-4 text-[#868a91]" />
              <input
                ref={commandInputRef}
                value={commandQuery}
                onChange={(event) => setCommandQuery(event.target.value)}
                placeholder="Search pages and open a workspace..."
                aria-label="Search pages"
                className="h-12 min-w-0 flex-1 bg-transparent text-sm text-[#dfe1e5] outline-none placeholder:text-[#6c707e]"
              />
              <kbd className="rounded border border-[#393b40] px-1.5 py-0.5 font-jetbrains text-[9px] text-[#868a91]">ESC</kbd>
            </div>
            <div className="max-h-[min(55vh,420px)] overflow-y-auto p-2">
              {filteredItems.length > 0 ? filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.to}
                    onClick={() => goTo(item.to)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-[#bcbec4] transition-colors hover:bg-[#2b2d30] hover:text-[#dfe1e5]"
                  >
                    <Icon className="h-4 w-4 text-[#3574f0]" />
                    <span className="flex-1">{item.label}</span>
                    <span className="font-jetbrains text-[10px] text-[#6c707e]">{item.shortcut}</span>
                  </button>
                );
              }) : (
                <p className="px-3 py-6 text-center text-xs text-[#868a91]">No matching menu pages.</p>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-[#2b2d30] px-4 py-2 font-jetbrains text-[9px] text-[#6c707e]">
              <span>Navigate to a ticket workspace</span><span>TicketDesk</span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
