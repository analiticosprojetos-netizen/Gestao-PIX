"use client";

import React, { useState } from 'react';
import<dyad-write path="src/components/lider/LiderDialog.tsx" description="Diálogo para cadastrar custos fixos ou mensalidades da Lider">
"use client";

import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from '@/lib/utils';

interface LiderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'expense' | 'payment';
  onSubmit: (data: any) => void;
}

const LiderDialog = ({ open, onOpenChange, type, onSubmit }: LiderDialogProps) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    rawAmount: 0,
    due_date: new Date(),
    expense_type: 'system' as any,
    month_year: format(new Date(), "MMMM/yyyy", { locale: ptBR })
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const numericValue = value ? parseInt(value) / 100 : 0;
    const formatted = numericValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    setFormData({ ...formData, amount: formatted, rawAmount: numericValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'expense') {
      onSubmit({
        description: formData.description,
        amount: formData.rawAmount,
        due_date: formData.due_date,
        type: formData.expense_type,
        status: 'pending'
      });
    } else {
      onSubmit({
        month_year: formData.month_year,
        amount: formData.rawAmount,
        due_date: formData.due_date,
        status: 'pending'
      });
    }
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      rawAmount: 0,
      due_date: new Date(),
      expense_type: 'system',
      month_year: format(new Date(), "MMMM/yyyy", { locale: ptBR })
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="dark:bg-slate-900 border-none rounded-t-[32px] max-w-lg mx-auto">
        <div className="mx-auto w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full my-4" />
        <DrawerHeader className="px-6 relative">
          <DrawerTitle className="text-2xl font-bold">
            {type === 'expense' ? 'Novo Custo Fixo' : 'Nova Mensalidade'}
          </DrawerTitle>
          <DrawerDescription>Preencha os dados abaixo</DrawerDescription>
          <button onClick={() => onOpenChange(false)} className="absolute right-6 top-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><X size={20} /></button>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 pb-10">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-400 uppercase">
              {type === 'expense' ? 'Descrição' : 'Mês/Ano'}
            </Label>
            <Input 
              placeholder={type === 'expense' ? "Ex: Domínio .com.br" : "Ex: Janeiro/2024"}
              value={type === 'expense' ? formData.description : formData.month_year}
              onChange={(e) => setFormData({ ...formData, [type === 'expense' ? 'description' : 'month_year']: e.target.value })}
              className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-400 uppercase">Valor</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
              <Input 
                type="text" 
                inputMode="numeric"
                placeholder="0,00"
                className="h-12 pl-12 text-lg font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border-none"
                value={formData.amount}
                onChange={handleAmountChange}
              />
            </div>
          </div>

          {type === 'expense' && (
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-400 uppercase">Tipo</Label>
              <Select value={formData.expense_type} onValueChange={(v) => setFormData({ ...formData, expense_type: v })}>
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="domain">Domínio</SelectItem>
                  <SelectItem value="migration">Migração</SelectItem>
                  <SelectItem value="website">Site</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-400 uppercase">Vencimento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-12 justify-start text-left font-normal rounded-xl bg-slate-50 dark:bg-slate-800 border-none">
                  <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                  {format(formData.due_date, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={formData.due_date} onSelect={(d) => d && setFormData({ ...formData, due_date: d })} locale={ptBR} />
              </PopoverContent>
            </Popover>
          </div>

          <Button type="submit" className="w-full bg-indigo-600 h-14 text-lg font-bold rounded-2xl mt-4">
            Salvar
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default LiderDialog;