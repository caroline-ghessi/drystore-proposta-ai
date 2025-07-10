-- Limpar dados de teste antigos para evitar confusão
UPDATE public.propostas_brutas 
SET cliente_identificado = 'DADOS_TESTE_REMOVIDO', 
    status = 'test_data_archived'
WHERE cliente_identificado ILIKE '%PEDRO BARTELLE%' 
   OR cliente_identificado ILIKE '%BARTELLE%'
   OR cliente_identificado ILIKE '%RONALDO SOUZA%';

-- Criar índice para melhorar performance na identificação de dados de teste
CREATE INDEX IF NOT EXISTS idx_propostas_brutas_cliente_test 
ON public.propostas_brutas(cliente_identificado) 
WHERE cliente_identificado ILIKE '%TESTE%' OR cliente_identificado ILIKE '%TEST%';