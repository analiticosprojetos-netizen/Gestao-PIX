"use client";

import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useTransfers } from '@/context/TransferContext';
import { useCards } from '@/context/CardContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownLeft, CreditCard, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonHistoryDrawerProps {
  personName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PersonHistoryDrawer = ({ personName, open, onOpenChange }: PersonHistoryDrawerProps) => {
  const { transfers } = useTransfers();
  const { transactions, installments } = useCards();

  if (!personName) return null;

  const personTransfers = transfers
    .filter(t => t.friend_name === personName)
    .map(t => ({
      id: t.id,
      date: t.date,
      description: t.description,
      amount: t.amount,
      type: t.type === 'in' ? 'credit' : 'debit',
      icon: t.type === 'in' ? <ArrowDownLeft className="text-emerald-500" /> : <ArrowUpRight className="text-rose-500" />,
      label: t.type === 'in' ? 'Recebido' : 'Pago (PIX)',
      status: 'completed'
    }));

  const personInstallments = installments
    .filter(inst => {
      const tx = transactions.find(t => t.id === inst.transaction_id);
      return tx?.recipient_name === personName;
    })
    .map(inst => {
      const tx = transactions.find(t => t.id === inst.transaction_id)!;
      return {
        id: inst.id,
        date: new Date(inst.due_date),
        description: `Parcela ${inst.number}/${tx.installments_count}: ${tx.description}`,
        amount: inst.amount,
        type: 'debit',
        icon: <CreditCard className={cn(inst.status === 'paid' ? "text-slate-400" : "text-indigo-500")} />,
        label: inst.status === 'paid' ? 'Pago (Cartão)' : 'Dívida (Cartão)',
        status: inst.status
      };
    });

  const history = [...personTransfers, ...personInstallments].sort((a, b) => b.date.getTime() - a.date.getTime());

  // Cálculo do saldo: Soma tudo que recebi (Credit) e subtrai TUDO que enviei ou que a pessoa gastou no cartão (Debit)
  const totalBalance = history.reduce((acc, item) => {
    return item.type === 'credit' ? acc + item.amount : acc - item.amount;
  }, 0);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="dark:bg-slate-900 border-none rounded-t-[32px] max-w-lg mx-auto h-[80vh]">
        <div className="mx-auto w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full my-4" />
        <DrawerHeader className="px-6 flex justify-between items-center">
          <div>
            <DrawerTitle className="text-2xl font-bold">{personName}</DrawerTitle>
            <p className={cn("text-sm font-bold mt-1", totalBalance > 0 ? "text-emerald-600" : "text-rose-600")}>
              Saldo: R$ {formatCurrency(Math.abs(totalBalance))} 
              <span className="font-normal text-slate-500 ml-1">({totalBalance > 0 ? "Você deve" : "Ele(a) deve"})</span>
            </p>
          </div>
          <button onClick={() => onOpenChange(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><X size={20} /></button>
        </DrawerHeader>
        <div className="p-6 overflow-y-auto space-y-4">
          {history.map((item) => (
            <div key={item.id} className={cn("flex items-center justify-between p-4 rounded-2xl border transition-all", item.status === 'pending' && item.type === 'debit' ? "bg-rose-50/50 border-rose-100 dark:bg-rose-950/10 dark:border-rose-900/30" : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800")}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">{item.icon}</div>
                <div>
                  <p className={cn("font-bold text-sm leading-tight", item.status === 'paid' && item.type === 'debit' && "text-slate-400 line-through")}>{item.description}</p>
                  <p className="text-[10px] text-slate-500">{item.label} • {format(item.date, "dd/MM/yyyy", { locale: ptBR })}</p>
                </div>
              </div>
              <p className={cn("font-bold font-mono text-sm", item.type === 'credit' ? "text-emerald-600" : "text-rose-600", item.status === 'paid' && item.type === 'debit' && "text-slate-400")}>
                {item.type === 'credit' ? '+' : '-'} R$ {formatCurrency(item.amount)}
              </p>
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PersonHistoryDrawer;