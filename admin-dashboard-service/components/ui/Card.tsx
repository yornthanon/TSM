import React from 'react';
import { clsx } from './Button';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={clsx('bg-white rounded-2xl border border-line shadow-card', className)}
    {...props}
  />
);

export const CardHeader: React.FC<
  React.HTMLAttributes<HTMLDivElement> & { title?: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode }
> = ({ title, subtitle, action, className, ...props }) => (
  <div className={clsx('flex items-start justify-between gap-3 px-5 pt-5 pb-3', className)} {...props}>
    <div>
      {title && <h3 className="font-display text-base font-semibold text-ink">{title}</h3>}
      {subtitle && <p className="text-xs text-ink-soft mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={clsx('px-5 pb-5', className)} {...props} />
);

export default Card;