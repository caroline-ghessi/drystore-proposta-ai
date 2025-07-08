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
    const { 
      stage, 
      status, 
      details, 
      user_id, 
      file_name,
      processing_id,
      duration,
      error_message 
    } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log estruturado para debug
    const logEntry = {
      processing_id: processing_id || crypto.randomUUID(),
      user_id,
      file_name,
      stage,
      status, // 'started', 'success', 'error', 'timeout'
      duration_ms: duration,
      error_message,
      details: details || {},
      timestamp: new Date().toISOString()
    };

    console.log(`🔍 PDF Processing Log [${stage}]:`, JSON.stringify(logEntry, null, 2));

    // Salvar no banco para análise posterior
    const { error } = await supabase
      .from('pdf_processing_logs')
      .insert([{
        processing_id: logEntry.processing_id,
        user_id: logEntry.user_id,
        file_name: logEntry.file_name,
        stage: logEntry.stage,
        status: logEntry.status,
        duration_ms: logEntry.duration_ms,
        error_message: logEntry.error_message,
        details: logEntry.details,
      }]);

    if (error) {
      console.error('❌ Erro ao salvar log:', error);
    }

    // Métricas agregadas
    if (status === 'error') {
      await trackErrorMetrics(supabase, stage, error_message);
    } else if (status === 'success') {
      await trackSuccessMetrics(supabase, stage, duration);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processing_id: logEntry.processing_id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro no logger:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function trackErrorMetrics(supabase: any, stage: string, errorMessage: string) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    await supabase
      .from('pdf_processing_metrics')
      .upsert([{
        date: today,
        stage,
        error_count: 1,
        total_attempts: 1,
        most_common_error: errorMessage
      }], {
        onConflict: 'date,stage',
        update: {
          error_count: 'pdf_processing_metrics.error_count + 1',
          total_attempts: 'pdf_processing_metrics.total_attempts + 1'
        }
      });
  } catch (error) {
    console.error('❌ Erro ao rastrear métricas de erro:', error);
  }
}

async function trackSuccessMetrics(supabase: any, stage: string, duration: number) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    await supabase
      .from('pdf_processing_metrics')
      .upsert([{
        date: today,
        stage,
        success_count: 1,
        total_attempts: 1,
        avg_duration_ms: duration
      }], {
        onConflict: 'date,stage',
        update: {
          success_count: 'pdf_processing_metrics.success_count + 1',
          total_attempts: 'pdf_processing_metrics.total_attempts + 1',
          avg_duration_ms: `(pdf_processing_metrics.avg_duration_ms * pdf_processing_metrics.success_count + ${duration}) / (pdf_processing_metrics.success_count + 1)`
        }
      });
  } catch (error) {
    console.error('❌ Erro ao rastrear métricas de sucesso:', error);
  }
}