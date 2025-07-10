-- Limpar registros marcados erroneamente como teste
UPDATE public.propostas_brutas 
SET cliente_identificado = NULL,
    status = 'processing'
WHERE cliente_identificado = 'DADOS_TESTE_REMOVIDO' 
   AND arquivo_nome NOT ILIKE '%test%' 
   AND arquivo_nome NOT ILIKE '%exemplo%';

-- Remover registros obviamente de teste baseados no nome do arquivo
DELETE FROM public.propostas_brutas 
WHERE arquivo_nome ILIKE '%test%' 
   OR arquivo_nome ILIKE '%exemplo%' 
   OR arquivo_nome ILIKE '%demo%';