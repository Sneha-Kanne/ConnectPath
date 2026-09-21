import { useState, useEffect, useCallback } from 'react';
import { SupportedLanguage, translations } from '../lib/translations';

const STORAGE_KEY = 'connectpath_language';

// Global dispatch event for cross-component synchronization
const LANG_CHANGE_EVENT = 'connectpath_lang_changed';

export function useLanguage() {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'te' || stored === 'hi') {
        return stored as SupportedLanguage;
      }
    } catch {
      // Ignore storage errors
    }
    return 'en';
  });

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        if (e.newValue === 'en' || e.newValue === 'te' || e.newValue === 'hi') {
          setLanguageState(e.newValue as SupportedLanguage);
        }
      }
    };

    const handleCustomChange = (e: CustomEvent<SupportedLanguage>) => {
      if (e.detail) {
        setLanguageState(e.detail);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(LANG_CHANGE_EVENT as any, handleCustomChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(LANG_CHANGE_EVENT as any, handleCustomChange);
    };
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors
    }
    // Dispatch custom event so other mounted hooks update immediately
    window.dispatchEvent(new CustomEvent(LANG_CHANGE_EVENT, { detail: lang }));
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const currentDict = translations[language] || translations.en;
      if (currentDict && currentDict[key]) {
        return currentDict[key];
      }
      if (translations.en && translations.en[key]) {
        return translations.en[key];
      }
      return fallback || key;
    },
    [language]
  );

  return { language, setLanguage, t };
}
