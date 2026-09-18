import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'dark';
  className?: string;
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', color = 'primary', ...props }, ref) => {
    const sizes = {
      sm: 'w-4 h-4 border-2',
      md: 'w-6 h-6 border-2',
      lg: 'w-8 h-8 border-3',
      xl: 'w-12 h-12 border-4',
    };

    const colors = {
      primary: 'border-primary-500 border-t-transparent',
      white: 'border-white border-t-transparent',
      dark: 'border-dark-500 border-t-transparent',
    };

    return (
      <div
        ref={ref}
        className={twMerge(clsx(
          'rounded-full animate-spin',
          sizes[size],
          colors[color]
        ), className)}
        role="status"
        aria-label="Loading"
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  size?: SpinnerProps['size'];
}

export function LoadingOverlay({ isLoading, message, size = 'md' }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-dark-900/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-border-light dark:border-border-dark">
        <Spinner size={size} />
        {message && <p className="text-sm text-dark-600 dark:text-dark-400">{message}</p>}
      </div>
    </div>
  );
}

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', width, height, animation = 'pulse', ...props }, ref) => {
    const baseStyles = 'bg-dark-200 dark:bg-dark-700 rounded animate-pulse';

    const variants = {
      text: 'h-4',
      circular: 'rounded-full',
      rectangular: 'rounded-lg',
    };

    const animations = {
      pulse: 'animate-pulse',
      wave: 'animate-wave',
      none: '',
    };

    return (
      <div
        ref={ref}
        className={twMerge(clsx(
          baseStyles,
          variants[variant],
          animations[animation],
          width && `w-[${width}]`,
          height && `h-[${height}]`
        ), className)}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl border border-border-light dark:border-border-dark p-6 space-y-4 animate-pulse">
      <Skeleton variant="rectangular" width="40%" height="24px" />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="40%" />
      <div className="flex gap-2 mt-4">
        <Skeleton variant="circular" width="32px" height="32px" />
        <Skeleton variant="circular" width="32px" height="32px" />
        <Skeleton variant="circular" width="32px" height="32px" />
      </div>
    </div>
  );
}

export function SkeletonTable(rows = 5, columns = 4) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full" role="table">
        <thead>
          <tr className="border-b border-border-light dark:border-border-dark">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <Skeleton variant="text" width="80%" height="12px" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border-light dark:border-border-dark">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <Skeleton variant="text" width="60%" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}