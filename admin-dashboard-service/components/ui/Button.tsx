import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'icon';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-gradient-brand text-white shadow-glow hover:brightness-110 active:brightness-95',
  secondary: 'bg-ink text-white hover:bg-ink-soft active:brightness-95',
  ghost: 'bg-transparent text-ink-soft hover:bg-line/70 hover:text-ink',
  danger: 'bg-rose-600 text-white hover:bg-rose-500 active:brightness-95',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500 active:brightness-95',
  outline: 'bg-white text-ink border border-line shadow-card hover:border-brand-300 hover:text-brand-700',
};

const sizeClasses: Record<Size, string> = {
  xs: 'px-2.5 py-1.5 text-xs gap-1.5',
  sm: 'px-3 py-2 text-sm gap-2',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
  icon: 'p-2',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}) => (
  <button
    className={twMerge(
      clsx(
        'inline-flex items-center justify-center font-semibold rounded-xl transition disabled:opacity-50 disabled:pointer-events-none select-none',
        variantClasses[variant],
        sizeClasses[size],
        className
      )
    )}
    disabled={disabled || loading}
    {...props}
  >
    {loading && <Spinner className="w-4 h-4" />}
    {children}
  </button>
);

export const Spinner: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={clsx('animate-spin', className)} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

export { clsx };