"use client";

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, CheckCircle2, Circle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { useCards } from '@/context/CardContext';
import CardTransactionDialog from '@/components/cards/CardTransactionDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Cards = () => {
  const { transactions, installments, toggleInstallmentPaid, addTransaction } = useCards();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredInstallments = installments.filter(inst => {
    const tx = transactions.find(t => t.id === inst.transaction_id);
    if (!tx) return false;
    return tx.description.toLowerCase().includes(search.toLowerCase()) || 
           tx.recipient_name.toLowerCase().includes(search.toLowerCase());
  });

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const InstallmentItem = ({ inst }: { inst: any }) => {
    const tx = transactions.find(t => t.id === inst.transaction_id);
    if (!tx) return null;

    return (
      <Card className="border-none shadow-sm mb-3 dark:bg-slate-900">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => toggleInstallmentPaid(inst.id)}>
              {inst.status === 'paid' ? 
                <CheckCircle2 className="text-emerald-500" size={24} /> : 
                <Circle className="text-slate-300 dark:text-slate-600" size={24} />
              }
            </button>
            <div>
              <p className={cn("font-bold leading-tight", 
                inst.status === 'paid' ? "text-slate-400 line-through" : "text-slate-800 dark:text-slate-100"
              )}>
                {tx.description} ({inst.number}/{tx.installments_count})
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {tx.recipient_name} • Vence {format(new Date(inst.due_date), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-700 dark:text-slate-300 font-mono">R$ {formatCurrency(inst.amount)}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Buscar compra ou pessoa..." 
              className="pl-10 bg-white dark:bg-slate-900 border-none shadow-sm rounded-xl h-12" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setDialogOpen(true)} className="bg-indigo-600 rounded-xl h-12 w-12 p-0">
            <Plus size={24} />
          </Button>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl h-12">
            <TabsTrigger value="pending" className="rounded-lg">Pendentes</TabsTrigger>
            <TabsTrigger value="paid" className="rounded-lg">Pagas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-4">
            {filteredInstallments.filter(i => i.status === 'pending').map(inst => (
              <InstallmentItem key={inst.id} inst={inst} />
            ))}
            {filteredInstallments.filter(i => i.status === 'pending').length === 0 && (
              <div className="text-center py-12 text-slate-400 italic">Nenhuma parcela pendente</div>
            )}
          </TabsContent>
          
          <TabsContent value="paid" className="mt-4">
            {filteredInstallments.filter(i => i.status === 'paid').map(inst => (
              <InstallmentItem key={inst.id} inst={inst} />
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <CardTransactionDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onSubmit={addTransaction} 
      />
    </AppShell>
  );
};

export default Cards;