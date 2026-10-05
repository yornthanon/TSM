import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils';
import { Button } from './Button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, footer, children, className, compact = false }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          compact
            ? 'relative flex w-full max-w-lg flex-col overflow-hidden rounded-12 bg-white shadow-card-hover dark:bg-dark-card max-h-[86dvh]'
            : 'relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-12 bg-white shadow-card-hover dark:bg-dark-card',
          className
        )}
      >
        <div className={cn(
          'flex items-center justify-between border-b border-light-border dark:border-dark-border',
          compact ? 'shrink-0 p-4 sm:p-5' : 'p-6'
        )}>
          {title && (
            <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
          )}
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className={compact ? 'min-h-0 flex-1 overflow-y-auto p-4 sm:p-5' : 'p-6'}>{children}</div>
        {footer && (
          <div className={cn(
            'flex items-center justify-end gap-3 border-t border-light-border dark:border-dark-border',
            compact ? 'shrink-0 p-4 sm:p-5' : 'p-6'
          )}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
