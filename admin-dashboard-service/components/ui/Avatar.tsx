'use client';

import React, { forwardRef } from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from './utils';

export interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', ...props }, ref) => {
    const initials = fallback
      ? fallback
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : '?';

    return (
      <AvatarPrimitive.Root ref={ref} className={cn('relative inline-flex shrink-0 overflow-hidden rounded-full', sizeClasses[size], className)} {...props}>
        <AvatarPrimitive.Image
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
        />
        <AvatarPrimitive.Fallback className={cn('flex h-full w-full items-center justify-center rounded-full bg-slate-800 text-slate-300 font-medium', sizeClasses[size])}>
          {initials}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
    );
  }
);
Avatar.displayName = 'Avatar';