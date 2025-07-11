-- FASE 1: Criar tabela dedicada para token Adobe com constraints de segurança
CREATE TABLE IF NOT EXISTS public.adobe_token_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_validated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  renewal_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  correlation_id UUID DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  scopes TEXT NOT NULL DEFAULT 'openid,AdobeID,DCAPI',
  token_source TEXT DEFAULT 'auto_generated',
  
  -- Constraint: apenas um token ativo por vez
  CONSTRAINT single_active_token_constraint UNIQUE (is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_adobe_token_active ON public.adobe_token_cache (is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_adobe_token_expires ON public.adobe_token_cache (expires_at);
CREATE INDEX IF NOT EXISTS idx_adobe_token_correlation ON public.adobe_token_cache (correlation_id);

-- RLS Policies
ALTER TABLE public.adobe_token_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage Adobe tokens" 
ON public.adobe_token_cache 
FOR ALL 
USING (auth.role() = 'service_role');

CREATE POLICY "Admins can view Adobe tokens" 
ON public.adobe_token_cache 
FOR SELECT 
USING (is_admin_user());

-- Função para cleanup de tokens expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_adobe_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Desativar tokens expirados
  UPDATE public.adobe_token_cache 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
  
  -- Deletar tokens muito antigos (mais de 7 dias)
  DELETE FROM public.adobe_token_cache 
  WHERE created_at < now() - interval '7 days';
  
  RAISE LOG 'Adobe tokens cleanup completed';
END;
$$;

-- Função para verificar se token precisa renovação
CREATE OR REPLACE FUNCTION public.adobe_token_needs_renewal()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_token_expires TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT expires_at INTO current_token_expires
  FROM public.adobe_token_cache
  WHERE is_active = true
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Retorna true se não há token ou se expira em menos de 4 horas
  RETURN (
    current_token_expires IS NULL OR 
    current_token_expires < now() + interval '4 hours'
  );
END;
$$;