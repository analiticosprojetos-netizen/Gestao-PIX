"use client";

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Volume2, Vibrate, PlayCircle, ShieldCheck, BellRing, Moon } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { showSuccess, showError } from '@/utils/toast';

const Settings = () => {
  const { settings, updateSettings, toggleTheme } = useSettings();
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
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0;
      audio.play().catch(() => {});
    } else {
      showError("Permissão negada.");
    }
  };

  const testAlert = async () => {
    if (settings.alerts.sound) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => {});
    }

    if (settings.alerts.vibration && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    if (permissionStatus === "granted" && 'serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification("Teste de Alerta", {
        body: "Se você viu isso, o AlertaBoleto está configurado!",
        icon: "/icon.svg",
        badge: "/icon.svg",
        vibrate: [200, 100, 200],
        tag: 'teste-alerta'
      });
      showSuccess("Comando enviado!");
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
              ATIVAR NOTIFICAÇÕES
            </Button>
          ) : (
            <Button 
              disabled
              className="h-16 bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center gap-3 font-bold rounded-2xl"
            >
              <ShieldCheck size={24} />
              NOTIFICAÇÕES ATIVAS
            </Button>
          )}
          
          <Button 
            onClick={testAlert}
            variant="outline" 
            className="h-14 border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl font-bold"
          >
            <PlayCircle size={20} className="mr-2" />
            Testar Alerta Completo
          </Button>
        </div>

        <Card className="border-none shadow-sm dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Aparência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Moon className="text-indigo-600 dark:text-indigo-400" size={20} />
                <Label className="font-medium text-slate-700 dark:text-slate-300">Modo Escuro (Lua)</Label>
              </div>
              <Switch checked={settings.theme === 'dark'} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Canais de Alerta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Smartphone className="text-indigo-600 dark:text-indigo-400" size={20} />
                <Label className="font-medium text-slate-700 dark:text-slate-300">Avisos no Celular</Label>
              </div>
              <Switch checked={settings.alerts.push} onCheckedChange={() => toggleAlert('push')} />
            </div>
            <div className="flex items-center justify-between py-2 border-b dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Volume2 className="text-indigo-600 dark:text-indigo-400" size={20} />
                <Label className="font-medium text-slate-700 dark:text-slate-300">Tocar Som</Label>
              </div>
              <Switch checked={settings.alerts.sound} onCheckedChange={() => toggleAlert('sound')} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Vibrate className="text-indigo-600 dark:text-indigo-400" size={20} />
                <Label className="font-medium text-slate-700 dark:text-slate-300">Vibrar Aparelho</Label>
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