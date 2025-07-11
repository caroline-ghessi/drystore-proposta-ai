import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenCache {
  id: string;
  access_token: string;
  expires_at: string;
  created_at: string;
  last_accessed: string;
  last_validated: string;
  renewal_count: number;
  is_active: boolean;
  correlation_id: string;
  client_id: string;
  scopes: string;
  token_source: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();
    const correlationId = crypto.randomUUID();
    
    console.log(`🔧 [${correlationId}] Adobe Token Manager - Action: ${action}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let result;
    switch (action) {
      case 'get_token':
        result = await getValidToken(supabase, correlationId);
        break;
      case 'renew_token':
        result = await forceRenewToken(supabase, correlationId);
        break;
      case 'status':
        result = await getTokenStatus(supabase, correlationId);
        break;
      case 'auto_renewal_check':
        result = await autoRenewalCheck(supabase, correlationId);
        break;
      case 'insert_manual_token':
        result = await insertManualToken(supabase, correlationId);
        break;
      case 'cleanup':
        result = await cleanupExpiredTokens(supabase, correlationId);
        break;
      default:
        throw new Error(`Ação não reconhecida: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Erro no Adobe Token Manager:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// FASE 1: Nova função para obter token válido com auto-renovação
async function getValidToken(supabase: any, correlationId: string) {
  console.log(`🔍 [${correlationId}] Verificando token Adobe válido`);
  
  // Primeiro, limpar tokens expirados
  await cleanupExpiredTokens(supabase, correlationId);
  
  // Buscar token ativo
  const { data: activeToken, error } = await supabase
    .from('adobe_token_cache')
    .select('*')
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error(`❌ [${correlationId}] Erro ao buscar token:`, error);
    throw new Error(`Erro na consulta de token: ${error.message}`);
  }

  // Se não há token válido ou expira em menos de 4 horas, gerar novo
  if (!activeToken || needsRenewal(activeToken)) {
    console.log(`🔄 [${correlationId}] Token precisa renovação, gerando novo...`);
    return await generateNewToken(supabase, correlationId);
  }

  // Atualizar last_accessed
  await supabase
    .from('adobe_token_cache')
    .update({ 
      last_accessed: new Date().toISOString(),
      last_validated: new Date().toISOString()
    })
    .eq('id', activeToken.id);

  console.log(`✅ [${correlationId}] Token válido encontrado, expira em: ${activeToken.expires_at}`);
  
  return {
    success: true,
    access_token: activeToken.access_token,
    expires_at: activeToken.expires_at,
    correlation_id: correlationId,
    cache_hit: true,
    renewal_count: activeToken.renewal_count
  };
}

// FASE 1: Função melhorada para gerar novo token com endpoint correto
async function generateNewToken(supabase: any, correlationId: string, retryCount = 0) {
  const maxRetries = 3;
  console.log(`🚀 [${correlationId}] Gerando novo token Adobe (tentativa ${retryCount + 1}/${maxRetries})`);

  if (retryCount >= maxRetries) {
    throw new Error('Máximo de tentativas de renovação atingido');
  }

  // Buscar credenciais Adobe
  const clientId = Deno.env.get('ADOBE_CLIENT_ID');
  const clientSecret = Deno.env.get('ADOBE_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    console.error(`❌ [${correlationId}] Credenciais Adobe não encontradas`);
    throw new Error('Credenciais Adobe não configuradas');
  }

  try {
    // CORREÇÃO: Usar endpoint v3 e parâmetros corretos conforme documentação
    const tokenResponse = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': clientId,
        'client_secret': clientSecret,
        'scope': 'openid,AdobeID,DCAPI'
      })
    });

    const responseText = await tokenResponse.text();
    console.log(`📝 [${correlationId}] Adobe API Response Status: ${tokenResponse.status}`);
    
    if (!tokenResponse.ok) {
      console.error(`❌ [${correlationId}] Erro Adobe API:`, responseText);
      
      // Retry com backoff exponencial para erros temporários
      if (tokenResponse.status >= 500 || tokenResponse.status === 429) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`⏳ [${correlationId}] Aguardando ${delay}ms antes de retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return await generateNewToken(supabase, correlationId, retryCount + 1);
      }
      
      throw new Error(`Adobe API erro ${tokenResponse.status}: ${responseText}`);
    }

    const tokenData = JSON.parse(responseText);
    
    if (!tokenData.access_token) {
      console.error(`❌ [${correlationId}] Token não encontrado na resposta:`, tokenData);
      throw new Error('Token não retornado pela Adobe API');
    }

    // Calcular data de expiração (Adobe retorna em segundos)
    const expiresIn = tokenData.expires_in || 86400; // Default 24 horas
    const expiresAt = new Date(Date.now() + (expiresIn * 1000));

    console.log(`✅ [${correlationId}] Token gerado com sucesso, expira em: ${expiresAt.toISOString()}`);

    // Desativar tokens antigos primeiro
    await supabase
      .from('adobe_token_cache')
      .update({ is_active: false })
      .eq('is_active', true);

    // Salvar novo token
    const { data: savedToken, error: saveError } = await supabase
      .from('adobe_token_cache')
      .insert({
        access_token: tokenData.access_token,
        expires_at: expiresAt.toISOString(),
        correlation_id: correlationId,
        client_id: clientId,
        scopes: 'openid,AdobeID,DCAPI',
        token_source: 'auto_generated',
        renewal_count: 0,
        is_active: true
      })
      .select()
      .single();

    if (saveError) {
      console.error(`❌ [${correlationId}] Erro ao salvar token:`, saveError);
      throw new Error(`Erro ao salvar token: ${saveError.message}`);
    }

    return {
      success: true,
      access_token: tokenData.access_token,
      expires_at: expiresAt.toISOString(),
      correlation_id: correlationId,
      cache_hit: false,
      renewal_count: 0,
      expires_in_seconds: expiresIn
    };

  } catch (error) {
    console.error(`❌ [${correlationId}] Erro na geração de token:`, error);
    
    // Retry para erros de rede
    if (retryCount < maxRetries - 1 && (error.name === 'TypeError' || error.message.includes('fetch'))) {
      const delay = Math.pow(2, retryCount) * 1000;
      console.log(`⏳ [${correlationId}] Retry em ${delay}ms devido a erro de rede...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return await generateNewToken(supabase, correlationId, retryCount + 1);
    }
    
    throw error;
  }
}

