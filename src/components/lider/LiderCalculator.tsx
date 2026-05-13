"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Percent } from 'lucide-react';

const LiderCalculator = () => {
  const basePrice = 350;
  
  const plans = [
    { months: 1, label: 'Mensal', discount: 0 },
    { months: 6, label: 'Semestral', discount: 5 },
    { months: 12, label: 'Anual', discount: 10 },
    { months: 24, label: 'Bienal', discount: 15 },
  ];

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <Card className="border-none shadow-sm bg-indigo-50 dark:bg-indigo-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
          <Calculator size={18} />
          Simulador de Planos (Base R$ 350,00)
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {plans.map((plan) => {
          const total = basePrice * plan.months;
          const discountedTotal = total * (1 - plan.discount / 100);
          const perMonth = discountedTotal / plan.months;

          return (
            <div key={plan.months} className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">{plan.label}</span>
                {plan.discount > 0 && (
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                    -{plan.discount}%
                  </span>
                )}
              </div>
              <p className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                {formatCurrency(discountedTotal)}
              </p>
              <p className="text-[9px] text-slate-500">
                {plan.months > 1 ? `${formatCurrency(perMonth)} /mês` : 'Pagamento único'}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default LiderCalculator;