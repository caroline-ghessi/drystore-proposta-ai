import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleVisionERPProcessor } from './main-processor.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('📄 Processing ERP PDF with Google Vision API')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { pdfBuffer, fileName, fileSize } = await req.json()
    
    if (!pdfBuffer || !fileName) {
      throw new Error('PDF buffer and filename are required')
    }

    console.log('📄 Processing ERP PDF:', fileName, 'Size:', fileSize)

    // Converter o buffer base64 de volta para Uint8Array
    const pdfData = new Uint8Array(atob(pdfBuffer).split('').map(char => char.charCodeAt(0)))
    const pdfFile = new File([pdfData], fileName, { type: 'application/pdf' })

    console.log('📄 PDF file created:', pdfFile.name, 'Size:', pdfFile.size)

    // PROCESSAMENTO COM GOOGLE VISION API
    console.log('🤖 Starting ERP PDF processing with Google Vision...')
    const googleCredentials = Deno.env.get('GOOGLE_CLOUD_CREDENTIALS')
    const googleProjectId = Deno.env.get('GOOGLE_CLOUD_PROJECT_ID')
    
    console.log('🔑 Google Cloud credentials status:', { 
      hasCredentials: !!googleCredentials, 
      hasProjectId: !!googleProjectId,
      projectId: googleProjectId
    });
    
    const processor = new GoogleVisionERPProcessor(googleCredentials || '', googleProjectId || '')
    const parsedData = await processor.processERPFile(pdfFile, fileName)

    const processorType = (googleCredentials && googleProjectId) ? 'google-vision-api' : 'intelligent-fallback'
    console.log('✅ ERP Processing completed:', {
      processor: processorType,
      client: parsedData.client,
      vendor: parsedData.vendor,
      items_count: parsedData.items?.length || 0,
      total: parsedData.total
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: parsedData,
        processor: processorType
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('❌ Error processing ERP PDF:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})