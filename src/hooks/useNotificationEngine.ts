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

  const triggerSystemNotification = useCallback((title: string, body: string) => {
    if (Notification.permission === "granted" && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          body: body,
          icon: '/icon.svg',
          badge: '/icon.svg',
          vibrate: [500, 200, 500],
          tag: 'alerta-boleto'
        });
      });
    }
  }, []);

  const playAlertEffects = useCallback(() => {
    if (settings.alerts.sound) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => {});
    }
    if (settings.alerts.vibration && "vibrate" in navigator) {
      navigator.vibrate([500, 200, 500]);
    }
  }, [settings]);

  const checkAndNotify = useCallback(() => {
    const today = startOfDay(new Date());
    
    bills.forEach(bill => {
      if (bill.paid) return;

      const dueDate = startOfDay(new Date(bill.dueDate));
      const daysLeft = differenceInDays(dueDate, today);

      if (daysLeft <= 0) {
        const title = daysLeft === 0 ? "Boleto vence HOJE!" : "Boleto ATRASADO!";
        const message = `${bill.title} - R$ ${bill.amount.toFixed(2)}`;

        // Mostra a notificação REAL do Android (fora do app)
        triggerSystemNotification(title, message);
        
        // Mostra o aviso visual dentro do app
        showError(`${title}: ${message}`);

        if (hasInteracted.current) {
          playAlertEffects();
        }
      }
    });
  }, [bills, triggerSystemNotification, playAlertEffects]);

  useEffect(() => {
    const handleInteraction = () => {
      hasInteracted.current = true;
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    if (bills.length > 0) {
      checkAndNotify();
    }

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [bills, checkAndNotify]);
};