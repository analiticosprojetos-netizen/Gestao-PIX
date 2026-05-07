"use client";

import React, { useState, useRef } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, X, DollarSign, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any, file?: File) => void;
}

const TransferDialog = ({ open, onOpenChange, onSubmit }: TransferDialogProps) => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    description: '',
    amount: '', // Valor formatado para exibição
    rawAmount: 0, // Valor numérico real
    date: new Date().toISOString().split('T')[0],
    friend_name: '',
    type: 'in' as 'in' | 'out',
    status: 'completed' as 'pending' | 'completed'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!formData.description || formData.rawAmount <= 0 || !formData.friend_name) return;

    onSubmit({
      ...formData,
      amount: formData.rawAmount,
      date: new Date(formData.date + 'T12:00:00')
    }, selectedFile || undefined);
    
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      rawAmount: 0,
      date: new Date().toISOString().split('T')[0],
      friend_name: '',
      type: 'in',
      status: 'completed'
    });
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <Drawer open={open} onOpenChange={(o) => { onOpenChange(o); if(!o) resetForm(); }}>
      <DrawerContent className="dark:bg-slate-900 border-none rounded-t-[32px] max-w-lg mx-auto">
        <div className="mx-auto w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full my-4" />
        
        <DrawerHeader className="text-left px-6 relative">
          <DrawerTitle className="text-2xl font-bold">Nova Movimentação</DrawerTitle>
          <DrawerDescription>Registre entradas ou saídas de PIX</DrawerDescription>
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute right-6 top-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 pb-10 overflow-y-auto max-h-[85vh]">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'in'})}
              className={cn(
                "h-14 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border-2",
                formData.type === 'in' 
                  ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/30" 
                  : "bg-slate-50 border-transparent text-slate-500 dark:bg-slate-800"
              )}
            >
              <DollarSign size={20} /> Recebi
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'out'})}
              className={cn(
                "h-14 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border-2",
                formData.type === 'out' 
                  ? "bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/30" 
                  : "bg-slate-50 border-transparent text-slate-500 dark:bg-slate-800"
              )}
            >
              <DollarSign size={20} /> Enviei
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Label className="text-xs font-bold text-slate-400 uppercase ml-1">Valor</Label>
              <div className="relative mt-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                <Input 
                  type="text" 
                  inputMode="numeric"
                  placeholder="0,00"
                  className="h-14 pl-12 text-xl font-bold rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-indigo-500"
                  value={formData.amount}
                  onChange={handleAmountChange}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-400 uppercase ml-1">Pessoa / Contato</Label>
              <Select value={formData.friend_name} onValueChange={(v) => setFormData({...formData, friend_name: v})}>
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
                placeholder="Ex: Repasse Transportadora" 
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-400 uppercase ml-1">Data</Label>
                <Input 
                  type="date"
                  className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-400 uppercase ml-1">Status</Label>
                <Select value={formData.status} onValueChange={(v: any) => setFormData({...formData, status: v})}>
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-400 uppercase ml-1">Comprovante</Label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                  selectedFile ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" : "border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                )}
              >
                {selectedFile ? (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <FileText size={20} />
                    <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                    <X size={16} onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="ml-2" />
                  </div>
                ) : (
                  <>
                    <Camera className="text-slate-400" size={24} />
                    <span className="text-xs text-slate-500 font-medium">Anexar foto ou PDF</span>
                  </>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
            </div>
          </div>

          <Button type="submit" className="w-full bg-indigo-600 h-14 text-lg font-bold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none">
            Salvar Registro
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default TransferDialog;