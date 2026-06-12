"use client";

// Dicionário de preços médios estimados em reais (BRL) para produtos comuns no Brasil
const priceDatabase: Record<string, number> = {
  "farinha": 5.50,
  "farinha torrada": 6.20,
  "farinha de trigo": 5.20,
  "farinha de mandioca": 6.50,
  "arroz": 6.80,
  "feijão": 8.50,
  "leite": 5.30,
  "óleo": 7.20,
  "café": 16.50,
  "açúcar": 4.50,
  "pão": 7.50,
  "manteiga": 11.90,
  "margarina": 6.50,
  "sabonete": 2.80,
  "shampoo": 14.50,
  "condicionador": 16.00,
  "detergente": 2.40,
  "macarrão": 4.20,
  "molho de tomate": 3.20,
  "sal": 2.80,
  "frango": 17.90,
  "carne": 36.00,
  "carne moída": 28.00,
  "ovos": 14.00,
  "queijo": 26.00,
  "presunto": 11.50,
  "refrigerante": 8.50,
  "suco": 5.80,
  "cerveja": 4.80,
  "papel higiênico": 14.90,
  "creme dental": 4.20,
  "sabão em pó": 17.90,
  "amaciante": 12.50,
  "banana": 5.50,
  "maçã": 8.90,
  "tomate": 7.80,
  "cebola": 5.90,
  "batata": 6.50,
  "alho": 4.50,
  "bolacha": 3.80,
  "biscoito": 3.80,
  "iogurte": 6.50,
  "creme de leite": 3.50,
  "leite condensado": 5.80,
  "azeite": 32.00,
  "vinagre": 3.50,
  "maionese": 6.80,
  "ketchup": 7.50,
  "mostarda": 6.20,
  "pipoca": 4.50,
  "chocolate": 6.50,
  "sabão líquido": 19.90,
  "desinfetante": 7.80,
  "esponja": 1.80,
  "água sanitária": 4.50,
  "pasta de dente": 4.20,
  "fio dental": 7.50,
  "desodorante": 12.90,
};

/**
 * Busca o preço médio estimado de um item com base no nome (busca aproximada)
 */
export const getEstimatedPrice = (itemName: string): number => {
  const cleanName = itemName.toLowerCase().trim();
  
  // 1. Busca exata ou por chave contida
  for (const [key, price] of Object.entries(priceDatabase)) {
    if (cleanName === key || cleanName.includes(key)) {
      return price;
    }
  }

  // 2. Categorização genérica por palavras-chave
  if (cleanName.includes("carne") || cleanName.includes("bife") || cleanName.includes("alcatra") || cleanName.includes("contra")) {
    return 35.00;
  }
  if (cleanName.includes("cerveja") || cleanName.includes("vinho") || cleanName.includes("vodka") || cleanName.includes("gin")) {
    return 15.00;
  }
  if (cleanName.includes("sabonete") || cleanName.includes("pasta") || cleanName.includes("escova") || cleanName.includes("fio")) {
    return 4.50;
  }
  if (cleanName.includes("limpeza") || cleanName.includes("sabão") || cleanName.includes("amaciante")) {
    return 12.00;
  }
  if (cleanName.includes("fruta") || cleanName.includes("legume") || cleanName.includes("verdura")) {
    return 6.00;
  }

  // Retorna 0 se não encontrar nenhuma pista
  return 0;
};