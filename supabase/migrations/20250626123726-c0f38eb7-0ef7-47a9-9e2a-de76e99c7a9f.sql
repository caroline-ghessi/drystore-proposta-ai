
-- Adicionar campo product_group na tabela proposals
ALTER TABLE public.proposals 
ADD COLUMN product_group TEXT;

-- Adicionar comentário para documentação
COMMENT ON COLUMN public.proposals.product_group IS 'Grupo de produtos/solução selecionado para definir layout personalizado da proposta';
