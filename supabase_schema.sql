-- Tabela de Custos Fixos (Domínio, Migração, Site, etc)
CREATE TABLE IF NOT EXISTS lider_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  type TEXT CHECK (type IN ('domain', 'migration', 'website', 'system', 'other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid'))
);

-- Tabela de Mensalidades do Sistema
CREATE TABLE IF NOT EXISTS lider_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  month_year TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid'))
);

-- Habilitar RLS (Segurança)
ALTER TABLE lider_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lider_payments ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso público (para simplificar o teste inicial)
CREATE POLICY "Permitir tudo para lider_expenses" ON lider_expenses FOR ALL USING (true);
CREATE POLICY "Permitir tudo para lider_payments" ON lider_payments FOR ALL USING (true);