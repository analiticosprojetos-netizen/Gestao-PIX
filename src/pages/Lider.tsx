"use client";

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Server, CreditCard, CheckCircle2, Clock, Plus, Trash2 } from 'lucide-react';
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

  const ExpenseItem = ({ item }: { item: any }) => (
    <Card className="border-none shadow-sm mb-3 dark:bg-slate-900">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-xl",
            item.type === 'domain' ? "bg-blue-100 text-blue-600" : 
            item.type === 'migration' ? "bg-orange-100 text-orange-600" : "bg-indigo-100 text-indigo-600"
          )}>
            {item.type === 'domain' ? <Globe size={20} /> : <Server size={20} />}
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100 leading-tight">{item.description}</p>
            <p className="text-[10px] text-slate-500">
              Vence em {format(item.due_date, "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(item.amount)}</p>
            <button 
              onClick={() => updateExpense(item.id, { status: item.status === 'paid' ? 'pending' : 'paid' })}
              className={cn(
                "text-[9px] font-bold px-2 py-0.5 rounded-full mt-1",
                item.status === 'paid' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
              )}
            >
              {item.status === 'paid' ? 'Pago' : 'Pendente'}
            </button>
          </div>
          <button onClick={() => { if(confirm("Remover?")) deleteExpense(item.id) }} className="text-slate-300 hover:text-rose-500">
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
                    <p className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(pay.amount)}</p>
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