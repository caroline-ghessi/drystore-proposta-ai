-- Adicionar campo user_id à tabela energia_bills_uploads
ALTER TABLE public.energia_bills_uploads 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Atualizar políticas RLS para energia_bills_uploads
DROP POLICY IF EXISTS "Managers podem inserir uploads de faturas" ON public.energia_bills_uploads;
DROP POLICY IF EXISTS "Managers podem atualizar uploads de faturas" ON public.energia_bills_uploads;
DROP POLICY IF EXISTS "Usuários podem visualizar seus próprios uploads" ON public.energia_bills_uploads;

-- Política de INSERT: Usuários autenticados podem inserir seus próprios uploads
CREATE POLICY "Usuários autenticados podem inserir uploads"
ON public.energia_bills_uploads
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política de SELECT: Usuários veem seus uploads, admins veem todos
CREATE POLICY "Usuários veem seus uploads ou admins veem todos"
ON public.energia_bills_uploads
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR 
  get_user_role(auth.uid()) = 'admin'::user_role
);

-- Política de UPDATE: Apenas sistema e admins podem atualizar
CREATE POLICY "Sistema e admins podem atualizar uploads"
ON public.energia_bills_uploads
FOR UPDATE
TO authenticated
USING (
  get_user_role(auth.uid()) = 'admin'::user_role OR
  can_manage_resources()
);