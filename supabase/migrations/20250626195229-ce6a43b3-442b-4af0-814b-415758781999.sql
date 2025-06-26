
-- Adicionar campo show_detailed_values na tabela proposals
ALTER TABLE public.proposals 
ADD COLUMN show_detailed_values BOOLEAN DEFAULT true;

-- Adicionar comentário para documentação
COMMENT ON COLUMN public.proposals.show_detailed_values IS 'Define se os valores detalhados devem ser exibidos na proposta para o cliente';
