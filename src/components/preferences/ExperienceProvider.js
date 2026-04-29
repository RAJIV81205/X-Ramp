'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { t as translate } from '../../lib/ux';

const ExperienceContext = createContext(null);

const defaultNotifications = {
  transactionAlerts: true,
  weeklySummary: true,
  priceAlerts: false,
};

const getStoredTheme = () => {
  if (typeof window === 'undefined') return 'light';
  return localStorage.getItem('xramp-theme') || 'light';
};

const getStoredLanguage = () => {
  if (typeof window === 'undefined') return 'en';
  return localStorage.getItem('xramp-language') || 'en';
};

const getStoredNotifications = () => {
  if (typeof window === 'undefined') return defaultNotifications;

  try {
    return {
      ...defaultNotifications,
      ...JSON.parse(localStorage.getItem('xramp-notifications') || '{}'),
    };
  } catch (error) {
    console.error('Failed to parse saved notification settings:', error);
    return defaultNotifications;
  }
};

export function ExperienceProvider({ children }) {
  const [theme, setTheme] = useState(getStoredTheme);
  const [language, setLanguage] = useState(getStoredLanguage);
  const [notifications, setNotifications] = useState(getStoredNotifications);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('xramp-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.lang = language === 'hi' ? 'hi' : 'en';
    localStorage.setItem('xramp-language', language);
  }, [language]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('xramp-notifications', JSON.stringify(notifications));
  }, [notifications]);

  const value = {
    theme,
    setTheme,
    toggleTheme: () => setTheme((current) => (current === 'light' ? 'dark' : 'light')),
    language,
    setLanguage,
    notifications,
    setNotifications,
    t: (key, fallback) => translate(language, key, fallback),
  };

  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  );
}

export function useExperience() {
  const context = useContext(ExperienceContext);

  if (!context) {
    throw new Error('useExperience must be used within ExperienceProvider');
  }

  return context;
}
