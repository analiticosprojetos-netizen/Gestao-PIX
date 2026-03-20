"use client";

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceCommand } from '@/hooks/useVoiceCommand';
import { cn } from '@/lib/utils';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const { processCommand } = useVoiceCommand();

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
    }
  }, []);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      processCommand(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <div className="relative">
        {isListening && (
          <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-75" />
        )}
        <Button
          onClick={startListening}
          className={cn(
            "h-14 w-14 rounded-full shadow-2xl transition-all active:scale-90",
            isListening ? "bg-rose-500 hover:bg-rose-600" : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500"
          )}
        >
          {isListening ? <Loader2 className="animate-spin" /> : <Mic size={28} />}
        </Button>
      </div>
      
      {isListening && (
        <div className="absolute bottom-16 right-0 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl border dark:border-slate-700 w-48 text-center animate-in fade-in slide-in-from-bottom-2">
          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Ouvindo...</p>
          <p className="text-[10px] text-slate-500 mt-1 italic">"Pagar luz", "Novo aluguel 1000"...</p>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;