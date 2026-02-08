import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, TranslationKey } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isFirstVisit: boolean;
  setFirstVisitComplete: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'shivam-cctv-language';
const FIRST_VISIT_KEY = 'shivam-cctv-first-visit';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
    const hasVisited = localStorage.getItem(FIRST_VISIT_KEY);
    
    if (savedLanguage && ['en', 'mr', 'hi'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
    
    if (!hasVisited) {
      setIsFirstVisit(true);
    }
    
    setIsInitialized(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const setFirstVisitComplete = () => {
    setIsFirstVisit(false);
    localStorage.setItem(FIRST_VISIT_KEY, 'true');
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  // Don't render until we've checked localStorage
  if (!isInitialized) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isFirstVisit, setFirstVisitComplete }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
