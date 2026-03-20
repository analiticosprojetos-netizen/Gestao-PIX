"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings } from '@/types/bill';
import { supabase } from '@/lib/supabase';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => Promise<void>;
  loading: boolean;
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
  const [loading, setLoading] = useState(true);

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
          id: 1, // Usando ID fixo para app de usuário único por enquanto
          config: newSettings 
        });

      if (error) throw error;
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
};