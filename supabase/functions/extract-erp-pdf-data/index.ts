import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔄 ERP PDF Processing - Redirecting to Adobe PDF Services')
    console.log('📄 Request method:', req.method)
    console.log('📄 Content-Type:', req.headers.get('content-type'))

    // Get authorization header
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization')
    if (!authHeader) {
      console.log('❌ Missing authorization header')
      throw new Error('Authorization header required')
    }

    console.log('✅ Authorization found, forwarding to Adobe PDF Services...')

    // Forward directly to extract-pdf-data (Adobe PDF Services)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const adobeEndpoint = `${supabaseUrl}/functions/v1/extract-pdf-data`
    
    console.log('📤 Forwarding to:', adobeEndpoint)

    // Forward the entire request to Adobe PDF Services
    const forwardResponse = await fetch(adobeEndpoint, {
      method: req.method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': req.headers.get('content-type') || 'multipart/form-data'
      },
      body: req.body
    })

    const responseData = await forwardResponse.json()
    
    console.log('✅ Adobe PDF Services response:', {
      success: responseData.success,
      method: responseData.method,
      hasData: !!responseData.data,
      itemsCount: responseData.data?.items?.length || 0
    })

    // Return the Adobe response with consistent format
    return new Response(
      JSON.stringify({
        success: responseData.success,
        data: responseData.data,
        processor: 'adobe-pdf-services',
        method: responseData.method || 'Adobe PDF Services'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: forwardResponse.status
      }
    )

  } catch (error) {
    console.error('❌ Error in ERP PDF processing:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
        processor: 'error',
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})