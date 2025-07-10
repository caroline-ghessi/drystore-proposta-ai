import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SystemMetrics {
  edge_functions: {
    [key: string]: {
      status: 'healthy' | 'degraded' | 'failing',
      last_success: string | null,
      error_rate: number,
      avg_response_time: number
    }
  },
  adobe_integration: {
    status: 'healthy' | 'degraded' | 'failing',
    last_success: string | null,
    auth_success_rate: number,
    upload_success_rate: number,
    extraction_success_rate: number
  },
  database: {
    status: 'healthy' | 'degraded' | 'failing',
    connection_pool: number,
    slow_queries: number
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const correlationId = `monitor-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  
  try {
    console.log(`📊 [${correlationId}] === SYSTEM MONITORING CHECK ===`);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const monitoring = {
      correlation_id: correlationId,
      timestamp: new Date().toISOString(),
      overall_health: 'healthy' as 'healthy' | 'degraded' | 'critical',
      metrics: {} as SystemMetrics,
      alerts: [] as string[],
      recommendations: [] as string[]
    };

    // 1. Verificar métricas de processamento PDF
    try {
      console.log(`📋 [${correlationId}] Analisando métricas de processamento PDF...`);
      
      const { data: pdfMetrics } = await supabase
        .from('pdf_processing_metrics')
        .select('*')
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });

      const totalAttempts = pdfMetrics?.reduce((sum, m) => sum + m.total_attempts, 0) || 0;
      const totalErrors = pdfMetrics?.reduce((sum, m) => sum + m.error_count, 0) || 0;
      const errorRate = totalAttempts > 0 ? (totalErrors / totalAttempts) * 100 : 0;

      monitoring.metrics.adobe_integration = {
        status: errorRate > 50 ? 'failing' : errorRate > 25 ? 'degraded' : 'healthy',
        last_success: pdfMetrics?.[0]?.updated_at || null,
        auth_success_rate: 100 - errorRate,
        upload_success_rate: 100 - errorRate,
        extraction_success_rate: 100 - errorRate
      };

      if (errorRate > 25) {
        monitoring.alerts.push(`Taxa de erro alta no processamento PDF: ${errorRate.toFixed(1)}%`);
      }

      if (errorRate > 50) {
        monitoring.overall_health = 'critical';
        monitoring.recommendations.push('Verificar credenciais Adobe e conectividade');
      } else if (errorRate > 25) {
        monitoring.overall_health = 'degraded';
        monitoring.recommendations.push('Monitorar tendência de erros Adobe');
      }

    } catch (error) {
      console.error(`❌ [${correlationId}] Erro ao analisar métricas PDF:`, error);
      monitoring.alerts.push('Falha ao acessar métricas de processamento PDF');
    }

    // 2. Verificar logs de erro recentes
    try {
      console.log(`📜 [${correlationId}] Verificando logs de erro recentes...`);
      
      const { data: recentErrors } = await supabase
        .from('pdf_processing_logs')
        .select('*')
        .eq('status', 'error')
        .gte('created_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentErrors && recentErrors.length > 5) {
        monitoring.alerts.push(`${recentErrors.length} erros nas últimas 2 horas`);
        if (monitoring.overall_health === 'healthy') {
          monitoring.overall_health = 'degraded';
        }
      }

      // Analisar padrões de erro
      const errorPatterns = new Map();
      recentErrors?.forEach(error => {
        const pattern = error.error_message?.substring(0, 50) || 'Erro desconhecido';
        errorPatterns.set(pattern, (errorPatterns.get(pattern) || 0) + 1);
      });

      if (errorPatterns.size > 0) {
        const mostCommonError = Array.from(errorPatterns.entries())
          .sort((a, b) => b[1] - a[1])[0];
        
        if (mostCommonError[1] > 3) {
          monitoring.alerts.push(`Erro recorrente: ${mostCommonError[0]} (${mostCommonError[1]}x)`);
          monitoring.recommendations.push(`Investigar erro: ${mostCommonError[0]}`);
        }
      }

    } catch (error) {
      console.error(`❌ [${correlationId}] Erro ao verificar logs:`, error);
    }

    // 3. Verificar status das Edge Functions
    const edgeFunctions = [
      'extract-pdf-data',
      'upload-to-adobe', 
      'pdf-text-extractor',
      'process-adobe-extraction',
      'debug-adobe-health'
    ];

    monitoring.metrics.edge_functions = {};

    for (const funcName of edgeFunctions) {
      try {
        const startTime = Date.now();
        
        // Fazer uma requisição de health check básica
        const response = await fetch(`https://mlzgeceiinjwpffgsxuy.supabase.co/functions/v1/${funcName}`, {
          method: 'OPTIONS'
        });
        
        const responseTime = Date.now() - startTime;
        
        monitoring.metrics.edge_functions[funcName] = {
          status: response.ok ? 'healthy' : 'failing',
          last_success: response.ok ? new Date().toISOString() : null,
          error_rate: response.ok ? 0 : 100,
          avg_response_time: responseTime
        };

        if (!response.ok) {
          monitoring.alerts.push(`Edge Function ${funcName} não responde`);
          if (monitoring.overall_health !== 'critical') {
            monitoring.overall_health = 'degraded';
          }
        }

        if (responseTime > 10000) {
          monitoring.alerts.push(`Edge Function ${funcName} com alta latência: ${responseTime}ms`);
        }

      } catch (error) {
        monitoring.metrics.edge_functions[funcName] = {
          status: 'failing',
          last_success: null,
          error_rate: 100,
          avg_response_time: 0
        };
        
        monitoring.alerts.push(`Edge Function ${funcName} inacessível`);
        console.error(`❌ [${correlationId}] Erro ao verificar ${funcName}:`, error);
      }
    }

    // 4. Health Score geral
    const healthyFunctions = Object.values(monitoring.metrics.edge_functions)
      .filter(f => f.status === 'healthy').length;
    const totalFunctions = Object.keys(monitoring.metrics.edge_functions).length;
    const functionHealthScore = (healthyFunctions / totalFunctions) * 100;

    if (functionHealthScore < 50) {
      monitoring.overall_health = 'critical';
    } else if (functionHealthScore < 80) {
      if (monitoring.overall_health === 'healthy') {
        monitoring.overall_health = 'degraded';
      }
    }

    // 5. Recomendações baseadas no status
    if (monitoring.overall_health === 'critical') {
      monitoring.recommendations.push('AÇÃO IMEDIATA: Verificar status do Supabase e Adobe');
      monitoring.recommendations.push('Revisar logs de erro detalhados');
      monitoring.recommendations.push('Considerar ativar modo de fallback');
    } else if (monitoring.overall_health === 'degraded') {
      monitoring.recommendations.push('Monitorar tendências de erro');
      monitoring.recommendations.push('Verificar configurações Adobe');
      monitoring.recommendations.push('Analisar padrões de falha');
    }

    const emoji = monitoring.overall_health === 'healthy' ? '✅' : 
                  monitoring.overall_health === 'degraded' ? '⚠️' : '🚨';
    
    console.log(`${emoji} [${correlationId}] System health: ${monitoring.overall_health.toUpperCase()}`);
    console.log(`📊 [${correlationId}] Edge Functions: ${healthyFunctions}/${totalFunctions} healthy`);
    console.log(`🔗 [${correlationId}] Adobe success rate: ${monitoring.metrics.adobe_integration.auth_success_rate.toFixed(1)}%`);
    
    if (monitoring.alerts.length > 0) {
      console.log(`🚨 [${correlationId}] Alertas ativos:`, monitoring.alerts);
    }

    return new Response(
      JSON.stringify(monitoring, null, 2),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Health-Status': monitoring.overall_health,
          'X-Correlation-ID': correlationId,
          'X-Function-Health-Score': functionHealthScore.toString(),
          'X-Alert-Count': monitoring.alerts.length.toString()
        } 
      }
    );

  } catch (error) {
    console.error(`❌ [${correlationId}] Erro crítico no system monitor:`, {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({
        correlation_id: correlationId,
        timestamp: new Date().toISOString(),
        overall_health: 'critical',
        error: error.message,
        stack: error.stack,
        alerts: ['Sistema de monitoramento falhou'],
        recommendations: ['Verificar infraestrutura básica', 'Contatar suporte técnico']
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Health-Status': 'critical',
          'X-Correlation-ID': correlationId
        } 
      }
    );
  }
});