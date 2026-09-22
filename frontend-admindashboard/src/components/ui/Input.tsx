import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '../../utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon: LeftIcon, rightIcon: RightIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          {LeftIcon && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <LeftIcon className="h-5 w-5" />
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'input',
              LeftIcon && 'pl-10',
              RightIcon && 'pr-10',
              error && 'border-red-500 focus:ring-red-500/50',
              className
            )}
            {...props}
          />
          {RightIcon && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              <RightIcon className="h-5 w-5" />
            </span>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
