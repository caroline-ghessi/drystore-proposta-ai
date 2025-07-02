-- Criar tabela de configurações de energia solar
CREATE TABLE public.energia_solar_configuracoes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  fator_perdas_sistema numeric DEFAULT 0.8,
  fator_seguranca numeric DEFAULT 1.1,
  margem_comercial numeric DEFAULT 0.25,
  custo_instalacao_wp numeric DEFAULT 0.80,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT energia_solar_configuracoes_pkey PRIMARY KEY (id)
);

-- Criar tabela de irradiação por estado
CREATE TABLE public.irradiacao_estados (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  estado text NOT NULL UNIQUE,
  irradiacao_media_kwh_m2_dia numeric NOT NULL,
  fator_correcao_regional numeric DEFAULT 1.0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT irradiacao_estados_pkey PRIMARY KEY (id)
);

-- Criar tabela de painéis solares
CREATE TABLE public.paineis_solares (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  fabricante text NOT NULL,
  modelo text NOT NULL,
  potencia_wp integer NOT NULL,
  eficiencia numeric NOT NULL,
  largura_m numeric NOT NULL,
  altura_m numeric NOT NULL,
  peso_kg numeric,
  preco_unitario numeric NOT NULL,
  tipos_telhado_compativeis jsonb,
  ativo boolean DEFAULT true,
  destaque boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT paineis_solares_pkey PRIMARY KEY (id)
);

-- Criar tabela para uploads de faturas de energia
CREATE TABLE public.energia_bills_uploads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  extraction_status text DEFAULT 'pending',
  extracted_data jsonb,
  consumo_extraido jsonb,
  tarifa_extraida numeric,
  concessionaria_extraida text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT energia_bills_uploads_pkey PRIMARY KEY (id)
);

-- Estender tabela de clientes para energia solar
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS consumo_historico jsonb;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS tarifa_kwh numeric;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS concessionaria text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS cidade text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS estado text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS tipo_telhado text DEFAULT 'ceramico';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS area_disponivel_m2 numeric;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS origem_dados text DEFAULT 'manual';

-- Estender tabela de propostas para energia solar
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS tipo_sistema text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS potencia_sistema_kwp numeric;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS painel_selecionado_id uuid REFERENCES public.paineis_solares(id);
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS quantidade_paineis integer;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS geracao_estimada_anual_kwh numeric;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS economia_anual_estimada numeric;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS payback_simples_anos numeric;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS area_ocupada_m2 numeric;

-- Inserir dados iniciais de irradiação por estado
INSERT INTO public.irradiacao_estados (estado, irradiacao_media_kwh_m2_dia, fator_correcao_regional) VALUES
('AC', 4.8, 1.0),
('AL', 5.2, 1.0),
('AP', 4.9, 1.0),
('AM', 4.7, 1.0),
('BA', 5.5, 1.0),
('CE', 5.8, 1.0),
('DF', 5.3, 1.0),
('ES', 5.0, 1.0),
('GO', 5.2, 1.0),
('MA', 5.6, 1.0),
('MT', 5.4, 1.0),
('MS', 5.1, 1.0),
('MG', 5.0, 1.0),
('PA', 5.0, 1.0),
('PB', 5.7, 1.0),
('PR', 4.6, 1.0),
('PE', 5.8, 1.0),
('PI', 5.7, 1.0),
('RJ', 4.9, 1.0),
('RN', 5.9, 1.0),
('RS', 4.5, 1.0),
('RO', 4.8, 1.0),
('RR', 5.2, 1.0),
('SC', 4.7, 1.0),
('SP', 4.8, 1.0),
('SE', 5.6, 1.0),
('TO', 5.5, 1.0);

-- Inserir configuração padrão do sistema solar
INSERT INTO public.energia_solar_configuracoes DEFAULT VALUES;