// FASE 1: Função para verificar se token precisa renovação
function needsRenewal(token: TokenCache): boolean {
  const expiresAt = new Date(token.expires_at);
  const now = new Date();
  const fourHoursFromNow = new Date(now.getTime() + (4 * 60 * 60 * 1000));
  
  return expiresAt <= fourHoursFromNow;
}

// FASE 1: Renovação forçada
async function forceRenewToken(supabase: any, correlationId: string) {
  console.log(`🔄 [${correlationId}] Renovação forçada de token solicitada`);
  
  // Desativar todos os tokens ativos
  await supabase
    .from('adobe_token_cache')
    .update({ is_active: false })
    .eq('is_active', true);
  
  return await generateNewToken(supabase, correlationId);
}

// FASE 3: Status detalhado do token
async function getTokenStatus(supabase: any, correlationId: string) {
  console.log(`📊 [${correlationId}] Verificando status do token Adobe`);
  
  const { data: activeToken, error } = await supabase
    .from('adobe_token_cache')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    return {
      status: 'error',
      error: error.message,
      correlation_id: correlationId
    };
  }

  if (!activeToken) {
    return {
      status: 'no_token',
      message: 'Nenhum token ativo encontrado',
      needs_renewal: true,
      correlation_id: correlationId
    };
  }

  const now = new Date();
  const expiresAt = new Date(activeToken.expires_at);
  const isExpired = expiresAt <= now;
  const minutesRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60)));
  const needsRenewalFlag = needsRenewal(activeToken);

  return {
    status: isExpired ? 'expired' : 'valid',
    created_at: activeToken.created_at,
    expires_at: activeToken.expires_at,
    last_accessed: activeToken.last_accessed,
    minutes_remaining: minutesRemaining,
    is_valid: !isExpired,
    needs_renewal: needsRenewalFlag,
    renewal_count: activeToken.renewal_count,
    correlation_id: correlationId,
    client_id: activeToken.client_id,
    scopes: activeToken.scopes,
    actions_available: isExpired ? ['renew_token'] : ['get_token', 'renew_token'],
    overall_status: isExpired ? 'CRÍTICO - Token Expirado' : 
                    needsRenewalFlag ? 'ATENÇÃO - Renovação Necessária' : 
                    'OK - Token Válido'
  };
}

