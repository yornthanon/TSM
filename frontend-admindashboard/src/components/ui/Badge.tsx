import React from 'react';
import { cn } from '../../utils';
import { getStatusColor } from '../../utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: string;
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ status, children, className }) => {
  if (children) {
    return (
      <span className={cn('badge', className)}>
        {children}
      </span>
    );
  }
  return (
    <span className={cn(getStatusColor(status || ''), 'badge capitalize', className)}>
      {status}
    </span>
  );
};
