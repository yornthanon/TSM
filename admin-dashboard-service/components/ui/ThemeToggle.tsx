'use client';

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../lib/theme';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui';
import { cn } from '../ui/utils';

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'relative h-9 w-9 rounded-lg bg-slate-800/50 border border-slate-700/50',
            'hover:bg-slate-800 transition-colors',
            'flex items-center justify-center'
          )}
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="w-5 h-5 text-slate-300" />
          ) : (
            <Sun className="w-5 h-5 text-slate-300" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-slate-900 border-slate-800 rounded-xl shadow-xl min-w-[160px] p-1"
        sideOffset={8}
        align="end"
        side="bottom"
      >
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onSelect={() => setTheme(t.value)}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm',
              'hover:bg-slate-800 transition-colors cursor-pointer',
              theme === t.value && 'bg-slate-800 text-orange-400'
            )}
          >
            <span className="w-5 h-5 flex items-center justify-center">
              {t.icon}
            </span>
            {t.label}
            {theme === t.value && <span className="ml-auto text-orange-400">✓</span>}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="my-1 border-slate-800" />
        <DropdownMenuItem
          onSelect={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <span className="w-5 h-5 flex items-center justify-center">
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </span>
          Switch to {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}