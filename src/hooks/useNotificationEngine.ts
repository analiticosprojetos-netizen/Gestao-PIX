"use client";

import { useEffect, useCallback } from 'react';
import { useBills } from '@/context/BillContext';
import { useSettings } from '@/context/SettingsContext';
import { differenceInDays } from 'date-fns';
import { supabase } from '@/lib/supabase';

export const useNotificationEngine = () => {
  const { bills } = useBills();
  const { settings } = useSettings();

  const triggerSystemNotification = useCallback((title: string, body: string) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    // Criar a notificação visual do sistema
    const n = new Notification(title, {
      body,
      icon: '/placeholder.svg',
      vibrate: [200, 100, 200]
    });

    // Tocar som se estiver ativo
    if (settings.alerts.sound) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.log("Som bloqueado pelo navegador", e));
    }

    // Vibrar se estiver ativo
    if (settings.alerts.vibration && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }, [settings]);

  const subscribeToPush = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription && Notification.permission === 'granted') {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BIdyGZ0H7h5Xm8D8Z6C6_TzU5p5v5D5v5D5v5D5v5D5v5D5v5D5v5D5v5D5v5D5v5D5v5D5v5D5v'
        });
      }

      if (subscription) {
        await supabase.from('push_subscriptions').upsert({ 
          subscription: subscription.toJSON(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'subscription' });
      }
    } catch (error) {
      console.error("Push subscription error:", error);
    }
  }, []);

  useEffect(() => {
    if (Notification.permission === 'granted') {
      subscribeToPush();
    }

    const checkBills = () => {
      const today = new Date();
      bills.forEach(bill => {
        if (bill.paid) return;
        const daysLeft = differenceInDays(new Date(bill.dueDate), today);
        
        // Se vencer hoje ou em 1 dia, dispara notificação do sistema
        if (daysLeft === 0 || daysLeft === 1) {
          triggerSystemNotification(
            "⚠️ Boleto Vencendo!", 
            `O boleto "${bill.title}" vence ${daysLeft === 0 ? 'hoje' : 'amanhã'}! R$ ${bill.amount.toFixed(2)}`
          );
        }
      });
    };

    // Checar ao carregar e a cada 30 minutos
    checkBills();
    const interval = setInterval(checkBills, 1000 * 60 * 30);
    return () => clearInterval(interval);
  }, [bills, triggerSystemNotification, subscribeToPush]);
};