"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ShoppingItem } from '@/types/shopping';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';

interface ShoppingContextType {
  items: ShoppingItem[];
  addItem: (item: Omit<ShoppingItem, 'id' | 'checked'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<ShoppingItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleChecked: (id: string) => Promise<void>;
  clearCheckedItems: () => Promise<void>;
  loading: boolean;
}

const ShoppingContext = createContext<ShoppingContextType | undefined>(undefined);

export const ShoppingProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('shopping_list')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        setItems(data.map(item => ({
          id: item.id,
          created_at: item.created_at,
          name: item.name,
          quantity: item.quantity || 1,
          checked: item.checked || false,
          price: parseFloat(item.price || 0)
        })));
      }
    } catch (err) {
      console.error("Erro ao buscar lista de compras:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const addItem = async (newItem: Omit<ShoppingItem, 'id' | 'checked'>) => {
    try {
      const { data, error } = await supabase
        .from('shopping_list')
        .insert([{
          name: newItem.name,
          quantity: newItem.quantity,
          price: newItem.price,
          checked: false
        }])
        .select();

      if (error) throw error;
      if (data) {
        const mapped = data.map(item => ({
          id: item.id,
          created_at: item.created_at,
          name: item.name,
          quantity: item.quantity || 1,
          checked: item.checked || false,
          price: parseFloat(item.price || 0)
        }));
        setItems(prev => [...prev, ...mapped]);
        showSuccess(`"${newItem.name}" adicionado à lista!`);
      }
    } catch (err) {
      console.error(err);
      showError("Erro ao adicionar item");
    }
  };

  const updateItem = async (id: string, updates: Partial<ShoppingItem>) => {
    try {
      const formattedUpdates: any = {};
      if (updates.name !== undefined) formattedUpdates.name = updates.name;
      if (updates.quantity !== undefined) formattedUpdates.quantity = updates.quantity;
      if (updates.price !== undefined) formattedUpdates.price = updates.price;
      if (updates.checked !== undefined) formattedUpdates.checked = updates.checked;

      const { error } = await supabase
        .from('shopping_list')
        .update(formattedUpdates)
        .eq('id', id);

      if (error) throw error;
      setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    } catch (err) {
      showError("Erro ao atualizar item");
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase.from('shopping_list').delete().eq('id', id);
      if (error) throw error;
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      showError("Erro ao remover item");
    }
  };

  const toggleChecked = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newChecked = !item.checked;
    await updateItem(id, { checked: newChecked });
  };

  const clearCheckedItems = async () => {
    try {
      const checkedIds = items.filter(i => i.checked).map(i => i.id);
      if (checkedIds.length === 0) return;

      const { error } = await supabase
        .from('shopping_list')
        .delete()
        .in('id', checkedIds);

      if (error) throw error;
      setItems(prev => prev.filter(item => !item.checked));
      showSuccess("Itens comprados removidos da lista!");
    } catch (err) {
      showError("Erro ao limpar itens");
    }
  };

  return (
    <ShoppingContext.Provider value={{ items, addItem, updateItem, deleteItem, toggleChecked, clearCheckedItems, loading }}>
      {children}
    </ShoppingContext.Provider>
  );
};

export const useShopping = () => {
  const context = useContext(ShoppingContext);
  if (!context) throw new Error("useShopping must be used within a ShoppingProvider");
  return context;
};