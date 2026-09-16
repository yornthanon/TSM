import React, { createContext, useContext, useMemo, useState } from 'react';

export type Language = 'en' | 'km';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  isKhmer: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('tsm_language');
    return saved === 'en' || saved === 'km' ? saved : 'km';
  });

  const value = useMemo(() => ({
    language,
    isKhmer: language === 'km',
    setLanguage: (next: Language) => {
      setLanguageState(next);
      localStorage.setItem('tsm_language', next);
      document.documentElement.lang = next === 'km' ? 'km' : 'en';
    },
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
};

export const LanguageSwitcher: React.FC<{ dark?: boolean }> = ({ dark = false }) => {
  const { language, setLanguage } = useLanguage();
  return (
    <div className={`inline-flex items-center gap-0.5 rounded-lg p-1 border ${dark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'}`} aria-label="Language selector">
      <button onClick={() => setLanguage('km')} className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${language === 'km' ? (dark ? 'bg-cyan-600 text-white' : 'bg-white text-indigo-700 shadow-sm') : (dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}>ខ្មែរ</button>
      <button onClick={() => setLanguage('en')} className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${language === 'en' ? (dark ? 'bg-cyan-600 text-white' : 'bg-white text-indigo-700 shadow-sm') : (dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}>EN</button>
    </div>
  );
};
