"use client";

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Upload, X } from 'lucide-react';

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any, file?: File) => void;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.friend_name) return;

    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date + 'T12:00:00')
    }, selectedFile || undefined);
    
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      friend_name: '',
      type: 'out',
      status: 'pending'
    });
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if(!o) resetForm(); }}>
      <DialogContent className="sm:max-w-[425px] rounded-t-3xl sm:rounded-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Movimentação PIX</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={formData.type} onValueChange={(v: any) => setFormData({...formData, type: v})}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Recebi (Entrada)</SelectItem>
                  <SelectItem value="out">Enviei (Saída)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v: any) => setFormData({...formData, status: v})}>
                <SelectTrigger className="rounded-xl">
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
            <Label>Descrição (Ex: Repasse Lucio, Aluguel...)</Label>
            <Input 
              className="rounded-xl"
              placeholder="O que é isso?" 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Pessoa / Contato (Ex: Lucio, Transportadora)</Label>
            <Input 
              className="rounded-xl"
              placeholder="Nome da pessoa" 
              value={formData.friend_name}
              onChange={(e) => setFormData({...formData, friend_name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input 
                className="rounded-xl"
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
                className="rounded-xl"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Comprovante</Label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors",
                selectedFile ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" : "border-slate-200 dark:border-slate-800 hover:border-indigo-400"
              )}
            >
              {selectedFile ? (
                <div className="flex items-center gap-2 text-emerald-600 font-medium">
                  <Upload size={20} />
                  <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    className="p-1 hover:bg-emerald-100 rounded-full"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Camera className="text-slate-400" size={24} />
                  <span className="text-xs text-slate-500">Clique para subir foto ou PDF</span>
                </>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />
          </div>

          <Button type="submit" className="w-full bg-indigo-600 h-12 text-lg rounded-2xl mt-4 shadow-lg shadow-indigo-200 dark:shadow-none">
            Salvar Movimentação
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

import { cn } from '@/lib/utils';
export default TransferDialog;