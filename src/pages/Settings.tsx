"use client";

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Volume2, Vibrate, PlayCircle, ShieldCheck, BellRing, Share, PlusSquare } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { showSuccess, showError } from '@/utils/toast';

const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const [permissionStatus, setPermissionStatus] = useState(Notification.permission);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      showError("Este navegador não suporta notificações.");
      return;
    }
    
    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
    
    if (permission === "granted") {
      showSuccess("Notificações ativadas!");
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
        {!isStandalone && (
          <Card className="border-indigo-200 bg-indigo-50 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-indigo-900 text-sm flex items-center gap-2">
                <Smartphone size={18} />
                Como instalar no Celular
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-indigo-700 space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-white p-1 rounded border border-indigo-200">
                  <Share size={14} className="text-indigo-600" />
                </div>
                <p>No <b>iPhone</b>, toque no botão de <b>Compartilhar</b> abaixo.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-white p-1 rounded border border-indigo-200">
                  <PlusSquare size={14} className="text-indigo-600" />
                </div>
                <p>Role para baixo e toque em <b>"Adicionar à Tela de Início"</b>.</p>
              </div>
              <p className="bg-indigo-600 text-white p-2 rounded-lg text-center font-bold">
                Isso ativa o ícone e os alertas!
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-3">
          {permissionStatus !== "granted" ? (
            <Button 
              onClick={requestPermission}
              className="h-16 bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-3 font-bold rounded-2xl animate-pulse"
            >
              <BellRing size={24} />
              ATIVAR ALERTAS AGORA
            </Button>
          ) : (
            <Button 
              disabled
              className="h-16 bg-slate-100 text-emerald-600 border border-emerald-200 flex items-center justify-center gap-3 font-bold rounded-2xl"
            >
              <ShieldCheck size={24} />
              ALERTAS ATIVADOS
            </Button>
          )}
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Canais de Alerta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <Volume2 className="text-indigo-600" size={20} />
                <Label>Som do Alerta</Label>
              </div>
              <Switch checked={settings.alerts.sound} onCheckedChange={() => toggleAlert('sound')} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Vibrate className="text-indigo-600" size={20} />
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