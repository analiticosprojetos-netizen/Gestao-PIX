"use client";

import React from 'react';
import { Loader2, Mic, Check, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceAssistantProps {
  isListening: boolean;
  transcript: string;
  onConfirm: () => void;
  onRetry: () => void;
  onClose: () => void;
}

const VoiceAssistant = ({ isListening, transcript, onConfirm, onRetry, onClose }: VoiceAssistantProps) => {
  if (!isListening && !transcript) return null;

  // Capitaliza a primeira letra do texto reconhecido para exibição amigável
  const formattedTranscript = transcript 
    ? transcript.charAt(0).toUpperCase() + transcript.slice(1) 
    : '';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-[90%] max-w-sm p-8 rounded-[40px] shadow-2xl flex flex-col items-center gap-6 border dark:border-slate-800 animate-in zoom-in-95 duration-300 relative">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X size={24} />
        </button>

        {isListening && !transcript ? (
          <>
            <div className="relative">
              <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-30" />
              <div className="relative h-20 w-20 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg">
                <Mic size={40} className="animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-bold text-slate-800 dark:text-white">Estou ouvindo...</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">"Pagar luz", "Novo aluguel 1200"...</p>
            </div>
            <div className="flex items-center gap-2 text-rose-500 font-medium text-sm">
              <Loader2 className="animate-spin" size={16} />
              Gravando áudio
            </div>
          </>
        ) : (
          <>
            <div className="w-full space-y-4">
              <div className="text-center">
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Eu entendi:</p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border-2 border-indigo-100 dark:border-indigo-900/30 min-h-[100px] flex items-center justify-center text-center">
                <p className="text-xl font-medium text-slate-800 dark:text-white leading-relaxed">
                  "{formattedTranscript}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button 
                  onClick={onRetry}
                  variant="outline" 
                  className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold flex gap-2"
                >
                  <RotateCcw size={20} />
                  Corrigir
                </Button>
                <Button 
                  onClick={onConfirm}
                  className="h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex gap-2 shadow-lg shadow-emerald-100 dark:shadow-none"
                >
                  <Check size={20} />
                  Confirmar
                </Button>
              </div>
              <p className="text-[10px] text-center text-slate-400">Você também pode dizer "OK" para confirmar</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;