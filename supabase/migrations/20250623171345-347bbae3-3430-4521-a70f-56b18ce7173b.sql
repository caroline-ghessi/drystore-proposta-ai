
-- Fase 1: Criar Funções Security Definer Otimizadas

-- 1. Função otimizada para obter o ID do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;

-- 2. Função otimizada para obter o role do usuário atual (com cache interno)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  user_role_result public.user_role;
BEGIN
  SELECT role INTO user_role_result 
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  RETURN COALESCE(user_role_result, 'cliente'::public.user_role);
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'cliente'::public.user_role;
END;
$$;

-- 3. Função otimizada para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- 4. Função otimizada para verificar se o usuário pode gerenciar recursos
CREATE OR REPLACE FUNCTION public.can_manage_resources()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'vendedor_interno', 'representante')
  );
$$;

-- Fase 2: Recriar Políticas RLS Otimizadas

-- PROFILES TABLE - Remover políticas antigas e criar novas otimizadas
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Novas políticas otimizadas para profiles
CREATE POLICY "Users can view own profile or admins view all" ON public.profiles
  FOR SELECT USING (
    user_id = public.get_current_user_id() OR public.is_admin_user()
  );

CREATE POLICY "Users can update own profile or admins update all" ON public.profiles
  FOR UPDATE USING (
    user_id = public.get_current_user_id() OR public.is_admin_user()
  );

-- CLIENTS TABLE - Remover políticas antigas e criar novas otimizadas
DROP POLICY IF EXISTS "Users can view clients they created or admins can view all" ON public.clients;
DROP POLICY IF EXISTS "Internal users can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Internal users can update clients" ON public.clients;
DROP POLICY IF EXISTS "Internal users can delete clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can view clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can create clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON public.clients;

-- Novas políticas otimizadas para clients
CREATE POLICY "Managers can view clients" ON public.clients
  FOR SELECT USING (public.can_manage_resources());

CREATE POLICY "Managers can insert clients" ON public.clients
  FOR INSERT WITH CHECK (public.can_manage_resources());

CREATE POLICY "Managers can update clients" ON public.clients
  FOR UPDATE USING (public.can_manage_resources());

CREATE POLICY "Admins can delete clients" ON public.clients
  FOR DELETE USING (public.is_admin_user());

-- PRODUCTS TABLE - Remover políticas antigas e criar novas otimizadas
DROP POLICY IF EXISTS "Anyone can view active products or internal users can view all" ON public.products;
DROP POLICY IF EXISTS "Internal users can insert products" ON public.products;
DROP POLICY IF EXISTS "Internal users can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

-- Novas políticas otimizadas para products
CREATE POLICY "View active products or managers view all" ON public.products
  FOR SELECT USING (
    ativo = true OR public.can_manage_resources()
  );

CREATE POLICY "Managers can insert products" ON public.products
  FOR INSERT WITH CHECK (public.can_manage_resources());

CREATE POLICY "Managers can update products" ON public.products
  FOR UPDATE USING (public.can_manage_resources());

CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE USING (public.is_admin_user());

-- SALES_TARGETS TABLE - Criar políticas otimizadas
CREATE POLICY "Users can view own targets or admins view all" ON public.sales_targets
  FOR SELECT USING (
    user_id = public.get_current_user_id() OR public.is_admin_user()
  );

CREATE POLICY "Admins can manage sales targets" ON public.sales_targets
  FOR ALL USING (public.is_admin_user());

-- Adicionar índices para melhorar performance das consultas RLS
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_role ON public.profiles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_sales_targets_user_id ON public.sales_targets(user_id);

-- Atualizar estatísticas das tabelas para melhor otimização
ANALYZE public.profiles;
ANALYZE public.clients;
ANALYZE public.products;
ANALYZE public.sales_targets;
