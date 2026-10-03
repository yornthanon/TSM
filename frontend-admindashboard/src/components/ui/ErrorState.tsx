import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

function readableError(description?: string): string {
  const message = description?.trim();
  if (!message) return 'The service is temporarily unavailable. Please try again in a moment.';
  if (/<\s*!doctype\s+html|<\s*html[\s>]|<\s*body[\s>]|<\/?[a-z][^>]*>/i.test(message)) {
    return 'The service returned a web error instead of dashboard data. It may be starting up or temporarily unavailable; please retry shortly.';
  }
  return message.length > 240 ? `${message.slice(0, 237)}…` : message;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description,
  onRetry,
  className,
}) => (
  <div
    role="alert"
    className={cn('mx-auto flex w-full max-w-2xl flex-col items-center justify-center rounded-xl border border-[#2b2d30] bg-[#18191c] px-6 py-10 text-center', className)}
  >
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#59401e] bg-[#2a2118] text-[#ffc66d]">
      <RefreshCw className="h-5 w-5" />
    </div>
    <h3 className="mb-2 text-base font-semibold text-[#dfe1e5]">{title}</h3>
    <p className="mb-6 max-w-md text-xs leading-5 text-[#868a91]">{readableError(description)}</p>
    {onRetry && (
      <Button variant="secondary" onClick={onRetry} leftIcon={<RefreshCw className="h-4 w-4" />}>
        Retry
      </Button>
    )}
  </div>
);
