import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from './Button';

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}> = ({ open, onClose, title, description, children, footer, size = 'md' }) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={clsx(
          'relative w-full bg-white rounded-2xl border border-line shadow-soft max-h-[calc(100vh-2rem)] flex flex-col',
          sizes[size]
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-line">
            <div>
              {title && <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>}
              {description && <p className="text-xs text-ink-soft mt-1">{description}</p>}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-ink-soft hover:bg-line/70 hover:text-ink transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-line flex items-center justify-end gap-2.5">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;