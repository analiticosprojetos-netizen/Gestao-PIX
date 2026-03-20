"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bill } from '@/types/bill';

interface BillContextType {
  bills: Bill[];
  addBill: (bill: Omit<Bill, 'id' | 'paid'>) => void;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  togglePaid: (id: string) => void;
}

const BillContext = createContext<BillContextType | undefined>(undefined);

export const BillProvider = ({ children }: { children: React.ReactNode }) => {
  const [bills, setBills] = useState<Bill[]>([]);

  // Carregar dados iniciais do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('alertaboleto_bills');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Converter strings de data de volta para objetos Date
      const formatted = parsed.map((b: any) => ({
        ...b,
        dueDate: new Date(b.dueDate)
      }));
      setBills(formatted);
    } else {
      // Dados iniciais de exemplo
      setBills([
        { id: '1', title: 'Internet Fibra', amount: 99.90, dueDate: new Date(2025, 4, 15), paid: false, category: 'Geral' },
      ]);
    }
  }, []);

  // Salvar no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('alertaboleto_bills', JSON.stringify(bills));
  }, [bills]);

  const addBill = (newBill: Omit<Bill, 'id' | 'paid'>) => {
    const bill: Bill = {
      ...newBill,
      id: Math.random().toString(36).substr(2, 9),
      paid: false
    };
    setBills(prev => [bill, ...prev]);
  };

  const updateBill = (id: string, updates: Partial<Bill>) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBill = (id: string) => {
    setBills(prev => prev.filter(b => b.id !== id));
  };

  const togglePaid = (id: string) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, paid: !b.paid } : b));
  };

  return (
    <BillContext.Provider value={{ bills, addBill, updateBill, deleteBill, togglePaid }}>
      {children}
    </BillContext.Provider>
  );
};

export const useBills = () => {
  const context = useContext(BillContext);
  if (!context) throw new Error("useBills must be used within a BillProvider");
  return context;
};