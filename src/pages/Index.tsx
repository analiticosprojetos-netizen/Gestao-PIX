"use client";

import React, { useState, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, ArrowUpRight, ArrowDownLeft, Users, Plus, CreditCard, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TransferDialog from '@/components/transfers/TransferDialog';
import PersonHistoryDrawer from '@/components/people/PersonHistoryDrawer';
import { useTransfers } from '@/context/TransferContext';
import { useCards } from '@/context/CardContext';
import { useSettings } from '@/context/SettingsContext';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate, Link } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const { transfers, addTransfer } = useTransfers();
  const { installments, transactions } = useCards();
  const { settings } = useSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  // 1. Cálculos PIX (Dinheiro em conta - APENAS CONCLUÍDOS)
  const pixBalance = useMemo(() => {
    const completedTransfers = transfers.filter(t => t.status === 'completed');
    const totalIn = completedTransfers.filter(t => t.type === 'in').reduce((acc, t) => acc + t.amount, 0);
    const totalOut = completedTransfers.filter(t => t.type === 'out').reduce((acc, t) => acc + t.amount, 0);
    
    // Subtrai também o que já foi pago no cartão (pois saiu do caixa)
    const totalPaidCards = installments
      .filter(i => i.status === 'paid')
      .reduce((acc, i) => acc + i.amount, 0);

    return { 
      totalIn, 
      totalOut: totalOut + totalPaidCards, 
      balance: totalIn - totalOut - totalPaidCards 
    };
  }, [transfers, installments]);

  // 2. Cálculo da Fatura Ativa
  const activeInvoice = useMemo(() => {
    if (installments.length === 0) return { total: 0, pending: 0, monthName: 'Atual', dueDate: settings.cardClosingDay + 7 };
    
    const pendingInstallments = installments
      .filter(i => i.status === 'pending')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    
    if (pendingInstallments.length === 0) {
      const now = new Date();
      const monthInstallments = installments.filter(i => {
        const d = new Date(i.due_date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const total = monthInstallments.reduce((acc, i) => acc + i.amount, 0);
      return { total, pending: 0, monthName: format(now, 'MMMM', { locale: ptBR }), dueDate: settings.cardClosingDay + 7 };
    }

    const firstPendingDate = new Date(pendingInstallments[0].due_date);
    const monthName = format(firstPendingDate, 'MMMM', { locale: ptBR });
    
    const monthInstallments = installments.filter(i => {
      const d = new Date(i.due_date);
      return d.getMonth() === firstPendingDate.getMonth() && d.getFullYear() === firstPendingDate.getFullYear();
    });

    const total = monthInstallments.reduce((acc, i) => acc + i.amount, 0);
    const pending = monthInstallments.filter(i => i.status === 'pending').reduce((acc, i) => acc + i.amount, 0);
    
    return { total, pending, monthName, dueDate: firstPendingDate.getDate() };
  }, [installments, settings.cardClosingDay]);

  // 3. Cálculo da Prévia (Total de todas as parcelas pendentes de cartão)
  const totalPendingCards = useMemo(() => {
    return installments
      .filter(i => i.status === 'pending')
      .reduce((acc, i) => acc + i.amount, 0);
  }, [installments]);

  const netBalance = pixBalance.balance - activeInvoice.pending;

  // 4. Saldo por Pessoa
  const peopleWithBalance = useMemo(() => {
    const balances: Record<string, number> = {};
    settings.contacts.forEach(name => { balances[name] = 0; });

    transfers.forEach(t => {
      const amount = t.type === 'in' ? t.amount : -t.amount;
      balances[t.friend_name] = (balances[t.friend_name] || 0) + amount;
    });

    installments.forEach(inst => {
      const tx = transactions.find(t => t.id === inst.transaction_id);
      if (tx && tx.recipient_name) {
        balances[tx.recipient_name] = (balances[tx.recipient_name] || 0) - inst.amount;
      }
    });

    return Object.entries(balances)
      .filter(([_, balance]) => Math.abs(balance) > 0.01)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  }, [transfers, installments, transactions, settings.contacts]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-indigo-100 text-xs font-medium uppercase tracking-wider">Saldo em Conta (PIX)</p>
              <h2 className="text-4xl font-bold mt-1">R$ {formatCurrency(pixBalance.balance)}</h2>
              <div className="mt-3 flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full w-fit border border-white/10">
                <Calculator size={14} className="text-indigo-200" />
                <p className="text-[11px] font-medium text-indigo-50">
                  Líquido: <span className="font-bold">R$ {formatCurrency(netBalance)}</span>
                </p>
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <Wallet size={28} />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-white/10 relative z-10">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/20 rounded-lg"><ArrowDownLeft size={14} className="text-emerald-300" /></div>
                <p className="text-[9px] text-indigo-100 uppercase font-bold">Entradas</p>
              </div>
              <p className="text-xs font-bold">R$ {formatCurrency(pixBalance.totalIn)}</p>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-500/20 rounded-lg"><ArrowUpRight size={14} className="text-rose-300" /></div>
                <p className="text-[9px] text-indigo-100 uppercase font-bold">Saídas</p>
              </div>
              <p className="text-xs font-bold">R$ {formatCurrency(pixBalance.totalOut)}</p>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-500/20 rounded-lg"><CreditCard size={14} className="text-rose-300" /></div>
                <p className="text-[9px] text-rose-100 uppercase font-bold">Prévia</p>
              </div>
              <p className="text-xs font-bold text-rose-200">R$ {formatCurrency(totalPendingCards)}</p>
            </div>
          </div>
        </section>

        <Link 
          to="/cards"
          className="block w-full text-left bg-white dark:bg-slate-900 rounded-[32px] p-5 shadow-sm border dark:border-slate-800 active:scale-[0.98] transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="text-indigo-600" size={20} />
              <h3 className="font-bold dark:text-white capitalize">Fatura de {activeInvoice.monthName}</h3>
            </div>
            <Badge className={cn(
              "border-none",
              activeInvoice.pending === 0 ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
            )}>
              {activeInvoice.pending === 0 ? "Paga" : `Vence dia ${activeInvoice.dueDate}`}
            </Badge>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                R$ {formatCurrency(activeInvoice.pending)}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                Total da Fatura: R$ {formatCurrency(activeInvoice.total)}
              </p>
            </div>
            <p className="text-xs text-slate-500">Fechamento dia {settings.cardClosingDay}</p>
          </div>
        </Link>

        <section className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2 dark:text-slate-100">
            <Users className="text-indigo-600 dark:text-indigo-400" size={20} />
            Saldos por Pessoa
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {peopleWithBalance.map(([name, balance]) => (
              <Card key={name} className="border-none shadow-sm dark:bg-slate-900 cursor-pointer active:scale-95 transition-transform" onClick={() => setSelectedPerson(name)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm", balance > 0 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600")}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{name}</p>
                      <p className="text-[10px] text-slate-500">{balance > 0 ? "Você deve a ele(a)" : "Ele(a) te deve"}</p>
                    </div>
                  </div>
                  <p className={cn("font-bold font-mono", balance > 0 ? "text-emerald-600" : "text-rose-600")}>R$ {formatCurrency(Math.abs(balance))}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Button onClick={() => setDialogOpen(true)} className="fixed bottom-20 right-6 h-16 w-16 rounded-full bg-indigo-600 shadow-2xl z-50"><Plus size={32} /></Button>
      </div>
      <TransferDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={addTransfer} />
      <PersonHistoryDrawer personName={selectedPerson} open={!!selectedPerson} onOpenChange={(open) => !open && setSelectedPerson(null)} />
    </AppShell>
  );
};

export default Index;