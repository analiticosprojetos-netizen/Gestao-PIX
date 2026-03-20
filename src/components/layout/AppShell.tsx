"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Receipt, Settings, Bell, BellOff } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useBills } from '@/context/BillContext';

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { bills } = useBills();
  
  const pendingCount = bills.filter(b => !b.paid).length;
  const hasPermission = "Notification" in window && Notification.permission === "granted";

  const navItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: Receipt, label: 'Boletos', path: '/bills' },
    { icon: Settings, label: 'Ajustes', path: '/settings' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-50 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">AlertaBoleto</h1>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <div className="relative">
              {hasPermission ? (
                <Bell size={20} className="text-indigo-600 animate-bounce" />
              ) : (
                <BellOff size={20} className="text-rose-400" />
              )}
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1 rounded-full min-w-[16px] text-center">
                {pendingCount}
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 max-w-md mx-auto w-full">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-16 px-2 z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-colors",
                isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
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