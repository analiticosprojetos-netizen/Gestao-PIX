"use client";

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, ArrowDownLeft, Search, Trash2, CheckCircle2, Clock, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { useTransfers } from '@/context/TransferContext';
import TransferDialog from '@/components/transfers/TransferDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Transfers = () => {
  const { transfers, deleteTransfer, addTransfer } = useTransfers();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredTransfers = transfers.filter(t => 
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.friend_name.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const TransferItem = ({ transfer }: { transfer: any }) => (
    <Card className="border-none shadow-sm mb-3 dark:bg-slate-900 overflow-hidden">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-full",
            transfer.type === 'in' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
          )}>
            {transfer.type === 'in' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100 leading-tight">{transfer.description}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {transfer.friend_name} • {format(transfer.date, "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={cn(
              "font-bold font-mono",
              transfer.type === 'in' ? "text-emerald-600" : "text-rose-600"
            )}>
              {transfer.type === 'in' ? '+' : '-'} R$ {formatCurrency(transfer.amount)}
            </p>
            <div className="flex items-center justify-end gap-1">
              {transfer.status === 'completed' ? 
                <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-bold"><CheckCircle2 size={10} /> Pago</span> :
                <span className="text-[10px] text-amber-500 flex items-center gap-1 font-bold"><Clock size={10} /> Pendente</span>
              }
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            {transfer.receipt_url && (
              <a 
                href={transfer.receipt_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors"
                title="Ver Comprovante"
              >
                <FileText size={18} />
              </a>
            )}
            <button 
              onClick={() => {
                if(confirm("Deseja remover este registro?")) deleteTransfer(transfer.id);
              }}
              className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Buscar por nome ou descrição..." 
              className="pl-10 bg-white dark:bg-slate-900 border-none shadow-sm rounded-xl h-12" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setDialogOpen(true)} className="bg-indigo-600 rounded-xl h-12 w-12 p-0 shadow-lg shadow-indigo-200 dark:shadow-none">
            <Plus size={24} />
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl h-12">
            <TabsTrigger value="all" className="rounded-lg">Todos</TabsTrigger>
            <TabsTrigger value="in" className="rounded-lg">Entradas</TabsTrigger>
            <TabsTrigger value="out" className="rounded-lg">Saídas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            {filteredTransfers.map(t => <TransferItem key={t.id} transfer={t} />)}
            {filteredTransfers.length === 0 && (
              <div className="text-center py-12 text-slate-400 italic">Nenhum registro encontrado</div>
            )}
          </TabsContent>
          <TabsContent value="in" className="mt-4">
            {filteredTransfers.filter(t => t.type === 'in').map(t => <TransferItem key={t.id} transfer={t} />)}
          </TabsContent>
          <TabsContent value="out" className="mt-4">
            {filteredTransfers.filter(t => t.type === 'out').map(t => <TransferItem key={t.id} transfer={t} />)}
          </TabsContent>
        </Tabs>
      </div>

      <TransferDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onSubmit={addTransfer} 
      />
    </AppShell>
  );
};

export default Transfers;