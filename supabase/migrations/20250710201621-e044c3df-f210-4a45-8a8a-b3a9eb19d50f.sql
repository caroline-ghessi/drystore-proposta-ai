-- Limpar dados de teste antigos usando status válido
UPDATE public.propostas_brutas 
SET cliente_identificado = 'DADOS_TESTE_REMOVIDO', 
    status = 'processed_with_errors'
WHERE cliente_identificado ILIKE '%PEDRO BARTELLE%' 
   OR cliente_identificado ILIKE '%BARTELLE%'
   OR cliente_identificado ILIKE '%RONALDO SOUZA%';

-- Criar índice para melhorar performance 
CREATE INDEX IF NOT EXISTS idx_propostas_brutas_cliente_test 
ON public.propostas_brutas(cliente_identificado) 
WHERE cliente_identificado ILIKE '%TESTE%' OR cliente_identificado ILIKE '%TEST%';