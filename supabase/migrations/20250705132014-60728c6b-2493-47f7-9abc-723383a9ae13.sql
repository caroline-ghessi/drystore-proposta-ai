-- Criar tabela de inversores solares
CREATE TABLE public.inversores_solares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fabricante TEXT NOT NULL,
  modelo TEXT NOT NULL,
  potencia_kw NUMERIC NOT NULL,
  eficiencia NUMERIC NOT NULL DEFAULT 0.97,
  preco_unitario NUMERIC NOT NULL DEFAULT 0,
  tipos_instalacao JSONB DEFAULT '["residencial", "comercial", "industrial"]'::jsonb,
  faixa_potencia_min_kwp NUMERIC DEFAULT 0,
  faixa_potencia_max_kwp NUMERIC DEFAULT 100,
  ativo BOOLEAN DEFAULT true,
  destaque BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir alguns inversores de exemplo
INSERT INTO public.inversores_solares (fabricante, modelo, potencia_kw, eficiencia, preco_unitario, faixa_potencia_min_kwp, faixa_potencia_max_kwp, destaque) VALUES
('Fronius', 'Primo 5.0-1', 5.0, 0.975, 3500.00, 3.0, 6.0, true),
('Fronius', 'Primo 8.2-1', 8.2, 0.976, 4800.00, 6.0, 10.0, true),
('Fronius', 'Primo 15.0-1', 15.0, 0.977, 7200.00, 10.0, 18.0, false),
('ABB', 'UNO-DM-5.0-TL', 5.0, 0.973, 3200.00, 3.0, 6.0, false),
('ABB', 'TRIO-8.5-TL', 8.5, 0.975, 5100.00, 6.0, 10.0, true),
('SolarEdge', 'SE5000H', 5.0, 0.974, 3800.00, 3.0, 6.0, false),
('SolarEdge', 'SE10000H', 10.0, 0.976, 6500.00, 8.0, 12.0, true);

-- Expandir configurações solares com custos detalhados
ALTER TABLE public.energia_solar_configuracoes 
ADD COLUMN IF NOT EXISTS custo_inversor_wp NUMERIC DEFAULT 0.60,
ADD COLUMN IF NOT EXISTS custo_estrutura_wp NUMERIC DEFAULT 0.45,
ADD COLUMN IF NOT EXISTS custo_eletrico_wp NUMERIC DEFAULT 0.35,
ADD COLUMN IF NOT EXISTS custo_mao_obra_wp NUMERIC DEFAULT 0.80,
ADD COLUMN IF NOT EXISTS margem_adicional_equipamentos NUMERIC DEFAULT 0.15;

-- Atualizar configuração padrão
UPDATE public.energia_solar_configuracoes 
SET 
  custo_inversor_wp = 0.60,
  custo_estrutura_wp = 0.45, 
  custo_eletrico_wp = 0.35,
  custo_mao_obra_wp = 0.80,
  margem_adicional_equipamentos = 0.15
WHERE ativo = true;

-- RLS policies para inversores
ALTER TABLE public.inversores_solares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers podem gerenciar inversores solares" 
ON public.inversores_solares 
FOR ALL 
USING (can_manage_resources());

CREATE POLICY "Todos podem visualizar inversores ativos" 
ON public.inversores_solares 
FOR SELECT 
USING (ativo = true OR can_manage_resources());

-- Triggers para updated_at
CREATE TRIGGER update_inversores_solares_updated_at
  BEFORE UPDATE ON public.inversores_solares
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();