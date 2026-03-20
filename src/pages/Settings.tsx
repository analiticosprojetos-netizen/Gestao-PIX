"use client";

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Volume2, Vibrate, PlayCircle, ShieldCheck, BellRing } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { showSuccess, showError } from '@/utils/toast';

const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const [permissionStatus, setPermissionStatus] = useState(Notification.permission);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      showError("Navegador sem suporte a notificações.");
      return;
    }
    
    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
    
    if (permission === "granted") {
      showSuccess("Notificações liberadas!");
      // Tenta dar um 'toque' silencioso para destravar o áudio no Android
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0;
      audio.play().catch(() => {});
    } else {
      showError("Permissão negada no Android.");
    }
  };

  const testAlert = async () => {
    // 1. DISPARAR SOM IMEDIATAMENTE (Obrigatório no Android dentro do clique)
    if (settings.alerts.sound) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch((err) => {
        console.error("Erro ao tocar som:", err);
        showError("Erro no som. Tente interagir mais com a tela.");
      });
    }

    // 2. VIBRAR IMEDIATAMENTE
    if (settings.alerts.vibration && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    // 3. NOTIFICAÇÃO DE SISTEMA (Via Service Worker para aparecer na barra do Android)
    if (permissionStatus === "granted" && 'serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification("Teste de Alerta", {
        body: "Se você viu isso, o AlertaBoleto está configurado!",
        icon: "/icon.svg",
        badge: "/icon.svg",
        vibrate: [200, 100, 200],
        tag: 'teste-alerta'
      });
      showSuccess("Comando enviado ao Android!");
    } else if (permissionStatus !== "granted") {
      showError("Ative as notificações primeiro!");
    }
  };

  const toggleAlert = (key: keyof typeof settings.alerts) => {
    updateSettings({
      ...settings,
      alerts: { ...settings.alerts, [key]: !settings.alerts[key] }
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3">
          {permissionStatus !== "granted" ? (
            <Button 
              onClick={requestPermission}
              className="h-16 bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-3 font-bold rounded-2xl animate-pulse"
            >
              <BellRing size={24} />
              ATIVAR NOTIFICAÇÕES AGORA
            </Button>
          ) : (
            <Button 
              disabled
              className="h-16 bg-slate-100 text-emerald-600 border border-emerald-200 flex items-center justify-center gap-3 font-bold rounded-2xl"
            >
              <ShieldCheck size={24} />
              NOTIFICAÇÕES ATIVADAS
            </Button>
          )}
          
          <Button 
            onClick={testAlert}
            variant="outline" 
            className="h-14 border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center gap-2 font-bold rounded-2xl"
          >
            <PlayCircle size={20} />
            Testar Alerta Completo
          </Button>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Canais de Alerta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <Smartphone className="text-indigo-600" size={20} />
                <Label className="font-medium text-slate-700">Avisos na Barra do Celular</Label>
              </div>
              <Switch checked={settings.alerts.push} onCheckedChange={() => toggleAlert('push')} />
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <Volume2 className="text-indigo-600" size={20} />
                <Label className="font-medium text-slate-700">Tocar Som</Label>
              </div>
              <Switch checked={settings.alerts.sound} onCheckedChange={() => toggleAlert('sound')} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Vibrate className="text-indigo-600" size={20} />
                <Label className="font-medium text-slate-700">Vibrar Aparelho</Label>
              </div>
              <Switch checked={settings.alerts.vibration} onCheckedChange={() => toggleAlert('vibration')} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default Settings;