'use client';

import React, { forwardRef } from 'react';
import { cn } from './utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        disabled={disabled}
        className={cn(
          'w-full h-10 px-3 text-sm bg-slate-800 border text-slate-100 placeholder:text-slate-500 rounded-lg transition-all duration-150',
          'focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed',
          error
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
            : 'border-slate-700 focus:border-orange-500 focus:ring-orange-500',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, disabled, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        disabled={disabled}
        className={cn(
          'w-full px-3 py-3 text-sm bg-slate-800 border text-slate-100 placeholder:text-slate-500 rounded-lg transition-all duration-150 resize-none',
          'focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed',
          error
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
            : 'border-slate-700 focus:border-orange-500 focus:ring-orange-500',
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, disabled, ...props }, ref) => {
    return (
      <select
        ref={ref}
        disabled={disabled}
        className={cn(
          'w-full h-10 px-3 pr-8 text-sm bg-slate-800 border text-slate-100 rounded-lg transition-all duration-150 appearance-none',
          'focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed',
          error
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
            : 'border-slate-700 focus:border-orange-500 focus:ring-orange-500',
          className
        )}
        {...props}
      />
    );
  }
);
Select.displayName = 'Select';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn('block text-xs font-medium text-slate-300 mb-1.5', className)}
        {...props}
      />
    );
  }
);
Label.displayName = 'Label';

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  children: React.ReactNode;
}

export function Field({ label, hint, error, children, className, ...props }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)} {...props}>
      {label && <Label>{label}</Label>}
      <div>{children}</div>
      {error && <p className="text-xs text-rose-400" role="alert">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}