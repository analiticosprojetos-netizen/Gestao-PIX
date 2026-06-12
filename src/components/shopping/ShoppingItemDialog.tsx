"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingItem } from '@/types/shopping';

interface ShoppingItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, quantity: number, price: number) => void;
  editingItem?: ShoppingItem | null;
}

const ShoppingItemDialog = ({ open, onOpenChange, onSubmit, editingItem }: ShoppingItemDialogProps) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('0');

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setQuantity(editingItem.quantity.toString());
      setPrice(editingItem.price.toString());
    } else {
      setName('');
      setQuantity('1');
      setPrice('0');
    }
  }, [editingItem, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name, parseInt(quantity) || 1, parseFloat(price) || 0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-t-3xl sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Editar Item' : 'Novo Item de Mercado'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome do Produto</Label>
            <Input 
              placeholder="Ex: Arroz, Feijão..." 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input 
                type="number" 
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Preço Estimado (R$)</Label>
              <Input 
                type="number" 
                step="0.01"
                placeholder="0,00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-indigo-600 h-12 text-lg rounded-2xl mt-4">
            {editingItem ? 'Salvar Alterações' : 'Adicionar à Lista'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShoppingItemDialog;