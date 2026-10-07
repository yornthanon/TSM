import React from 'react';
import { cn } from 'frontend-shared/utils';
import { formatStatusLabel, getStatusColor } from 'frontend-shared/utils';

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
      {formatStatusLabel(status)}
    </span>
  );
};
