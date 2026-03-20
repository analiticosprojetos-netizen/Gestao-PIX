"use client";

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Circle, Search, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Bills = () => {
  const [bills, setBills] = useState([
    { id: '1', title: 'Internet Fibra', amount: 99.90, dueDate: new Date(2025, 4, 15), paid: false },
    { id: '2', title: 'Energia Elétrica', amount: 245.50, dueDate: new Date(2025, 4, 10), paid: true },
    { id: '3', title: 'Condomínio', amount: 450.00, dueDate: new Date(2025, 4, 5), paid: true },
  ]);

  const togglePaid = (id: string) => {
    setBills(bills.map(b => b.id === id ? { ...b, paid: !b.paid } : b));
  };

  const deleteBill = (id: string) => {
    setBills(bills.filter(b => b.id !== id));
  };

  const BillItem = ({ bill }: { bill: any }) => (
    <Card className="border-none shadow-sm mb-3">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => togglePaid(bill.id)}>
            {bill.paid ? 
              <CheckCircle2 className="text-emerald-500" size={24} /> : 
              <Circle className="text-slate-300" size={24} />
            }
          </button>
          <div>
            <p className={cn("font-bold", bill.paid ? "text-slate-400 line-through" : "text-slate-800")}>
              {bill.title}
            </p>
            <p className="text-xs text-slate-500">
              Vencimento: {format(bill.dueDate, "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-bold text-slate-700 font-mono">R$ {bill.amount.toFixed(2)}</p>
          </div>
          <button onClick={() => deleteBill(bill.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input placeholder="Buscar boleto..." className="pl-10 bg-white border-none shadow-sm" />
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-200/50 p-1 rounded-xl">
            <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-white">Pendentes</TabsTrigger>
            <TabsTrigger value="paid" className="rounded-lg data-[state=active]:bg-white">Pagos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-4">
            {bills.filter(b => !b.paid).map(bill => (
              <BillItem key={bill.id} bill={bill} />
            ))}
            {bills.filter(b => !b.paid).length === 0 && (
              <p className="text-center text-slate-500 py-10">Tudo em dia! 🎉</p>
            )}
          </TabsContent>
          
          <TabsContent value="paid" className="mt-4">
            {bills.filter(b => b.paid).map(bill => (
              <BillItem key={bill.id} bill={bill} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
};

export default Bills;