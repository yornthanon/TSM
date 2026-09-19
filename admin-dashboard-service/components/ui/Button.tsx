'use client';

import React, { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 focus-visible:ring-orange-500 focus-visible:ring-offset-slate-950 dark:focus-visible:ring-offset-slate-950',
        secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 active:bg-slate-600 focus-visible:ring-slate-500 focus-visible:ring-offset-slate-950 dark:focus-visible:ring-offset-slate-950',
        ghost: 'bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white active:bg-slate-700 focus-visible:ring-slate-500 focus-visible:ring-offset-slate-950 dark:focus-visible:ring-offset-slate-950',
        danger: 'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700 focus-visible:ring-rose-500 focus-visible:ring-offset-slate-950 dark:focus-visible:ring-offset-slate-950',
        outline: 'border border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800 active:bg-slate-700 focus-visible:ring-slate-500 focus-visible:ring-offset-slate-950 dark:focus-visible:ring-offset-slate-950',
        link: 'text-orange-400 hover:text-orange-300 underline-offset-2 hover:underline focus-visible:ring-orange-500 focus-visible:ring-offset-slate-950 dark:focus-visible:ring-offset-slate-950',
      },
      size: {
        xs: 'h-8 px-2.5 text-xs gap-1.5',
        sm: 'h-9 px-3 text-sm gap-2',
        md: 'h-10 px-4 text-sm gap-2',
        lg: 'h-11 px-6 text-base gap-2.5',
        xl: 'h-12 px-8 text-lg gap-3',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, asChild = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <Spinner className="h-4 w-4" />
            <span className="sr-only">Loading</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export const Spinner = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={cn('animate-spin', className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

export { cn } from './utils';