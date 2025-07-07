-- Criar tabela para gerenciar instâncias Whapi de cada vendedor
CREATE TABLE public.whapi_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL,
  vendor_name TEXT NOT NULL,
  instance_id TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL,
  webhook_url TEXT NOT NULL UNIQUE,
  webhook_secret TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  phone_number TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Criar tabela para histórico de mensagens WhatsApp
CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  whapi_instance_id UUID NOT NULL REFERENCES public.whapi_instances(id) ON DELETE CASCADE,
  proposal_id UUID REFERENCES public.proposals(id),
  client_id UUID NOT NULL REFERENCES public.clients(id),
  message_content TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  vendor_phone TEXT NOT NULL,
  whapi_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id)
);

-- Criar tabela para logs de webhooks
CREATE TABLE public.whapi_webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  whapi_instance_id UUID REFERENCES public.whapi_instances(id) ON DELETE CASCADE,
  webhook_event_type TEXT NOT NULL,
  raw_payload JSONB NOT NULL,
  processed_successfully BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_whapi_instances_vendor_id ON public.whapi_instances(vendor_id);
CREATE INDEX idx_whapi_instances_active ON public.whapi_instances(is_active);
CREATE INDEX idx_whatsapp_messages_instance ON public.whatsapp_messages(whapi_instance_id);
CREATE INDEX idx_whatsapp_messages_proposal ON public.whatsapp_messages(proposal_id);
CREATE INDEX idx_whatsapp_messages_client ON public.whatsapp_messages(client_id);
CREATE INDEX idx_whatsapp_messages_status ON public.whatsapp_messages(status);
CREATE INDEX idx_whatsapp_messages_sent_at ON public.whatsapp_messages(sent_at);
CREATE INDEX idx_webhook_logs_instance ON public.whapi_webhook_logs(whapi_instance_id);
CREATE INDEX idx_webhook_logs_created_at ON public.whapi_webhook_logs(created_at);

-- Habilitar RLS
ALTER TABLE public.whapi_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whapi_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para whapi_instances
CREATE POLICY "Admins podem gerenciar todas as instâncias Whapi"
  ON public.whapi_instances FOR ALL
  USING (is_admin_user());

CREATE POLICY "Vendedores podem ver suas próprias instâncias"
  ON public.whapi_instances FOR SELECT
  USING (vendor_id = auth.uid() OR is_admin_user());

-- Políticas RLS para whatsapp_messages
CREATE POLICY "Admins podem ver todas as mensagens"
  ON public.whatsapp_messages FOR SELECT
  USING (is_admin_user());

CREATE POLICY "Vendedores podem ver mensagens de suas instâncias"
  ON public.whatsapp_messages FOR SELECT
  USING (
    whapi_instance_id IN (
      SELECT id FROM public.whapi_instances 
      WHERE vendor_id = auth.uid()
    ) OR is_admin_user()
  );

CREATE POLICY "Sistema pode inserir mensagens"
  ON public.whatsapp_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Sistema pode atualizar status das mensagens"
  ON public.whatsapp_messages FOR UPDATE
  USING (true);

-- Políticas RLS para whapi_webhook_logs
CREATE POLICY "Apenas admins podem ver logs de webhook"
  ON public.whapi_webhook_logs FOR SELECT
  USING (is_admin_user());

CREATE POLICY "Sistema pode inserir logs de webhook"
  ON public.whapi_webhook_logs FOR INSERT
  WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_whapi_instances_updated_at
  BEFORE UPDATE ON public.whapi_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Função para gerar URL de webhook única
CREATE OR REPLACE FUNCTION public.generate_whapi_webhook_url(instance_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  base_url TEXT;
  webhook_secret TEXT;
BEGIN
  -- Buscar o segredo do webhook
  SELECT webhook_secret INTO webhook_secret
  FROM public.whapi_instances
  WHERE whapi_instances.instance_id = generate_whapi_webhook_url.instance_id;
  
  IF webhook_secret IS NULL THEN
    RAISE EXCEPTION 'Instância não encontrada: %', instance_id;
  END IF;
  
  -- URL base do projeto Supabase
  base_url := current_setting('app.settings.supabase_url', true);
  
  RETURN base_url || '/functions/v1/whapi-webhook?instance=' || instance_id || '&secret=' || webhook_secret;
END;
$$;