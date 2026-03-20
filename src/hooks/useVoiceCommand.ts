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

    // --- LÓGICA DE CRIAR (Mais robusta) ---
    if (text.includes("criar") || text.includes("novo") || text.includes("adicionar") || text.includes("cadastrar")) {
      // 1. Extrair Valor (Procura por números seguidos ou precedidos por 'reais', 'valor' ou apenas o número)
      const amountMatch = text.match(/(\d+[,.]?\d*)/g);
      let amount = 0;
      if (amountMatch) {
        // Pega o primeiro número que pareça um valor (geralmente o maior ou o primeiro falado)
        amount = parseFloat(amountMatch[0].replace(',', '.'));
      }

      // 2. Extrair Dia (Procura por "dia X" ou "vencimento X")
      const dayMatch = text.match(/dia\s*(\d+)/) || text.match(/vencimento\s*(\d+)/);
      let dueDate = new Date();
      if (dayMatch) {
        const day = parseInt(dayMatch[1]);
        if (day >= 1 && day <= 31) {
          dueDate = setDate(startOfDay(new Date()), day);
          // Se o dia já passou no mês atual, assume que é para o mês que vem
          if (isBefore(dueDate, startOfDay(new Date()))) {
            dueDate = addMonths(dueDate, 1);
          }
        }
      }

      // 3. Extrair Título (Remove as palavras de comando, valores e dias)
      let title = text
        .replace(/(criar|novo|adicionar|cadastrar|boleto|conta)/g, "")
        .replace(/valor|reais|vencimento|dia/g, "")
        .replace(/\d+[,.]?\d*/g, "") // remove números
        .replace(/\s+/g, " ") // limpa espaços extras
        .trim();

      if (title.length > 2) {
        addBill({
          title: title.charAt(0).toUpperCase() + title.slice(1),
          amount: amount,
          dueDate: dueDate,
          category: 'Geral',
          recurring: false
        });
        showSuccess(`Boleto "${title}" de R$ ${amount} criado para dia ${dueDate.getDate()}!`);
        return true;
      }
    }

    showError("Comando não reconhecido. Tente: 'Criar luz valor 150 dia 10'");
    return false;
  };

  return { processCommand };
};