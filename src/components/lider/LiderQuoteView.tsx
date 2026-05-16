"use client";

import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X, Download, Printer, Share2, CheckCircle2, Globe, Cpu, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LiderQuoteViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  basePrice: number;
}

const LiderQuoteView = ({ open, onOpenChange, basePrice }: LiderQuoteViewProps) => {
  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  const siteValue = basePrice * 0.33;
  const systemValue = basePrice * 0.67;

  const plans = [
    { months: 1, label: 'Plano Mensal', discount: 0, desc: 'Ideal para começar' },
    { months: 6, label: 'Plano Semestral', discount: 5, desc: 'Economia de 5%' },
    { months: 12, label: 'Plano Anual', discount: 10, desc: 'Melhor custo-benefício' },
    { months: 24, label: 'Plano Bienal', discount: 15, desc: 'Máxima economia' },
  ];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-white dark:bg-slate-950 border-none rounded-t-[32px] max-w-2xl mx-auto h-[95vh]">
        <div className="mx-auto w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full my-4" />
        
        <div className="flex justify-between items-center px-6 mb-2">
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full">
            <X size={24} />
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={() => window.print()}>
              <Printer size={16} /> Imprimir
            </Button>
          </div>
        </div>

        <div id="quote-content" className="p-8 overflow-y-auto bg-white text-slate-900">
          {/* Cabeçalho do Orçamento */}
          <div className="border-b-2 border-indigo-600 pb-6 mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-indigo-900 uppercase tracking-tighter">Orçamento</h1>
              <p className="text-slate-500 font-medium">Lider Refrigeração - Soluções Digitais</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase">Data de Emissão</p>
              <p className="font-bold">{format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
            </div>
          </div>

          {/* Descrição dos Serviços */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-indigo-700 mb-3">
                <Globe size={20} />
                <h3 className="font-bold uppercase text-sm">Website Profissional</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Desenvolvimento de interface moderna, responsiva (celular e PC) e otimizada para conversão de clientes.
              </p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-indigo-700 mb-3">
                <Cpu size={20} />
                <h3 className="font-bold uppercase text-sm">Sistema & Servidor</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hospedagem de alta performance, banco de dados seguro e sistema de gestão integrado.
              </p>
            </div>
          </div>

          {/* Composição do Valor */}
          <div className="mb-10">
            <h3 className="text-sm font-black text-slate-400 uppercase mb-4 tracking-widest">Composição do Investimento</h3>
            <div className="bg-indigo-900 text-white p-6 rounded-[24px] shadow-xl flex justify-around items-center">
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-indigo-300 mb-1">Site (33%)</p>
                <p className="text-xl font-bold">{formatCurrency(siteValue)}</p>
              </div>
              <div className="h-10 w-[1px] bg-white/20" />
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-indigo-300 mb-1">Sistema (67%)</p>
                <p className="text-xl font-bold">{formatCurrency(systemValue)}</p>
              </div>
              <div className="h-10 w-[1px] bg-white/20" />
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-indigo-300 mb-1">Total Base</p>
                <p className="text-xl font-bold">{formatCurrency(basePrice)}</p>
              </div>
            </div>
          </div>

          {/* Opções de Planos */}
          <h3 className="text-sm font-black text-slate-400 uppercase mb-4 tracking-widest">Opções de Contratação</h3>
          <div className="grid grid-cols-1 gap-3 mb-8">
            {plans.map((plan) => {
              const total = basePrice * plan.months;
              const discountedTotal = total * (1 - plan.discount / 100);
              const perMonth = discountedTotal / plan.months;

              return (
                <div key={plan.months} className="flex items-center justify-between p-4 border-2 border-slate-100 rounded-2xl hover:border-indigo-200 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800">{plan.label}</p>
                      {plan.discount > 0 && (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          ECONOMIA DE {plan.discount}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{plan.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-indigo-900">{formatCurrency(discountedTotal)}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      {plan.months > 1 ? `${formatCurrency(perMonth)} / mês` : 'Pagamento único'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rodapé / Garantias */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm text-emerald-600">
              <ShieldCheck size={32} />
            </div>
            <div>
              <p className="font-bold text-slate-800">Garantia de Performance</p>
              <p className="text-xs text-slate-500">Suporte técnico incluso e disponibilidade de 99.9% do sistema.</p>
            </div>
          </div>

          <p className="text-center text-[10px] text-slate-400 mt-10 uppercase font-bold tracking-widest">
            Este orçamento é válido por 15 dias.
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default LiderQuoteView;