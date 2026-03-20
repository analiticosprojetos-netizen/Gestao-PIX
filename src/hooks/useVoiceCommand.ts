"use client";

import { useBills } from '@/context/BillContext';
import { showSuccess, showError } from '@/utils/toast';
import { addDays } from 'date-fns';

export const useVoiceCommand = () => {
  const { bills, togglePaid, deleteBill, addBill } = useBills();

  const processCommand = (transcript: string) => {
    const text = transcript.toLowerCase();
    console.log("Comando recebido:", text);

    // 1. Comando: PAGAR
    if (text.includes("pagar") || text.includes("pago") || text.includes("quitei")) {
      const target = bills.find(b => text.includes(b.title.toLowerCase()));
      if (target) {
        togglePaid(target.id);
        showSuccess(`Entendido! Marquei "${target.title}" como pago.`);
        return true;
      }
    }

    // 2. Comando: EXCLUIR / REMOVER
    if (text.includes("excluir") || text.includes("remover") || text.includes("deletar")) {
      const target = bills.find(b => text.includes(b.title.toLowerCase()));
      if (target) {
        deleteBill(target.id);
        showSuccess(`Ok! Excluí o boleto "${target.title}".`);
        return true;
      }
    }

    // 3. Comando: NOVO BOLETO
    if (text.includes("novo") || text.includes("cadastrar") || text.includes("conta")) {
      // Tenta extrair valor (ex: "valor cem", "valor 100", "50 reais")
      const amountMatch = text.match(/(\d+)/);
      const amount = amountMatch ? parseFloat(amountMatch[0]) : 0;
      
      // Tenta extrair o nome (ignora palavras de comando)
      let title = text
        .replace("novo", "")
        .replace("cadastrar", "")
        .replace("conta", "")
        .replace("valor", "")
        .replace("reais", "")
        .replace(/\d+/g, "")
        .trim();

      if (title) {
        addBill({
          title: title.charAt(0).toUpperCase() + title.slice(1),
          amount: amount || 0,
          dueDate: addDays(new Date(), 7), // Vencimento padrão em 7 dias
          category: 'Geral',
          recurring: false
        });
        showSuccess(`Adicionei "${title}" no valor de R$ ${amount}.`);
        return true;
      }
    }

    showError("Não entendi o comando. Tente: 'Pagar conta de luz' ou 'Novo boleto internet valor 100'");
    return false;
  };

  return { processCommand };
};