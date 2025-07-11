import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TokenCache {
  access_token: string;
  expires_at: string;
  created_at: string;
  last_validated: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const correlationId = `token-manager-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  console.log(`🔑 [${correlationId}] Adobe Token Manager iniciado`);

  try {
    const { action = 'get_token' } = await req.json().catch(() => ({}));
    console.log(`📋 [${correlationId}] Ação solicitada: ${action}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (action) {
      case 'get_token':
        return await getValidToken(supabase, correlationId);
      case 'renew_token':
        return await forceRenewToken(supabase, correlationId);
      case 'status':
        return await getTokenStatus(supabase, correlationId);
      default:
        throw new Error(`Ação inválida: ${action}`);
    }

  } catch (error) {
    console.error(`❌ [${correlationId}] Erro no token manager:`, error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        correlation_id: correlationId,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId
        } 
      }
    );
  }
});

async function getValidToken(supabase: any, correlationId: string) {
  console.log(`🔍 [${correlationId}] Buscando token válido...`);

  // 1. Verificar cache existente
  const { data: cachedToken } = await supabase
    .from('pdf_extraction_cache')
    .select('*')
    .eq('file_name', 'adobe_token_cache')
    .eq('user_id', '00000000-0000-0000-0000-000000000000')
    .maybeSingle();

  if (cachedToken) {
    const tokenData = cachedToken.extraction_data as TokenCache;
    const expiresAt = new Date(tokenData.expires_at);
    const now = new Date();
    
    // Token válido se expira em mais de 2 horas
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    const twoHoursInMs = 2 * 60 * 60 * 1000;

    console.log(`⏰ [${correlationId}] Token expira em: ${Math.round(timeUntilExpiry / 1000 / 60)} minutos`);

    if (timeUntilExpiry > twoHoursInMs) {
      console.log(`✅ [${correlationId}] Token em cache válido`);
      
      // Atualizar last_accessed
      await supabase
        .from('pdf_extraction_cache')
        .update({ last_accessed: new Date().toISOString() })
        .eq('id', cachedToken.id);

      return new Response(
        JSON.stringify({
          success: true,
          token: tokenData.access_token,
          expires_at: tokenData.expires_at,
          source: 'cache',
          correlation_id: correlationId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.log(`⚠️ [${correlationId}] Token em cache próximo ao vencimento, renovando...`);
    }
  }

  // 2. Gerar novo token
  return await generateNewToken(supabase, correlationId);
}

async function generateNewToken(supabase: any, correlationId: string) {
  console.log(`🔄 [${correlationId}] Gerando novo token Adobe...`);

  const clientId = Deno.env.get('ADOBE_CLIENT_ID');
  const clientSecret = Deno.env.get('ADOBE_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Credenciais Adobe não configuradas');
  }

  // Implementar retry para geração de token
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🔑 [${correlationId}] Tentativa ${attempt}/3 de geração de token`);
      
      const response = await fetch('https://ims-na1.adobelogin.com/ims/token/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'client_id': clientId,
          'client_secret': clientSecret,
          'grant_type': 'client_credentials',
          'scope': 'openid,AdobeID,read_organizations,additional_info.projectedProductContext,additional_info.job_function'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Adobe token request failed: ${response.status} - ${errorText}`);
      }

      const tokenData = await response.json();
      const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));

      console.log(`✅ [${correlationId}] Novo token gerado, expira em: ${tokenData.expires_in} segundos`);

      // Salvar no cache
      const cacheData: TokenCache = {
        access_token: tokenData.access_token,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        last_validated: new Date().toISOString()
      };

      // Upsert no cache
      await supabase
        .from('pdf_extraction_cache')
        .upsert({
          user_id: '00000000-0000-0000-0000-000000000000',
          file_name: 'adobe_token_cache',
          file_hash: 'adobe_token',
          file_size: JSON.stringify(cacheData).length,
          extraction_data: cacheData,
          extraction_quality: 'high',
          processing_method: 'adobe_api',
          last_accessed: new Date().toISOString()
        }, {
          onConflict: 'user_id,file_name'
        });

      console.log(`💾 [${correlationId}] Token salvo no cache`);

      return new Response(
        JSON.stringify({
          success: true,
          token: tokenData.access_token,
          expires_at: expiresAt.toISOString(),
          expires_in: tokenData.expires_in,
          source: 'new',
          correlation_id: correlationId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      lastError = error;
      console.log(`⚠️ [${correlationId}] Tentativa ${attempt} falhou: ${error.message}`);
      
      if (attempt < 3) {
        const backoffTime = Math.pow(2, attempt - 1) * 1000; // 1s, 2s
        console.log(`🔄 [${correlationId}] Retry em ${backoffTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }
  
  throw lastError || new Error('Falha ao gerar token após 3 tentativas');
}

async function forceRenewToken(supabase: any, correlationId: string) {
  console.log(`🔄 [${correlationId}] Renovação forçada de token...`);
  
  // Limpar cache existente
  await supabase
    .from('pdf_extraction_cache')
    .delete()
    .eq('file_name', 'adobe_token_cache')
    .eq('user_id', '00000000-0000-0000-0000-000000000000');

  return await generateNewToken(supabase, correlationId);
}

async function getTokenStatus(supabase: any, correlationId: string) {
  console.log(`📊 [${correlationId}] Verificando status do token...`);

  const { data: cachedToken } = await supabase
    .from('pdf_extraction_cache')
    .select('*')
    .eq('file_name', 'adobe_token_cache')
    .eq('user_id', '00000000-0000-0000-0000-000000000000')
    .maybeSingle();

  if (!cachedToken) {
    return new Response(
      JSON.stringify({
        success: true,
        status: 'no_token',
        message: 'Nenhum token em cache',
        correlation_id: correlationId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const tokenData = cachedToken.extraction_data as TokenCache;
  const expiresAt = new Date(tokenData.expires_at);
  const now = new Date();
  const timeUntilExpiry = expiresAt.getTime() - now.getTime();
  const minutesUntilExpiry = Math.round(timeUntilExpiry / 1000 / 60);

  const status = timeUntilExpiry > 0 ? 'valid' : 'expired';
  const needsRenewal = timeUntilExpiry < (2 * 60 * 60 * 1000); // Menos de 2 horas

  return new Response(
    JSON.stringify({
      success: true,
      status,
      expires_at: tokenData.expires_at,
      minutes_until_expiry: minutesUntilExpiry,
      needs_renewal: needsRenewal,
      created_at: tokenData.created_at,
      last_validated: tokenData.last_validated,
      correlation_id: correlationId
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}