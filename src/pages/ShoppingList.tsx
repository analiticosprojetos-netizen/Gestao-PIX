"use client";

import React, { useState, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useShopping } from '@/context/ShoppingContext';
import { useShoppingVoiceCommand } from '@/hooks/useShoppingVoiceCommand';
import ShoppingItemDialog from '@/components/shopping/ShoppingItemDialog';
import VoiceAssistant from '@/components/voice/VoiceAssistant';
import { getItemCategory } from '@/utils/priceEstimator';
import { 
  Search, Plus, Mic, Trash2, CheckCircle2, Circle, 
  ShoppingCart, Sparkles, Trash, Pencil, Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { showError } from '@/utils/toast';

const ShoppingList = () => {
  const { items, addItem, updateItem, deleteItem, toggleChecked, clearCheckedItems } = useShopping();
  const { processShoppingCommand } = useShoppingVoiceCommand();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Voice Assistant States
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  // Lista de todas as categorias possíveis para os botões de filtro
  const categories = [
    'Todos',
    'Higiene Pessoal',
    'Limpeza',
    'Bebidas',
    'Hortifruti',
    'Padaria & Snacks',
    'Carnes & Frios',
    'Mercearia'
  ];

  // Filtra os itens por busca de texto e pela categoria selecionada
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const itemCategory = item.category || getItemCategory(item.name);
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || itemCategory === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, selectedCategory]);

  // Agrupamento por categorias
  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof items> = {};
    
    filteredItems.forEach(item => {
      const category = item.category || getItemCategory(item.name);
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });

    return groups;
  }, [filteredItems]);

  // Cálculos de Totais
  const totals = useMemo(() => {
    const totalEstimated = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalInCart = items
      .filter(item => item.checked)
      .reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return {
      estimated: totalEstimated,
      inCart: totalInCart
    };
  }, [items]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleAddManual = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDialogSubmit = (data: any) => {
    if (editingItem) {
      updateItem(editingItem.id, data);
    } else {
      addItem(data);
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
      processShoppingCommand(transcript);
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

  // Cores para as categorias
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "Higiene Pessoal":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border-blue-100 dark:border-blue-900/30";
      case "Limpeza":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 border-purple-100 dark:border-purple-900/30";
      case "Bebidas":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border-amber-100 dark:border-amber-900/30";
      case "Hortifruti":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/30";
      case "Padaria & Snacks":
        return "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300 border-orange-100 dark:border-orange-900/30";
      case "Carnes & Frios":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border-rose-100 dark:border-rose-900/30";
      default:
        return "bg-slate-50 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border-slate-100 dark:border-slate-800";
    }
  };

  // Cores para os botões de filtro ativos
  const getFilterActiveStyle = (category: string) => {
    switch (category) {
      case "Todos":
        return "bg-indigo-600 text-white";
      case "Higiene Pessoal":
        return "bg-blue-600 text-white";
      case "Limpeza":
        return "bg-purple-600 text-white";
      case "Bebidas":
        return "bg-amber-600 text-white";
      case "Hortifruti":
        return "bg-emerald-600 text-white";
      case "Padaria & Snacks":
        return "bg-orange-600 text-white";
      case "Carnes & Frios":
        return "bg-rose-600 text-white";
      default:
        return "bg-slate-700 text-white";
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header com Resumo Financeiro */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-none bg-indigo-50 dark:bg-indigo-950/20">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold text-indigo-600 uppercase">Total Estimado</p>
              <p className="text-lg font-bold text-indigo-700 dark:text-indigo-400">
                R$ {formatCurrency(totals.estimated)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-none bg-emerald-50 dark:bg-emerald-950/20">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold text-emerald-600 uppercase">No Carrinho</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                R$ {formatCurrency(totals.inCart)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Barra de Busca e Ações */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Buscar item..." 
              className="pl-10 bg-white dark:bg-slate-900 border-none shadow-sm rounded-xl h-12" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button 
            onClick={startVoiceListening}
            className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-12 w-12 p-0 shadow-lg shadow-rose-200 dark:shadow-none"
            title="Adicionar por Voz"
          >
            <Mic size={22} />
          </Button>
          <Button 
            onClick={handleAddManual} 
            className="bg-indigo-600 hover:bg-indigo-700 rounded-xl h-12 w-12 p-0 shadow-lg shadow-indigo-200 dark:shadow-none"
            title="Adicionar Manual"
          >
            <Plus size={24} />
          </Button>
        </div>

        {/* Filtros de Categoria com Rolagem Horizontal */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 border",
                  isActive 
                    ? getFilterActiveStyle(category)
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-50"
                )}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Lista de Itens Agrupados */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Itens na Lista ({filteredItems.length})
            </h3>
            {items.some(i => i.checked) && (
              <button 
                onClick={() => {
                  if (confirm("Deseja limpar todos os itens já comprados?")) {
                    clearCheckedItems();
                  }
                }}
                className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1"
              >
                <Trash size={14} /> Limpar Comprados
              </button>
            )}
          </div>

          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category} className="space-y-2">
              {/* Header da Categoria */}
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold w-fit",
                getCategoryStyle(category)
              )}>
                <Tag size={12} />
                {category} ({categoryItems.length})
              </div>

              {/* Itens da Categoria */}
              <div className="space-y-2">
                {categoryItems.map(item => (
                  <Card 
                    key={item.id} 
                    className={cn(
                      "border-none shadow-sm overflow-hidden transition-all",
                      item.checked ? "bg-slate-50/50 dark:bg-slate-900/40 opacity-60" : "bg-white dark:bg-slate-900"
                    )}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button 
                          onClick={() => toggleChecked(item.id)}
                          className="transition-transform active:scale-90 flex-shrink-0"
                        >
                          {item.checked ? (
                            <CheckCircle2 className="text-emerald-500" size={24} />
                          ) : (
                            <Circle className="text-slate-300 dark:text-slate-600" size={24} />
                          )}
                        </button>
                        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => handleEdit(item)}>
                          <p className={cn(
                            "font-bold text-slate-800 dark:text-slate-100 leading-tight truncate",
                            item.checked && "text-slate-400 line-through"
                          )}>
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Qtd: {item.quantity} {item.price > 0 && `• R$ ${formatCurrency(item.price)} un.`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-2">
                        {item.price > 0 && (
                          <p className={cn(
                            "font-bold font-mono text-sm",
                            item.checked ? "text-slate-400" : "text-slate-700 dark:text-slate-300"
                          )}>
                            R$ {formatCurrency(item.price * item.quantity)}
                          </p>
                        )}
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleEdit(item)}
                            className="p-2 text-slate-300 hover:text-indigo-500 transition-colors"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => deleteItem(item.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <ShoppingCart className="mx-auto text-slate-300 dark:text-slate-700 mb-3" size={40} />
              <p className="text-slate-400 italic text-sm">Nenhum item encontrado nesta categoria</p>
              <p className="text-xs text-slate-400 mt-1">Toque no microfone ou no botão + para adicionar</p>
            </div>
          )}
        </div>

        {/* Dicas de Voz */}
        <Card className="border-none bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 rounded-2xl">
          <div className="flex gap-3">
            <Sparkles className="text-indigo-500 flex-shrink-0" size={20} />
            <div>
              <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">Comandos de Voz Rápidos</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                🎙️ Fale: <span className="font-semibold">"3 pacotes de arroz de 15 reais"</span> para adicionar.<br />
                🎙️ Fale: <span className="font-semibold">"arroz ok"</span> para marcar como comprado.<br />
                🎙️ Fale: <span className="font-semibold">"remover arroz"</span> para excluir.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <ShoppingItemDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleDialogSubmit}
        item={editingItem}
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

export default ShoppingList;