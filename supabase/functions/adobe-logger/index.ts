import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const logData = await req.json();
    const correlationId = logData.correlationId || crypto.randomUUID().substring(0, 8);
    
    // Log estruturado no console para debug em tempo real
    const logEntry = {
      correlation_id: correlationId,
      timestamp: new Date().toISOString(),
      stage: logData.stage,
      status: logData.status, // 'started', 'progress', 'success', 'error', 'timeout'
      function_name: logData.function_name,
      user_id: logData.user_id,
      file_name: logData.file_name,
      file_size: logData.file_size,
      duration_ms: logData.duration_ms,
      error_message: logData.error_message,
      error_stack: logData.error_stack,
      adobe_status: logData.adobe_status,
      adobe_asset_id: logData.adobe_asset_id,
      details: logData.details || {},
      retry_count: logData.retry_count || 0
    };

    // Console log colorido e estruturado
    const emoji = getStatusEmoji(logData.status);
    const prefix = `${emoji} [${correlationId}]`;
    
    console.log(`${prefix} === ADOBE PROCESSING LOG ===`);
    console.log(JSON.stringify(logEntry, null, 2));
    
    // Salvar no banco para análise posterior
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
      .from('pdf_processing_logs')
      .insert([{
        processing_id: correlationId,
        user_id: logData.user_id,
        file_name: logData.file_name,
        stage: `${logData.function_name}:${logData.stage}`,
        status: logData.status,
        duration_ms: logData.duration_ms,
        error_message: logData.error_message,
        details: logEntry
      }]);

    if (error) {
      console.error(`${prefix} ❌ Erro ao salvar log no banco:`, error);
    }

    // Alertas em tempo real para erros críticos
    if (logData.status === 'error' || logData.status === 'timeout') {
      await sendAlert(logEntry);
    }

    return new Response(
      JSON.stringify({ success: true, correlation_id: correlationId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro no logger Adobe:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'started': return '🚀';
    case 'progress': return '⏳';
    case 'success': return '✅';
    case 'error': return '❌';
    case 'timeout': return '⏰';
    case 'warning': return '⚠️';
    default: return '📋';
  }
}

async function sendAlert(logEntry: any) {
  try {
    console.log('🚨 ALERTA CRÍTICO - Erro na integração Adobe:', {
      correlation_id: logEntry.correlation_id,
      stage: logEntry.stage,
      error: logEntry.error_message,
      file_name: logEntry.file_name,
      timestamp: logEntry.timestamp
    });
    
    // Aqui poderia integrar com Slack, Discord, email, etc.
    // Por agora, apenas log estruturado
  } catch (error) {
    console.error('❌ Erro ao enviar alerta:', error);
  }
}