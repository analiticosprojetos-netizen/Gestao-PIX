"use client";

import React from 'react';
import { Loader2, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceAssistantProps {
  isListening: boolean;
}

const VoiceAssistant = ({ isListening }: VoiceAssistantProps) => {
  if (!isListening) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-2xl flex flex-col items-center gap-6 border dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className="relative">
          <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-30" />
          <div className="relative h-20 w-20 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg">
            <Mic size={40} className="animate-pulse" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-xl font-bold text-slate-800 dark:text-white">Estou ouvindo...</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[200px]">
            "Pagar luz", "Novo aluguel 1200", "Excluir internet"...
          </p>
        </div>

        <div className="flex items-center gap-2 text-rose-500 font-medium text-sm">
          <Loader2 className="animate-spin" size={16} />
          Gravando áudio
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;