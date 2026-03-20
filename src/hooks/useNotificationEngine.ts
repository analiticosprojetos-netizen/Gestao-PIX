"use client";

import { useEffect, useCallback } from 'react';
import { useBills } from '@/context/BillContext';
import { useSettings } from '@/context/SettingsContext';
import { differenceInDays } from 'date-fns';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/lib/supabase';

export const useNotificationEngine = () => {
  const { bills } = useBills();
  const { settings } = useSettings();

  // Função para inscrever o navegador no sistema de Push do navegador
  const subscribeToPush = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Verifica se já existe uma inscrição
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription && Notification.permission === 'granted') {
        // Aqui você precisaria de uma VAPID_PUBLIC_KEY real para produção
        // Por enquanto, vamos apenas garantir que a permissão foi pedida
        console.log("Pronto para receber push. Em produção, registraríamos o endpoint aqui.");
      }

      // Se tivermos a inscrição, poderíamos salvá-la no Supabase vinculada ao usuário
      if (subscription) {
        // await supabase.from('push_subscriptions').upsert({ subscription });
      }
    } catch (error) {
      console.error("Erro ao configurar push:", error);
    }
  }, []);

  const triggerAlert = useCallback((billTitle: string) => {
    // Alerta visual quando o app ESTÁ aberto
    showError(`ALERTA CRÍTICO: O boleto "${billTitle}" vence em breve!`);

    // Som e Vibração
    if (settings.alerts.sound) {
      new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
    }
    if (settings.alerts.vibration && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200, 100, 500]);
    }
  }, [settings.alerts]);

  useEffect(() => {
    // Pede permissão e tenta inscrever
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') subscribeToPush();
      });
    }

    const checkBills = () => {
      const today = new Date();
      const lastAlertsStr = localStorage.getItem('last_intensive_alerts') || '{}';
      const lastAlerts = JSON.parse(lastAlertsStr);
      const todayKey = today.toISOString().split('T')[0];

      let updated = false;
      bills.forEach(bill => {
        if (bill.paid) return;
        const daysLeft = differenceInDays(new Date(bill.dueDate), today);
        
        if (daysLeft >= 0 && daysLeft <= settings.intervals.third) {
          const billAlertKey = `${bill.id}_${todayKey}`;
          if ((lastAlerts[billAlertKey] || 0) < 3) {
            triggerAlert(bill.title);
            lastAlerts[billAlertKey] = (lastAlerts[billAlertKey] || 0) + 1;
            updated = true;
          }
        }
      });
      if (updated) localStorage.setItem('last_intensive_alerts', JSON.stringify(lastAlerts));
    };

    checkBills();
    const interval = setInterval(checkBills, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, [bills, settings, triggerAlert, subscribeToPush]);
};