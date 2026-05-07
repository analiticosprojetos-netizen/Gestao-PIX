"use client";

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, ArrowDownLeft, Search, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { useTransfers } from '@/context/TransferContext';
import TransferDialog from '@/components/transfers/TransferDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Transfers = () => {
  const { transfers, deleteTransfer, addTransfer, updateTransfer } = useTransfers();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredTransfers = transfers.filter(t => 
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.friend_name.toLowerCase().includes(search.toLowerCase())
  );

  const TransferItem = ({ transfer }: { transfer: any }) => (
    <Card className="border-none shadow-sm mb-3 dark:bg-slate-900">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-full",
            transfer.type === 'in' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
          )}>
            {transfer.type === 'in' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">{transfer.description}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {transfer.friend_name} • {format(transfer.date, "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={cn(
              "font-bold font-mono",
              transfer.type === 'in' ? "text-emerald-600" : "text-rose-600"
            )}>
              {transfer.type === 'in' ? '+' : '-'} R$ {transfer.amount.toFixed(2)}
            </p>
            <div className="flex items-center justify-end gap-1">
              {transfer.status === 'completed' ? 
                <span className="text-[10px] text-emerald-500 flex items-center gap-1"><CheckCircle2 size={10} /> Pago</span> :
                <span className="text-[10px] text-amber-500 flex items-center gap-1"><Clock size={10} /> Pendente</span>
              }
            </div>
          </div>
          <button 
            onClick={() => deleteTransfer(transfer.id)}
            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
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
              placeholder="Buscar PIX..." 
              className="pl-10 bg-white dark:bg-slate-900 border-none shadow-sm" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setDialogOpen(true)} className="bg-indigo-600 rounded-xl h-10 w-10 p-0">
            <Plus size={20} />
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="out">Saídas</TabsTrigger>
            <TabsTrigger value="in">Entradas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            {filteredTransfers.map(t => <TransferItem key={t.id} transfer={t} />)}
          </TabsContent>
          <TabsContent value="out" className="mt-4">
            {filteredTransfers.filter(t => t.type === 'out').map(t => <TransferItem key={t.id} transfer={t} />)}
          </TabsContent>
          <TabsContent value="in" className="mt-4">
            {filteredTransfers.filter(t => t.type === 'in').map(t => <TransferItem key={t.id} transfer={t} />)}
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