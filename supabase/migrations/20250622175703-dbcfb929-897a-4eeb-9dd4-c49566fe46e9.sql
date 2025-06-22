
-- Criar tabela para dados brutos das propostas extraídas
CREATE TABLE public.propostas_brutas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  arquivo_nome TEXT NOT NULL,
  arquivo_tamanho INTEGER NOT NULL,
  dados_adobe_json JSONB,
  dados_estruturados JSONB,
  cliente_identificado TEXT,
  valor_total_extraido NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'confirmed', 'processed', 'error')),
  erro_processamento TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.propostas_brutas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para propostas_brutas
CREATE POLICY "Users can view their own raw proposals" 
  ON public.propostas_brutas 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own raw proposals" 
  ON public.propostas_brutas 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own raw proposals" 
  ON public.propostas_brutas 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Adicionar trigger para updated_at
CREATE TRIGGER propostas_brutas_updated_at
  BEFORE UPDATE ON public.propostas_brutas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Criar índices para performance
CREATE INDEX idx_propostas_brutas_user_id ON public.propostas_brutas(user_id);
CREATE INDEX idx_propostas_brutas_status ON public.propostas_brutas(status);
CREATE INDEX idx_propostas_brutas_created_at ON public.propostas_brutas(created_at);
