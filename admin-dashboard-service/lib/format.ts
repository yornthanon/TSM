import dayjs from 'dayjs';

export const formatMoney = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

export const formatKHR = (value: number, usdRate = 4100): string => {
  const khr = Math.round((value || 0) * usdRate);
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(khr) + ' KHR';
};

export const formatDate = (iso: string | undefined | null, withTime = false): string => {
  if (!iso) return '—';
  return withTime ? dayjs(iso).format('MMM D, YYYY · HH:mm') : dayjs(iso).format('MMM D, YYYY');
};

export const formatDateTime = (iso: string | undefined | null): string => formatDate(iso, true);

export const relativeTime = (iso: string | undefined | null): string => {
  if (!iso) return '—';
  const diff = dayjs().diff(dayjs(iso), 'minute');
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 24 * 60) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / (24 * 60))}d ago`;
};

export const formatSeatPrice = (price: number): string => `$${price.toFixed(0)}`;