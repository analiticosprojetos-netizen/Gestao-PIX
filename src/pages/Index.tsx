"use client";

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, ArrowUpRight, ArrowDownLeft, Users, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TransferDialog from '@/components/transfers/TransferDialog';
import { useTransfers } from '@/context/TransferContext';
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';

const Index = () => {
  const { transfers, addTransfer } = useTransfers();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Cálculos Gerais
  const totalIn = transfers.filter(t => t.type === 'in').reduce((acc, t) => acc + t.amount, 0);
  const totalOut = transfers.filter(t => t.type === 'out').reduce((acc, t) => acc + t.amount, 0);
  const pixBalance = totalIn - totalOut;

  // Saldo por Pessoa (Abates)
  const balancesByPerson = transfers.reduce((acc: Record<string, number>, t) => {
    const amount = t.type === 'in' ? t.amount : -t.amount;
    acc[t.friend_name] = (acc[t.friend_name] || 0) + amount;
    return acc;
  }, {});

  const peopleWithBalance = Object.entries(balancesByPerson)
    .filter(([_, balance]) => Math.abs(balance) > 0.01)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Card de Saldo Principal */}
        <section className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-indigo-100 text-xs font-medium uppercase tracking-wider">Saldo em Conta (PIX)</p>
              <h2 className="text-4xl font-bold mt-1">
                R$ {pixBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <Wallet className="text-white" size={28} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/10 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-xl">
                <ArrowDownLeft size={18} className="text-emerald-300" />
              </div>
              <div>
                <p className="text-[10px] text-indigo-100 uppercase font-bold">Entradas</p>
                <p className="text-sm font-bold">R$ {totalIn.toLocaleString('pt-BR')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/20 rounded-xl">
                <ArrowUpRight size={18} className="text-rose-300" />
              </div>
              <div>
                <p className="text-[10px] text-indigo-100 uppercase font-bold">Saídas</p>
                <p className="text-sm font-bold">R$ {totalOut.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Saldo por Pessoa (Controle de Abates) */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-2 dark:text-slate-100">
              <Users className="text-indigo-600 dark:text-indigo-400" size={20} />
              Saldos por Pessoa
            </h3>
            <Badge variant="secondary" className="rounded-lg">
              {peopleWithBalance.length} contatos
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {peopleWithBalance.slice(0, 5).map(([name, balance]) => (
              <Card key={name} className="border-none shadow-sm dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                      balance > 0 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                    )}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{name}</p>
                      <p className="text-[10px] text-slate-500">
                        {balance > 0 ? "Você deve a ele(a)" : "Ele(a) te deve"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-bold font-mono",
                      balance > 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                      R$ {Math.abs(balance).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {peopleWithBalance.length === 0 && (
              <div className="text-center py-8 bg-slate-100/50 dark:bg-slate-900/50 rounded-[24px] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 text-sm italic">Nenhum saldo pendente</p>
              </div>
            )}
          </div>
        </section>

        {/* Botão Flutuante (+) */}
        <Button 
          onClick={() => setDialogOpen(true)}
          className="fixed bottom-20 right-6 h-16 w-16 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-300 dark:shadow-none z-50 flex items-center justify-center p-0"
        >
          <Plus size={32} className="text-white" />
        </Button>
      </div>

      <TransferDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onSubmit={addTransfer} 
      />
    </AppShell>
  );
};

export default Index;