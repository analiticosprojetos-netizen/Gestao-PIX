"use client";

import { useEffect, useCallback, useRef } from 'react';
import { useBills } from '@/context/BillContext';
import { useSettings } from '@/context/SettingsContext';
import { differenceInDays } from 'date-fns';
import { showError } from '@/utils/toast';
import { supabase } from '@/lib/supabase';

export const useNotificationEngine = () => {
  const { bills } = useBills();
  const { settings } = useSettings();
  const notifiedRef = useRef<Set<string>>(new Set());

  const triggerSystemNotification = useCallback((title: string, body: string, billId: string) => {
    // 1. Alerta visual (Sonner) - Sempre funciona ao abrir o link
    showError(`${title}: ${body}`);

    // 2. Notificação do Sistema (se permitido)
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: '/placeholder.svg',
        tag: billId // Evita repetir a mesma notificação
      });
    }

    // 3. Som (Pode ser bloqueado se não houver interação prévia)
    if (settings.alerts.sound) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => {
        console.log("Áudio aguardando interação do usuário para tocar");
      });
    }

    // 4. Vibração
    if (settings.alerts.vibration && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }, [settings]);

  useEffect(() => {
    const checkBills = () => {
      const today = new Date();
      bills.forEach(bill => {
        if (bill.paid) return;
        
        // Evita disparar 50 vezes pro mesmo boleto na mesma sessão
        if (notifiedRef.current.has(bill.id)) return;

        const daysLeft = differenceInDays(new Date(bill.dueDate), today);
        
        if (daysLeft <= 1) {
          triggerSystemNotification(
            "⚠️ BOLETO VENCENDO", 
            `${bill.title} (${daysLeft === 0 ? 'HOJE' : 'AMANHÃ'})`,
            bill.id
          );
          notifiedRef.current.add(bill.id);
        }
      });
    };

    // Tenta rodar assim que os boletos carregarem
    if (bills.length > 0) {
      checkBills();
    }

    const interval = setInterval(checkBills, 1000 * 60 * 5); // Checa a cada 5 min
    return () => clearInterval(interval);
  }, [bills, triggerSystemNotification]);

  // Tenta registrar o Push em segundo plano se tiver permissão
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      const registerPush = async () => {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          await supabase.from('push_subscriptions').upsert({ 
            subscription: sub.toJSON(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'subscription' });
        }
      };
      registerPush();
    }
  }, []);
};