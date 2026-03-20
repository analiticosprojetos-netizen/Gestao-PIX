import { createClient } from '@supabase/supabase-js';

// Tenta pegar das variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Se não houver chaves, exportamos um cliente nulo ou avisamos
// Isso evita o erro 'supabaseUrl is required' logo no carregamento
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERRO: Configuração do Supabase ausente! O app não conseguirá salvar ou carregar dados.");
}

// Inicializa apenas se tivermos os dados, senão o app vai travar nas funções que usarem o banco
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);