import React from 'react';
import { SearchX } from 'lucide-react';
import { clsx } from './Button';

export const EmptyState: React.FC<{
  icon?: React.ElementType;
  title: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ icon: Icon = SearchX, title, message, action, className }) => (
  <div className={clsx('flex flex-col items-center justify-center text-center py-14 px-6', className)}>
    <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6" />
    </div>
    <h4 className="font-display text-base font-semibold text-ink">{title}</h4>
    {message && <p className="text-sm text-ink-soft mt-1 max-w-sm">{message}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;