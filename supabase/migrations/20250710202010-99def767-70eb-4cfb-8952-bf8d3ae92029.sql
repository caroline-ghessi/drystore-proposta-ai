-- Limpar dados de teste usando status válido do default
UPDATE public.propostas_brutas 
SET cliente_identificado = 'DADOS_TESTE_REMOVIDO', 
    status = 'pending_review'
WHERE cliente_identificado ILIKE '%PEDRO BARTELLE%' 
   OR cliente_identificado ILIKE '%BARTELLE%'
   OR cliente_identificado ILIKE '%RONALDO SOUZA%';