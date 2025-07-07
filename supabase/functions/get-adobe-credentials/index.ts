
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Buscar credenciais do ambiente (com fallback)
    const adobeClientId = Deno.env.get('ADOBE_CLIENT_ID') || Deno.env.get('ADOBE_PDF_API_KEY');
    const adobeClientSecret = Deno.env.get('ADOBE_CLIENT_SECRET');
    const adobeOrgId = Deno.env.get('ADOBE_ORG_ID');

    console.log('🔑 Verificando credenciais Adobe disponíveis...');
    console.log('- ADOBE_CLIENT_ID:', !!Deno.env.get('ADOBE_CLIENT_ID'));
    console.log('- ADOBE_PDF_API_KEY:', !!Deno.env.get('ADOBE_PDF_API_KEY'));
    console.log('- ADOBE_CLIENT_SECRET:', !!adobeClientSecret);
    console.log('- ADOBE_ORG_ID:', !!adobeOrgId);
    console.log('- Client ID final (fallback):', !!adobeClientId);

    if (!adobeClientId || !adobeClientSecret || !adobeOrgId) {
      console.error('❌ Credenciais Adobe faltando:', {
        clientId: !adobeClientId,
        clientSecret: !adobeClientSecret,
        orgId: !adobeOrgId
      });
      throw new Error('Adobe API credentials not configured');
    }

    console.log('✅ Adobe credentials requested and provided');

    return new Response(
      JSON.stringify({
        clientId: adobeClientId,
        clientSecret: adobeClientSecret,
        orgId: adobeOrgId
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Get Adobe Credentials Error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message
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
