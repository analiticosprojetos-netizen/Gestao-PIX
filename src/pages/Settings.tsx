"use client";

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Smartphone, Volume2, Vibrate, PlayCircle, ShieldCheck, BellRing, Moon, Users, Plus, Trash2 } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { showSuccess, showError } from '@/utils/toast';

const Settings = () => {
  const { settings, updateSettings, toggleTheme } = useSettings();
  const [permissionStatus, setPermissionStatus] = useState(Notification.permission);
  const [newContact, setNewContact] = useState('');

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      showError("Navegador sem suporte a notificações.");
      return;
    }
    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
    if (permission === "granted") showSuccess("Notificações liberadas!");
  };

  const addContact = () => {
    if (!newContact.trim()) return;
    if (settings.contacts.includes(newContact.trim())) {
      showError("Este contato já existe.");
      return;
    }
    updateSettings({
      ...settings,
      contacts: [...settings.contacts, newContact.trim()]
    });
    setNewContact('');
    showSuccess("Contato adicionado!");
  };

  const removeContact = (name: string) => {
    updateSettings({
      ...settings,
      contacts: settings.contacts.filter(c => c !== name)
    });
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
        {/* Gestão de Pessoas/Contatos */}
        <Card className="border-none shadow-sm dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="text-indigo-600" size={20} />
              Pessoas / Contatos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Novo nome..." 
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none"
              />
              <Button onClick={addContact} className="bg-indigo-600 h-11 w-11 p-0 rounded-xl">
                <Plus size={20} />
              </Button>
            </div>
            
            <div className="space-y-2">
              {settings.contacts.map(contact => (
                <div key={contact} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="font-medium">{contact}</span>
                  <button onClick={() => removeContact(contact)} className="text-slate-400 hover:text-rose-500">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Aparência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Moon className="text-indigo-600 dark:text-indigo-400" size={20} />
                <Label className="font-medium text-slate-700 dark:text-slate-300">Modo Escuro</Label>
              </div>
              <Switch checked={settings.theme === 'dark'} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Notificações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Smartphone className="text-indigo-600 dark:text-indigo-400" size={20} />
                <Label className="font-medium text-slate-700 dark:text-slate-300">Avisos no Celular</Label>
              </div>
              <Switch checked={settings.alerts.push} onCheckedChange={() => toggleAlert('push')} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Volume2 className="text-indigo-600 dark:text-indigo-400" size={20} />
                <Label className="font-medium text-slate-700 dark:text-slate-300">Tocar Som</Label>
              </div>
              <Switch checked={settings.alerts.sound} onCheckedChange={() => toggleAlert('sound')} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default Settings;