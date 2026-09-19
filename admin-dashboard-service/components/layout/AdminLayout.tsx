'use client';

import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  ShoppingCart,
  CreditCard,
  Users,
  Bell,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Command,
  User,
  LogOut,
  Shield,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useLanguage } from '../../i18n';
import {
  Button,
  Avatar,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Separator,
} from '../ui';
import { ThemeToggle } from '../ui/ThemeToggle';
import { cn } from '../ui/utils';

const navItems = [
  { path: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard, km: 'ផ្ទាំងសង្ខេប' },
  { path: '/admin-dashboard/events', label: 'Events', icon: Calendar, km: 'កម្មវិធី' },
  { path: '/admin-dashboard/tickets', label: 'Tickets', icon: Ticket, km: 'សំបុត្រ' },
  { path: '/admin-dashboard/orders', label: 'Orders', icon: ShoppingCart, km: 'ការកុម្ម៉ង់' },
  { path: '/admin-dashboard/payments', label: 'Payments', icon: CreditCard, km: 'ការទូទាត់' },
  { path: '/admin-dashboard/users', label: 'Users', icon: Users, km: 'អ្នកប្រើប្រាស់' },
  { path: '/admin-dashboard/notifications', label: 'Notifications', icon: Bell, km: 'ការជូនដំណឹង' },
  { path: '/admin-dashboard/reports', label: 'Reports', icon: BarChart3, km: 'របាយការណ៍' },
  { path: '/admin-dashboard/settings', label: 'Settings', icon: Settings, km: 'ការកំណត់ប្រព័ន្ធ' },
];

const businessItems = [
  { path: '/admin-dashboard/refunds', label: 'Refunds', icon: Zap, km: 'សងប្រាក់' },
  { path: '/admin-dashboard/promotions', label: 'Promotions', icon: Shield, km: 'ប្រូម៉ូសិន' },
  { path: '/admin-dashboard/organizers', label: 'Organizers', icon: Users, km: 'អ្នករៀបចំ' },
  { path: '/admin-dashboard/checkin', label: 'Check-in', icon: Ticket, km: 'ផ្ទៀងផ្ទាត់' },
  { path: '/admin-dashboard/audit', label: 'Audit Logs', icon: Zap, km: 'កំណត់ត្រាសកម្មភាព' },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { identity, logout } = useAuth();
  const { isKhmer } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(false);
      const stored = localStorage.getItem('sidebarCollapsed');
      if (stored !== null) {
        setSidebarCollapsed(JSON.parse(stored));
      }
    }
  }, []);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
    }
  }, [sidebarCollapsed]);

  const isActive = (path: string) => {
    if (path === '/admin-dashboard') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-16' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center justify-between h-16 px-4 border-b border-slate-800', sidebarCollapsed && 'justify-center')}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-100 text-sm">TicketManager</span>
                <span className="text-[10px] text-slate-500 font-mono">Admin</span>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-white" />
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn(
              'p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors',
              sidebarCollapsed && 'ml-auto'
            )}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!sidebarCollapsed}
          >
            {sidebarCollapsed ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Main navigation">
          <div className={cn('px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider', sidebarCollapsed && 'text-center')}>
            {isKhmer ? 'ម៉ូឌុលចាក់ស្តាប់' : 'Core Modules'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Tooltip key={item.path} disableHoverableContent={sidebarCollapsed}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
                      active
                        ? 'bg-orange-500/10 text-orange-400 border-l-4 border-orange-500 pl-[calc(12px-4px)]'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100',
                      sidebarCollapsed && 'justify-center px-2'
                    )}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={cn('h-5 w-5 flex-shrink-0', active && 'text-orange-400')} aria-hidden="true" />
                    {!sidebarCollapsed && <span className="truncate">{isKhmer ? item.km : item.label}</span>}
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  {isKhmer ? item.km : item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}

          <Separator className="my-4 border-slate-800" />

          <div className={cn('px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider', sidebarCollapsed && 'text-center')}>
            {isKhmer ? 'ប្រតិបត្តិការអាជីវកម្ម' : 'Business Operations'}
          </div>

          {businessItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Tooltip key={item.path} disableHoverableContent={sidebarCollapsed}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
                      active
                        ? 'bg-orange-500/10 text-orange-400 border-l-4 border-orange-500 pl-[calc(12px-4px)]'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100',
                      sidebarCollapsed && 'justify-center px-2'
                    )}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={cn('h-5 w-5 flex-shrink-0', active && 'text-orange-400')} aria-hidden="true" />
                    {!sidebarCollapsed && <span className="truncate">{isKhmer ? item.km : item.label}</span>}
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  {isKhmer ? item.km : item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* User Section */}
        <div className={cn('p-3 border-t border-slate-800', sidebarCollapsed && 'items-center')}>
          <div className="flex items-center gap-3">
            <Avatar
              src={null}
              fallback={identity?.username || 'AD'}
              size="md"
            />
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-100 truncate">{identity?.username || 'Admin'}</p>
                <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {isKhmer ? 'កំពុងដំណើរការ' : 'Active'}
                </p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start mt-2">
                  <LogOut className="h-4 w-4 mr-2" />
                  {isKhmer ? 'ចាកចេញ' : 'Sign out'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel className="text-xs font-medium text-slate-400 px-1">
                  Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-rose-400 focus:text-rose-300">
                  <LogOut className="h-4 w-4 mr-2" />
                  {isKhmer ? 'ចាកចេញ' : 'Sign out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <nav className="flex items-center gap-1" aria-label="Breadcrumb">
                <NavLink
                  to="/admin-dashboard"
                  className={cn(
                    'px-2 py-1 rounded text-xs font-medium transition-colors',
                    location.pathname === '/admin-dashboard'
                      ? 'text-orange-400'
                      : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  Dashboard
                </NavLink>
                {location.pathname !== '/admin-dashboard' && (
                  <>
                    <ChevronRight className="h-3 w-3 text-slate-500 mx-1" aria-hidden="true" />
                    <span className="px-2 py-1 text-xs font-medium text-slate-400 capitalize">
                      {location.pathname.split('/').pop()?.replace(/-/g, ' ') || ''}
                    </span>
                  </>
                )}
              </nav>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex relative">
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Search className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] font-mono text-slate-300">⌘K</kbd>
                {' '}Command Palette
              </TooltipContent>
            </div>

            <ThemeToggle />

            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Bell className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                  <Avatar
                    src={null}
                    fallback={identity?.username || 'AD'}
                    size="sm"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs font-medium text-slate-400">
                  {identity?.username || 'Admin'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-rose-400 focus:text-rose-300">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}