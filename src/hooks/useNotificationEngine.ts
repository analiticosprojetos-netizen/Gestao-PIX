"use client";

import { useEffect, useCallback, useRef } from 'react';
import { useBills } from '@/context/BillContext';
import { useSettings } from '@/context/SettingsContext';
import { differenceInDays, startOfDay } from 'date-fns';
import { showError } from '@/utils/toast';

export const useNotificationEngine = () => {
  const { bills } = useBills();
  const { settings } = useSettings();
  const hasInteracted = useRef(false);
  const pendingAlerts = useRef<string[]>([]);

  const playAlertEffects = useCallback(() => {
    if (!settings.alerts.sound && !settings.alerts.vibration) return;

    // Tenta tocar o som (precisa de interação prévia)
    if (settings.alerts.sound) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 1.0;
      audio.play().catch(() => console.log("Aguardando toque para som..."));
    }

    // Vibração (precisa de interação prévia)
    if (settings.alerts.vibration && "vibrate" in navigator) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }
  }, [settings]);

  const checkAndNotify = useCallback(() => {
    const today = startOfDay(new Date());
    
    bills.forEach(bill => {
      if (bill.paid) return;

      const dueDate = startOfDay(new Date(bill.dueDate));
      const daysLeft = differenceInDays(dueDate, today);

      // Se vence hoje ou está atrasado
      if (daysLeft <= 0) {
        const msg = `${bill.title} - VENCE ${daysLeft === 0 ? 'HOJE' : 'ATRASADO'}!`;
        
        // Alerta visual imediato (sempre funciona)
        showError(msg);

        // Se o usuário já tocou na tela, toca som agora. 
        // Se não, guarda para tocar no primeiro toque.
        if (hasInteracted.current) {
          playAlertEffects();
        } else {
          pendingAlerts.current.push(msg);
        }
      }
    });
  }, [bills, playAlertEffects]);

  useEffect(() => {
    // Monitora o primeiro clique/toque na tela para "destravar" o áudio
    const handleFirstInteraction = () => {
      if (hasInteracted.current) return;
      hasInteracted.current = true;
      
      if (pendingAlerts.current.length > 0) {
        playAlertEffects();
        pendingAlerts.current = []; // Limpa fila
      }
      
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    if (bills.length > 0) {
      checkAndNotify();
    }

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [bills, checkAndNotify, playAlertEffects]);
};