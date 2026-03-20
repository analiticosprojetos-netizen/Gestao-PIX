"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { showSuccess } from "@/utils/toast";
import { Bill } from '@/types/bill';
import { format } from 'date-fns';
import { Repeat } from 'lucide-react';

interface BillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  bill?: Bill;
}

const BillDialog = ({ open, onOpenChange, onSubmit, bill }: BillDialogProps) => {
  const [formData, setFormData] = useState({ 
    title: '', 
    amount: '', 
    dueDate: '',
    recurring: false 
  });

  useEffect(() => {
    if (bill) {
      setFormData({
        title: bill.title,
        amount: bill.amount.toString(),
        dueDate: format(bill.dueDate, 'yyyy-MM-dd'),
        recurring: bill.recurring || false
      });
    } else {
      setFormData({ 
        title: '', 
        amount: '', 
        dueDate: '',
        recurring: false 
      });
    }
  }, [bill, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.dueDate) return;
    
    onSubmit({
      title: formData.title,
      amount: parseFloat(formData.amount),
      dueDate: new Date(formData.dueDate + 'T12:00:00'),
      recurring: formData.recurring
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
          
          <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
            <div className="flex items-center gap-3">
              <Repeat className="text-indigo-600" size={20} />
              <div>
                <Label htmlFor="recurring" className="font-bold text-indigo-900">Boleto Mensal</Label>
                <p className="text-[10px] text-indigo-600">Repetir automaticamente todo mês</p>
              </div>
            </div>
            <Switch 
              id="recurring" 
              checked={formData.recurring}
              onCheckedChange={(checked) => setFormData({...formData, recurring: checked})}
            />
          </div>

          <Button type="submit" className="w-full bg-indigo-600 h-12 text-lg rounded-2xl">
            {bill ? 'Salvar Alterações' : 'Salvar Boleto'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BillDialog;