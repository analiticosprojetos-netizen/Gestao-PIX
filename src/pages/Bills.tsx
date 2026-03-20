"use client";

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Circle, Search, Trash2, Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { useBills } from '@/context/BillContext';
import BillDialog from '@/components/bills/BillDialog';
import { Bill } from '@/types/bill';

const Bills = () => {
  const { bills, togglePaid, deleteBill, updateBill } = useBills();
  const [search, setSearch] = useState('');
  const [editingBill, setEditingBill] = useState<Bill | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredBills = bills.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setDialogOpen(true);
  };

  const BillItem = ({ bill }: { bill: Bill }) => (
    <Card className="border-none shadow-sm mb-3 group">
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
        <div className="flex items-center gap-2">
          <div className="text-right mr-2">
            <p className="font-bold text-slate-700 font-mono">R$ {bill.amount.toFixed(2)}</p>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => handleEdit(bill)} 
              className="p-2 text-slate-300 hover:text-indigo-500 transition-colors"
            >
              <Edit2 size={16} />
            </button>
            <button 
              onClick={() => deleteBill(bill.id)} 
              className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Buscar boleto..." 
            className="pl-10 bg-white border-none shadow-sm" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-200/50 p-1 rounded-xl">
            <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-white">Pendentes</TabsTrigger>
            <TabsTrigger value="paid" className="rounded-lg data-[state=active]:bg-white">Pagos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-4">
            {filteredBills.filter(b => !b.paid).map(bill => (
              <BillItem key={bill.id} bill={bill} />
            ))}
            {filteredBills.filter(b => !b.paid).length === 0 && (
              <p className="text-center text-slate-500 py-10 italic">Nenhum boleto pendente</p>
            )}
          </TabsContent>
          
          <TabsContent value="paid" className="mt-4">
            {filteredBills.filter(b => b.paid).map(bill => (
              <BillItem key={bill.id} bill={bill} />
            ))}
            {filteredBills.filter(b => b.paid).length === 0 && (
              <p className="text-center text-slate-500 py-10 italic">Nenhum boleto pago</p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BillDialog 
        open={dialogOpen} 
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingBill(undefined);
        }} 
        onSubmit={(data) => {
          if (editingBill) updateBill(editingBill.id, data);
        }} 
        bill={editingBill}
      />
    </AppShell>
  );
};

export default Bills;