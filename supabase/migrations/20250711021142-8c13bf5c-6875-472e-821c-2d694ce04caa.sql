-- Habilitar extensões necessárias para jobs automatizados
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Configurar job de auto-renovação do token Adobe
-- Verifica A CADA HORA se o token precisa ser renovado (quando restam menos de 4 horas)
SELECT cron.schedule(
    'adobe-token-auto-renewal',
    '0 * * * *', -- A cada hora no minuto 0
    $$
    SELECT
      net.http_post(
          url := 'https://mlzgeceiinjwpffgsxuy.supabase.co/functions/v1/adobe-token-manager',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1semdlY2VpaW5qd3BmZmdzeHV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQyOTAwMSwiZXhwIjoyMDY2MDA1MDAxfQ.gBnLANvpK9g8VdFjk1xZbmY6cV7aGH2R8-0mHs1QZEI"}'::jsonb,
          body := '{"action": "auto_renewal_check"}'::jsonb
      ) as request_id;
    $$
);

-- Adicionar log da configuração
INSERT INTO public.security_events (event_type, details, severity)
VALUES (
  'adobe_cron_job_configured',
  jsonb_build_object(
    'schedule', '0 * * * *',
    'action', 'auto_renewal_check',
    'description', 'Job configurado para verificar renovação de token Adobe a cada hora',
    'timestamp', now()
  ),
  'low'
);