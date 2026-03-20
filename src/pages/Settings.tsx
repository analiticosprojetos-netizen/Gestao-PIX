"use client";

import React from 'react';
import AppShell from '@/components/layout/AppShell';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Mail, BellRing, Smartphone, Volume2, Vibrate, PlayCircle, Phone } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { showSuccess, showError } from '@/utils/toast';

const Settings = () => {
  const { settings, updateSettings } = useSettings();

  const toggleAlert = (key: keyof typeof settings.alerts) => {
    updateSettings({
      ...settings,
      alerts: { ...settings.alerts, [key]: !settings.alerts[key] }
    });
    showSuccess("Configuração atualizada!");
  };

  const updateContact = (key: keyof typeof settings.contact, value: string) => {
    updateSettings({
      ...settings,
      contact: { ...settings.contact, [key]: value }
    });
  };

  const updateInterval = (key: keyof typeof settings.intervals, value: string) => {
    const numValue = parseInt(value) || 0;
    updateSettings({
      ...settings,
      intervals: { ...settings.intervals, [key]: numValue }
    });
  };

  const testAlert = () => {
    showError("TESTE: Alerta de vencimento disparado!");

    if (settings.alerts.push && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Teste de Alerta", {
          body: "Este é um teste do AlertaBoleto. Se você recebeu isso, o push está OK!",
          icon: "/placeholder.svg"
        });
      } else {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification("Permissão Concedida!", { body: "Agora você receberá alertas." });
          }
        });
      }
    }

    if (settings.alerts.sound) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => showError("Clique na tela antes de testar o som!"));
    }

    if (settings.alerts.vibration && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <Button 
          onClick={testAlert}
          variant="outline" 
          className="w-full h-14 border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center gap-2 font-bold rounded-2xl"
        >
          <PlayCircle size={24} />
          Testar Alerta Crítico Agora
        </Button>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Dados de Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone-input" className="flex items-center gap-2">
                <Phone size={16} className="text-slate-500" /> WhatsApp / SMS
              </Label>
              <Input 
                id="phone-input"
                placeholder="(00) 00000-0000"
                value={settings.contact.phoneNumber}
                onChange={(e) => updateContact('phoneNumber', e.target.value)}
                className="bg-slate-50 border-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-input" className="flex items-center gap-2">
                <Mail size={16} className="text-slate-500" /> E-mail de Alerta
              </Label>
              <Input 
                id="email-input"
                type="email"
                placeholder="seu@email.com"
                value={settings.contact.email}
                onChange={(e) => updateContact('email', e.target.value)}
                className="bg-slate-50 border-none"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Canais de Notificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <Smartphone className="text-indigo-600" size={20} />
                <Label htmlFor="push">Notificação Push</Label>
              </div>
              <Switch 
                id="push" 
                checked={settings.alerts.push} 
                onCheckedChange={() => toggleAlert('push')} 
              />
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <MessageSquare className="text-emerald-500" size={20} />
                <Label htmlFor="whatsapp">WhatsApp</Label>
              </div>
              <Switch 
                id="whatsapp" 
                checked={settings.alerts.whatsapp} 
                onCheckedChange={() => toggleAlert('whatsapp')} 
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <Mail className="text-amber-500" size={20} />
                <Label htmlFor="email">E-mail</Label>
              </div>
              <Switch 
                id="email" 
                checked={settings.alerts.email} 
                onCheckedChange={() => toggleAlert('email')} 
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <BellRing className="text-slate-500" size={20} />
                <Label htmlFor="sms">SMS</Label>
              </div>
              <Switch 
                id="sms" 
                checked={settings.alerts.sms} 
                onCheckedChange={() => toggleAlert('sms')} 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Som e Vibração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 size={20} />
                <Label htmlFor="sound">Sinal Sonoro</Label>
              </div>
              <Switch 
                id="sound" 
                checked={settings.alerts.sound} 
                onCheckedChange={() => toggleAlert('sound')} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Vibrate size={20} />
                <Label htmlFor="vibration">Vibrar</Label>
              </div>
              <Switch 
                id="vibration" 
                checked={settings.alerts.vibration} 
                onCheckedChange={() => toggleAlert('vibration')} 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Intervalos de Alerta (Dias)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase text-slate-500">Alerta 1</Label>
              <Input 
                type="number" 
                value={settings.intervals.first} 
                onChange={(e) => updateInterval('first', e.target.value)}
                className="text-center font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase text-slate-500">Alerta 2</Label>
              <Input 
                type="number" 
                value={settings.intervals.second} 
                onChange={(e) => updateInterval('second', e.target.value)}
                className="text-center font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase text-slate-500">Alerta 3</Label>
              <Input 
                type="number" 
                value={settings.intervals.third} 
                onChange={(e) => updateInterval('third', e.target.value)}
                className="text-center font-bold"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default Settings;