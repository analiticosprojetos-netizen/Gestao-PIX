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

  const saveSubscriptionToDB = useCallback(async (subscription: PushSubscription) => {
    try {
      // Salva ou atualiza a inscrição no banco de dados
      // Precisamos da tabela 'push_subscriptions' no Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({ 
          subscription: subscription.toJSON(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'subscription' });

      if (error) throw error;
      console.log("Celular inscrito para receber alertas offline!");
    } catch (err) {
      console.error("Erro ao salvar inscrição no banco:", err);
    }
  }, []);

  const subscribeToPush = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription && Notification.permission === 'granted') {
        // Em produção, você usaria uma VAPID_PUBLIC_KEY real aqui
        // Para teste, o navegador pode gerar uma inscrição básica
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BIdyGZ0H7h5Xm8D8Z6C6_TzU5p5v5D5v5D5v5D5v5D5v5D5v5D5v5D5v5D5v5D5v5D5v5D5v5D5v' // Placeholder
        });
      }

      if (subscription) {
        await saveSubscriptionToDB(subscription);
      }
    } catch (error) {
      console.error("Erro ao configurar push:", error);
    }
  }, [saveSubscriptionToDB]);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') subscribeToPush();
      });
    }

    // Alertas locais (quando o app está aberto)
    const checkBills = () => {
      const today = new Date();
      bills.forEach(bill => {
        if (bill.paid) return;
        const daysLeft = differenceInDays(new Date(bill.dueDate), today);
        if (daysLeft >= 0 && daysLeft <= settings.intervals.third) {
          showError(`ALERTA: O boleto "${bill.title}" vence em breve!`);
        }
      });
    };

    checkBills();
    const interval = setInterval(checkBills, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, [bills, settings, subscribeToPush]);
};