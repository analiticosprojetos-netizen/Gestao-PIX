"use client";

import React, { useState, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, ArrowUpRight, ArrowDownLeft, Users, Plus, CreditCard, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TransferDialog from '@/components/transfers/TransferDialog';
import PersonHistoryDrawer from '@/components/people/PersonHistoryDrawer';
import { useTransfers } from '@/context/TransferContext';
import { useCards } from '@/context/CardContext';
import { useSettings } from '@/context/SettingsContext';
import { cn } from "@/lib/utils";
import { parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

const Index = () => {
  const { transfers, addTransfer } = useTransfers();
  const { installments, transactions } = useCards();
  const { settings } = useSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  // Cálculo financeiro principal:
  // - Saldo em Conta: Estritamente (Entradas PIX - Saídas PIX)
  // - Saídas: Saídas PIX + Parcelas do Cartão que já foram PAGAS
  const pixBalance = useMemo(() => {
    const completedTransfers = transfers.filter(t => t.status === 'completed' || !t.status);
    const listToUse = completedTransfers.length > 0 ? completedTransfers : transfers;

    const totalIn = listToUse.filter(t => t.type === 'in').reduce((acc, t) => acc + t.amount, 0);
    const pixOut = listToUse.filter(t => t.type === 'out').reduce((acc, t) => acc + t.amount, 0);

    // Soma APENAS das parcelas de cartão marcadas como PAGAS
    const paidCardAmount = installments
      .filter(i => i.status === 'paid')
      .reduce((acc, i) => acc + i.amount, 0);

    // O indicador "Saídas" soma as Saídas PIX + o Cartão Pago
    const totalOut = pixOut + paidCardAmount;
    
    // Saldo em conta é EXCLUSIVAMENTE movimentação de conta (PIX)
    const balance = totalIn - pixOut;

    return { 
      totalIn, 
      totalOut, 
      balance
    };
  }, [transfers, installments]);

  // Total do Cartão de Crédito em Aberto (Pendentes)
  const totalPendingCards = useMemo(() => {
    return installments
      .filter(i => i.status === 'pending')
      .reduce((acc, i) => acc + i.amount, 0);
  }, [installments]);

  const activeInvoice = useMemo(() => {
    const pendingInstallments = installments.filter(i => i.status === 'pending');
    
    if (pendingInstallments.length === 0) {
      return { total: 0, pending: 0, monthName: 'Atual', dueDate: settings.cardClosingDay + 7 };
    }

    const sortedPending = [...pendingInstallments].sort((a, b) => a.due_date.localeCompare(b.due_date));
    const firstPendingDate = parseISO(sortedPending[0].due_date);
    
    const totalAbsolutePending = pendingInstallments.reduce((acc, i) => acc + i.amount, 0);

    return { 
      total: totalAbsolutePending, 
      pending: totalAbsolutePending, 
      monthName: "Total em Aberto", 
      dueDate: firstPendingDate.getDate() 
    };
  }, [installments, settings.cardClosingDay]);

  // Calcula pendências ativas por pessoa (apenas itens PENDENTES)
  const peopleWithBalance = useMemo(() => {
    const balances: Record<string, number> = {};
    settings.contacts.forEach(name => { balances[name] = 0; });

    transfers.filter(t => t.status === 'pending').forEach(t => {
      const amount = t.type === 'in' ? t.amount : -t.amount;
      balances[t.friend_name] = (balances[t.friend_name] || 0) + amount;
    });

    installments.filter(i => i.status === 'pending').forEach(inst => {
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
        {/* Painel de Saldo */}
        <section className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider">Saldo em Conta (PIX)</p>
              <h2 className="text-4xl font-black mt-1">R$ {formatCurrency(pixBalance.balance)}</h2>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <Wallet size={28} />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-white/10 relative z-10">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-emerald-500/20 rounded-md"><ArrowDownLeft size={12} className="text-emerald-300" /></div>
                <p className="text-[9px] text-indigo-100 uppercase font-bold">Entradas</p>
              </div>
              <p className="text-xs font-bold text-emerald-300">+R$ {formatCurrency(pixBalance.totalIn)}</p>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-rose-500/20 rounded-lg"><ArrowUpRight size={12} className="text-rose-300" /></div>
                <p className="text-[9px] text-indigo-100 uppercase font-bold">Saídas</p>
              </div>
              <p className="text-xs font-bold text-rose-200">-R$ {formatCurrency(pixBalance.totalOut)}</p>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-amber-500/20 rounded-lg"><CreditCard size={12} className="text-amber-300" /></div>
                <p className="text-[9px] text-indigo-100 uppercase font-bold">Total Cartão</p>
              </div>
              <p className="text-xs font-bold text-amber-200">-R$ {formatCurrency(totalPendingCards)}</p>
            </div>
          </div>
        </section>

        {/* Atalho para o Extrato Geral */}
        <Link 
          to="/historico"
          className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 shadow-sm active:scale-[0.98] transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 rounded-xl">
              <History size={20} />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-800 dark:text-slate-100">Ver Extrato Completo</p>
              <p className="text-xs text-slate-500">Histórico de PIX, Cartões e Boletos</p>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-600">Abrir &rarr;</span>
        </Link>

        <Link 
          to="/cards"
          className="block w-full text-left bg-white dark:bg-slate-900 rounded-[32px] p-5 shadow-sm border dark:border-slate-800 active:scale-[0.98] transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="text-indigo-600" size={20} />
              <h3 className="font-bold dark:text-white">Total Pendente no Cartão</h3>
            </div>
            <Badge className={cn(
              "border-none",
              activeInvoice.pending === 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            )}>
              {activeInvoice.pending === 0 ? "Tudo Pago" : `Atenção`}
            </Badge>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                R$ {formatCurrency(activeInvoice.pending)}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                Soma de todas as parcelas em aberto
              </p>
            </div>
            <p className="text-xs text-slate-500">Ver detalhes</p>
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
            {peopleWithBalance.length === 0 && (
              <div className="text-center py-8 text-slate-400 italic text-sm bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                Tudo quitado! Ninguém deve nada a ninguém.
              </div>
            )}
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