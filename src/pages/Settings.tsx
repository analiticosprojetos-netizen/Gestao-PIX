"use client";

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Mail, BellRing, Smartphone, Volume2, Vibration } from 'lucide-react';

const Settings = () => {
  const [alerts, setAlerts] = useState({
    sms: false,
    whatsapp: true,
    email: true,
    push: true,
    sound: true,
    vibration: true
  });

  const [intervals, setIntervals] = useState({
    first: 15,
    second: 7,
    third: 3
  });

  const toggleAlert = (key: keyof typeof alerts) => {
    setAlerts({ ...alerts, [key]: !alerts[key] });
  };

  return (
    <AppShell>
      <div className="space-y-6">
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
              <Switch id="push" checked={alerts.push} onCheckedChange={() => toggleAlert('push')} />
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <MessageSquare className="text-emerald-500" size={20} />
                <Label htmlFor="whatsapp">WhatsApp</Label>
              </div>
              <Switch id="whatsapp" checked={alerts.whatsapp} onCheckedChange={() => toggleAlert('whatsapp')} />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <Mail className="text-amber-500" size={20} />
                <Label htmlFor="email">E-mail</Label>
              </div>
              <Switch id="email" checked={alerts.email} onCheckedChange={() => toggleAlert('email')} />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <BellRing className="text-slate-500" size={20} />
                <Label htmlFor="sms">SMS</Label>
              </div>
              <Switch id="sms" checked={alerts.sms} onCheckedChange={() => toggleAlert('sms')} />
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
              <Switch id="sound" checked={alerts.sound} onCheckedChange={() => toggleAlert('sound')} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Vibration size={20} />
                <Label htmlFor="vibration">Vibrar</Label>
              </div>
              <Switch id="vibration" checked={alerts.vibration} onCheckedChange={() => toggleAlert('vibration')} />
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
                value={intervals.first} 
                onChange={(e) => setIntervals({...intervals, first: parseInt(e.target.value)})}
                className="text-center font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase text-slate-500">Alerta 2</Label>
              <Input 
                type="number" 
                value={intervals.second} 
                onChange={(e) => setIntervals({...intervals, second: parseInt(e.target.value)})}
                className="text-center font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase text-slate-500">Alerta 3</Label>
              <Input 
                type="number" 
                value={intervals.third} 
                onChange={(e) => setIntervals({...intervals, third: parseInt(e.target.value)})}
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