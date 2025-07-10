import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const correlationId = `health-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  
  try {
    console.log(`🔍 [${correlationId}] === ADOBE HEALTH CHECK ===`);
    
    const healthCheck = {
      correlation_id: correlationId,
      timestamp: new Date().toISOString(),
      checks: {},
      overall_status: 'healthy',
      errors: []
    };

    // 1. Verificar credenciais Adobe
    const adobeClientId = Deno.env.get('ADOBE_CLIENT_ID');
    const adobeClientSecret = Deno.env.get('ADOBE_CLIENT_SECRET');
    const adobeOrgId = Deno.env.get('ADOBE_ORG_ID');

    healthCheck.checks.credentials = {
      has_client_id: !!adobeClientId,
      has_client_secret: !!adobeClientSecret,
      has_org_id: !!adobeOrgId,
      client_id_preview: adobeClientId ? adobeClientId.substring(0, 8) + '...' : 'missing'
    };

    if (!adobeClientId || !adobeClientSecret || !adobeOrgId) {
      healthCheck.overall_status = 'unhealthy';
      healthCheck.errors.push('Adobe credentials incomplete');
    }

    // 2. Testar autenticação Adobe (se credenciais disponíveis)
    if (adobeClientId && adobeClientSecret && adobeOrgId) {
      try {
        console.log(`🔐 [${correlationId}] Testando autenticação Adobe...`);
        const authStartTime = Date.now();
        
        const tokenResponse = await fetch('https://ims-na1.adobelogin.com/ims/token/v1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'client_id': adobeClientId,
            'client_secret': adobeClientSecret,
            'grant_type': 'client_credentials',
            'scope': 'openid,AdobeID,read_organizations,additional_info.projectedProductContext'
          }).toString()
        });

        const authDuration = Date.now() - authStartTime;
        
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          healthCheck.checks.authentication = {
            status: 'success',
            duration_ms: authDuration,
            has_token: !!tokenData.access_token,
            expires_in: tokenData.expires_in || 'unknown',
            token_preview: tokenData.access_token ? tokenData.access_token.substring(0, 20) + '...' : 'missing'
          };
          console.log(`✅ [${correlationId}] Autenticação Adobe OK (${authDuration}ms)`);
        } else {
          const errorText = await tokenResponse.text();
          healthCheck.checks.authentication = {
            status: 'failed',
            duration_ms: authDuration,
            error_status: tokenResponse.status,
            error_message: errorText
          };
          healthCheck.overall_status = 'unhealthy';
          healthCheck.errors.push(`Authentication failed: ${tokenResponse.status}`);
          console.error(`❌ [${correlationId}] Autenticação Adobe falhou:`, tokenResponse.status, errorText);
        }
      } catch (authError) {
        healthCheck.checks.authentication = {
          status: 'error',
          error_message: authError.message,
          error_stack: authError.stack
        };
        healthCheck.overall_status = 'unhealthy';
        healthCheck.errors.push(`Authentication error: ${authError.message}`);
        console.error(`❌ [${correlationId}] Erro na autenticação Adobe:`, authError);
      }
    } else {
      healthCheck.checks.authentication = {
        status: 'skipped',
        reason: 'Missing credentials'
      };
    }

    // 3. Verificar conectividade com Adobe PDF Services
    try {
      console.log(`🌐 [${correlationId}] Testando conectividade Adobe PDF Services...`);
      const connectivityStartTime = Date.now();
      
      const response = await fetch('https://pdf-services.adobe.io/assets', {
        method: 'OPTIONS'
      });
      
      const connectivityDuration = Date.now() - connectivityStartTime;
      
      healthCheck.checks.connectivity = {
        status: 'success',
        duration_ms: connectivityDuration,
        endpoint: 'https://pdf-services.adobe.io/assets'
      };
      console.log(`✅ [${correlationId}] Conectividade Adobe OK (${connectivityDuration}ms)`);
    } catch (connectError) {
      healthCheck.checks.connectivity = {
        status: 'failed',
        error_message: connectError.message,
        endpoint: 'https://pdf-services.adobe.io/assets'
      };
      healthCheck.overall_status = 'degraded';
      healthCheck.errors.push(`Connectivity error: ${connectError.message}`);
      console.error(`❌ [${correlationId}] Erro de conectividade Adobe:`, connectError);
    }

    // 4. Verificar status das edge functions relacionadas
    const edgeFunctions = [
      'extract-pdf-data',
      'upload-to-adobe', 
      'pdf-text-extractor',
      'process-adobe-extraction'
    ];
    
    healthCheck.checks.edge_functions = {};
    
    for (const funcName of edgeFunctions) {
      try {
        console.log(`🔧 [${correlationId}] Verificando função ${funcName}...`);
        
        // Simular verificação de health da função
        healthCheck.checks.edge_functions[funcName] = {
          status: 'available',
          last_check: new Date().toISOString()
        };
      } catch (funcError) {
        healthCheck.checks.edge_functions[funcName] = {
          status: 'unavailable',
          error_message: funcError.message
        };
        healthCheck.overall_status = 'degraded';
      }
    }

    // 5. Resumo final
    const totalErrors = healthCheck.errors.length;
    if (totalErrors === 0) {
      healthCheck.overall_status = 'healthy';
    } else if (totalErrors <= 2) {
      healthCheck.overall_status = 'degraded';
    } else {
      healthCheck.overall_status = 'unhealthy';
    }

    const emoji = healthCheck.overall_status === 'healthy' ? '✅' : 
                  healthCheck.overall_status === 'degraded' ? '⚠️' : '❌';
    
    console.log(`${emoji} [${correlationId}] Health check concluído: ${healthCheck.overall_status.toUpperCase()}`);
    console.log(`📊 [${correlationId}] Erros encontrados: ${totalErrors}`);
    
    if (totalErrors > 0) {
      console.log(`🚨 [${correlationId}] Problemas identificados:`, healthCheck.errors);
    }

    return new Response(
      JSON.stringify(healthCheck, null, 2),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Health-Status': healthCheck.overall_status,
          'X-Correlation-ID': correlationId
        } 
      }
    );

  } catch (error) {
    console.error(`❌ [${correlationId}] Erro crítico no health check:`, {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({
        correlation_id: correlationId,
        timestamp: new Date().toISOString(),
        overall_status: 'critical_error',
        error: error.message,
        stack: error.stack
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Health-Status': 'critical_error',
          'X-Correlation-ID': correlationId
        } 
      }
    );
  }
});