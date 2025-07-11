import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 Testing infrastructure - Function started');
    
    // Test basic functionality
    const timestamp = new Date().toISOString();
    const testData = {
      status: 'success',
      message: 'Infrastructure test successful',
      timestamp,
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
    };

    // Test environment variables access
    const secrets = {
      grok_api_key: !!Deno.env.get('GROK_API_KEY'),
      adobe_client_id: !!Deno.env.get('ADOBE_CLIENT_ID'),
      adobe_client_secret: !!Deno.env.get('ADOBE_CLIENT_SECRET'),
      adobe_org_id: !!Deno.env.get('ADOBE_ORG_ID'),
      adobe_temp_token: !!Deno.env.get('ADOBE_TEMP_TOKEN'),
    };

    console.log('🔧 Secrets availability:', secrets);

    return new Response(JSON.stringify({
      ...testData,
      secrets_available: secrets,
      environment: {
        deno_version: Deno.version.deno,
        typescript_version: Deno.version.typescript,
        v8_version: Deno.version.v8
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('🚨 Infrastructure test failed:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack,
      status: 'failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});