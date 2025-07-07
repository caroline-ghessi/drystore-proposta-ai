
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { AdobeClient } from './adobe-client.ts'
import { DataParser } from './data-parser.ts'
import { DatabaseOperations } from './database-operations.ts'
import { FileValidator } from './validation.ts'

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
    console.log('=== ADOBE PDF EXTRACTION STARTED ===');
    console.log('📄 Request method:', req.method);
    console.log('📄 Content-Type:', req.headers.get('Content-Type'));
    
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Initialize services
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const dbOps = new DatabaseOperations(supabaseUrl, supabaseKey);

    // Verify authenticated user
    const token = authHeader.replace('Bearer ', '');
    const user = await dbOps.verifyUser(token);
    console.log('✅ User authenticated:', user.email);

    // Parse form data and validate file
    const formData = await req.formData();
    const file = formData.get('file') as File;
    FileValidator.validateFile(file);
    console.log('✅ File validation passed');

    // Validate Adobe credentials and create client
    const adobeCredentials = FileValidator.validateAdobeCredentials();
    const adobeClient = new AdobeClient(adobeCredentials);
    console.log('✅ Adobe client initialized');

    // Adobe PDF extraction workflow
    console.log('🔄 Step 1: Getting Adobe access token...');
    const accessToken = await adobeClient.getAccessToken();
    
    console.log('🔄 Step 2: Uploading file to Adobe...');
    const assetID = await adobeClient.uploadFile(file, accessToken);
    
    console.log('🔄 Step 3: Starting PDF extraction...');
    const location = await adobeClient.startExtraction(assetID, accessToken);
    
    console.log('🔄 Step 4: Polling for results...');
    const extractResult = await adobeClient.pollExtractionResult(location, accessToken);
    
    console.log('🔄 Step 5: Downloading results...');
    const resultUrl = extractResult.asset.downloadUri;
    const resultData = await adobeClient.downloadResult(resultUrl);

    console.log('🔄 Step 6: Parsing extracted data...');
    const structuredData = DataParser.parseAdobeData(resultData);
    console.log('✅ Extraction completed:', {
      itemsFound: structuredData.items.length,
      totalValue: structuredData.total,
      clientFound: !!structuredData.client
    });

    // Save to database
    const savedData = await dbOps.saveExtractedData(user, file, resultData, structuredData);

    return new Response(
      JSON.stringify({
        success: true,
        method: 'Adobe PDF Services',
        data: {
          id: savedData.id,
          ...structuredData
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Adobe PDF Services failed:', error);
    
    // Tentar fallback local quando Adobe falha
    console.log('🔄 Tentando fallback local...');
    
    try {
      // Converter o arquivo para buffer base64 para o fallback
      const arrayBuffer = await file.arrayBuffer();
      const pdfBuffer = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      // Chamar a função de fallback local
      console.log('📤 Enviando para processamento local...');
      const fallbackResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/extract-erp-pdf-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          pdfBuffer,
          fileName: file.name,
          fileSize: file.size
        })
      });

      if (fallbackResponse.ok) {
        const fallbackResult = await fallbackResponse.json();
        console.log('✅ Fallback local bem-sucedido:', {
          processor: fallbackResult.processor,
          itemsExtracted: fallbackResult.data.items?.length || 0,
          totalValue: fallbackResult.data.total
        });

        // Salvar dados do fallback no banco
        const fallbackStructuredData = {
          client: fallbackResult.data.client || 'Cliente não identificado',
          vendor: fallbackResult.data.vendor || 'N/A',
          proposalNumber: fallbackResult.data.proposalNumber || 'N/A',
          date: fallbackResult.data.date || new Date().toISOString().split('T')[0],
          items: fallbackResult.data.items || [],
          subtotal: fallbackResult.data.subtotal || 0,
          total: fallbackResult.data.total || 0,
          paymentTerms: fallbackResult.data.paymentTerms || 'N/A',
          delivery: fallbackResult.data.delivery || 'N/A'
        };

        const savedData = await dbOps.saveExtractedData(user, file, fallbackResult.data, fallbackStructuredData);

        return new Response(
          JSON.stringify({
            success: true,
            method: `Processamento Local (${fallbackResult.processor || 'fallback'})`,
            data: {
              id: savedData.id,
              ...fallbackStructuredData
            }
          }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      } else {
        throw new Error('Fallback local também falhou');
      }

    } catch (fallbackError) {
      console.error('❌ Fallback local também falhou:', fallbackError);
      
      // Se tanto Adobe quanto fallback falharam, retornar erro específico
      let errorMessage = error.message;
      let statusCode = 500;
      
      console.log('🔍 Error analysis:', {
        adobeError: error.message,
        fallbackError: fallbackError.message,
        stack: error.stack?.substring(0, 200) + '...'
      });
      
      // Determinar tipo de erro baseado no erro do Adobe
      if (error.message.includes('credentials not configured')) {
        statusCode = 500;
        errorMessage = 'Adobe PDF Services não configurado. Processamento local também falhou.';
      } else if (error.message.includes('Adobe credentials are invalid')) {
        statusCode = 500;
        errorMessage = 'Credenciais Adobe inválidas. Processamento local não disponível.';
      } else if (error.message.includes('Client ID appears to be too short')) {
        statusCode = 500;
        errorMessage = 'Configuração Adobe incompleta. Contate o administrador.';
      } else if (error.message.includes('415')) {
        statusCode = 400;
        errorMessage = 'Formato de arquivo inválido. Certifique-se que o PDF não está corrompido.';
      } else if (error.message.includes('401') || error.message.includes('authentication failed')) {
        statusCode = 500;
        errorMessage = 'Erro de autenticação com Adobe. Verificar configuração do sistema.';
      } else if (error.message.includes('413') || error.message.includes('too large')) {
        statusCode = 400;
        errorMessage = 'Arquivo muito grande. O tamanho máximo é 10MB.';
      } else if (error.message.includes('timeout')) {
        statusCode = 408;
        errorMessage = 'Timeout no processamento. Tente novamente com um arquivo menor.';
      } else {
        errorMessage = 'Falha na extração de dados. Tanto Adobe quanto processamento local falharam.';
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          technical_details: error.message,
          fallback_error: fallbackError.message
        }),
        { 
          status: statusCode,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
  }
});
