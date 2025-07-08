import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 pdf-text-extractor: Iniciando extração de texto');
    
    const { file_data, file_name, extraction_method = 'adobe' } = await req.json();
    
    if (!file_data) {
      throw new Error('Dados do arquivo não fornecidos');
    }

    let extractedText = '';
    let extraction_metadata = {};

    // Método Adobe PDF Services
    if (extraction_method === 'adobe') {
      try {
        console.log('📄 Tentando extração via Adobe PDF Services...');
        
        const adobeResult = await extractWithAdobe(file_data, file_name);
        extractedText = adobeResult.text;
        extraction_metadata = adobeResult.metadata;
        
        console.log('✅ Adobe extraction successful');
        
      } catch (adobeError) {
        console.log('⚠️ Adobe falhou, tentando Google Vision...', adobeError.message);
        
        // Fallback para Google Vision
        const googleResult = await extractWithGoogleVision(file_data);
        extractedText = googleResult.text;
        extraction_metadata = { method: 'google_vision', ...googleResult.metadata };
      }
    } else if (extraction_method === 'google_vision') {
      const googleResult = await extractWithGoogleVision(file_data);
      extractedText = googleResult.text;
      extraction_metadata = { method: 'google_vision', ...googleResult.metadata };
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('Nenhum texto foi extraído do PDF');
    }

    console.log(`✅ Texto extraído com sucesso: ${extractedText.length} caracteres`);

    return new Response(
      JSON.stringify({
        success: true,
        extracted_text: extractedText,
        metadata: extraction_metadata,
        processing_time: Date.now()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Erro na extração de texto:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stage: 'text_extraction'
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

async function extractWithAdobe(fileData: string, fileName: string) {
  const adobeApiKey = Deno.env.get('ADOBE_PDF_API_KEY');
  const adobeClientId = Deno.env.get('ADOBE_CLIENT_ID');
  const adobeClientSecret = Deno.env.get('ADOBE_CLIENT_SECRET');
  
  if (!adobeApiKey || !adobeClientId || !adobeClientSecret) {
    throw new Error('Adobe API credentials not configured');
  }

  // Implementar lógica de extração Adobe aqui
  // Por enquanto, retornando um mock para teste
  return {
    text: 'Texto extraído via Adobe PDF Services...',
    metadata: {
      method: 'adobe_pdf_services',
      file_name: fileName,
      extraction_time: new Date().toISOString()
    }
  };
}

async function extractWithGoogleVision(fileData: string) {
  const googleCredentials = Deno.env.get('GOOGLE_CLOUD_CREDENTIALS');
  
  if (!googleCredentials) {
    throw new Error('Google Vision credentials not configured');
  }

  // Implementar lógica de extração Google Vision aqui
  // Por enquanto, retornando um mock para teste
  return {
    text: 'Texto extraído via Google Vision...',
    metadata: {
      method: 'google_vision',
      extraction_time: new Date().toISOString()
    }
  };
}