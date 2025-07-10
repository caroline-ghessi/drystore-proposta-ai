-- Permitir email NULL na tabela clients para extração inicial de PDFs
-- O email será coletado pelo vendedor na etapa de revisão
ALTER TABLE public.clients 
ALTER COLUMN email DROP NOT NULL;

-- Criar função para validar se cliente tem email antes de gerar proposta final
CREATE OR REPLACE FUNCTION public.validate_client_email_for_proposal(client_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.clients 
    WHERE id = client_id AND email IS NOT NULL AND email != ''
  );
END;
$$;

-- Adicionar trigger para garantir email antes de alterar status para 'sent'
CREATE OR REPLACE FUNCTION public.check_client_email_before_send()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se status está mudando para 'sent', verificar se cliente tem email
  IF NEW.status = 'sent' AND OLD.status != 'sent' THEN
    IF NOT public.validate_client_email_for_proposal(NEW.client_id) THEN
      RAISE EXCEPTION 'Cliente deve ter email válido antes de enviar proposta';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger na tabela proposals
CREATE TRIGGER ensure_client_email_before_send
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.check_client_email_before_send();