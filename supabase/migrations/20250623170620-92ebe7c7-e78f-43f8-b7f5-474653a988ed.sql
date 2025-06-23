
-- Habilitar RLS nas tabelas que estão sem proteção
ALTER TABLE public.proposal_recommended_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_solutions ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para proposal_recommended_products
-- Usuários podem ver produtos recomendados de suas próprias propostas
CREATE POLICY "Users can view recommended products for their proposals" 
  ON public.proposal_recommended_products 
  FOR SELECT 
  USING (
    proposal_id IN (
      SELECT id FROM public.proposals 
      WHERE user_id = auth.uid()
    )
  );

-- Administradores podem ver todos os produtos recomendados
CREATE POLICY "Admins can view all recommended products" 
  ON public.proposal_recommended_products 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Usuários podem inserir produtos recomendados em suas próprias propostas
CREATE POLICY "Users can insert recommended products for their proposals" 
  ON public.proposal_recommended_products 
  FOR INSERT 
  WITH CHECK (
    proposal_id IN (
      SELECT id FROM public.proposals 
      WHERE user_id = auth.uid()
    )
  );

-- Usuários podem atualizar produtos recomendados de suas próprias propostas
CREATE POLICY "Users can update recommended products for their proposals" 
  ON public.proposal_recommended_products 
  FOR UPDATE 
  USING (
    proposal_id IN (
      SELECT id FROM public.proposals 
      WHERE user_id = auth.uid()
    )
  );

-- Usuários podem deletar produtos recomendados de suas próprias propostas
CREATE POLICY "Users can delete recommended products for their proposals" 
  ON public.proposal_recommended_products 
  FOR DELETE 
  USING (
    proposal_id IN (
      SELECT id FROM public.proposals 
      WHERE user_id = auth.uid()
    )
  );

-- Criar políticas RLS para proposal_solutions
-- Usuários podem ver soluções de suas próprias propostas
CREATE POLICY "Users can view solutions for their proposals" 
  ON public.proposal_solutions 
  FOR SELECT 
  USING (
    proposal_id IN (
      SELECT id FROM public.proposals 
      WHERE user_id = auth.uid()
    )
  );

-- Administradores podem ver todas as soluções
CREATE POLICY "Admins can view all solutions" 
  ON public.proposal_solutions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Usuários podem inserir soluções em suas próprias propostas
CREATE POLICY "Users can insert solutions for their proposals" 
  ON public.proposal_solutions 
  FOR INSERT 
  WITH CHECK (
    proposal_id IN (
      SELECT id FROM public.proposals 
      WHERE user_id = auth.uid()
    )
  );

-- Usuários podem atualizar soluções de suas próprias propostas
CREATE POLICY "Users can update solutions for their proposals" 
  ON public.proposal_solutions 
  FOR UPDATE 
  USING (
    proposal_id IN (
      SELECT id FROM public.proposals 
      WHERE user_id = auth.uid()
    )
  );

-- Usuários podem deletar soluções de suas próprias propostas
CREATE POLICY "Users can delete solutions for their proposals" 
  ON public.proposal_solutions 
  FOR DELETE 
  USING (
    proposal_id IN (
      SELECT id FROM public.proposals 
      WHERE user_id = auth.uid()
    )
  );

-- Verificar se há outras tabelas relacionadas a propostas sem RLS
-- Esta é apenas uma verificação, não uma alteração
-- Se necessário, habilitaremos RLS em outras tabelas em migrações futuras

-- Adicionar índices para melhorar performance das consultas RLS
CREATE INDEX IF NOT EXISTS idx_proposal_recommended_products_proposal_id 
  ON public.proposal_recommended_products(proposal_id);

CREATE INDEX IF NOT EXISTS idx_proposal_solutions_proposal_id 
  ON public.proposal_solutions(proposal_id);
