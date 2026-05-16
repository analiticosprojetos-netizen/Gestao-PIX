"use client";

import React, { useRef, useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X, Download, Globe, Cpu, ShieldCheck, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LiderQuoteViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  basePrice: number;
}

const LiderQuoteView = ({ open, onOpenChange, basePrice }: LiderQuoteViewProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const quoteRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  const siteValue = basePrice * 0.33;
  const systemValue = basePrice * 0.67;

  const plans = [
    { months: 1, label: 'Plano Mensal', discount: 0, desc: 'Ideal para começar' },
    { months: 6, label: 'Plano Semestral', discount: 5, desc: 'Economia de 5%' },
    { months: 12, label: 'Plano Anual', discount: 10, desc: 'Melhor custo-benefício' },
    { months: 24, label: 'Plano Bienal', discount: 15, desc: 'Máxima economia' },
  ];

  const handleDownloadPDF = async () => {
    if (!quoteRef.current) return;
    
    setIsGenerating(true);
    try {
      const html2canvas = (window as any).html2canvas;
      const { jsPDF } = (window as any).jspdf;

      const element = quoteRef.current;
      
      // Captura o elemento com scroll total para não cortar
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollY: -window.scrollY, // Corrige problemas de scroll
        windowWidth: 800,
        height: element.scrollHeight, // Força a altura total do conteúdo
        windowHeight: element.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Calcula dimensões para o PDF
      const imgWidth = 210; // Largura A4 em mm
      const pageHeight = 297; // Altura A4 em mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Se a imagem for maior que uma página A4, criamos um PDF com altura customizada ou múltiplas páginas
      // Aqui vamos usar altura customizada para manter o design em uma única folha longa (comum em orçamentos digitais)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: imgHeight > pageHeight ? [imgWidth, imgHeight] : 'a4'
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Orcamento_Lider_${format(new Date(), 'dd_MM_yyyy')}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-white dark:bg-slate-950 border-none rounded-t-[32px] max-w-2xl mx-auto h-[95vh]">
        <div className="mx-auto w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full my-4" />
        
        <div className="flex justify-between items-center px-6 mb-2">
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full">
            <X size={24} />
          </Button>
          <Button 
            className="rounded-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 px-6" 
            onClick={handleDownloadPDF}
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isGenerating ? 'Gerando PDF...' : 'Baixar Orçamento (PDF)'}
          </Button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-4 bg-slate-100 dark:bg-slate-900/50">
            <div 
              ref={quoteRef} 
              className="bg-white text-slate-900 shadow-2xl mx-auto p-10 rounded-[8px] w-full max-w-[700px]"
              style={{ minHeight: 'fit-content' }}
            >
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
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default LiderQuoteView;