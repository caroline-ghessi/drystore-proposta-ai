import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('📄 Função test-adobe-api iniciada');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar todas as credenciais Adobe
    const adobeClientId = Deno.env.get('ADOBE_CLIENT_ID');
    const adobeClientSecret = Deno.env.get('ADOBE_CLIENT_SECRET');
    const adobeOrgId = Deno.env.get('ADOBE_ORG_ID');
    const adobeTempToken = Deno.env.get('ADOBE_TEMP_TOKEN');

    const credentials = {
      hasClientId: !!adobeClientId,
      hasClientSecret: !!adobeClientSecret,
      hasOrgId: !!adobeOrgId,
      hasTempToken: !!adobeTempToken,
      clientIdPreview: adobeClientId ? adobeClientId.substring(0, 10) + '...' : null,
      orgIdPreview: adobeOrgId ? adobeOrgId.substring(0, 10) + '...' : null
    };

    console.log('🔍 Credenciais Adobe verificadas:', credentials);

    if (!adobeClientId || !adobeClientSecret || !adobeOrgId) {
      console.error('❌ Credenciais Adobe incompletas');
      return new Response(JSON.stringify({
        success: false,
        error: 'Credenciais Adobe incompletas',
        credentials,
        missing: [
          !adobeClientId && 'ADOBE_CLIENT_ID',
          !adobeClientSecret && 'ADOBE_CLIENT_SECRET',
          !adobeOrgId && 'ADOBE_ORG_ID'
        ].filter(Boolean),
        timestamp: new Date().toISOString()
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Teste 1: Obter Access Token
    console.log('🔐 Testando autenticação Adobe...');
    
    const tokenPayload = new URLSearchParams({
      client_id: adobeClientId,
      client_secret: adobeClientSecret,
      grant_type: 'client_credentials',
      scope: 'openid,AdobeID,read_organizations,additional_info.projectedProductContext,additional_info.roles'
    });

    console.log('📤 Solicitando access token...');
    
    const startTime = Date.now();
    const tokenResponse = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: tokenPayload
    });

    const tokenDuration = Date.now() - startTime;
    
    console.log('📥 Resposta do token:', {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      duration: `${tokenDuration}ms`,
      headers: Object.fromEntries(tokenResponse.headers.entries())
    });

    let tokenData = null;
    let accessToken = null;
    
    try {
      const tokenText = await tokenResponse.text();
      console.log('📄 Resposta do token:', tokenText.substring(0, 200));
      
      if (tokenResponse.headers.get('content-type')?.includes('application/json')) {
        tokenData = JSON.parse(tokenText);
        accessToken = tokenData?.access_token;
      }
    } catch (parseError) {
      console.error('❌ Erro ao parsear token:', parseError);
    }

    // Teste 2: Verificar PDF Services (se token obtido)
    let pdfServiceTest = null;
    
    if (accessToken && tokenResponse.ok) {
      console.log('📋 Testando PDF Services...');
      
      try {
        const pdfServiceStartTime = Date.now();
        const pdfServiceResponse = await fetch('https://pdf-services.adobe.io/assets', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-API-Key': adobeClientId,
            'X-Gw-Ims-Org-Id': adobeOrgId,
            'Accept': 'application/json'
          }
        });

        const pdfServiceDuration = Date.now() - pdfServiceStartTime;
        
        console.log('📥 Resposta PDF Services:', {
          status: pdfServiceResponse.status,
          statusText: pdfServiceResponse.statusText,
          duration: `${pdfServiceDuration}ms`
        });

        const pdfServiceText = await pdfServiceResponse.text();
        
        pdfServiceTest = {
          success: pdfServiceResponse.ok,
          status: pdfServiceResponse.status,
          duration: pdfServiceDuration,
          hasAccess: pdfServiceResponse.status !== 403,
          response: pdfServiceText.substring(0, 200)
        };
        
      } catch (pdfError) {
        console.error('❌ Erro no teste PDF Services:', pdfError);
        pdfServiceTest = { error: pdfError.message };
      }
    }

    const testResult = {
      timestamp: new Date().toISOString(),
      success: tokenResponse.ok,
      credentials,
      authentication: {
        success: tokenResponse.ok,
        status: tokenResponse.status,
        duration: tokenDuration,
        hasAccessToken: !!accessToken,
        tokenType: tokenData?.token_type,
        expiresIn: tokenData?.expires_in,
        scope: tokenData?.scope
      },
      pdfServices: pdfServiceTest,
      error: !tokenResponse.ok ? {
        status: tokenResponse.status,
        message: tokenData || 'Erro na autenticação',
        code: tokenData?.error,
        description: tokenData?.error_description
      } : null
    };

    console.log('✅ Teste Adobe concluído:', testResult);

    return new Response(JSON.stringify(testResult), {
      status: tokenResponse.ok ? 200 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('🚨 Erro crítico no teste Adobe:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});