import React from 'react';
import { clsx } from './Button';

type Tone =
  | 'brand' | 'green' | 'amber' | 'red' | 'slate' | 'sky' | 'violet' | 'rose';

const toneClasses: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700 border-brand-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-rose-50 text-rose-700 border-rose-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
  sky: 'bg-sky-50 text-sky-700 border-sky-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const Badge: React.FC<{
  tone?: Tone;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
  children: React.ReactNode;
}> = ({ tone = 'slate', dot, pulse, className, children }) => (
  <span
    className={clsx(
      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap',
      toneClasses[tone],
      className
    )}
  >
    {dot && (
      <span className={clsx('w-1.5 h-1.5 rounded-full bg-current', pulse && 'animate-pulse')} />
    )}
    {children}
  </span>
);

export default Badge;