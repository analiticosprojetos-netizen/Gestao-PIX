"use client";

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, CheckCircle2, Circle, Trash2, Plus, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { useCards } from '@/context/CardContext';
import CardTransactionDialog from '@/components/cards/CardTransactionDialog';
import { Button } from '@/components/ui/button';
import { CardTransaction } from '@/types/transfer';

const Cards = () => {
  const { transactions, installments, toggleInstallmentPaid, addTransaction, updateTransaction, deleteTransaction } = useCards();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<CardTransaction | null>(null);

  const filteredInstallments = installments
    .filter(inst => {
      const tx = transactions.find(t => t.id === inst.transaction_id);
      if (!tx) return false;
      return tx.description.toLowerCase().includes(search.toLowerCase()) || 
             tx.recipient_name.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => {
      const txA = transactions.find(t => t.id === a.transaction_id);
      const txB = transactions.find(t => t.id === b.transaction_id);
      if (!txA || !txB) return 0;
      
      // Ordena pela data da compra (mais antiga para mais nova)
      const dateA = new Date(txA.purchase_date).getTime();
      const dateB = new Date(txB.purchase_date).getTime();
      
      if (dateA !== dateB) return dateA - dateB;
      
      // Se for a mesma data de compra, ordena pelo número da parcela
      return a.number - b.number;
    });

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleEdit = (tx: CardTransaction) => {
    setEditingTransaction(tx);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingTransaction(null);
    setDialogOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, data);
    } else {
      addTransaction(data);
    }
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
                {tx.recipient_name} • Compra: {format(new Date(tx.purchase_date), "dd/MM/yyyy", { locale: ptBR })}
              </p>
              <p className="text-[9px] text-indigo-500 font-medium">
                Vencimento: {format(new Date(inst.due_date), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-1">
              <p className="font-bold text-slate-700 dark:text-slate-300 font-mono">R$ {formatCurrency(inst.amount)}</p>
            </div>
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => handleEdit(tx)}
                className="p-2 text-slate-300 hover:text-indigo-500 transition-colors"
                title="Editar compra"
              >
                <Pencil size={16} />
              </button>
              <button 
                onClick={() => {
                  if(confirm("Deseja excluir toda esta compra (todas as parcelas)?")) {
                    deleteTransaction(tx.id);
                  }
                }}
                className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                title="Excluir compra"
              >
                <Trash2 size={16} />
              </button>
            </div>
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
          <Button onClick={handleAdd} className="bg-indigo-600 rounded-xl h-12 w-12 p-0">
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
        onSubmit={handleSubmit} 
        initialData={editingTransaction}
      />
    </AppShell>
  );
};

export default Cards;