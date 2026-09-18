import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Language, translations } from './dictionary';
import { translateDocument } from './walker';

type LanguageContextValue = {
  language: Language;
  isKhmer: boolean;
  setLanguage: (language: Language) => void;
  toggle: () => void;
  t: (key: string, fallback?: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function resolveLanguage(): Language {
  const requested = new URLSearchParams(window.location.search).get('lang');
  if (requested === 'en' || requested === 'km') {
    localStorage.setItem('tsm_language', requested);
    return requested;
  }
  const saved = localStorage.getItem('tsm_language');
  return saved === 'en' || saved === 'km' ? saved : 'km';
}

/**
 * Look up a translation.
 * The `km` dictionary maps English phrases -> Khmer, so when the current
 * language is Khmer we translate English keys into Khmer and Khmer keys to
 * themselves. When English is active, Khmer keys map back to English.
 */
function lookup(key: string, language: Language): string | undefined {
  const dict = translations[language];
  if (key in dict) return dict[key];
  if (language === 'km') {
    // Khmer -> Khmer pass-through
    return key;
  }
  return undefined;
}

export const LanguageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(resolveLanguage);

  useEffect(() => {
    document.documentElement.lang = language === 'km' ? 'km' : 'en';
    const apply = () => translateDocument(language);
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    localStorage.setItem('tsm_language', next);
    window.setTimeout(() => window.location.reload(), 0);
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) => lookup(key, language) ?? fallback ?? key,
    [language]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      isKhmer: language === 'km',
      setLanguage,
      toggle: () => setLanguage(language === 'km' ? 'en' : 'km'),
      t,
    }),
    [language, setLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
};

/** New idiomatic hook for translating strings at render time. */
export const useT = () => {
  const { t, isKhmer, language, toggle, setLanguage } = useLanguage();
  return { t, isKhmer, language, toggle, setLanguage };
};

export const LanguageSwitcher: React.FC<{ dark?: boolean; size?: 'sm' | 'md' }> = ({
  dark = false,
  size = 'md',
}) => {
  const { language, setLanguage } = useLanguage();
  const text = size === 'sm' ? 'px-2 py-0.5 rounded text-[10px]' : 'px-2.5 py-1 rounded-md text-[11px]';
  const active =
    language === 'km'
      ? dark
        ? 'bg-violet-600 text-white'
        : 'bg-white text-violet-700 shadow-sm'
      : dark
        ? 'bg-cyan-600 text-white'
        : 'bg-white text-violet-700 shadow-sm';
  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-lg p-1 border ${
        dark ? 'bg-slate-900 border-slate-700' : 'bg-white/70 border-slate-200'
      }`}
      aria-label="Language selector"
    >
      <button
        type="button"
        onClick={() => setLanguage('km')}
        className={`${text} font-semibold transition ${
          language === 'km' ? active : dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        ខ្មែរ
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`${text} font-semibold transition ${
          language === 'en' ? active : dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        EN
      </button>
    </div>
  );
};