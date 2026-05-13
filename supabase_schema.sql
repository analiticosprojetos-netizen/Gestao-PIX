-- Tabela para Custos Fixos (Domínio, Migração, etc)
CREATE TABLE IF NOT EXISTS lider_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  type TEXT CHECK (type IN ('domain', 'migration', 'website', 'system', 'other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela para Mensalidades do Sistema
CREATE TABLE IF NOT EXISTS lider_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month_year TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS (Opcional, dependendo da sua config)
ALTER TABLE lider_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lider_payments ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso público (ajuste conforme sua necessidade de segurança)
CREATE POLICY "Permitir tudo para lider_expenses" ON lider_expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo para lider_payments" ON lider_payments FOR ALL USING (true) WITH CHECK (true);