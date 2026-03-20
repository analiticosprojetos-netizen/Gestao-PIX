"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings } from '@/types/bill';
import { supabase } from '@/lib/supabase';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => Promise<void>;
  toggleTheme: () => void;
  loading: boolean;
}

const defaultSettings: AppSettings = {
  theme: 'light',
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
  const [loading, setLoading] = useState(true);

  // Aplica a classe dark no HTML quando o tema muda
  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setSettings(data.config);
        }
      } catch (err) {
        console.error("Erro ao buscar configurações:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: AppSettings) => {
    try {
      setSettings(newSettings);
      
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          id: 1,
          config: newSettings 
        });

      if (error) throw error;
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
    }
  };

  const toggleTheme = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    updateSettings({ ...settings, theme: newTheme });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, toggleTheme, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
};