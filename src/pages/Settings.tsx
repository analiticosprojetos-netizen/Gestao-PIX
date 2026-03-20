"use client";

import React from 'react';
import AppShell from '@/components/layout/AppShell';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Mail, BellRing, Smartphone, Volume2, Vibrate, PlayCircle, Phone, ShieldCheck } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { showSuccess, showError } from '@/utils/toast';

const Settings = () => {
  const { settings, updateSettings } = useSettings();

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      showError("Este navegador não suporta notificações.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      showSuccess("Notificações ativadas com sucesso!");
    } else {
      showError("Permissão de notificação negada.");
    }
  };

  const testAlert = () => {
    if (settings.alerts.push && Notification.permission === "granted") {
      new Notification("Teste de Alerta", {
        body: "Se você recebeu isso, as notificações estão configuradas!",
        icon: "/placeholder.svg"
      });
    } else if (Notification.permission !== "granted") {
      showError("Ative as notificações no botão acima primeiro!");
    }

    if (settings.alerts.sound) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => showError("Toque na tela para permitir o som!"));
    }

    if (settings.alerts.vibration && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    
    showSuccess("Teste disparado!");
  };

  const toggleAlert = (key: keyof typeof settings.alerts) => {
    updateSettings({
      ...settings,
      alerts: { ...settings.alerts, [key]: !settings.alerts[key] }
    });
  };

  const updateContact = (key: keyof typeof settings.contact, value: string) => {
    updateSettings({ ...settings, contact: { ...settings.contact, [key]: value } });
  };

  const updateInterval = (key: keyof typeof settings.intervals, value: string) => {
    const numValue = parseInt(value) || 0;
    updateSettings({ ...settings, intervals: { ...settings.intervals, [key]: numValue } });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={requestPermission}
            className="h-14 bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2 font-bold rounded-2xl"
          >
            <ShieldCheck size={20} />
            Ativar Permissões
          </Button>
          <Button 
            onClick={testAlert}
            variant="outline" 
            className="h-14 border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center gap-2 font-bold rounded-2xl"
          >
            <PlayCircle size={20} />
            Testar Agora
          </Button>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Dados de Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Phone size={16} /> WhatsApp / Celular</Label>
              <Input 
                placeholder="(00) 00000-0000"
                value={settings.contact.phoneNumber}
                onChange={(e) => updateContact('phoneNumber', e.target.value)}
                className="bg-slate-50 border-none"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Canais de Alerta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <Smartphone className="text-indigo-600" size={20} />
                <Label>Notificação Push (No Celular)</Label>
              </div>
              <Switch checked={settings.alerts.push} onCheckedChange={() => toggleAlert('push')} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Volume2 className="text-slate-500" size={20} />
                <Label>Som do Alerta</Label>
              </div>
              <Switch checked={settings.alerts.sound} onCheckedChange={() => toggleAlert('sound')} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Vibrate className="text-slate-500" size={20} />
                <Label>Vibrar Aparelho</Label>
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