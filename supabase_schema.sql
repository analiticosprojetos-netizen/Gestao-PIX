-- Remover políticas se já existirem para evitar erro
DROP POLICY IF EXISTS "Permitir tudo para lider_expenses" ON lider_expenses;
DROP POLICY IF EXISTS "Permitir tudo para lider_payments" ON lider_payments;

-- Criar as políticas novamente
CREATE POLICY "Permitir tudo para lider_expenses" ON lider_expenses FOR ALL USING (true);
CREATE POLICY "Permitir tudo para lider_payments" ON lider_payments FOR ALL USING (true);

-- Garantir que o RLS está ativo
ALTER TABLE lider_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lider_payments ENABLE ROW LEVEL SECURITY;