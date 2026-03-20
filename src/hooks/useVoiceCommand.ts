"use client";

import { useBills } from '@/context/BillContext';
import { showSuccess, showError } from '@/utils/toast';
import { setDate, isBefore, addMonths, startOfDay } from 'date-fns';

export const useVoiceCommand = () => {
  const { bills, togglePaid, deleteBill, addBill } = useBills();

  const processCommand = (transcript: string) => {
    const text = transcript.toLowerCase();
    console.log("Processando comando:", text);

    // --- LÓGICA DE PAGAR ---
    if (text.includes("pagar") || text.includes("pago") || text.includes("quitei")) {
      const target = bills.find(b => text.includes(b.title.toLowerCase()) && !b.paid);
      if (target) {
        togglePaid(target.id);
        showSuccess(`Pronto! Marquei "${target.title}" como pago.`);
        return true;
      } else {
        showError("Não encontrei esse boleto pendente para pagar.");
        return false;
      }
    }

    // --- LÓGICA DE EXCLUIR ---
    if (text.includes("excluir") || text.includes("remover") || text.includes("deletar")) {
      const target = bills.find(b => text.includes(b.title.toLowerCase()));
      if (target) {
        deleteBill(target.id);
        showSuccess(`Boleto "${target.title}" removido com sucesso.`);
        return true;
      }
    }

    // --- LÓGICA DE CRIAR (Limpeza agressiva) ---
    if (text.includes("criar") || text.includes("novo") || text.includes("adicionar") || text.includes("cadastrar") || text.includes("boleto")) {
      // 1. Extrair Valor
      const amountMatch = text.match(/(\d+[,.]?\d*)/g);
      let amount = 0;
      if (amountMatch) {
        amount = parseFloat(amountMatch[0].replace(',', '.'));
      }

      // 2. Extrair Dia
      const dayMatch = text.match(/dia\s*(\d+)/) || text.match(/vencimento\s*(\d+)/);
      let dueDate = new Date();
      if (dayMatch) {
        const day = parseInt(dayMatch[1]);
        if (day >= 1 && day <= 31) {
          dueDate = setDate(startOfDay(new Date()), day);
          if (isBefore(dueDate, startOfDay(new Date()))) {
            dueDate = addMonths(dueDate, 1);
          }
        }
      }

      // 3. Extrair Título Limpo (Removendo "de", "da", "do", "r$", "boleto", etc.)
      let title = text
        .replace(/(criar|novo|adicionar|cadastrar|boleto|conta|fatura|recibo)/g, "")
        .replace(/(valor|reais|vencimento|dia|de|da|do|r\$|r \$)/g, "") // Limpa conectores e símbolos
        .replace(/\d+[,.]?\d*/g, "") // remove todos os números
        .replace(/\s+/g, " ") // limpa espaços extras
        .trim();

      if (title.length > 2) {
        // Capitaliza a primeira letra (ex: água -> Água)
        const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);
        
        addBill({
          title: capitalizedTitle,
          amount: amount,
          dueDate: dueDate,
          category: 'Geral',
          recurring: false
        });
        showSuccess(`Boleto "${capitalizedTitle}" criado com sucesso!`);
        return true;
      }
    }

    showError("Não entendi o comando. Tente: 'Criar boleto de água 120 reais dia 30'");
    return false;
  };

  return { processCommand };
};