-- LIMPEZA COMPLETA DOS DADOS DE TESTE - Resolver poluição do sistema

-- 1. Deletar TODOS os registros com "PEDRO BARTELLE" (dados de teste antigos)
DELETE FROM public.propostas_brutas 
WHERE cliente_identificado = 'PEDRO BARTELLE'
   OR cliente_identificado ILIKE '%PEDRO%BARTELLE%'
   OR arquivo_nome ILIKE '%PEDRO%BARTELLE%';

-- 2. Deletar registros com "PROPOSTA COMERCIAL" como cliente (falso positivo comum)
DELETE FROM public.propostas_brutas 
WHERE cliente_identificado = 'PROPOSTA COMERCIAL'
   OR cliente_identificado ILIKE '%PROPOSTA%COMERCIAL%';

-- 3. Deletar outros dados de teste óbvios
DELETE FROM public.propostas_brutas 
WHERE cliente_identificado IN ('DADOS_TESTE_REMOVIDO', 'Test Client', 'Cliente Teste')
   OR arquivo_nome ILIKE '%test%' 
   OR arquivo_nome ILIKE '%exemplo%' 
   OR arquivo_nome ILIKE '%demo%'
   OR arquivo_nome ILIKE '%sample%';

-- 4. Resetar registros com dados estruturados inválidos (valor muito baixo ou muito alto)
DELETE FROM public.propostas_brutas 
WHERE valor_total_extraido < 100 
   OR valor_total_extraido > 1000000;

-- 5. Limpar registros antigos com status de erro permanente (mais de 7 dias)
DELETE FROM public.propostas_brutas 
WHERE status = 'error' 
   AND created_at < NOW() - INTERVAL '7 days';