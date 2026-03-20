"use client";

import { useEffect, useCallback } from 'react';
import { useBills } from '@/context/BillContext';
import { useSettings } from '@/context/SettingsContext';
import { differenceInDays, isSameDay } from 'date-fns';
import { showSuccess, showError } from '@/utils/toast';

export const useNotificationEngine = () => {
  const { bills } = useBills();
  const { settings } = useSettings();

  const triggerAlert = useCallback((billTitle: string) => {
    // 1. Notificação Visual (Toast)
    showError(`ALERTA CRÍTICO: O boleto "${billTitle}" vence em breve!`);

    // 2. Notificação do Navegador (Push)
    if (settings.alerts.push && "Notification" in window && Notification.permission === "granted") {
      new Notification("Alerta de Boleto", {
        body: `O boleto "${billTitle}" vence em breve. Pague agora para evitar juros!`,
        icon: "/placeholder.svg"
      });
    }

    // 3. Som
    if (settings.alerts.sound) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.log("Audio play blocked", e));
    }

    // 4. Vibração
    if (settings.alerts.vibration && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200, 100, 500]);
    }
  }, [settings.alerts]);

  useEffect(() => {
    // Solicitar permissão de notificação
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const checkBills = () => {
      const today = new Date();
      const lastAlertsStr = localStorage.getItem('last_intensive_alerts') || '{}';
      const lastAlerts = JSON.parse(lastAlertsStr);
      const todayKey = today.toISOString().split('T')[0];

      let updated = false;

      bills.forEach(bill => {
        if (bill.paid) return;

        const daysLeft = differenceInDays(bill.dueDate, today);
        
        // Se estiver dentro da janela do "Alerta 3" (ex: 3 dias)
        if (daysLeft >= 0 && daysLeft <= settings.intervals.third) {
          const billAlertKey = `${bill.id}_${todayKey}`;
          const alertCount = lastAlerts[billAlertKey] || 0;

          // Se ainda não disparou 3 vezes hoje
          if (alertCount < 3) {
            triggerAlert(bill.title);
            lastAlerts[billAlertKey] = alertCount + 1;
            updated = true;
          }
        }
      });

      if (updated) {
        localStorage.setItem('last_intensive_alerts', JSON.stringify(lastAlerts));
      }
    };

    // Executa uma vez ao carregar e depois a cada 1 hora para verificar novamente
    checkBills();
    const interval = setInterval(checkBills, 1000 * 60 * 60); // 1 hora
    
    return () => clearInterval(interval);
  }, [bills, settings, triggerAlert]);
};