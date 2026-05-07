"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transfer } from '@/types/transfer';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';

interface TransferContextType {
  transfers: Transfer[];
  addTransfer: (transfer: Omit<Transfer, 'id' | 'created_at'>, file?: File) => Promise<void>;
  updateTransfer: (id: string, updates: Partial<Transfer>) => Promise<void>;
  deleteTransfer: (id: string) => Promise<void>;
  loading: boolean;
}

const TransferContext = createContext<TransferContextType | undefined>(undefined);

export const TransferProvider = ({ children }: { children: React.ReactNode }) => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransfers = async () => {
    try {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      if (data) {
        setTransfers(data.map(t => ({
          ...t,
          date: new Date(t.date)
        })));
      }
    } catch (err) {
      console.error("Erro ao buscar transferências:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const uploadReceipt = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const addTransfer = async (newTransfer: Omit<Transfer, 'id' | 'created_at'>, file?: File) => {
    try {
      let receipt_url = newTransfer.receipt_url;

      if (file) {
        receipt_url = await uploadReceipt(file);
      }

      const { data, error } = await supabase
        .from('transfers')
        .insert([{
          description: newTransfer.description,
          amount: newTransfer.amount,
          date: newTransfer.date.toISOString().split('T')[0],
          friend_name: newTransfer.friend_name,
          type: newTransfer.type,
          status: newTransfer.status,
          receipt_url: receipt_url
        }])
        .select();

      if (error) throw error;
      if (data) {
        const mapped = data.map(t => ({ ...t, date: new Date(t.date) }));
        setTransfers(prev => [...mapped, ...prev]);
        showSuccess("Transferência registrada!");
      }
    } catch (err) {
      console.error(err);
      showError("Erro ao salvar transferência");
    }
  };

  const updateTransfer = async (id: string, updates: Partial<Transfer>) => {
    try {
      const formattedUpdates: any = { ...updates };
      if (updates.date) formattedUpdates.date = updates.date.toISOString().split('T')[0];

      const { error } = await supabase
        .from('transfers')
        .update(formattedUpdates)
        .eq('id', id);

      if (error) throw error;
      setTransfers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch (err) {
      showError("Erro ao atualizar");
    }
  };

  const deleteTransfer = async (id: string) => {
    try {
      const { error } = await supabase.from('transfers').delete().eq('id', id);
      if (error) throw error;
      setTransfers(prev => prev.filter(t => t.id !== id));
      showSuccess("Removido com sucesso");
    } catch (err) {
      showError("Erro ao remover");
    }
  };

  return (
    <TransferContext.Provider value={{ transfers, addTransfer, updateTransfer, deleteTransfer, loading }}>
      {children}
    </TransferContext.Provider>
  );
};

export const useTransfers = () => {
  const context = useContext(TransferContext);
  if (!context) throw new Error("useTransfers must be used within a TransferProvider");
  return context;
};