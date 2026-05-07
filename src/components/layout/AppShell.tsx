"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Receipt, Settings, Moon, Sun, SendHorizontal } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useSettings } from '@/context/SettingsContext';

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { settings, toggleTheme } = useSettings();

  const navItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: Receipt, label: 'Boletos', path: '/bills' },
    { icon: SendHorizontal, label: 'PIX', path: '/pix' },
    { icon: Settings, label: 'Ajustes', path: '/settings' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 px-6 py-4 sticky top-0 z-50 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">AlertaBoleto</h1>
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 transition-all hover:scale-110 active:scale-95"
        >
          {settings.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <main className="flex-1 p-4 max-w-md mx-auto w-full">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t dark:border-slate-800 flex justify-around items-center h-16 px-2 z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-colors",
                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600 dark:text-slate-500"
              )}
            >
              <Icon size={24} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AppShell;