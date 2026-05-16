"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Info, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LiderQuoteView from './LiderQuoteView';

const LiderCalculator = () => {
  const [basePrice, setBasePrice] = useState(210);
  const [quoteOpen, setQuoteOpen] = useState(false);
  
  const plans = [
    { months: 1, label: '1 mês', discount: 0 },
    { months: 6, label: '6 meses', discount: 5 },
    { months: 12, label: '1 ano', discount: 10 },
    { months: 24, label: '2 anos', discount: 15 },
  ];

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Distribuição: 1/3 para Site, 2/3 para Sistema
  const siteValue = basePrice / 3;
  const systemValue = basePrice - siteValue;

  return (
    <>
      <Card className="border-none shadow-sm bg-indigo-50 dark:bg-indigo-950/20">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
            <Calculator size={18} />
            Cálculos de planos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="basePrice" className="text-[10px] font-bold text-indigo-600 uppercase">Base:</Label>
            <Input 
              id="basePrice"
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              className="h-7 w-20 text-xs font-bold rounded-lg border-indigo-200 bg-white dark:bg-slate-900"
            />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Detalhamento da Distribuição */}
          <div className="bg-white/50 dark:bg-slate-900/50 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
              <Info size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Distribuição do Valor Base</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Site (33%)</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white">{formatCurrency(siteValue)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Sistema (67%)</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white">{formatCurrency(systemValue)}</p>
              </div>
              <div className="border-l border-indigo-100 dark:border-indigo-900/30 pl-2">
                <p className="text-[10px] text-indigo-600 font-bold uppercase">Total</p>
                <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">{formatCurrency(basePrice)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {plans.map((plan) => {
              const total = basePrice * plan.months;
              const discountedTotal = total * (1 - plan.discount / 100);
              const perMonth = discountedTotal / plan.months;

              return (
                <div key={plan.months} className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                      {plan.label}
                    </span>
                    {plan.discount > 0 && (
                      <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                        -{plan.discount}%
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-base font-bold text-slate-800 dark:text-white leading-tight">
                      {formatCurrency(discountedTotal)}
                    </p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Total</p>
                  </div>

                  <p className="text-[10px] text-slate-500 font-medium border-t border-slate-50 dark:border-slate-800 pt-1 mt-1">
                    {plan.months > 1 ? `${formatCurrency(perMonth)} /mês` : 'Pagamento único'}
                  </p>
                </div>
              );
            })}
          </div>

          <Button 
            onClick={() => setQuoteOpen(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-2xl font-bold gap-2 shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <FileText size={20} />
            Gerar Orçamento para Cliente
          </Button>
        </CardContent>
      </Card>

      <LiderQuoteView 
        open={quoteOpen} 
        onOpenChange={setQuoteOpen} 
        basePrice={basePrice} 
      />
    </>
  );
};

export default LiderCalculator;