'use client';

import React from 'react';
import { cn } from '../ui/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[88rem]',
  full: 'max-w-full',
};

const paddingClasses = {
  none: '',
  sm: 'px-4 sm:px-6',
  md: 'px-4 sm:px-6 lg:px-8',
  lg: 'px-6 lg:px-8 xl:px-12',
};

export function PageContainer({ children, className, size = 'lg', padding = 'md' }: PageContainerProps) {
  return (
    <div className={cn('mx-auto', sizeClasses[size], paddingClasses[padding], className)}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6', className)}>
      <div>
        <h1 className="text-2xl font-bold text-slate-100 dark:text-slate-100 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 dark:text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Section({ children, className, title, subtitle, action }: SectionProps) {
  return (
    <div className={cn('card', className)}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            {title && <h2 className="font-semibold text-slate-100">{title}</h2>}
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}