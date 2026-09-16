import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Language = 'en' | 'km';
type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void; isKhmer: boolean };
const LanguageContext = createContext<LanguageContextValue | null>(null);

const translations: Record<Language, Record<string, string>> = {
  km: {
    'Overview': 'ផ្ទាំងសង្ខេប', 'Events': 'កម្មវិធី', 'Tickets': 'សំបុត្រ', 'Orders': 'ការកុម្ម៉ង់', 'Payments': 'ការទូទាត់', 'Users': 'អ្នកប្រើប្រាស់', 'Dashboard': 'ផ្ទាំងគ្រប់គ្រង', 'Admin modules': 'ម៉ូឌុល Admin', 'API modules': 'ម៉ូឌុល API', 'Search': 'ស្វែងរក', 'Filter': 'តម្រង', 'Sort': 'តម្រៀប', 'Actions': 'សកម្មភាព', 'Status': 'ស្ថានភាព', 'Role': 'តួនាទី', 'Phone': 'ទូរស័ព្ទ', 'User': 'អ្នកប្រើប្រាស់', 'Email': 'អ៊ីមែល', 'Created': 'កាលបរិច្ឆេទបង្កើត', 'Name': 'ឈ្មោះ', 'Price': 'តម្លៃ', 'Date': 'កាលបរិច្ឆេទ', 'Title': 'ចំណងជើង', 'Category': 'ប្រភេទ', 'Location': 'ទីតាំង', 'Capacity': 'ចំណុះ', 'Edit': 'កែប្រែ', 'Delete': 'លុប', 'Cancel': 'បោះបង់', 'Save changes': 'រក្សាទុកការកែប្រែ', 'Create account': 'បង្កើតគណនី', 'New user': 'អ្នកប្រើប្រាស់ថ្មី', 'Edit user': 'កែប្រែអ្នកប្រើប្រាស់', 'Edit event': 'កែប្រែកម្មវិធី', 'Publish new event': 'បង្កើតកម្មវិធីថ្មី', 'Publish event': 'បង្កើតកម្មវិធី', 'No users found': 'រកមិនឃើញអ្នកប្រើប្រាស់', 'No events found': 'រកមិនឃើញកម្មវិធី', 'Try another search term': 'សាកល្បងពាក្យស្វែងរកផ្សេងទៀត', 'Try clearing filters or searching another term': 'សាកល្បងលុបតម្រង ឬស្វែងរកពាក្យផ្សេង', 'Login': 'ចូលប្រើ', 'Logged in': 'កំពុងប្រើ', 'Book': 'កក់', 'Order': 'កុម្ម៉ង់', 'Save': 'រក្សាទុក', 'Refresh': 'ធ្វើបច្ចុប្បន្នភាព', 'Loading...': 'កំពុងដំណើរការ...', 'No data': 'គ្មានទិន្នន័យ', 'Available': 'ទំនេរ', 'Locked': 'បានចាក់សោ', 'Sold': 'លក់រួច', 'Search by username, email, or role...': 'ស្វែងរកតាមឈ្មោះ, អ៊ីមែល ឬតួនាទី...', 'Search by ticket code or seat number...': 'ស្វែងរកតាមលេខសំបុត្រ ឬលេខកៅអី...', 'Search by title, artist, or venue...': 'ស្វែងរកតាមចំណងជើង ឬទីតាំង...', 'View seats': 'មើលកៅអី', 'Book ticket': 'កក់សំបុត្រ', 'Login as user': 'ចូលជាអ្នកប្រើប្រាស់', 'Register new user': 'បង្កើតអ្នកប្រើប្រាស់ថ្មី', 'Ticket Code': 'លេខសំបុត្រ', 'Event Title': 'ចំណងជើងកម្មវិធី', 'Seat Number': 'លេខកៅអី', 'Tier': 'កម្រិត', 'Base Price': 'តម្លៃដើម', 'Event Category': 'ប្រភេទកម្មវិធី', 'Date & Time': 'កាលបរិច្ឆេទ និងម៉ោង', 'Venue Location': 'ទីតាំងកម្មវិធី', 'Total Capacity': 'ចំណុះសរុប', 'Username *': 'ឈ្មោះអ្នកប្រើប្រាស់ *', 'Phone number *': 'លេខទូរស័ព្ទ *', 'Gateway online': 'Gateway ដំណើរការ', 'Business services healthy': 'សេវាកម្មអាជីវកម្មដំណើរការ', 'Live traffic': 'ចរាចរ API', 'API Gateway & Service Diagnostics': 'API Gateway និងការត្រួតពិនិត្យ Service', 'Event Stream Monitoring': 'តាមដាន Event Stream', 'ចំណូល': 'Revenue', 'ស្វែងរក Order #, អតិថិជន...': 'Search Order # or customer...', 'JSON Request Body មិនត្រឹមត្រូវ!': 'Invalid JSON request body!', 'កំពុងជ្រើសរើស ✓': 'Selected ✓', 'ចុចមើល Error →': 'View errors →', 'សាកល្បងលុប filter ឬស្វែងរកពាក្យផ្សេង': 'Try clearing filters or another search', 'ស្វែងរកកម្មវិធី កក់កៅអី និងបង្កើតកម្មវិធីថ្មី': 'Discover events, reserve seats, and publish new events', 'ស្វែងរកតាមឈ្មោះ ឬទីតាំង...': 'Search by name or location...', 'កម្មវិធី និងកាតាឡុកសំបុត្រ': 'Events and ticket catalog', 'កាតកម្មវិធី': 'Cards', 'តារាង': 'Table', 'បានកែប្រែកម្មវិធីជោគជ័យ': 'Event updated successfully', 'មានបញ្ហា': 'Error', 'មើលកៅអី': 'View seats', 'លុបកម្មវិធីបានជោគជ័យ': 'Event deleted successfully', 'លុបមិនបានសម្រេច': 'Delete failed', 'គ្រប់គ្រងតួនាទី សិទ្ធិ និងគណនីអ្នកប្រើប្រាស់': 'Manage roles, permissions, and user accounts', 'ចូលជា user': 'Login as user', 'បង្កើតអ្នកប្រើប្រាស់': 'New user', 'បង្កើតអ្នកប្រើប្រាស់ថ្មី': 'Register new user', 'បានកែប្រែអ្នកប្រើប្រាស់ជោគជ័យ': 'User updated successfully', 'រក្សាទុកមិនបានសម្រេច': 'Save failed', 'លុបអ្នកប្រើប្រាស់បានជោគជ័យ': 'User deleted successfully', 'ស្ថានភាព': 'Status', 'អ្នកប្រើប្រាស់ និងសិទ្ធិ RBAC': 'Users and RBAC security', 'ផ្ទាំង Admin': 'Admin Dashboard', 'កន្លែងធ្វើការ': 'Workspace', 'ការគ្រប់គ្រងអាជីវកម្ម': 'BUSINESS OPERATIONS', 'គ្រប់គ្រង API →': 'Management API →', 'សេវាកម្មដំណើរការ': 'Business services healthy', 'ការលក់ និងចំណូល': 'Sales & Revenue', 'សេចក្តីសង្ខេបការលក់': 'Sales overview', 'កម្មវិធី & Shows': 'Events & Shows', 'កាតាឡុកកម្មវិធី': 'Events catalog', 'ការកុម្ម៉ង់ និង checkout': 'Orders & checkout', 'បញ្ជីទូទាត់ប្រាក់': 'Payment ledger', 'ស្តុកសំបុត្រ': 'Ticket inventory', 'អ្នកប្រើប្រាស់ និង RBAC': 'Users & RBAC', 'គ្រប់គ្រង API': 'Management API', 'ប្រតិបត្តិការប្រព័ន្ធ': 'PLATFORM OPERATIONS', 'Gateway និង Diagnostics': 'Gateway & Diagnostics', 'ការជូនដំណឹង Kafka': 'Kafka notifications', 'សុខភាព, routes និង errors': 'Health, routes & errors', 'ចរាចរ API': 'Live traffic', 'Gateway ដំណើរការ': 'Gateway online',
  },
  en: {
    'ផ្ទាំងសង្ខេប': 'Overview', 'កម្មវិធី': 'Events', 'កម្មវិធី & Shows': 'Events & Shows', 'សំបុត្រ': 'Tickets', 'សំបុត្រ & កៅអី': 'Tickets & Seats', 'ការកុម្ម៉ង់': 'Orders', 'ការទូទាត់': 'Payments', 'អ្នកប្រើប្រាស់': 'Users', 'ផ្ទាំងគ្រប់គ្រង': 'Dashboard', 'ម៉ូឌុល Admin': 'Admin modules', 'ម៉ូឌុល API': 'API modules', 'ស្វែងរក': 'Search', 'តម្រង': 'Filter', 'តម្រៀប': 'Sort', 'សកម្មភាព': 'Actions', 'ស្ថានភាព': 'Status', 'តួនាទី': 'Role', 'ទូរស័ព្ទ': 'Phone', 'អ៊ីមែល': 'Email', 'កាលបរិច្ឆេទ': 'Date', 'ឈ្មោះ': 'Name', 'តម្លៃ': 'Price', 'ចំណងជើង': 'Title', 'ប្រភេទ': 'Category', 'ទីតាំង': 'Location', 'ចំណុះ': 'Capacity', 'កែប្រែ': 'Edit', 'លុប': 'Delete', 'បោះបង់': 'Cancel', 'រក្សាទុកការកែប្រែ': 'Save changes', 'បង្កើតគណនី': 'Create account', 'អ្នកប្រើប្រាស់ថ្មី': 'New user', 'កែប្រែអ្នកប្រើប្រាស់': 'Edit user', 'កែប្រែកម្មវិធី': 'Edit event', 'បង្កើតកម្មវិធីថ្មី': 'Publish new event', 'បង្កើតកម្មវិធី': 'Publish event', 'រកមិនឃើញអ្នកប្រើប្រាស់': 'No users found', 'រកមិនឃើញកម្មវិធី': 'No events found', 'សាកល្បងពាក្យស្វែងរកផ្សេងទៀត': 'Try another search term', 'សាកល្បងលុបតម្រង ឬស្វែងរកពាក្យផ្សេង': 'Try clearing filters or searching another term', 'ចូលប្រើ': 'Login', 'កំពុងប្រើ': 'Logged in', 'កក់': 'Book', 'កុម្ម៉ង់': 'Order', 'រក្សាទុក': 'Save', 'កំពុងដំណើរការ...': 'Loading...', 'គ្មានទិន្នន័យ': 'No data', 'ទំនេរ': 'Available', 'បានចាក់សោ': 'Locked', 'លក់រួច': 'Sold', 'លេខសំបុត្រ': 'Ticket Code', 'ចំណងជើងកម្មវិធី': 'Event Title', 'លេខកៅអី': 'Seat Number', 'កម្រិត': 'Tier', 'តម្លៃដើម': 'Base Price', 'ប្រភេទកម្មវិធី': 'Event Category', 'កាលបរិច្ឆេទ និងម៉ោង': 'Date & Time', 'ទីតាំងកម្មវិធី': 'Venue Location', 'ចំណុះសរុប': 'Total capacity', 'ឈ្មោះអ្នកប្រើប្រាស់ *': 'Username *', 'លេខទូរស័ព្ទ *': 'Phone number *', 'Gateway ដំណើរការ': 'Gateway online', 'សេវាកម្មអាជីវកម្មដំណើរការ': 'Business services healthy', 'ចរាចរ API': 'Live traffic', 'API Gateway និងការត្រួតពិនិត្យ Service': 'API Gateway & Service Diagnostics', 'តាមដាន Event Stream': 'Event Stream Monitoring', 'គ្រប់គ្រង API': 'Management API', 'ផ្ទាំង Admin': 'Admin Dashboard',
  },
};

