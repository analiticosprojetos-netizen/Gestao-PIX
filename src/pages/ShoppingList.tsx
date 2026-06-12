"use client";

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { useShoppingList } from '@/context/ShoppingListContext';
import ShoppingItemDialog from '@/components/shopping/ShoppingItemDialog';
import { ShoppingItem } from '@/types/shopping';
import { Plus, Trash2, Edit2, Mic, MicOff, Search, ShoppingBag } from 'lucide-react';
import { cn } from "@/lib/utils";
import { showSuccess, showError } from '@/utils/toast';

const ShoppingList = () => {
  const { items, addItem, updateItem, deleteItem, toggleItemChecked, handleVoiceCommand } = useShoppingList();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [isListening, setIsListening] = useState(false);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const pendingItems = filteredItems.filter(i => !i.checked);
  const completedItems = filteredItems.filter(i => i.checked);

  const handleVoiceListen = () => {
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
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      showError("Erro ao capturar voz. Tente novamente.");
    };

    recognition.onresult = async (event: any) => {
      const speechResult = event.results[0][0].transcript;
      showSuccess(`Comando ouvido: "${speechResult}"`);
      await handleVoiceCommand(speechResult);
    };

    recognition.start();
  };

  const handleFormSubmit = async (name: string, quantity: number, price: number) => {
    if (editingItem) {
      await updateItem(editingItem.id, { name, quantity, price });
      setEditingItem(null);
    } else {
      await addItem(name, quantity, price);
    }
  };

  const totalEstimated = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalChecked = items.filter(i => i.checked).reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Card de Resumo Financeiro do Mercado */}
        <section className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-6 text-white shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-indigo-100 text-xs font-medium uppercase tracking-wider">Total no Carrinho</p>
              <h2 className="text-3xl font-bold mt-1">R$ {totalChecked.toFixed(2)}</h2>
              <p className="text-xs text-indigo-200 mt-1">Estimado total: R$ {totalEstimated.toFixed(2)}</p>
            </div>
            <ShoppingBag size={36} className="text-indigo-200/50" />
          </div>
        </section>

        {/* Barra de Busca e Ações */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Buscar item..." 
              className="pl-10 bg-white dark:bg-slate-900 border-none shadow-sm" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {/* Botão de Voz */}
          <Button 
            onClick={handleVoiceListen} 
            className={cn(
              "rounded-xl h-10 w-10 p-0 transition-all",
              isListening ? "bg-rose-500 hover:bg-rose-600 animate-pulse" : "bg-indigo-600 hover:bg-indigo-700"
            )}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </Button>

          <Button onClick={() => { setEditingItem(null); setDialogOpen(true); }} className="bg-indigo-600 rounded-xl h-10 w-10 p-0">
            <Plus size={20} />
          </Button>
        </div>

        {isListening && (
          <div className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 p-3 rounded-2xl text-center text-xs font-medium animate-pulse">
            🎙️ Ouvindo... Fale o produto (ex: "farinha", "farinha ok" ou "remover farinha")
          </div>
        )}

        {/* Lista de Itens Pendentes */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Para Comprar ({pendingItems.length})</h3>
          {pendingItems.map(item => (
            <Card key={item.id} className="border-none shadow-sm dark:bg-slate-900">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={item.checked} 
                    onCheckedChange={(checked) => toggleItemChecked(item.id, !!checked)}
                    className="h-5 w-5 rounded-md border-slate-300 text-indigo-600"
                  />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100 capitalize">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      Qtd: {item.quantity} {item.price > 0 && `• R$ ${item.price.toFixed(2)} un.`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setEditingItem(item); setDialogOpen(true); }}
                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Lista de Itens Comprados */}
        {completedItems.length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Comprado ({completedItems.length})</h3>
            {completedItems.map(item => (
              <Card key={item.id} className="border-none shadow-sm bg-slate-100/50 dark:bg-slate-900/50 opacity-70">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={item.checked} 
                      onCheckedChange={(checked) => toggleItemChecked(item.id, !!checked)}
                      className="h-5 w-5 rounded-md border-slate-300 text-indigo-600"
                    />
                    <div>
                      <p className="font-bold text-slate-500 dark:text-slate-400 line-through capitalize">{item.name}</p>
                      <p className="text-xs text-slate-400">Qtd: {item.quantity}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ShoppingItemDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onSubmit={handleFormSubmit}
        editingItem={editingItem}
      />
    </AppShell>
  );
};

export default ShoppingList;