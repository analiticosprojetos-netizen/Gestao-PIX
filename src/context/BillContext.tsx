"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bill } from '@/types/bill';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';

interface BillContextType {
  bills: Bill[];
  addBill: (bill: Omit<Bill, 'id' | 'paid'>) => Promise<void>;
  updateBill: (id: string, updates: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  togglePaid: (id: string) => Promise<void>;
  loading: boolean;
}

const BillContext = createContext<BillContextType | undefined>(undefined);

export const BillProvider = ({ children }: { children: React.ReactNode }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar boletos do Supabase
  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;

      if (data) {
        setBills(data.map(b => ({
          ...b,
          dueDate: new Date(b.due_date)
        })));
      }
    } catch (err) {
      console.error("Erro ao buscar boletos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const addBill = async (newBill: Omit<Bill, 'id' | 'paid'>) => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .insert([{
          title: newBill.title,
          amount: newBill.amount,
          due_date: newBill.dueDate.toISOString(),
          category: newBill.category,
          paid: false
        }])
        .select();

      if (error) throw error;
      if (data) {
        setBills(prev => [...data.map(b => ({ ...b, dueDate: new Date(b.due_date) })), ...prev]);
        showSuccess("Boleto salvo no banco de dados!");
      }
    } catch (err) {
      showError("Erro ao salvar boleto");
    }
  };

  const updateBill = async (id: string, updates: Partial<Bill>) => {
    try {
      const formattedUpdates: any = { ...updates };
      if (updates.dueDate) formattedUpdates.due_date = updates.dueDate.toISOString();
      delete formattedUpdates.dueDate;

      const { error } = await supabase
        .from('bills')
        .update(formattedUpdates)
        .eq('id', id);

      if (error) throw error;
      setBills(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    } catch (err) {
      showError("Erro ao atualizar");
    }
  };

  const deleteBill = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setBills(prev => prev.filter(b => b.id !== id));
      showSuccess("Boleto removido");
    } catch (err) {
      showError("Erro ao remover");
    }
  };

  const togglePaid = async (id: string) => {
    const bill = bills.find(b => b.id === id);
    if (!bill) return;
    await updateBill(id, { paid: !bill.paid });
  };

  return (
    <BillContext.Provider value={{ bills, addBill, updateBill, deleteBill, togglePaid, loading }}>
      {children}
    </BillContext.Provider>
  );
};

export const useBills = () => {
  const context = useContext(BillContext);
  if (!context) throw new Error("useBills must be used within a BillProvider");
  return context;
};