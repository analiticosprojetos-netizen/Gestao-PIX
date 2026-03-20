"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess } from "@/utils/toast";
import { Bill } from '@/types/bill';
import { format } from 'date-fns';

interface BillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  bill?: Bill;
}

const BillDialog = ({ open, onOpenChange, onSubmit, bill }: BillDialogProps) => {
  const [formData, setFormData] = useState({ title: '', amount: '', dueDate: '' });

  useEffect(() => {
    if (bill) {
      setFormData({
        title: bill.title,
        amount: bill.amount.toString(),
        dueDate: format(bill.dueDate, 'yyyy-MM-dd')
      });
    } else {
      setFormData({ title: '', amount: '', dueDate: '' });
    }
  }, [bill, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.dueDate) return;
    
    onSubmit({
      title: formData.title,
      amount: parseFloat(formData.amount),
      dueDate: new Date(formData.dueDate + 'T12:00:00') // Evitar problemas de timezone
    });
    
    onOpenChange(false);
    showSuccess(bill ? "Boleto atualizado!" : "Boleto cadastrado!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-t-3xl sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>{bill ? 'Editar Boleto' : 'Novo Boleto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Descrição</Label>
            <Input 
              id="title" 
              placeholder="Ex: Aluguel, Luz..." 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input 
              id="amount" 
              type="number" 
              step="0.01" 
              placeholder="0,00"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Vencimento</Label>
            <Input 
              id="dueDate" 
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            />
          </div>
          <Button type="submit" className="w-full bg-indigo-600">
            {bill ? 'Salvar Alterações' : 'Salvar Boleto'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BillDialog;