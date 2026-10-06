import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + '...';
}

/**
 * Status -> badge colour. Handles both the event-ticketing statuses the backend
 * actually returns (upper case) and the legacy helpdesk values, because the
 * lookup is case-insensitive.
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Events
    draft: 'bg-gray-100 text-gray-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    upcoming: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    ongoing: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    postponed: 'bg-orange-100 text-orange-800',
    rescheduled: 'bg-yellow-100 text-yellow-800',
    // Tickets
    available: 'bg-green-100 text-green-800',
    locked: 'bg-yellow-100 text-yellow-800',
    sold: 'bg-blue-100 text-blue-800',
    expired: 'bg-gray-100 text-gray-800',
    // Orders
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    // Payments
    refunded: 'bg-purple-100 text-purple-800',
    failed: 'bg-red-100 text-red-800',
    // Notifications
    sent: 'bg-green-100 text-green-800',
    retry: 'bg-yellow-100 text-yellow-800',
    // Legacy helpdesk values, kept so nothing renders unstyled.
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    review: 'bg-purple-100 text-purple-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
  };
  return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

export function formatCurrency(value: number | null | undefined, currency = 'USD'): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * LocalDateTime strings from the backend have no zone suffix. `new Date()` would
 * parse them as local time on some engines and UTC on others, so the value is
 * normalised to an explicit local-time Date first.
 */
export function parseLocalDateTime(value: string | Date): Date {
  if (value instanceof Date) return value;
  const normalised = /[Zz]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value.replace(' ', 'T')}Z`;
  const d = new Date(normalised);
  return Number.isNaN(d.getTime()) ? new Date(NaN) : d;
}

export function formatDate(date: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (date === null || date === undefined || date === '') return '-';
  const d = parseLocalDateTime(date);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (date === null || date === undefined || date === '') return '-';
  const d = parseLocalDateTime(date);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Value for an `<input type="datetime-local">` from a LocalDateTime string. */
export function toDateTimeLocalValue(date: string | null | undefined): string {
  if (!date) return '';
  return date.replace(' ', 'T').slice(0, 16);
}

export function getStatusCodeColor(code: number): string {
  if (code >= 500) return 'bg-red-100 text-red-800';
  if (code >= 400) return 'bg-orange-100 text-orange-800';
  if (code >= 300) return 'bg-blue-100 text-blue-800';
  return 'bg-green-100 text-green-800';
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
