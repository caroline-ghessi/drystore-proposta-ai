import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const diagnosticId = crypto.randomUUID();
  
  try {
    console.log(`🔍 [${diagnosticId}] PDF Processing Diagnostics iniciado`);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const diagnostics = {
      timestamp: new Date().toISOString(),
      diagnostic_id: diagnosticId,
      overall_status: 'unknown',
      pipeline_health: {},
      performance_metrics: {},
      bottlenecks: [],
      recommendations: []
    };

    // 1. Verificar logs recentes de processamento PDF
    console.log(`📋 [${diagnosticId}] Analisando logs de processamento...`);
    try {
      const { data: recentLogs, error: logsError } = await supabase
        .from('pdf_processing_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // últimas 24h
        .order('created_at', { ascending: false })
        .limit(50);

      if (!logsError && recentLogs) {
        const successRate = recentLogs.filter(log => log.status === 'success').length / Math.max(recentLogs.length, 1);
        const avgDuration = recentLogs
          .filter(log => log.duration_ms && log.status === 'success')
          .reduce((sum, log) => sum + (log.duration_ms || 0), 0) / 
          Math.max(recentLogs.filter(log => log.status === 'success').length, 1);

        diagnostics.pipeline_health = {
          recent_requests: recentLogs.length,
          success_rate: Math.round(successRate * 100),
          avg_duration_ms: Math.round(avgDuration || 0),
          common_errors: recentLogs
            .filter(log => log.status === 'error')
            .map(log => log.error_message)
            .slice(0, 5)
        };

        // Identificar gargalos por etapa
        const stageMetrics = {};
        recentLogs.forEach(log => {
          if (!stageMetrics[log.stage]) {
            stageMetrics[log.stage] = { total: 0, success: 0, avg_duration: 0 };
          }
          stageMetrics[log.stage].total++;
          if (log.status === 'success') {
            stageMetrics[log.stage].success++;
            stageMetrics[log.stage].avg_duration += log.duration_ms || 0;
          }
        });

        Object.keys(stageMetrics).forEach(stage => {
          const metric = stageMetrics[stage];
          metric.success_rate = Math.round((metric.success / metric.total) * 100);
          metric.avg_duration = Math.round(metric.avg_duration / Math.max(metric.success, 1));
          
          // Identificar gargalos
          if (metric.avg_duration > 30000) { // > 30s
            diagnostics.bottlenecks.push({
              stage,
              issue: 'timeout_risk',
              avg_duration: metric.avg_duration,
              recommendation: `Otimizar ${stage} - duração média de ${Math.round(metric.avg_duration/1000)}s`
            });
          }
          
          if (metric.success_rate < 80) { // < 80% sucesso
            diagnostics.bottlenecks.push({
              stage,
              issue: 'low_success_rate',
              success_rate: metric.success_rate,
              recommendation: `Investigar falhas em ${stage} - taxa de sucesso ${metric.success_rate}%`
            });
          }
        });

        diagnostics.performance_metrics = stageMetrics;
      }
    } catch (error) {
      console.error(`❌ [${diagnosticId}] Erro ao analisar logs:`, error);
      diagnostics.bottlenecks.push({
        stage: 'log_analysis',
        issue: 'analysis_error',
        error: error.message
      });
    }

    // 2. Verificar status das funções dependentes
    console.log(`🔧 [${diagnosticId}] Verificando funções dependentes...`);
    const dependentFunctions = [
      'pdf-text-extractor',
      'ai-data-organizer', 
      'proposal-formatter',
      'data-validator',
      'data-saver'
    ];

    diagnostics.pipeline_health.functions = {};
    
    for (const funcName of dependentFunctions) {
      try {
        const startTime = Date.now();
        const testResponse = await fetch(
          `${supabaseUrl}/functions/v1/${funcName}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({ diagnostic_ping: true }),
            signal: AbortSignal.timeout(5000)
          }
        );
        
        const responseTime = Date.now() - startTime;
        diagnostics.pipeline_health.functions[funcName] = {
          status: testResponse.ok ? 'operational' : 'degraded',
          response_time: responseTime,
          http_status: testResponse.status
        };
        
        if (responseTime > 3000) {
          diagnostics.bottlenecks.push({
            stage: funcName,
            issue: 'slow_response',
            response_time: responseTime,
            recommendation: `Função ${funcName} respondendo lentamente (${responseTime}ms)`
          });
        }
      } catch (error) {
        diagnostics.pipeline_health.functions[funcName] = {
          status: 'error',
          error: error.message
        };
        
        diagnostics.bottlenecks.push({
          stage: funcName,
          issue: 'function_error',
          error: error.message,
          recommendation: `Verificar função ${funcName} - não responsiva`
        });
      }
    }

    // 3. Gerar recomendações
    if (diagnostics.bottlenecks.length === 0) {
      diagnostics.overall_status = 'healthy';
      diagnostics.recommendations.push('Pipeline funcionando normalmente');
    } else if (diagnostics.bottlenecks.length <= 2) {
      diagnostics.overall_status = 'degraded';
      diagnostics.recommendations.push('Pipeline com pequenos problemas de performance');
    } else {
      diagnostics.overall_status = 'unhealthy';
      diagnostics.recommendations.push('Pipeline com problemas significativos');
    }

    // Recomendações específicas
    if (diagnostics.pipeline_health.success_rate < 70) {
      diagnostics.recommendations.push('Taxa de sucesso baixa - verificar credenciais Adobe e conectividade');
    }
    
    if (diagnostics.pipeline_health.avg_duration_ms > 45000) {
      diagnostics.recommendations.push('Duração média alta - considerar otimização de timeouts e processamento');
    }

    console.log(`✅ [${diagnosticId}] Diagnóstico concluído: ${diagnostics.overall_status}`);

    return new Response(
      JSON.stringify(diagnostics),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error(`❌ [${diagnosticId}] Erro no diagnóstico:`, error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        diagnostic_id: diagnosticId
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});