-- Inserir painéis solares padrão
INSERT INTO public.paineis_solares (fabricante, modelo, potencia_wp, eficiencia, largura_m, altura_m, peso_kg, preco_unitario, tipos_telhado_compativeis, destaque) VALUES
('Canadian Solar', 'CS3W-410P', 410, 20.5, 1.048, 2.108, 22.5, 380.00, '["ceramico", "fibrocimento", "metalico", "concreto"]', true),
('Jinko Solar', 'JKM415N-54HL4-B', 415, 21.0, 1.048, 2.108, 22.0, 390.00, '["ceramico", "fibrocimento", "metalico", "concreto"]', true),
('Trina Solar', 'TSM-410DE09', 410, 20.8, 1.048, 2.108, 22.8, 385.00, '["ceramico", "fibrocimento", "metalico", "concreto"]', false),
('LONGi Solar', 'LR4-60HIH-420M', 420, 21.3, 1.048, 2.108, 22.0, 395.00, '["ceramico", "fibrocimento", "metalico", "concreto"]', true),
('JA Solar', 'JAM60S20-385/MR', 385, 19.8, 1.048, 2.108, 22.5, 365.00, '["ceramico", "fibrocimento", "metalico", "concreto"]', false);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.energia_solar_configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irradiacao_estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paineis_solares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energia_bills_uploads ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para energia_solar_configuracoes
CREATE POLICY "Todos podem visualizar configurações solares" ON public.energia_solar_configuracoes
FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem gerenciar configurações solares" ON public.energia_solar_configuracoes
FOR ALL USING (is_admin_user());

-- Políticas RLS para irradiacao_estados
CREATE POLICY "Todos podem visualizar irradiação por estado" ON public.irradiacao_estados
FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem gerenciar irradiação por estado" ON public.irradiacao_estados
FOR ALL USING (is_admin_user());

-- Políticas RLS para paineis_solares
CREATE POLICY "Todos podem visualizar painéis ativos" ON public.paineis_solares
FOR SELECT USING (ativo = true OR can_manage_resources());

CREATE POLICY "Managers podem gerenciar painéis solares" ON public.paineis_solares
FOR ALL USING (can_manage_resources());

-- Políticas RLS para energia_bills_uploads
CREATE POLICY "Usuários podem visualizar seus próprios uploads" ON public.energia_bills_uploads
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.proposals p 
    WHERE p.client_id = energia_bills_uploads.client_id 
    AND (p.user_id = auth.uid() OR get_user_role(auth.uid()) = 'admin')
  )
);

CREATE POLICY "Managers podem inserir uploads de faturas" ON public.energia_bills_uploads
FOR INSERT WITH CHECK (can_manage_resources());

CREATE POLICY "Managers podem atualizar uploads de faturas" ON public.energia_bills_uploads
FOR UPDATE USING (can_manage_resources());

-- Triggers para updated_at
CREATE TRIGGER update_energia_solar_configuracoes_updated_at
  BEFORE UPDATE ON public.energia_solar_configuracoes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_paineis_solares_updated_at
  BEFORE UPDATE ON public.paineis_solares
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_energia_bills_uploads_updated_at
  BEFORE UPDATE ON public.energia_bills_uploads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Criar bucket de storage para faturas de energia
INSERT INTO storage.buckets (id, name, public) VALUES ('energy-bills', 'energy-bills', false);

-- Políticas de storage para energy-bills
CREATE POLICY "Managers podem fazer upload de faturas" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'energy-bills' AND 
  (auth.role() = 'authenticated') AND
  (get_user_role(auth.uid()) IN ('admin', 'vendedor_interno', 'representante'))
);

CREATE POLICY "Managers podem visualizar faturas" ON storage.objects
FOR SELECT USING (
  bucket_id = 'energy-bills' AND 
  (auth.role() = 'authenticated') AND
  (get_user_role(auth.uid()) IN ('admin', 'vendedor_interno', 'representante'))
);

CREATE POLICY "Managers podem atualizar faturas" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'energy-bills' AND 
  (auth.role() = 'authenticated') AND
  (get_user_role(auth.uid()) IN ('admin', 'vendedor_interno', 'representante'))
);

CREATE POLICY "Managers podem deletar faturas" ON storage.objects
FOR DELETE USING (
  bucket_id = 'energy-bills' AND 
  (auth.role() = 'authenticated') AND
  (get_user_role(auth.uid()) IN ('admin', 'vendedor_interno', 'representante'))
);