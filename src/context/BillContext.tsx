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

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      if (data) {
        setBills(data.map(b => ({
          id: b.id,
          title: b.title,
          amount: parseFloat(b.amount),
          dueDate: new Date(b.due_date + 'T12:00:00'),
          paid: b.paid,
          category: b.category || 'Geral',
          recurring: b.recurring || false
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
          due_date: newBill.dueDate.toISOString().split('T')[0],
          paid: false,
          category: newBill.category,
          recurring: newBill.recurring
        }])
        .select();

      if (error) throw error;
      if (data) {
        const mapped = data.map(b => ({
          id: b.id,
          title: b.title,
          amount: parseFloat(b.amount),
          dueDate: new Date(b.due_date + 'T12:00:00'),
          paid: b.paid,
          category: b.category || 'Geral',
          recurring: b.recurring || false
        }));
        setBills(prev => [...prev, ...mapped].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()));
        showSuccess("Boleto cadastrado!");
      }
    } catch (err) {
      console.error(err);
      showError("Erro ao salvar boleto");
    }
  };

  const updateBill = async (id: string, updates: Partial<Bill>) => {
    try {
      const formattedUpdates: any = {};
      if (updates.title !== undefined) formattedUpdates.title = updates.title;
      if (updates.amount !== undefined) formattedUpdates.amount = updates.amount;
      if (updates.dueDate !== undefined) formattedUpdates.due_date = updates.dueDate.toISOString().split('T')[0];
      if (updates.paid !== undefined) formattedUpdates.paid = updates.paid;
      if (updates.category !== undefined) formattedUpdates.category = updates.category;
      if (updates.recurring !== undefined) formattedUpdates.recurring = updates.recurring;

      const { error } = await supabase
        .from('bills')
        .update(formattedUpdates)
        .eq('id', id);

      if (error) throw error;
      setBills(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()));
    } catch (err) {
      showError("Erro ao atualizar boleto");
    }
  };

  const deleteBill = async (id: string) => {
    try {
      const { error } = await supabase.from('bills').delete().eq('id', id);
      if (error) throw error;
      setBills(prev => prev.filter(b => b.id !== id));
      showSuccess("Boleto removido");
    } catch (err) {
      showError("Erro ao remover boleto");
    }
  };

  const togglePaid = async (id: string) => {
    const bill = bills.find(b => b.id === id);
    if (!bill) return;
    await updateBill(id, { paid: !bill.paid });
    showSuccess(bill.paid ? "Boleto marcado como pendente" : "Boleto marcado como pago!");
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