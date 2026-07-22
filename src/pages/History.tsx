"use client";

import React, { useState, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransfers } from '@/context/TransferContext';
import { useCards } from '@/context/CardContext';
import { useBills } from '@/context/BillContext';
import { 
  Search, ArrowUpRight, ArrowDownLeft, CreditCard, Receipt, 
  CheckCircle2, Clock, Filter, History as HistoryIcon 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";

const History = () => {
  const { transfers } = useTransfers();
  const { installments, transactions } = useCards();
  const { bills } = useBills();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'pix' | 'card' | 'bill'>('all');

  // Unifica todos os registros em uma única timeline
  const allHistoryItems = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      subtitle: string;
      date: Date;
      amount: number;
      isNegative: boolean;
      status: 'completed' | 'pending';
      category: 'pix' | 'card' | 'bill';
      icon: React.ReactNode;
    }> = [];

    // 1. PIX
    transfers.forEach(t => {
      items.push({
        id: `pix-${t.id}`,
        title: t.description,
        subtitle: `${t.friend_name} • PIX ${t.type === 'in' ? 'Recebido' : 'Enviado'}`,
        date: t.date,
        amount: t.amount,
        isNegative: t.type === 'out',
        status: t.status,
        category: 'pix',
        icon: t.type === 'in' ? <ArrowDownLeft className="text-emerald-500" size={18} /> : <ArrowUpRight className="text-rose-500" size={18} />
      });
    });

    // 2. Cartão de Crédito
    installments.forEach(inst => {
      const tx = transactions.find(t => t.id === inst.transaction_id);
      if (!tx) return;

      const date = parseISO(inst.due_date);

      items.push({
        id: `card-${inst.id}`,
        title: `${tx.description} (${inst.number}/${tx.installments_count})`,
        subtitle: `${tx.recipient_name} • Cartão de Crédito`,
        date: date,
        amount: inst.amount,
        isNegative: true,
        status: inst.status === 'paid' ? 'completed' : 'pending',
        category: 'card',
        icon: <CreditCard className="text-indigo-500" size={18} />
      });
    });

    // 3. Boletos
    bills.forEach(b => {
      items.push({
        id: `bill-${b.id}`,
        title: b.title,
        subtitle: `${b.category || 'Geral'} • Boleto`,
        date: b.dueDate,
        amount: b.amount,
        isNegative: true,
        status: b.paid ? 'completed' : 'pending',
        category: 'bill',
        icon: <Receipt className="text-amber-500" size={18} />
      });
    });

    // Ordena da data mais recente para a mais antiga
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [transfers, installments, transactions, bills]);

  // Aplica filtros de pesquisa, status e categoria
  const filteredItems = useMemo(() => {
    return allHistoryItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                            item.subtitle.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [allHistoryItems, search, statusFilter, categoryFilter]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <header className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 rounded-2xl">
            <HistoryIcon size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold dark:text-white">Extrato & Histórico Geral</h2>
            <p className="text-xs text-slate-500">Todas as transações, boletos e cartões</p>
          </div>
        </header>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Buscar por descrição ou nome..." 
            className="pl-10 bg-white dark:bg-slate-900 border-none shadow-sm rounded-xl h-12" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filtros de Categoria */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setCategoryFilter('all')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              categoryFilter === 'all' ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
            )}
          >
            Todos ({allHistoryItems.length})
          </button>
          <button
            onClick={() => setCategoryFilter('pix')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              categoryFilter === 'pix' ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
            )}
          >
            PIX
          </button>
          <button
            onClick={() => setCategoryFilter('card')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              categoryFilter === 'card' ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
            )}
          >
            Cartão
          </button>
          <button
            onClick={() => setCategoryFilter('bill')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              categoryFilter === 'bill' ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
            )}
          >
            Boletos
          </button>
        </div>

        {/* Tabs de Status: Todos / Pendentes / Concluídos */}
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl h-12">
            <TabsTrigger value="all" className="rounded-lg">Todos</TabsTrigger>
            <TabsTrigger value="pending" className="rounded-lg">Pendentes</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg">Concluídos</TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-4 space-y-3">
            {filteredItems.map(item => (
              <Card key={item.id} className="border-none shadow-sm dark:bg-slate-900">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100 leading-tight">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.subtitle} • {format(item.date, "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={cn(
                      "font-bold font-mono text-sm",
                      item.isNegative ? "text-slate-800 dark:text-slate-200" : "text-emerald-600"
                    )}>
                      {item.isNegative ? '-' : '+'} R$ {formatCurrency(item.amount)}
                    </p>
                    
                    <div className="mt-1 flex justify-end">
                      {item.status === 'completed' ? (
                        <span className="text-[9px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <CheckCircle2 size={10} /> Concluído
                        </span>
                      ) : (
                        <span className="text-[9px] text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Clock size={10} /> Pendente
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-slate-400 italic bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                Nenhuma movimentação encontrada
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
};

export default History;