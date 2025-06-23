
-- Criar tabela para armazenar configurações de funcionalidades por proposta
CREATE TABLE IF NOT EXISTS public.proposal_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  contract_generation BOOLEAN NOT NULL DEFAULT false,
  delivery_control BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(proposal_id)
);

-- Habilitar RLS
ALTER TABLE public.proposal_features ENABLE ROW LEVEL SECURITY;

-- Política para visualizar configurações de propostas
CREATE POLICY "Users can view proposal features for their proposals" 
  ON public.proposal_features 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals p 
      WHERE p.id = proposal_id 
      AND (p.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.clients c 
        WHERE c.id = p.client_id
      ))
    )
  );

-- Política para criar configurações de propostas (apenas vendedores)
CREATE POLICY "Vendors can create proposal features" 
  ON public.proposal_features 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.proposals p 
      JOIN public.profiles pr ON pr.user_id = auth.uid()
      WHERE p.id = proposal_id 
      AND pr.role IN ('admin', 'vendedor_interno', 'representante')
    )
  );

-- Política para atualizar configurações de propostas (apenas vendedores)
CREATE POLICY "Vendors can update proposal features" 
  ON public.proposal_features 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals p 
      JOIN public.profiles pr ON pr.user_id = auth.uid()
      WHERE p.id = proposal_id 
      AND pr.role IN ('admin', 'vendedor_interno', 'representante')
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE TRIGGER update_proposal_features_updated_at
  BEFORE UPDATE ON public.proposal_features
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
