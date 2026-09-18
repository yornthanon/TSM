import React from 'react';
import { clsx } from './Button';

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className, ...props }) => (
  <label className={clsx('block text-[13px] font-semibold text-ink mb-1.5', className)} {...props} />
);

const fieldBase =
  'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/50 transition focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10';

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input className={clsx(fieldBase, 'min-h-0', className)} {...props} />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, children, ...props }) => (
  <select className={clsx(fieldBase, 'min-h-0 appearance-none pr-9 bg-no-repeat bg-[right_0.75rem_center] bg-[length:14px]', className)}
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%239a93c9'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E\")",
    }}
    {...props}
  >
    {children}
  </select>
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => (
  <textarea className={clsx(fieldBase, className)} {...props} />
);

export const Field: React.FC<{ label?: string; hint?: string; children: React.ReactNode; className?: string }> = ({
  label,
  hint,
  children,
  className,
}) => (
  <div className={clsx('space-y-0.5', className)}>
    {label && <Label>{label}</Label>}
    {children}
    {hint && <p className="text-[11px] text-ink-soft mt-1">{hint}</p>}
  </div>
);