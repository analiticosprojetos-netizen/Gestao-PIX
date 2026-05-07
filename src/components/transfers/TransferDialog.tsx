"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Transfer } from '@/types/transfer';

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

const TransferDialog = ({ open, onOpenChange, onSubmit }: TransferDialogProps) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    friend_name: '',
    type: 'out' as 'in' | 'out',
    status: 'pending' as 'pending' | 'completed'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.friend_name) return;

    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date + 'T12:00:00')
    });
    
    onOpenChange(false);
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      friend_name: '',
      type: 'out',
      status: 'pending'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-t-3xl sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>Nova Transferência PIX</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={formData.type} onValueChange={(v: any) => setFormData({...formData, type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="out">Envio (Saída)</SelectItem>
                  <SelectItem value="in">Recebimento (Entrada)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v: any) => setFormData({...formData, status: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input 
              placeholder="Ex: Almoço, Empréstimo..." 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Amigo / Contato</Label>
            <Input 
              placeholder="Nome da pessoa" 
              value={formData.friend_name}
              onChange={(e) => setFormData({...formData, friend_name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input 
                type="number" 
                step="0.01" 
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input 
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-indigo-600 h-12 text-lg rounded-2xl mt-4">
            Salvar PIX
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransferDialog;