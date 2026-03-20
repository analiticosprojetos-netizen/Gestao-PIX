import { createClient } from '@supabase/supabase-js';

// Usando as credenciais da imagem fornecida
const supabaseUrl = 'https://nxpvkuschribtwwdyach.supabase.co';
const supabaseAnonKey = 'sb_publishable_sdT3PPSSRq-mR26v2WXiYA_zHb';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);