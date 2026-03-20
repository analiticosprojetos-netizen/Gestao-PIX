"use client";

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, Plus, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BillDialog from '@/components/bills/BillDialog';
import { useBills } from '@/context/BillContext';
import { useNotificationEngine } from '@/hooks/useNotificationEngine';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";

const Index = () => {
  const { bills, addBill } = useBills();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  
  useNotificationEngine();

  useEffect(() => {
    // Verifica se o app já está instalado (standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (!isStandalone) {
      setShowInstallBanner(true);
    }
  }, []);

  const upcomingBills = bills
    .filter(b => !b.paid)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const totalPending = upcomingBills.reduce((acc, b) => acc + b.amount, 0);

  return (
    <AppShell>
      <div className="space-y-6">
        {showInstallBanner && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl text-white">
                <Download size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-indigo-900">Instalar App</p>
                <p className="text-[10px] text-indigo-600">Para receber alertas e usar offline</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-indigo-400 h-8 w-8 p-0"
                onClick={() => setShowInstallBanner(false)}
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        )}

        <section className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl">
          <p className="text-indigo-100 text-sm font-medium">Total pendente</p>
          <h2 className="text-3xl font-bold mt-1">
            R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
            {upcomingBills.length > 0 ? (
              upcomingBills.map((bill) => {
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
              })
            ) : (
              <p className="text-center text-slate-400 py-10 italic">Nenhum boleto pendente</p>
            )}
          </div>
        </section>
      </div>

      <Button 
        onClick={() => setDialogOpen(true)}
        className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700"
      >
        <Plus size={28} />
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