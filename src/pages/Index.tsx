"use client";

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, Plus, ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BillDialog from '@/components/bills/BillDialog';
import AddActionMenu from '@/components/bills/AddActionMenu';
import { useBills } from '@/context/BillContext';
import { useTransfers } from '@/context/TransferContext';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";

const Index = () => {
  const { bills, addBill } = useBills();
  const { transfers } = useTransfers();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const upcomingBills = bills
    .filter(b => !b.paid)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const totalPendingBills = upcomingBills.reduce((acc, b) => acc + b.amount, 0);

  // Cálculos de PIX
  const totalIn = transfers.filter(t => t.type === 'in').reduce((acc, t) => acc + t.amount, 0);
  const totalOut = transfers.filter(t => t.type === 'out').reduce((acc, t) => acc + t.amount, 0);
  const pixBalance = totalIn - totalOut;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Card de Saldo PIX */}
        <section className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Saldo PIX (Entradas - Saídas)</p>
              <h2 className="text-3xl font-bold mt-1">
                R$ {pixBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <Wallet className="text-indigo-200/50" size={32} />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                <ArrowDownLeft size={16} className="text-emerald-300" />
              </div>
              <div>
                <p className="text-[10px] text-indigo-100 uppercase">Entradas</p>
                <p className="text-sm font-bold">R$ {totalIn.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-500/20 rounded-lg">
                <ArrowUpRight size={16} className="text-rose-300" />
              </div>
              <div>
                <p className="text-[10px] text-indigo-100 uppercase">Saídas</p>
                <p className="text-sm font-bold">R$ {totalOut.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Resumo de Boletos */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-2 dark:text-slate-100">
              <Calendar className="text-indigo-600 dark:text-indigo-400" size={20} />
              Boletos Pendentes
            </h3>
            <Badge variant="outline" className="border-rose-200 text-rose-600 bg-rose-50 dark:bg-rose-950/30">
              R$ {totalPendingBills.toFixed(2)}
            </Badge>
          </div>
          
          <div className="space-y-3">
            {upcomingBills.slice(0, 3).map((bill) => {
              const daysLeft = differenceInDays(bill.dueDate, new Date());
              let statusColor = "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400";
              if (daysLeft <= 3) statusColor = "text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400";

              return (
                <Card key={bill.id} className="border-none shadow-sm dark:bg-slate-900">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-xl", statusColor)}>
                        <AlertCircle size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{bill.title}</p>
                        <p className="text-[10px] text-slate-500">Vence em {format(bill.dueDate, "dd/MM")}</p>
                      </div>
                    </div>
                    <p className="font-bold text-indigo-600 dark:text-indigo-400">R$ {bill.amount.toFixed(2)}</p>
                  </CardContent>
                </Card>
              );
            })}
            {upcomingBills.length === 0 && (
              <p className="text-center text-slate-400 py-6 italic text-sm">Tudo em dia!</p>
            )}
          </div>
        </section>
      </div>

      <AddActionMenu 
        open={menuOpen} 
        onOpenChange={setMenuOpen}
        onVoiceAction={() => {}} // Voz pode ser implementada depois para PIX
        onManualAction={() => setDialogOpen(true)}
      />

      <Button 
        onClick={() => setMenuOpen(true)}
        className="fixed bottom-20 right-6 h-16 w-16 rounded-full shadow-2xl bg-indigo-600 hover:bg-indigo-700 z-50"
      >
        <Plus size={32} />
      </Button>

      <BillDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onSubmit={(data) => addBill({ ...data, category: 'Geral' })} 
      />
    </AppShell>
  );
};

export default Index;