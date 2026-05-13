"use client";

import React, { useState, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Server, CreditCard, CheckCircle2, Clock, Plus, Trash2, AlertCircle, Layout, Cpu } from 'lucide-react';
import { useLider } from '@/context/LiderContext';
import LiderCalculator from '@/components/lider/LiderCalculator';
import LiderDialog from '@/components/lider/LiderDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Lider = () => {
  const { expenses, payments, updateExpense, updatePayment, deleteExpense, addExpense, addPayment } = useLider();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'expenses' | 'system'>('expenses');

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Cálculos de Resumo
  const summary = useMemo(() => {
    const allItems = [...expenses.map(e => ({ ...e, isExpense: true })), ...payments.map(p => ({ ...p, isExpense: false }))];
    const pending = allItems.filter(i => i.status === 'pending').reduce((acc, i) => acc + i.amount, 0);
    const paid = allItems.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0);
    return { pending, paid };
  }, [expenses, payments]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'domain': return <Globe size={20} />;
      case 'migration': return <Server size={20} />;
      case 'website': return <Layout size={20} />;
      case 'system': return <Cpu size={20} />;
      default: return <AlertCircle size={20} />;
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'domain': return "bg-blue-100 text-blue-600";
      case 'migration': return "bg-orange-100 text-orange-600";
      case 'website': return "bg-purple-100 text-purple-600";
      case 'system': return "bg-indigo-100 text-indigo-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const ExpenseItem = ({ item }: { item: any }) => (
    <Card className="border-none shadow-sm mb-3 dark:bg-slate-900 overflow-hidden">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-xl", getCategoryColor(item.type))}>
            {getIcon(item.type)}
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100 leading-tight">{item.description}</p>
            <p className="text-[10px] text-slate-500">
              Vencimento: {format(item.due_date, "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={cn("font-bold", item.status === 'paid' ? "text-slate-400" : "text-slate-700 dark:text-slate-300")}>
              {formatCurrency(item.amount)}
            </p>
            <button 
              onClick={() => updateExpense(item.id, { status: item.status === 'paid' ? 'pending' : 'paid' })}
              className={cn(
                "text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 transition-colors",
                item.status === 'paid' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-700"
              )}
            >
              {item.status === 'paid' ? 'Pago' : 'Em Aberto'}
            </button>
          </div>
          <button onClick={() => { if(confirm("Remover este registro?")) deleteExpense(item.id) }} className="text-slate-300 hover:text-rose-500 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Server size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold dark:text-white">Lider Refrigeração</h2>
              <p className="text-xs text-slate-500">Gestão de Site e Sistemas</p>
            </div>
          </div>
          <Button 
            onClick={() => setDialogOpen(true)} 
            className="bg-indigo-600 rounded-xl h-12 w-12 p-0 shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Plus size={24} />
          </Button>
        </header>

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-none bg-emerald-50 dark:bg-emerald-950/20">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold text-emerald-600 uppercase">Total Pago</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(summary.paid)}</p>
            </CardContent>
          </Card>
          <Card className="border-none bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold text-amber-600 uppercase">Em Aberto</p>
              <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{formatCurrency(summary.pending)}</p>
            </CardContent>
          </Card>
        </div>

        <LiderCalculator />

        <Tabs defaultValue="expenses" onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl h-12">
            <TabsTrigger value="expenses" className="rounded-lg">Custos Fixos</TabsTrigger>
            <TabsTrigger value="system" className="rounded-lg">Mensalidades</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="mt-4 space-y-3">
            {expenses.map(exp => <ExpenseItem key={exp.id} item={exp} />)}
            {expenses.length === 0 && <p className="text-center py-8 text-slate-400 italic text-sm">Nenhum custo fixo registrado</p>}
          </TabsContent>

          <TabsContent value="system" className="mt-4 space-y-3">
            {payments.map(pay => (
              <Card key={pay.id} className="border-none shadow-sm dark:bg-slate-900">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl", pay.status === 'paid' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400")}>
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{pay.month_year}</p>
                      <p className="text-[10px] text-slate-500">Vencimento: {format(pay.due_date, "dd/MM/yyyy")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={cn("font-bold", pay.status === 'paid' ? "text-slate-400" : "text-slate-700 dark:text-slate-300")}>
                        {formatCurrency(pay.amount)}
                      </p>
                      <button 
                        onClick={() => updatePayment(pay.id, { status: pay.status === 'paid' ? 'pending' : 'paid' })}
                        className={cn(
                          "text-[9px] font-bold px-2 py-0.5 rounded-full mt-1",
                          pay.status === 'paid' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-700"
                        )}
                      >
                        {pay.status === 'paid' ? 'Pago' : 'Em Aberto'}
                      </button>
                    </div>
                    <button onClick={() => updatePayment(pay.id, { status: pay.status === 'paid' ? 'pending' : 'paid' })}>
                      {pay.status === 'paid' ? <CheckCircle2 className="text-emerald-500" size={24} /> : <Clock className="text-slate-300" size={24} />}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {payments.length === 0 && <p className="text-center py-8 text-slate-400 italic text-sm">Nenhuma mensalidade registrada</p>}
          </TabsContent>
        </Tabs>
      </div>

      <LiderDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        type={activeTab === 'expenses' ? 'expense' : 'payment'}
        onSubmit={activeTab === 'expenses' ? addExpense : addPayment}
      />
    </AppShell>
  );
};

export default Lider;