const translateDocument = (language: Language) => {
  const dictionary = translations[language];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) nodes.push(node as Text);
  nodes.forEach((textNode) => {
    const raw = textNode.nodeValue || '';
    const trimmed = raw.trim();
    if (!trimmed || textNode.parentElement?.closest('script,style,textarea')) return;
    const translated = dictionary[trimmed];
    if (translated) textNode.nodeValue = raw.replace(trimmed, translated);
  });
  document.querySelectorAll<HTMLElement>('[placeholder], [title], [aria-label]').forEach((element) => {
    ['placeholder', 'title', 'aria-label'].forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (value && dictionary[value]) element.setAttribute(attribute, dictionary[value]);
    });
  });
};

export const LanguageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const requested = new URLSearchParams(window.location.search).get('lang');
    if (requested === 'en' || requested === 'km') {
      localStorage.setItem('tsm_language', requested);
      return requested;
    }
    const saved = localStorage.getItem('tsm_language');
    return saved === 'en' || saved === 'km' ? saved : 'km';
  });

  useEffect(() => {
    document.documentElement.lang = language === 'km' ? 'km' : 'en';
    const apply = () => translateDocument(language);
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(() => ({
    language,
    isKhmer: language === 'km',
    setLanguage: (next: Language) => {
      setLanguageState(next);
      localStorage.setItem('tsm_language', next);
      window.setTimeout(() => window.location.reload(), 0);
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
  return <div className={`inline-flex items-center gap-0.5 rounded-lg p-1 border ${dark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'}`} aria-label="Language selector"><button onClick={() => setLanguage('km')} className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${language === 'km' ? (dark ? 'bg-cyan-600 text-white' : 'bg-white text-indigo-700 shadow-sm') : (dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}>ខ្មែរ</button><button onClick={() => setLanguage('en')} className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${language === 'en' ? (dark ? 'bg-cyan-600 text-white' : 'bg-white text-indigo-700 shadow-sm') : (dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}>EN</button></div>;
};
