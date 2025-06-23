
-- Atualizar propostas existentes de 'draft' para 'sent'
-- Isso permitirá que propostas já criadas sejam visíveis no portal do cliente
UPDATE public.proposals 
SET status = 'sent', updated_at = now()
WHERE status = 'draft';
