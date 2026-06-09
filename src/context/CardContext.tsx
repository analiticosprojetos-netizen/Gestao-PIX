"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CardTransaction, CardInstallment } from '@/types/transfer';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';
import { addMonths, setDate, parseISO } from 'date-fns';

interface CardContextType {
  transactions: CardTransaction[];
  installments: CardInstallment[];
  addTransaction: (data: Omit<CardTransaction, 'id' | 'created_at'>) => Promise<void>;
  updateTransaction: (id: string, data: Omit<CardTransaction, 'id' | 'created_at'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  toggleInstallmentPaid: (id: string) => Promise<void>;
  loading: boolean;
}

const CardContext = createContext<CardContextType | undefined>(undefined);

export const CardProvider = ({ children }: { children: React.ReactNode }) => {
  const [transactions, setTransactions] = useState<CardTransaction[]>([]);
  const [installments, setInstallments] = useState<CardInstallment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data: txData } = await supabase.from('card_transactions').select('*').order('purchase_date', { ascending: false });
      const { data: instData } = await supabase.from('card_installments').select('*').order('due_date', { ascending: true });
      
      if (txData) setTransactions(txData);
      if (instData) setInstallments(instData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateInstallments = (txId: string, data: Omit<CardTransaction, 'id' | 'created_at'>) => {
    const newInstallments = [];
    const installmentAmount = parseFloat((data.total_amount / data.installments_count).toFixed(2));
    
    // Usamos parseISO e setamos meio-dia para evitar problemas de fuso horário
    const purchaseDate = parseISO(data.purchase_date as any);
    const purchaseDay = purchaseDate.getDate();

    for (let i = 1; i <= data.installments_count; i++) {
      // i-1 para que a primeira parcela (i=1) comece no mês da compra (ou no próximo se já fechou)
      let dueDate = setDate(addMonths(purchaseDate, i - 1), data.closing_day + 7);
      
      // Se a compra foi feita no dia do fechamento ou depois, a primeira parcela pula para o próximo mês
      if (purchaseDay >= data.closing_day) {
        dueDate = addMonths(dueDate, 1);
      }

      newInstallments.push({
        transaction_id: txId,
        number: i,
        amount: i === data.installments_count 
          ? (data.total_amount - (installmentAmount * (data.installments_count - 1))) 
          : installmentAmount,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'pending'
      });
    }
    return newInstallments;
  };

  const addTransaction = async (data: Omit<CardTransaction, 'id' | 'created_at'>) => {
    try {
      const { data: tx, error: txError } = await supabase
        .from('card_transactions')
        .insert([data])
        .select()
        .single();

      if (txError) throw txError;

      const newInstallments = generateInstallments(tx.id, data);
      const { error: instError } = await supabase.from('card_installments').insert(newInstallments);
      if (instError) throw instError;

      fetchData();
      showSuccess("Compra parcelada registrada!");
    } catch (err) {
      showError("Erro ao salvar compra");
    }
  };

  const updateTransaction = async (id: string, data: Omit<CardTransaction, 'id' | 'created_at'>) => {
    try {
      const { error: txError } = await supabase
        .from('card_transactions')
        .update(data)
        .eq('id', id);

      if (txError) throw txError;

      const { error: delError } = await supabase.from('card_installments').delete().eq('transaction_id', id);
      if (delError) throw delError;

      const newInstallments = generateInstallments(id, data);
      const { error: instError } = await supabase.from('card_installments').insert(newInstallments);
      if (instError) throw instError;

      fetchData();
      showSuccess("Compra atualizada!");
    } catch (err) {
      showError("Erro ao atualizar compra");
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase.from('card_transactions').delete().eq('id', id);
      if (error) throw error;
      
      setTransactions(prev => prev.filter(t => t.id !== id));
      setInstallments(prev => prev.filter(i => i.transaction_id !== id));
      showSuccess("Compra removida com sucesso");
    } catch (err) {
      showError("Erro ao remover compra");
    }
  };

  const toggleInstallmentPaid = async (id: string) => {
    try {
      const installment = installments.find(i => i.id === id);
      if (!installment) return;

      const newStatus = installment.status === 'paid' ? 'pending' : 'paid';
      const { error } = await supabase
        .from('card_installments')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      setInstallments(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
    } catch (err) {
      showError("Erro ao atualizar parcela");
    }
  };

  return (
    <CardContext.Provider value={{ transactions, installments, addTransaction, updateTransaction, deleteTransaction, toggleInstallmentPaid, loading }}>
      {children}
    </CardContext.Provider>
  );
};

export const useCards = () => {
  const context = useContext(CardContext);
  if (!context) throw new Error("useCards must be used within a CardProvider");
  return context;
};