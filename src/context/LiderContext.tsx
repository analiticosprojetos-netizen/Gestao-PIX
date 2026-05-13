"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LiderExpense, LiderSystemPayment } from '@/types/lider';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';

interface LiderContextType {
  expenses: LiderExpense[];
  payments: LiderSystemPayment[];
  addExpense: (expense: Omit<LiderExpense, 'id'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<LiderExpense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addPayment: (payment: Omit<LiderSystemPayment, 'id'>) => Promise<void>;
  updatePayment: (id: string, updates: Partial<LiderSystemPayment>) => Promise<void>;
  loading: boolean;
}

const LiderContext = createContext<LiderContextType | undefined>(undefined);

export const LiderProvider = ({ children }: { children: React.ReactNode }) => {
  const [expenses, setExpenses] = useState<LiderExpense[]>([]);
  const [payments, setPayments] = useState<LiderSystemPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data: expData } = await supabase.from('lider_expenses').select('*').order('due_date', { ascending: true });
      const { data: payData } = await supabase.from('lider_payments').select('*').order('due_date', { ascending: true });
      
      // Adicionamos T12:00:00 para evitar que o fuso horário mude o dia
      if (expData) setExpenses(expData.map(e => ({ ...e, due_date: new Date(e.due_date + 'T12:00:00') })));
      if (payData) setPayments(payData.map(p => ({ ...p, due_date: new Date(p.due_date + 'T12:00:00') })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addExpense = async (expense: Omit<LiderExpense, 'id'>) => {
    try {
      const { data, error } = await supabase.from('lider_expenses').insert([{
        ...expense,
        due_date: expense.due_date.toISOString().split('T')[0]
      }]).select();
      if (error) throw error;
      fetchData();
      showSuccess("Gasto registrado!");
    } catch (err) {
      showError("Erro ao salvar");
    }
  };

  const updateExpense = async (id: string, updates: Partial<LiderExpense>) => {
    try {
      const formatted = { ...updates };
      if (updates.due_date) formatted.due_date = updates.due_date.toISOString().split('T')[0] as any;
      const { error } = await supabase.from('lider_expenses').update(formatted).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      showError("Erro ao atualizar");
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase.from('lider_expenses').delete().eq('id', id);
      if (error) throw error;
      fetchData();
      showSuccess("Removido!");
    } catch (err) {
      showError("Erro ao remover");
    }
  };

  const addPayment = async (payment: Omit<LiderSystemPayment, 'id'>) => {
    try {
      const { error } = await supabase.from('lider_payments').insert([{
        ...payment,
        due_date: payment.due_date.toISOString().split('T')[0]
      }]);
      if (error) throw error;
      fetchData();
      showSuccess("Mensalidade gerada!");
    } catch (err) {
      showError("Erro ao gerar");
    }
  };

  const updatePayment = async (id: string, updates: Partial<LiderSystemPayment>) => {
    try {
      const { error } = await supabase.from('lider_payments').update(updates).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      showError("Erro ao atualizar");
    }
  };

  return (
    <LiderContext.Provider value={{ expenses, payments, addExpense, updateExpense, deleteExpense, addPayment, updatePayment, loading }}>
      {children}
    </LiderContext.Provider>
  );
};

export const useLider = () => {
  const context = useContext(LiderContext);
  if (!context) throw new Error("useLider must be used within a LiderProvider");
  return context;
};