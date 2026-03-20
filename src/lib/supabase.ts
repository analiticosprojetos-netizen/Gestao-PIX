import { createClient } from '@supabase/supabase-js';

// Chaves reais do seu projeto configuradas
const supabaseUrl = 'https://nxpvkuschribtwwdyach.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54cHZrdXNjaHJpYnR3d2R5YWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMDc3NDcsImV4cCI6MjA4OTU4Mzc0N30.KjMve4BUNZNRX62NaPCu0jWqXRq14NDn69F8wZmpJD8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);