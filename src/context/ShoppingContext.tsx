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

// Chave para salvar as categorias localmente caso a coluna não exista no Supabase
const LOCAL_CATEGORIES_KEY = 'shopping_item_categories';

export const ShoppingProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const getLocalCategories = (): Record<string, string> => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_CATEGORIES_KEY) || '{}');
    } catch {
      return {};
    }
  };

  const saveLocalCategory = (itemId: string, category: string) => {
    try {
      const localCats = getLocalCategories();
      localCats[itemId] = category;
      localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(localCats));
    } catch (err) {
      console.error("Erro ao salvar categoria localmente:", err);
    }
  };

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('shopping_list')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        const localCats = getLocalCategories();
        setItems(data.map(item => ({
          id: item.id,
          created_at: item.created_at,
          name: item.name,
          quantity: item.quantity || 1,
          checked: item.checked || false,
          price: parseFloat(item.price || 0),
          category: item.category || localCats[item.id] || undefined
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
      // 1. Tenta salvar com a coluna 'category'
      const { data, error } = await supabase
        .from('shopping_list')
        .insert([{
          name: newItem.name,
          quantity: newItem.quantity,
          price: newItem.price,
          checked: false,
          category: newItem.category
        }])
        .select();

      if (error) {
        // Se o erro for de coluna inexistente (código 42703 ou mensagem contendo 'category'), tenta sem a coluna
        if (error.code === '42703' || error.message?.includes('category')) {
          console.warn("Coluna 'category' não existe no banco. Salvando localmente.");
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('shopping_list')
            .insert([{
              name: newItem.name,
              quantity: newItem.quantity,
              price: newItem.price,
              checked: false
            }])
            .select();

          if (fallbackError) throw fallbackError;
          if (fallbackData && fallbackData[0]) {
            const createdItem = fallbackData[0];
            if (newItem.category) {
              saveLocalCategory(createdItem.id, newItem.category);
            }
            const mapped = {
              id: createdItem.id,
              created_at: createdItem.created_at,
              name: createdItem.name,
              quantity: createdItem.quantity || 1,
              checked: createdItem.checked || false,
              price: parseFloat(createdItem.price || 0),
              category: newItem.category
            };
            setItems(prev => [...prev, mapped]);
            showSuccess(`"${newItem.name}" adicionado à lista!`);
          }
          return;
        }
        throw error;
      }

      if (data && data[0]) {
        const createdItem = data[0];
        const mapped = {
          id: createdItem.id,
          created_at: createdItem.created_at,
          name: createdItem.name,
          quantity: createdItem.quantity || 1,
          checked: createdItem.checked || false,
          price: parseFloat(createdItem.price || 0),
          category: createdItem.category || newItem.category
        };
        setItems(prev => [...prev, mapped]);
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
      if (updates.category !== undefined) formattedUpdates.category = updates.category;

      const { error } = await supabase
        .from('shopping_list')
        .update(formattedUpdates)
        .eq('id', id);

      if (error) {
        // Se falhar por causa da coluna 'category', atualiza sem ela e salva localmente
        if (error.code === '42703' || error.message?.includes('category')) {
          delete formattedUpdates.category;
          const { error: fallbackError } = await supabase
            .from('shopping_list')
            .update(formattedUpdates)
            .eq('id', id);

          if (fallbackError) throw fallbackError;
          if (updates.category) {
            saveLocalCategory(id, updates.category);
          }
          setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
          showSuccess("Item atualizado!");
          return;
        }
        throw error;
      }

      if (updates.category) {
        saveLocalCategory(id, updates.category);
      }
      setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      showSuccess("Item atualizado!");
    } catch (err) {
      console.error(err);
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