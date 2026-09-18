import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import { LanguageSwitcher } from '../../i18n';
import { clsx } from '../ui/Button';
import { useLanguage } from '../../i18n';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isKhmer } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-glow">
                <Ticket className="w-4.5 h-4.5" />
              </div>
              <div className="leading-tight">
                <div className="font-display font-bold text-ink tracking-tight text-[15px]">TicketPlatform</div>
                <div className="text-[10px] text-ink-soft font-medium -mt-0.5">{isKhmer ? 'វេទិកាលក់សំបុត្រ' : 'Cambodia Events & Shows'}</div>
              </div>
            </Link>

            <div className="flex items-center gap-2.5">
              <LanguageSwitcher />
              <Link to="/login" className="px-3 py-2 rounded-xl text-sm font-semibold text-ink-soft hover:text-ink transition">
                {isKhmer ? 'ចូលប្រើ' : 'Sign in'}
              </Link>
              <Link to="/register" className="px-4 py-2 rounded-xl bg-gradient-brand text-white text-sm font-semibold shadow-glow hover:brightness-110 transition">
                {isKhmer ? 'ចុះឈ្មោះ' : 'Register'}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="border-t border-line bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[11px] text-ink-soft">
          © {new Date().getFullYear()} TicketPlatform · Spring Cloud · React · Redis
        </div>
      </footer>
    </div>
  );
};