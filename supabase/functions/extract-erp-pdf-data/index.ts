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
    console.log('📄 Processing ERP PDF with Google Vision API - Direct Upload Mode')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // NOVA LÓGICA: Detectar se é FormData ou JSON
    let pdfFile: File;
    let fileName: string;
    let fileSize: number;

    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // UPLOAD DIRETO VIA FORMDATA - Evita problemas de stack overflow
      console.log('📄 Processing FormData upload...');
      const formData = await req.formData();
      
      const file = formData.get('file') as File;
      fileName = formData.get('fileName') as string || file.name;
      fileSize = parseInt(formData.get('fileSize') as string) || file.size;
      
      if (!file || !fileName) {
        throw new Error('File and filename are required in FormData');
      }
      
      pdfFile = file;
      console.log('📄 FormData PDF received:', fileName, 'Size:', fileSize);
      
    } else {
      // FALLBACK: Método antigo com base64 (apenas para arquivos muito pequenos)
      console.log('📄 Processing JSON with base64...');
      const { pdfBuffer, fileName: jsonFileName, fileSize: jsonFileSize } = await req.json();
      
      if (!pdfBuffer || !jsonFileName) {
        throw new Error('PDF buffer and filename are required');
      }

      fileName = jsonFileName;
      fileSize = jsonFileSize;
      
      // Converter o buffer base64 de volta para Uint8Array
      const pdfData = new Uint8Array(atob(pdfBuffer).split('').map(char => char.charCodeAt(0)));
      pdfFile = new File([pdfData], fileName, { type: 'application/pdf' });
      
      console.log('📄 Base64 PDF converted:', fileName, 'Size:', fileSize);
    }

    // Validação de tamanho (limite mais rigoroso para evitar stack overflow)
    if (fileSize > 2 * 1024 * 1024) {
      throw new Error('File size exceeds 2MB limit - use smaller files to avoid processing issues');
    }

    console.log('📄 PDF file prepared:', fileName, 'Size:', fileSize);

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

    // Determinar o tipo de processamento baseado na qualidade dos dados
    let processorType = 'intelligent-fallback';
    if (googleCredentials && googleProjectId) {
      // Verificar se os dados parecem ter sido extraídos com sucesso (não são apenas fallback)
      if (parsedData.client !== 'Cliente não identificado' && parsedData.items.length > 0) {
        processorType = 'google-vision-api';
      } else if (parsedData.proposalNumber && parsedData.proposalNumber !== 'N/A') {
        processorType = 'direct-text-extraction';
      }
    }
    
    console.log('✅ ERP Processing completed:', {
      processor: processorType,
      client: parsedData.client,
      vendor: parsedData.vendor,
      items_count: parsedData.items?.length || 0,
      total: parsedData.total,
      credentialsAvailable: !!(googleCredentials && googleProjectId)
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