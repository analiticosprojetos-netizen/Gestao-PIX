"use client";

import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Mic, PenLine, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddActionMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVoiceAction: () => void;
  onManualAction: () => void;
}

const AddActionMenu = ({ open, onOpenChange, onVoiceAction, onManualAction }: AddActionMenuProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="dark:bg-slate-900 border-none rounded-t-[32px] p-2">
        <div className="mx-auto w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full my-4" />
        
        <DrawerHeader className="text-center">
          <DrawerTitle className="text-2xl font-bold text-slate-800 dark:text-white">Novo Boleto</DrawerTitle>
          <DrawerDescription>Escolha como deseja cadastrar sua conta</DrawerDescription>
        </DrawerHeader>

        <div className="grid grid-cols-2 gap-4 p-6 pb-12">
          <button 
            onClick={() => {
              onOpenChange(false);
              setTimeout(onVoiceAction, 300);
            }}
            className="flex flex-col items-center justify-center gap-4 p-8 bg-indigo-50 dark:bg-indigo-950/40 rounded-[32px] border-2 border-transparent hover:border-indigo-500 transition-all active:scale-95 group"
          >
            <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none group-hover:scale-110 transition-transform">
              <Mic size={32} />
            </div>
            <span className="font-bold text-indigo-900 dark:text-indigo-200">Falar</span>
          </button>

          <button 
            onClick={() => {
              onOpenChange(false);
              setTimeout(onManualAction, 300);
            }}
            className="flex flex-col items-center justify-center gap-4 p-8 bg-emerald-50 dark:bg-emerald-950/40 rounded-[32px] border-2 border-transparent hover:border-emerald-500 transition-all active:scale-95 group"
          >
            <div className="h-16 w-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-none group-hover:scale-110 transition-transform">
              <PenLine size={32} />
            </div>
            <span className="font-bold text-emerald-900 dark:text-emerald-200">Manual</span>
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default AddActionMenu;