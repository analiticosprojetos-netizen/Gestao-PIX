"use client";

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Trash2, CheckCircle2, Circle, Plus, Mic, Calendar as CalendarIcon, Repeat } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { useBills } from '@/context/BillContext';
import { useVoiceCommand } from '@/hooks/useVoiceCommand';
import BillDialog from '@/components/bills/BillDialog';
import AddActionMenu from '@/components/bills/AddActionMenu';
import VoiceAssistant from '@/components/voice/VoiceAssistant';
import { showError } from '@/utils/toast';

const Bills = () => {
  const { bills, addBill, updateBill, deleteBill, togglePaid } = useBills();
  const { processCommand } = useVoiceCommand();
  const [search, setSearch] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<any>(null);

  // Voice Assistant States
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  const filteredBills = bills.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleAddManual = () => {
    setEditingBill(null);
    setDialogOpen(true);
  };

  const handleEdit = (bill: any) => {
    setEditingBill(bill);
    setDialogOpen(true);
  };

  const handleDialogSubmit = (data: any) => {
    if (editingBill) {
      updateBill(editingBill.id, data);
    } else {
      addBill({
        ...data,
        category: 'Geral'
      });
    }
  };

  const startVoiceListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showError("Reconhecimento de voz não suportado neste navegador.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setVoiceOpen(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setVoiceOpen(false);
      showError("Erro ao capturar voz.");
    };

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
    };

    recognition.start();
    setRecognitionInstance(recognition);
  };

  const handleVoiceConfirm = () => {
    if (transcript) {
      processCommand(transcript);
    }
    setVoiceOpen(false);
    setTranscript('');
  };

  const handleVoiceRetry = () => {
    startVoiceListening();
  };

  const handleVoiceClose = () => {
    if (recognitionInstance) {
      recognitionInstance.abort();
    }
    setVoiceOpen(false);
    setTranscript('');
  };

  const BillItem = ({ bill }: { bill: any }) => (
    <Card className="border-none shadow-sm mb-3 dark:bg-slate-900 overflow-hidden">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => togglePaid(bill.id)}
            className="transition-transform active:scale-90"
          >
            {bill.paid ? (
              <CheckCircle2 className="text-emerald-500" size={24} />
            ) : (
              <Circle className="text-slate-300 dark:text-slate-600" size={24} />
            )}
          </button>
          <div className="cursor-pointer" onClick={() => handleEdit(bill)}>
            <p className={cn(
              "font-bold text-slate-800 dark:text-slate-100 leading-tight flex items-center gap-1.5",
              bill.paid && "text-slate-400 line-through"
            )}>
              {bill.title}
              {bill.recurring && <Repeat size={12} className="text-indigo-500" />}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
              <CalendarIcon size={12} />
              Vence {format(bill.dueDate, "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={cn(
              "font-bold font-mono",
              bill.paid ? "text-slate-400" : "text-slate-700 dark:text-slate-300"
            )}>
              R$ {formatCurrency(bill.amount)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => {
                if(confirm("Deseja remover este boleto?")) deleteBill(bill.id);
              }}
              className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Buscar boleto..." 
              className="pl-10 bg-white dark:bg-slate-900 border-none shadow-sm rounded-xl h-12" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => setActionMenuOpen(true)} 
            className="bg-indigo-600 rounded-xl h-12 w-12 p-0 shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Plus size={24} />
          </Button>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl h-12">
            <TabsTrigger value="pending" className="rounded-lg">Pendentes</TabsTrigger>
            <TabsTrigger value="paid" className="rounded-lg">Pagos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-4">
            {filteredBills.filter(b => !b.paid).map(b => <BillItem key={b.id} bill={b} />)}
            {filteredBills.filter(b => !b.paid).length === 0 && (
              <div className="text-center py-12 text-slate-400 italic">Nenhum boleto pendente</div>
            )}
          </TabsContent>
          <TabsContent value="paid" className="mt-4">
            {filteredBills.filter(b => b.paid).map(b => <BillItem key={b.id} bill={b} />)}
            {filteredBills.filter(b => b.paid).length === 0 && (
              <div className="text-center py-12 text-slate-400 italic">Nenhum boleto pago</div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AddActionMenu 
        open={actionMenuOpen}
        onOpenChange={setActionMenuOpen}
        onVoiceAction={startVoiceListening}
        onManualAction={handleAddManual}
      />

      <BillDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onSubmit={handleDialogSubmit} 
        bill={editingBill}
      />

      <VoiceAssistant 
        isListening={isListening}
        transcript={transcript}
        onConfirm={handleVoiceConfirm}
        onRetry={handleVoiceRetry}
        onClose={handleVoiceClose}
      />
    </AppShell>
  );
};

export default Bills;