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

/**
 * Retorna a categoria do produto com base no nome
 */
export const getItemCategory = (itemName: string): string => {
  const cleanName = itemName.toLowerCase().trim();

  // Higiene Pessoal
  if (
    cleanName.includes("sabonete") || 
    cleanName.includes("shampoo") || 
    cleanName.includes("condicionador") || 
    cleanName.includes("dental") || 
    cleanName.includes("dente") || 
    cleanName.includes("higienico") || 
    cleanName.includes("higiênico") || 
    cleanName.includes("desodorante") || 
    cleanName.includes("fio dental") || 
    cleanName.includes("absorvente") || 
    cleanName.includes("gilete") || 
    cleanName.includes("barbear") || 
    cleanName.includes("creme") && (cleanName.includes("pele") || cleanName.includes("rosto"))
  ) {
    return "Higiene Pessoal";
  }

  // Limpeza
  if (
    cleanName.includes("detergente") || 
    cleanName.includes("sabão") || 
    cleanName.includes("sabao") || 
    cleanName.includes("amaciante") || 
    cleanName.includes("desinfetante") || 
    cleanName.includes("esponja") || 
    cleanName.includes("sanitaria") || 
    cleanName.includes("sanitária") || 
    cleanName.includes("cloro") || 
    cleanName.includes("lustra") || 
    cleanName.includes("multiuso") || 
    cleanName.includes("veja") || 
    cleanName.includes("vassoura") || 
    cleanName.includes("saco de lixo")
  ) {
    return "Limpeza";
  }

  // Bebidas
  if (
    cleanName.includes("refrigerante") || 
    cleanName.includes("suco") || 
    cleanName.includes("cerveja") || 
    cleanName.includes("vinho") || 
    cleanName.includes("agua") || 
    cleanName.includes("água") || 
    cleanName.includes("refris") || 
    cleanName.includes("coca") || 
    cleanName.includes("guarana") || 
    cleanName.includes("guaraná") || 
    cleanName.includes("fanta") || 
    cleanName.includes("sprite") || 
    cleanName.includes("energético") || 
    cleanName.includes("energetico")
  ) {
    return "Bebidas";
  }

  // Hortifruti
  if (
    cleanName.includes("banana") || 
    cleanName.includes("maçã") || 
    cleanName.includes("maca") || 
    cleanName.includes("tomate") || 
    cleanName.includes("cebola") || 
    cleanName.includes("batata") || 
    cleanName.includes("alho") || 
    cleanName.includes("laranja") || 
    cleanName.includes("limão") || 
    cleanName.includes("limao") || 
    cleanName.includes("alface") || 
    cleanName.includes("cenoura") || 
    cleanName.includes("abacaxi") || 
    cleanName.includes("uva") || 
    cleanName.includes("melancia") || 
    cleanName.includes("pimentão") || 
    cleanName.includes("pimentao")
  ) {
    return "Hortifruti";
  }

  // Padaria / Sobremesas
  if (
    cleanName.includes("pão") || 
    cleanName.includes("pao") || 
    cleanName.includes("bolo") || 
    cleanName.includes("bolacha") || 
    cleanName.includes("biscoito") || 
    cleanName.includes("torrada") || 
    cleanName.includes("pão de forma") || 
    cleanName.includes("pão puma") || 
    cleanName.includes("doce") || 
    cleanName.includes("chocolate") || 
    cleanName.includes("pipoca") || 
    cleanName.includes("salgadinho") || 
    cleanName.includes("batata palha")
  ) {
    return "Padaria & Snacks";
  }

  // Carnes / Frios
  if (
    cleanName.includes("carne") || 
    cleanName.includes("frango") || 
    cleanName.includes("peixe") || 
    cleanName.includes("bife") || 
    cleanName.includes("alcatra") || 
    cleanName.includes("contra") || 
    cleanName.includes("moída") || 
    cleanName.includes("moida") || 
    cleanName.includes("presunto") || 
    cleanName.includes("queijo") || 
    cleanName.includes("mussarela") || 
    cleanName.includes("mortadela") || 
    cleanName.includes("salsicha") || 
    cleanName.includes("linguiça") || 
    cleanName.includes("linguica") || 
    cleanName.includes("bacon")
  ) {
    return "Carnes & Frios";
  }

  // Mercearia (Padrão)
  return "Mercearia";
};