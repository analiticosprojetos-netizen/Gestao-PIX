"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings } from '@/types/bill';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => void;
}

const defaultSettings: AppSettings = {
  alerts: {
    sms: false,
    whatsapp: true,
    email: true,
    vibration: true,
    sound: true,
    push: true,
  },
  contact: {
    phoneNumber: '',
    email: '',
  },
  intervals: {
    first: 15,
    second: 7,
    third: 3,
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem('alertaboleto_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Garantir que a estrutura nova exista mesmo em dados antigos
      setSettings({
        ...defaultSettings,
        ...parsed,
        contact: parsed.contact || defaultSettings.contact,
        alerts: { ...defaultSettings.alerts, ...parsed.alerts }
      });
    }
  }, []);

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('alertaboleto_settings', JSON.stringify(newSettings));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
};