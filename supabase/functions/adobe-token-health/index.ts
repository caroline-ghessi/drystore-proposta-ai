// Adobe Token Health Check - Verificação específica do status do token
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { AdobeTokenManager } from "../_shared/adobe-token-manager.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const correlationId = `token-health-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  
  try {
    console.log(`🔍 [${correlationId}] === ADOBE TOKEN HEALTH CHECK ===`);
    
    const tokenManager = AdobeTokenManager.getInstance();
    
    const healthCheck = {
      correlation_id: correlationId,
      timestamp: new Date().toISOString(),
      token_status: {},
      actions_available: [],
      overall_status: 'unknown'
    };

    // 1. Verificar informações do token atual
    const tokenInfo = tokenManager.getTokenInfo();
    healthCheck.token_status = tokenInfo;

    // 2. Determinar ações disponíveis
    if (tokenInfo.status === 'no_token') {
      healthCheck.actions_available.push('authenticate');
      healthCheck.overall_status = 'needs_authentication';
    } else if (tokenInfo.status === 'expired') {
      healthCheck.actions_available.push('refresh_token');
      healthCheck.overall_status = 'expired';
    } else if (tokenInfo.status === 'valid') {
      healthCheck.actions_available.push('refresh_token', 'use_token');
      healthCheck.overall_status = 'healthy';
      
      // Adicionar aviso se token expira em menos de 1 hora
      if (tokenInfo.minutes_remaining < 60) {
        healthCheck.overall_status = 'expiring_soon';
        healthCheck.actions_available.unshift('refresh_token_recommended');
      }
    }

    // 3. Testar credenciais se solicitado
    const testCredentials = new URL(req.url).searchParams.get('test_credentials') === 'true';
    if (testCredentials) {
      console.log(`🧪 [${correlationId}] Testando credenciais...`);
      try {
        const isValid = await tokenManager.validateCredentials();
        healthCheck.credentials_valid = isValid;
        if (!isValid) {
          healthCheck.overall_status = 'credentials_invalid';
        }
      } catch (error) {
        healthCheck.credentials_valid = false;
        healthCheck.credential_error = error.message;
        healthCheck.overall_status = 'credentials_error';
      }
    }

    // 4. Renovar token se solicitado
    const refreshToken = new URL(req.url).searchParams.get('refresh_token') === 'true';
    if (refreshToken) {
      console.log(`🔄 [${correlationId}] Renovando token...`);
      try {
        const newToken = await tokenManager.refreshToken();
        healthCheck.token_refreshed = true;
        healthCheck.new_token_info = tokenManager.getTokenInfo();
        healthCheck.overall_status = 'refreshed';
      } catch (error) {
        healthCheck.token_refreshed = false;
        healthCheck.refresh_error = error.message;
        healthCheck.overall_status = 'refresh_failed';
      }
    }

    const statusEmoji = {
      'healthy': '✅',
      'expiring_soon': '⚠️',
      'expired': '🟡',
      'needs_authentication': '🔑',
      'credentials_invalid': '❌',
      'credentials_error': '💥',
      'refreshed': '🔄',
      'refresh_failed': '💢'
    };

    console.log(`${statusEmoji[healthCheck.overall_status] || '❓'} [${correlationId}] Token health: ${healthCheck.overall_status.toUpperCase()}`);
    
    return new Response(
      JSON.stringify(healthCheck, null, 2),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Token-Status': healthCheck.overall_status,
          'X-Correlation-ID': correlationId
        } 
      }
    );

  } catch (error) {
    console.error(`❌ [${correlationId}] Erro crítico no token health check:`, error);
    
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
          'X-Token-Status': 'critical_error',
          'X-Correlation-ID': correlationId
        } 
      }
    );
  }
});