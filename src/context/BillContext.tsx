"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bill } from '@/types/bill';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';
import { addMonths } from 'date-fns';

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
          ...b,
          dueDate: new Date(b.due_date),
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
          due_date: newBill.dueDate.toISOString(),
          category: newBill.category || 'Geral',
          paid: false,
          recurring: newBill.recurring || false
        }])
        .select();

      if (error) throw error;
      if (data) {
        const mapped = data.map(b => ({ ...b, dueDate: new Date(b.due_date) }));
        setBills(prev => [...mapped, ...prev]);
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
      const { error } = await supabase.from('bills').delete().eq('id', id);
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

    const newPaidStatus = !bill.paid;
    await updateBill(id, { paid: newPaidStatus });

    // Lógica Mensal: Se marcou como pago e é recorrente, cria o do mês seguinte
    if (newPaidStatus && bill.recurring) {
      const nextMonthDate = addMonths(bill.dueDate, 1);
      
      // Verifica se já não existe um boleto com o mesmo título no mês seguinte para evitar duplicatas
      const alreadyExists = bills.find(b => 
        b.title === bill.title && 
        b.dueDate.getMonth() === nextMonthDate.getMonth() &&
        b.dueDate.getFullYear() === nextMonthDate.getFullYear()
      );

      if (!alreadyExists) {
        await addBill({
          title: bill.title,
          amount: bill.amount,
          dueDate: nextMonthDate,
          category: bill.category,
          recurring: true
        });
        showSuccess(`Boleto de ${format(nextMonthDate, 'MMMM', { locale: (await import('date-fns/locale')).ptBR })} gerado!`);
      }
    }
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