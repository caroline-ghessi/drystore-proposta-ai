
-- Adicionar campo proposal_number na tabela proposals
ALTER TABLE public.proposals 
ADD COLUMN proposal_number TEXT;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN public.proposals.proposal_number IS 'Número do orçamento extraído do PDF (ex: N131719, PROP-123)';
