"use client";

import React, { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Sparkles } from 'lucide-react';
import { ShoppingItem } from '@/types/shopping';
import { getEstimatedPrice } from '@/utils/priceEstimator';

interface ShoppingItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; quantity: number; price: number }) => void;
  item?: ShoppingItem | null;
}

const ShoppingItemDialog = ({ open, onOpenChange, onSubmit, item }: ShoppingItemDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '1',
    price: ''
  });
  const [suggestedPrice, setSuggestedPrice] = useState<number>(0);

  useEffect(() => {
    if (item && open) {
      setFormData({
        name: item.name,
        quantity: item.quantity.toString(),
        price: item.price > 0 ? item.price.toString() : ''
      });
      setSuggestedPrice(0);
    } else if (open) {
      setFormData({
        name: '',
        quantity: '1',
        price: ''
      });
      setSuggestedPrice(0);
    }
  }, [item, open]);

  // Monitora a mudança de nome para sugerir o preço médio
  useEffect(() => {
    if (!item && formData.name.trim().length > 2) {
      const estimate = getEstimatedPrice(formData.name);
      setSuggestedPrice(estimate);
    } else {
      setSuggestedPrice(0);
    }
  }, [formData.name, item]);

  const applySuggestion = () => {
    if (suggestedPrice > 0) {
      setFormData(prev => ({
        ...prev,
        price: suggestedPrice.toFixed(2)
      }));
      setSuggestedPrice(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSubmit({
      name: formData.name.trim(),
      quantity: parseInt(formData.quantity) || 1,
      price: parseFloat(formData.price) || 0
    });

    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="dark:bg-slate-900 border-none rounded-t-[32px] max-w-lg mx-auto">
        <div className="mx-auto w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full my-4" />
        
        <DrawerHeader className="text-left px-6 relative">
          <DrawerTitle className="text-2xl font-bold">
            {item ? 'Editar Item' : 'Novo Item de Compra'}
          </DrawerTitle>
          <DrawerDescription>
            Adicione itens à sua lista de compras do supermercado
          </DrawerDescription>
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute right-6 top-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 pb-10">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-400 uppercase ml-1">Nome do Item</Label>
            <Input 
              placeholder="Ex: Arroz, Feijão, Sabonete..." 
              className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              autoFocus
            />
          </div>

          {suggestedPrice > 0 && (
            <button
              type="button"
              onClick={applySuggestion}
              className="w-full flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all active:scale-95"
            >
              <span className="flex items-center gap-2">
                <Sparkles size={14} className="animate-pulse" />
                Preço médio sugerido: R$ {suggestedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="bg-indigo-600 text-white px-2 py-1 rounded-lg text-[10px]">Usar</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-400 uppercase ml-1">Quantidade</Label>
              <Input 
                type="number"
                min="1"
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-400 uppercase ml-1">Preço Estimado (R$)</Label>
              <Input 
                type="number"
                step="0.01"
                placeholder="0,00 (Opcional)"
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-indigo-600 h-14 text-lg font-bold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none">
            {item ? 'Salvar Alterações' : 'Adicionar à Lista'}
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default ShoppingItemDialog;