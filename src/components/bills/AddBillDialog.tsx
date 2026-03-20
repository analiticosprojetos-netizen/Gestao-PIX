"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from 'lucide-react';
import { showSuccess } from "@/utils/toast";

interface AddBillDialogProps {
  onAdd: (bill: { title: string; amount: number; dueDate: string }) => void;
}

const AddBillDialog = ({ onAdd }: AddBillDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', amount: '', dueDate: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.dueDate) return;
    
    onAdd({
      title: formData.title,
      amount: parseFloat(formData.amount),
      dueDate: formData.dueDate
    });
    
    setFormData({ title: '', amount: '', dueDate: '' });
    setOpen(false);
    showSuccess("Boleto cadastrado com sucesso!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700">
          <Plus size={28} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-t-3xl sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>Novo Boleto</DialogTitle>
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
          <Button type="submit" className="w-full bg-indigo-600">Salvar Boleto</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBillDialog;