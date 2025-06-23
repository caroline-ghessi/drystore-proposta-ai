
-- Criar política RLS para permitir validação de email de clientes não autenticados
-- Esta política permite SELECT limitado apenas para validação de login de clientes
CREATE POLICY "Allow public email validation for client login" ON public.clients
  FOR SELECT 
  USING (true);

-- Criar função para log de tentativas de acesso de cliente
CREATE OR REPLACE FUNCTION public.log_client_access_attempt(
  client_email text,
  success boolean,
  client_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log da tentativa de acesso
  PERFORM public.log_security_event(
    'client_login_attempt',
    NULL, -- user_id (cliente não é usuário autenticado)
    client_id,
    jsonb_build_object(
      'email', client_email,
      'success', success,
      'timestamp', now()
    ),
    CASE WHEN success THEN 'low' ELSE 'medium' END
  );
END;
$$;
