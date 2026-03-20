"use client";

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle } from 'lucide-react';
import AddBillDialog from '@/components/bills/AddBillDialog';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";

const Index = () => {
  const [bills, setBills] = useState([
    { id: '1', title: 'Internet Fibra', amount: 99.90, dueDate: new Date(2025, 4, 15), paid: false },
    { id: '2', title: 'Energia Elétrica', amount: 245.50, dueDate: new Date(2025, 4, 10), paid: false },
  ]);

  const addBill = (newBill: any) => {
    const bill = {
      id: Math.random().toString(36).substr(2, 9),
      ...newBill,
      dueDate: new Date(newBill.dueDate),
      paid: false
    };
    setBills([bill, ...bills]);
  };

  const upcomingBills = bills.filter(b => !b.paid).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl">
          <p className="text-indigo-100 text-sm font-medium">Total pendente</p>
          <h2 className="text-3xl font-bold mt-1">
            R$ {upcomingBills.reduce((acc, b) => acc + b.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
          <div className="flex gap-2 mt-4">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">
              {upcomingBills.length} boletos próximos
            </Badge>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="text-indigo-600" size={20} />
            Próximos Vencimentos
          </h3>
          
          <div className="space-y-3">
            {upcomingBills.map((bill) => {
              const daysLeft = differenceInDays(bill.dueDate, new Date());
              let statusColor = "text-emerald-600 bg-emerald-50";
              if (daysLeft <= 3) statusColor = "text-rose-600 bg-rose-50";
              else if (daysLeft <= 7) statusColor = "text-amber-600 bg-amber-50";

              return (
                <Card key={bill.id} className="border-none shadow-sm overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn("p-3 rounded-2xl", statusColor)}>
                        <AlertCircle size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{bill.title}</p>
                        <p className="text-xs text-slate-500">
                          Vence em {format(bill.dueDate, "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600">R$ {bill.amount.toFixed(2)}</p>
                      <Badge variant="outline" className={cn("text-[10px] py-0", statusColor)}>
                        {daysLeft < 0 ? 'Atrasado' : `Em ${daysLeft} dias`}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
      <AddBillDialog onAdd={addBill} />
    </AppShell>
  );
};

export default Index;