"use client";

import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X, Printer, Globe, Cpu, ShieldCheck } from 'lucide-react';
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
      <DrawerContent className="bg-white dark:bg-slate-950 border-none rounded-t-[32px] max-w-2xl mx-auto h-[95vh] print:h-auto print:bg-white">
        {/* Estilos específicos para impressão profissional */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; background: white !important; }
            .no-print { display: none !important; }
            .print-content { 
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: auto !important;
              overflow: visible !important;
              padding: 0 !important;
              margin: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            /* Remove barras de rolagem e sombras de interface no PDF */
            .drawer-scroll-area { overflow: visible !important; height: auto !important; }
            * { box-shadow: none !important; }
          }
        `}} />

        <div className="mx-auto w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full my-4 no-print" />
        
        <div className="flex justify-between items-center px-6 mb-2 no-print">
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full">
            <X size={24} />
          </Button>
          <Button 
            className="rounded-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200" 
            onClick={() => window.print()}
          >
            <Printer size={18} />
            Imprimir / Salvar PDF
          </Button>
        </div>

        <div className="overflow-y-auto flex-1 drawer-scroll-area">
          <div className="p-8 bg-white text-slate-900 min-h-full print-content">
            {/* Cabeçalho do Orçamento */}
            <div className="border-b-4 border-indigo-600 pb-6 mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-black text-indigo-900 uppercase tracking-tighter">Orçamento</h1>
                <p className="text-slate-500 font-bold">Lider Refrigeração - Soluções Digitais</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data de Emissão</p>
                <p className="font-bold text-lg">{format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
              </div>
            </div>

            {/* Descrição dos Serviços */}
            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                <div className="flex items-center gap-3 text-indigo-700 mb-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm"><Globe size={24} /></div>
                  <h3 className="font-black uppercase text-xs tracking-wider">Website Profissional</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Desenvolvimento de interface moderna, responsiva (celular e PC) e otimizada para conversão de clientes.
                </p>
              </div>
              <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                <div className="flex items-center gap-3 text-indigo-700 mb-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm"><Cpu size={24} /></div>
                  <h3 className="font-black uppercase text-xs tracking-wider">Sistema & Servidor</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Hospedagem de alta performance, banco de dados seguro e sistema de gestão integrado.
                </p>
              </div>
            </div>

            {/* Composição do Valor */}
            <div className="mb-12">
              <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-[0.2em]">Composição do Investimento</h3>
              <div className="bg-indigo-900 text-white p-8 rounded-[32px] shadow-xl flex justify-around items-center">
                <div className="text-center">
                  <p className="text-[10px] uppercase font-black text-indigo-300 mb-2 tracking-widest">Site (33%)</p>
                  <p className="text-2xl font-black">{formatCurrency(siteValue)}</p>
                </div>
                <div className="h-12 w-[1px] bg-white/20" />
                <div className="text-center">
                  <p className="text-[10px] uppercase font-black text-indigo-300 mb-2 tracking-widest">Sistema (67%)</p>
                  <p className="text-2xl font-black">{formatCurrency(systemValue)}</p>
                </div>
                <div className="h-12 w-[1px] bg-white/20" />
                <div className="text-center">
                  <p className="text-[10px] uppercase font-black text-indigo-300 mb-2 tracking-widest">Total Base</p>
                  <p className="text-2xl font-black">{formatCurrency(basePrice)}</p>
                </div>
              </div>
            </div>

            {/* Opções de Planos */}
            <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-[0.2em]">Opções de Contratação</h3>
            <div className="grid grid-cols-1 gap-4 mb-10">
              {plans.map((plan) => {
                const total = basePrice * plan.months;
                const discountedTotal = total * (1 - plan.discount / 100);
                const perMonth = discountedTotal / plan.months;

                return (
                  <div key={plan.months} className="flex items-center justify-between p-5 border-2 border-slate-100 rounded-[24px] bg-white">
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-black text-slate-800 text-base">{plan.label}</p>
                        {plan.discount > 0 && (
                          <span className="bg-emerald-500 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter">
                            -{plan.discount}% OFF
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">{plan.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-indigo-900">{formatCurrency(discountedTotal)}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">
                        {plan.months > 1 ? `${formatCurrency(perMonth)} / mês` : 'Pagamento único'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rodapé / Garantias */}
            <div className="bg-indigo-50 p-8 rounded-[32px] border border-indigo-100 flex items-center gap-6">
              <div className="bg-white p-4 rounded-2xl shadow-sm text-emerald-600">
                <ShieldCheck size={32} />
              </div>
              <div>
                <p className="font-black text-slate-800 text-base">Garantia de Performance & Suporte</p>
                <p className="text-xs text-slate-600 font-medium mt-1">Suporte técnico prioritário incluso e disponibilidade garantida de 99.9% para o seu sistema e website.</p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.3em]">
                Válido por 15 dias
              </p>
              <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">
                Lider Refrigeração
              </p>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default LiderQuoteView;