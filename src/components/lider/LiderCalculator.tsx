"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from 'lucide-react';

const LiderCalculator = () => {
  const [basePrice, setBasePrice] = useState(350);
  
  const plans = [
    { months: 1, label: 'Mensal', discount: 0 },
    { months: 6, label: 'Semestral', discount: 5 },
    { months: 12, label: 'Anual', discount: 10 },
    { months: 24, label: 'Bienal', discount: 15 },
  ];

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
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
      <CardContent className="grid grid-cols-2 gap-3 pt-2">
        {plans.map((plan) => {
          const total = basePrice * plan.months;
          const discountedTotal = total * (1 - plan.discount / 100);
          const perMonth = discountedTotal / plan.months;

          return (
            <div key={plan.months} className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                  {plan.label}
                </span>
                {plan.discount > 0 && (
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                    -{plan.discount}%
                  </span>
                )}
              </div>
              <p className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                {formatCurrency(discountedTotal)}
              </p>
              <p className="text-[9px] text-slate-500 font-medium">
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