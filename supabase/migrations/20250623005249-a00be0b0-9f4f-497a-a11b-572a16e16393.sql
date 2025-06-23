
-- Remover políticas problemáticas que fazem JOIN com auth.users
DROP POLICY IF EXISTS "Users can view proposal items for accessible proposals" ON public.proposal_items;
DROP POLICY IF EXISTS "Users can view their own proposals or client access" ON public.proposals;

-- Criar novas políticas simplificadas para proposal_items
CREATE POLICY "Users can view their own proposal items" ON public.proposal_items
  FOR SELECT USING (
    proposal_id IN (
      SELECT id FROM public.proposals 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all proposal items" ON public.proposal_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Criar novas políticas simplificadas para proposals
CREATE POLICY "Users can view their own proposals" ON public.proposals
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all proposals" ON public.proposals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Manter política para inserção de propostas
CREATE POLICY "Users can create proposals" ON public.proposals
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Política para atualização de propostas
CREATE POLICY "Users can update their own proposals" ON public.proposals
  FOR UPDATE USING (user_id = auth.uid());

-- Política para inserção de itens da proposta
CREATE POLICY "Users can create proposal items for their proposals" ON public.proposal_items
  FOR INSERT WITH CHECK (
    proposal_id IN (
      SELECT id FROM public.proposals 
      WHERE user_id = auth.uid()
    )
  );

-- Política para atualização de itens da proposta
CREATE POLICY "Users can update their own proposal items" ON public.proposal_items
  FOR UPDATE USING (
    proposal_id IN (
      SELECT id FROM public.proposals 
      WHERE user_id = auth.uid()
    )
  );
