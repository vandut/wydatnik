import React, { createContext, useContext, useState } from 'react';
import { dictionaries, Language, getLanguage } from './dictionaries';

type I18nContextType = {
  t: (key: keyof typeof dictionaries['en']) => string;
  language: Language;
  setLanguage: (lang: Language) => void;
};

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(getLanguage());

  const t = (key: keyof typeof dictionaries['en']): string => {
    return dictionaries[language][key] || dictionaries['en'][key] || key;
  };

  return <I18nContext.Provider value={{ t, language, setLanguage }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
