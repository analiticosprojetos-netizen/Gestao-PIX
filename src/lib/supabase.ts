import { createClient } from '@supabase/supabase-js';

// Usando variáveis de ambiente (mais seguro e fácil de trocar)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Atenção: Chaves do Supabase não configuradas. Verifique o arquivo .env ou variáveis da Vercel.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);