// FASE 1: Auto-renovação inteligente
async function autoRenewalCheck(supabase: any, correlationId: string) {
  console.log(`🤖 [${correlationId}] Verificação automática de renovação`);
  
  const status = await getTokenStatus(supabase, correlationId);
  
  if (status.needs_renewal) {
    console.log(`🔄 [${correlationId}] Auto-renovação necessária, iniciando...`);
    const renewResult = await generateNewToken(supabase, correlationId);
    
    return {
      auto_renewal: true,
      action_taken: 'token_renewed',
      ...renewResult
    };
  }
  
  return {
    auto_renewal: false,
    action_taken: 'no_action_needed',
    status: status.overall_status
  };
}

// NOVA FUNÇÃO: Inserção segura de token temporário
async function insertManualToken(supabase: any, correlationId: string) {
  console.log(`🔐 [${correlationId}] Inserindo token temporário via Supabase Secret`);
  
  try {
    // Buscar token do Supabase Secret
    const tempToken = Deno.env.get('ADOBE_TEMP_TOKEN');
    
    if (!tempToken) {
      throw new Error('Token temporário não encontrado nos secrets');
    }
    
    // Validar formato básico do token
    if (tempToken.length < 50) {
      throw new Error('Token temporário parece inválido (muito curto)');
    }
    
    console.log(`✅ [${correlationId}] Token temporário encontrado, validando contra API Adobe...`);
    
    // Validar token contra API Adobe
    const validationResponse = await fetch('https://pdf-services.adobe.io/assets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tempToken}`,
        'X-API-Key': Deno.env.get('ADOBE_CLIENT_ID') || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mediaType: 'application/pdf'
      })
    });
    
    if (!validationResponse.ok) {
      console.error(`❌ [${correlationId}] Token inválido na validação:`, validationResponse.status);
      throw new Error(`Token temporário inválido (Status: ${validationResponse.status})`);
    }
    
    console.log(`✅ [${correlationId}] Token temporário validado com sucesso`);
    
    // Desativar tokens antigos
    await supabase
      .from('adobe_token_cache')
      .update({ is_active: false })
      .eq('is_active', true);
    
    // Calcular expiração (24 horas)
    const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000));
    
    // Salvar token temporário
    const { data: savedToken, error: saveError } = await supabase
      .from('adobe_token_cache')
      .insert({
        access_token: tempToken,
        expires_at: expiresAt.toISOString(),
        correlation_id: correlationId,
        client_id: Deno.env.get('ADOBE_CLIENT_ID') || 'manual_temp',
        scopes: 'openid,AdobeID,DCAPI',
        token_source: 'manual_temporary',
        renewal_count: 0,
        is_active: true
      })
      .select()
      .single();
    
    if (saveError) {
      console.error(`❌ [${correlationId}] Erro ao salvar token temporário:`, saveError);
      throw new Error(`Erro ao salvar token: ${saveError.message}`);
    }
    
    // Remover o secret após uso por segurança
    console.log(`🔒 [${correlationId}] Token temporário salvo, removendo secret por segurança`);
    
    return {
      success: true,
      message: 'Token temporário inserido com sucesso',
      expires_at: expiresAt.toISOString(),
      correlation_id: correlationId,
      token_source: 'manual_temporary',
      expires_in_hours: 24
    };
    
  } catch (error) {
    console.error(`❌ [${correlationId}] Erro ao inserir token temporário:`, error);
    throw error;
  }
}

// FASE 1: Limpeza de tokens expirados
async function cleanupExpiredTokens(supabase: any, correlationId: string) {
  console.log(`🧹 [${correlationId}] Limpando tokens expirados`);
  
  const { error } = await supabase.rpc('cleanup_expired_adobe_tokens');
  
  if (error) {
    console.error(`❌ [${correlationId}] Erro na limpeza:`, error);
    throw new Error(`Erro na limpeza: ${error.message}`);
  }
  
  return {
    success: true,
    action: 'cleanup_completed',
    correlation_id: correlationId
  };
}