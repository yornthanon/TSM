import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { cn } from 'frontend-shared/utils';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
  className?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  className,
}) => {
  if (!open) return null;

  return (
    <div className={cn('fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4', className)}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[86dvh] w-full max-w-md overflow-y-auto rounded-12 border border-[#2b2d30] bg-[#18191c] p-4 text-[#dfe1e5] shadow-card-hover sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold text-[#dfe1e5]">{title}</h3>
            <p className="text-sm text-[#9da0a8]">{description}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-end gap-2 sm:mt-6 sm:gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
