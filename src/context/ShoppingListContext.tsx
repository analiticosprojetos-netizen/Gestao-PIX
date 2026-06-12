"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ShoppingItem } from '@/types/shopping';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';

interface ShoppingListContextType {
  items: ShoppingItem[];
  addItem: (name: string, quantity?: number, price?: number) => Promise<void>;
  updateItem: (id: string, updates: Partial<ShoppingItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleItemChecked: (id: string, checked: boolean) => Promise<void>;
  handleVoiceCommand: (command: string) => Promise<void>;
  loading: boolean;
}

const ShoppingListContext = createContext<ShoppingListContextType | undefined>(undefined);

export const ShoppingListProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('shopping_list')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setItems(data);
    } catch (err) {
      console.error("Erro ao buscar lista de compras:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const addItem = async (name: string, quantity = 1, price = 0) => {
    try {
      const cleanName = name.trim().toLowerCase();
      if (!cleanName) return;

      // Verifica se já existe um item idêntico não marcado
      const existing = items.find(i => i.name.toLowerCase() === cleanName && !i.checked);
      if (existing) {
        await updateItem(existing.id, { quantity: existing.quantity + quantity });
        return;
      }

      const { data, error } = await supabase
        .from('shopping_list')
        .insert([{ name: name.trim(), quantity, price, checked: false }])
        .select();

      if (error) throw error;
      if (data) {
        setItems(prev => [data[0], ...prev]);
        showSuccess(`"${name}" adicionado!`);
      }
    } catch (err) {
      showError("Erro ao adicionar item");
    }
  };

  const updateItem = async (id: string, updates: Partial<ShoppingItem>) => {
    try {
      const { error } = await supabase
        .from('shopping_list')
        .update(updates)
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
      showSuccess("Item removido");
    } catch (err) {
      showError("Erro ao remover item");
    }
  };

  const toggleItemChecked = async (id: string, checked: boolean) => {
    await updateItem(id, { checked });
  };

  const handleVoiceCommand = async (command: string) => {
    const text = command.toLowerCase().trim();
    
    // 1. Comando de Marcar como OK (ex: "farinha ok" ou "marcar farinha")
    if (text.endsWith(' ok') || text.endsWith(' feito') || text.startsWith('marcar ')) {
      let itemName = text.replace(' ok', '').replace(' feito', '').replace('marcar ', '').trim();
      const item = items.find(i => i.name.toLowerCase() === itemName && !i.checked);
      if (item) {
        await toggleItemChecked(item.id, true);
        showSuccess(`"${item.name}" marcado como comprado!`);
      } else {
        showError(`"${itemName}" não encontrado na lista.`);
      }
      return;
    }

    // 2. Comando de Remover (ex: "remover farinha" ou "excluir farinha")
    if (text.startsWith('remover ') || text.startsWith('excluir ')) {
      const itemName = text.replace('remover ', '').replace('excluir ', '').trim();
      const item = items.find(i => i.name.toLowerCase() === itemName);
      if (item) {
        await deleteItem(item.id);
      } else {
        showError(`"${itemName}" não encontrado.`);
      }
      return;
    }

    // 3. Comando Padrão: Adicionar item (ex: "farinha" ou "3 farinhas")
    // Tenta detectar se começa com número para quantidade
    const match = text.match(/^(\d+)\s+(.+)$/);
    if (match) {
      const qty = parseInt(match[1]);
      const name = match[2];
      await addItem(name, qty);
    } else {
      await addItem(text, 1);
    }
  };

  return (
    <ShoppingListContext.Provider value={{ items, addItem, updateItem, deleteItem, toggleItemChecked, handleVoiceCommand, loading }}>
      {children}
    </ShoppingListContext.Provider>
  );
};

export const useShoppingList = () => {
  const context = useContext(ShoppingListContext);
  if (!context) throw new Error("useShoppingList must be used within a ShoppingListProvider");
  return context;
};