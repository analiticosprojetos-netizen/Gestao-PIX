"use client";

import { useShopping } from '@/context/ShoppingContext';
import { showSuccess, showError } from '@/utils/toast';

export const useShoppingVoiceCommand = () => {
  const { items, addItem, toggleChecked, deleteItem } = useShopping();

  const processShoppingCommand = async (transcript: string): Promise<boolean> => {
    const text = transcript.toLowerCase().trim();
    console.log("Processando comando de compras:", text);

    // 1. Comando de Excluir/Remover: "remover arroz" ou "excluir feijão"
    if (text.startsWith("remover ") || text.startsWith("excluir ") || text.startsWith("deletar ")) {
      const itemName = text
        .replace(/^(remover|excluir|deletar)\s+/, "")
        .trim();

      const target = items.find(i => i.name.toLowerCase() === itemName);
      if (target) {
        await deleteItem(target.id);
        showSuccess(`"${target.name}" removido da lista.`);
        return true;
      } else {
        showError(`Não encontrei "${itemName}" na lista.`);
        return false;
      }
    }

    // 2. Comando de Marcar como Comprado: "arroz ok" ou "arroz comprado" ou "marcar arroz"
    if (text.endsWith(" ok") || text.endsWith(" comprado") || text.startsWith("marcar ")) {
      let itemName = text;
      if (text.endsWith(" ok")) {
        itemName = text.slice(0, -3).trim();
      } else if (text.endsWith(" comprado")) {
        itemName = text.slice(0, -9).trim();
      } else if (text.startsWith("marcar ")) {
        itemName = text.replace(/^marcar\s+/, "").trim();
      }

      const target = items.find(i => i.name.toLowerCase() === itemName);
      if (target) {
        await toggleChecked(target.id);
        showSuccess(`"${target.name}" marcado como comprado!`);
        return true;
      } else {
        showError(`Não encontrei "${itemName}" na lista.`);
        return false;
      }
    }

    // 3. Comando de Adicionar com quantidade e preço opcional:
    // Exemplos: "3 pacotes de arroz de 15 reais", "arroz", "2 feijão", "leite de 5 reais"
    let quantity = 1;
    let price = 0;
    let name = text;

    // Tenta extrair quantidade no início (ex: "3 arroz" ou "2 pacotes de arroz")
    const qtyMatch = text.match(/^(\d+)\s*(?:pacotes?|unidades?|kg|g|litros?)?\s*(?:de)?\s*(.+)$/);
    if (qtyMatch) {
      quantity = parseInt(qtyMatch[1]);
      name = qtyMatch[2].trim();
    }

    // Tenta extrair preço no final (ex: "arroz de 15 reais" ou "leite de 5.50")
    const priceMatch = name.match(/(.+)\s+de\s+(\d+[,.]?\d*)\s*(?:reais|real)?$/);
    if (priceMatch) {
      name = priceMatch[1].trim();
      price = parseFloat(priceMatch[2].replace(',', '.'));
    }

    // Limpeza final do nome
    name = name
      .replace(/^(adicionar|inserir|colocar|novo|nova)\s+/, "")
      .trim();

    if (name.length > 1) {
      const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
      await addItem({
        name: capitalizedName,
        quantity,
        price
      });
      return true;
    }

    showError("Não entendi o comando. Tente: '3 arroz de 15 reais' ou 'remover arroz'");
    return false;
  };

  return { processShoppingCommand };
};