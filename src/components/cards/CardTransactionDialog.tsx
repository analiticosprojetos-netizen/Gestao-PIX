"use client";

import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from '@/context/SettingsContext';

interface CardTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

const CardTransactionDialog = ({ open, onOpenChange, onSubmit }: CardTransactionDialogProps) => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    description: '',
    amount: '', // Formatado
    rawAmount: 0, // Numérico
    installments_count: '1',
    recipient_name: '',
    purchase_date: new Date().toISOString().split('T')[0],
    closing_day: '17'
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const numericValue = value ? parseInt(value) / 100 : 0;
    
    const formatted = numericValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    setFormData({
      ...formData,
      amount: formatted,
      rawAmount: numericValue
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || formData.rawAmount <= 0 || !formData.recipient_name) return;

    onSubmit({
      description: formData.description,
      total_amount: formData.rawAmount,
      installments_count: parseInt(formData.installments_count),
      recipient_name: formData.recipient_name,
      purchase_date: formData.purchase_date,
      closing_day: parseInt(formData.closing_day)
    });
    
    onOpenChange(false);
    setFormData({
      description: '',
      amount: '',
      rawAmount: 0,
      installments_count: '1',
      recipient_name: '',
      purchase_date: new Date().toISOString().split('T')[0],
      closing_day: '17'
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="dark:bg-slate-900 border-none rounded-t-[32px]">
        <div className="mx-auto w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full my-4" />
        
        <DrawerHeader className="text-left px-6">
          <DrawerTitle className="text-2xl font-bold">Nova Compra no Cartão</DrawerTitle>
          <DrawerDescription>Registre compras parceladas</DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 pb-10 overflow-y-auto max-h-[80vh]">
          <div className="space-y-4">
            <div className="relative">
              <Label className="text-xs font-bold text-slate-400 uppercase ml-1">Valor Total</Label>
              <div className="relative mt-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                <Input 
                  type="text" 
                  inputMode="numeric"
                  placeholder="0,00"
                  className="h-14 pl-12 text-xl font-bold rounded-2xl bg-slate-50 dark:bg-slate-800 border-none"
                  value={formData.amount}
                  onChange={handleAmountChange}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-400 uppercase ml-1">Quem usou? (Pessoa)</Label>
              <Select value={formData.recipient_name} onValueChange={(v) => setFormData({...formData, recipient_name: v})}>
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none">
                  <SelectValue placeholder="Selecione uma pessoa" />
                </SelectTrigger>
                <SelectContent>
                  {settings.contacts.map(contact => (
                    <SelectItem key={contact} value={contact}>{contact}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-400 uppercase ml-1">Descrição</Label>
              <Input 
                placeholder="Ex: Notebook, Celular..." 
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-400 uppercase ml-1">Parcelas</Label>
                <Input 
                  type="number"
                  min="1"
                  className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none"
                  value={formData.installments_count}
                  onChange={(e) => setFormData({...formData, installments_count: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-400 uppercase ml-1">Data da Compra</Label>
                <Input 
                  type="date"
                  className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full bg-indigo-600 h-14 text-lg font-bold rounded-2xl shadow-lg">
            Salvar Compra
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default CardTransactionDialog;