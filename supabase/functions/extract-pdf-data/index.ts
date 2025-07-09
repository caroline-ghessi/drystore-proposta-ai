
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
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log(`🚀 [${requestId}] === ADOBE PDF EXTRACTION STARTED ===`);
  console.log(`📊 [${requestId}] Request details:`, {
    method: req.method,
    contentType: req.headers.get('Content-Type'),
    userAgent: req.headers.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  try {
    // Verify authentication
    console.log(`🔐 [${requestId}] Verifying authentication...`);
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log(`❌ [${requestId}] Missing Authorization header`);
      throw new Error('Authorization header required');
    }

    // Initialize services
    console.log(`⚙️ [${requestId}] Initializing services...`);
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const dbOps = new DatabaseOperations(supabaseUrl, supabaseKey);

    // Verify authenticated user
    console.log(`👤 [${requestId}] Authenticating user...`);
    const token = authHeader.replace('Bearer ', '');
    const user = await dbOps.verifyUser(token);
    console.log(`✅ [${requestId}] User authenticated:`, { 
      email: user.email,
      id: user.id?.substring(0, 8) + '...' 
    });

    // Parse form data and validate file
    console.log(`📄 [${requestId}] Processing form data...`);
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    console.log(`📊 [${requestId}] File details:`, {
      name: file.name,
      size: file.size,
      type: file.type,
      sizeFormatted: `${(file.size / 1024 / 1024).toFixed(2)}MB`
    });
    
    FileValidator.validateFile(file);
    console.log(`✅ [${requestId}] File validation passed`);

    // Validate Adobe credentials and create client
    console.log(`🔑 [${requestId}] Validating Adobe credentials...`);
    const adobeCredentials = FileValidator.validateAdobeCredentials();
    const adobeClient = new AdobeClient(adobeCredentials);
    console.log(`✅ [${requestId}] Adobe client initialized`);

    // Adobe PDF extraction workflow
    const adobeStartTime = Date.now();
    console.log(`🔄 [${requestId}] Step 1: Getting Adobe access token...`);
    const accessToken = await adobeClient.getAccessToken();
    
    console.log(`🔄 [${requestId}] Step 2: Uploading file to Adobe...`);
    const assetID = await adobeClient.uploadFile(file, accessToken);
    
    console.log(`🔄 [${requestId}] Step 3: Starting PDF extraction...`);
    const location = await adobeClient.startExtraction(assetID, accessToken);
    
    console.log(`🔄 [${requestId}] Step 4: Polling for results...`);
    const extractResult = await adobeClient.pollExtractionResult(location, accessToken);
    
    console.log(`🔄 [${requestId}] Step 5: Downloading results...`);
    const resultUrl = extractResult.asset.downloadUri;
    const resultData = await adobeClient.downloadResult(resultUrl);

    console.log(`🔄 [${requestId}] Step 6: Parsing extracted data...`);
    const structuredData = DataParser.parseAdobeData(resultData);
    
    const adobeProcessingTime = Date.now() - adobeStartTime;
    
    console.log(`✅ [${requestId}] Adobe extraction completed:`, {
      itemsFound: structuredData.items.length,
      totalValue: structuredData.total,
      clientFound: !!structuredData.client,
      processingTime: `${adobeProcessingTime}ms`,
      quality: structuredData.items.length > 0 ? 'High' : 'Low'
    });

    // Save to database
    console.log(`💾 [${requestId}] Saving to database...`);
    const savedData = await dbOps.saveExtractedData(user, file, resultData, structuredData);
    
    const totalTime = Date.now() - startTime;
    console.log(`🎉 [${requestId}] Process completed successfully:`, {
      totalTime: `${totalTime}ms`,
      adobeTime: `${adobeProcessingTime}ms`,
      dataId: savedData.id
    });

    return new Response(
      JSON.stringify({
        success: true,
        method: 'Adobe PDF Services',
        processingTime: totalTime,
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
    console.error(`❌ [${requestId}] Adobe PDF Services failed:`, {
      error: error.message,
      stack: error.stack?.substring(0, 300) + '...',
      totalTime: `${Date.now() - startTime}ms`
    });
    
    // Implementar fallback inteligente com extração real de texto
    console.log(`🔄 [${requestId}] Attempting smart fallback with real text extraction...`);
    
    try {
      // Funções auxiliares para extração de texto
      function extractClientFromText(text: string): string | null {
        const clientPatterns = [
          /cliente[\s\:]+([A-Za-z\s]+)/i,
          /razão social[\s\:]+([A-Za-z\s]+)/i,
          /empresa[\s\:]+([A-Za-z\s]+)/i,
          /para[\s\:]+([A-Za-z\s]+)/i
        ];
        
        for (const pattern of clientPatterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            return match[1].trim().substring(0, 50);
          }
        }
        return null;
      }
      
      function extractVendorFromText(text: string): string | null {
        const vendorPatterns = [
          /fornecedor[\s\:]+([A-Za-z\s]+)/i,
          /de[\s\:]+([A-Za-z\s]+)/i,
          /empresa emitente[\s\:]+([A-Za-z\s]+)/i
        ];
        
        for (const pattern of vendorPatterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            return match[1].trim().substring(0, 50);
          }
        }
        return null;
      }
      
      function extractProposalNumberFromText(text: string): string | null {
        const numberPatterns = [
          /proposta[\s\#\:]*(\d+)/i,
          /orçamento[\s\#\:]*(\d+)/i,
          /número[\s\#\:]*(\d+)/i,
          /n[º°][\s]*(\d+)/i
        ];
        
        for (const pattern of numberPatterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            return match[1];
          }
        }
        return null;
      }
      
      function extractPaymentTermsFromText(text: string): string | null {
        const paymentPatterns = [
          /pagamento[\s\:]+([^\.]+)/i,
          /prazo[\s\:]+([^\.]+)/i,
          /condições[\s\:]+([^\.]+)/i
        ];
        
        for (const pattern of paymentPatterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            return match[1].trim().substring(0, 100);
          }
        }
        return null;
      }
      
      function extractItemsFromText(text: string, fileName: string): Array<{
        description: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        total: number;
      }> {
        const items = [];
        
        // Procurar por padrões de valores monetários
        const moneyPattern = /R?\$?\s*(\d+[,\.]\d{2})/g;
        const moneyMatches = text.match(moneyPattern) || [];
        
        // Se encontrou valores, criar itens genéricos
        if (moneyMatches.length > 0) {
          moneyMatches.slice(0, 5).forEach((match, index) => {
            const value = parseFloat(match.replace(/[R\$\s]/g, '').replace(',', '.'));
            if (value > 0) {
              items.push({
                description: `Item ${index + 1} (extraído automaticamente)`,
                quantity: 1,
                unit: 'un',
                unitPrice: value,
                total: value
              });
            }
          });
        }
        
        // Se não encontrou itens, criar um item genérico
        if (items.length === 0) {
          items.push({
            description: `Serviço/produto referente ao arquivo: ${fileName}`,
            quantity: 1,
            unit: 'un',
            unitPrice: 0,
            total: 0
          });
        }
        
        return items;
      }

      // Extrair texto básico do PDF usando uma abordagem mais simples
      const arrayBuffer = await file.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      
      // Tentar extrair texto básico do PDF
      let extractedText = '';
      try {
        // Converter bytes para string e procurar por padrões de texto
        const pdfString = String.fromCharCode(...pdfBytes);
        
        // Procurar por padrões comuns em PDFs
        const textPatterns = pdfString.match(/[A-Za-z0-9\s\.,\-\(\)]+/g) || [];
        extractedText = textPatterns.join(' ').substring(0, 2000); // Limite para evitar overflow
        
      } catch (textError) {
        console.log('⚠️ Extração de texto básica falhou, usando estrutura mínima');
        extractedText = `Arquivo PDF: ${file.name}`;
      }

      console.log('📝 Texto extraído (amostra):', extractedText.substring(0, 200) + '...');

      // Parser simples para extrair informações básicas
      const fallbackData = {
        client: extractClientFromText(extractedText) || 'Cliente a ser identificado',
        vendor: extractVendorFromText(extractedText) || 'Fornecedor a ser identificado',
        proposalNumber: extractProposalNumberFromText(extractedText) || `AUTO-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        items: extractItemsFromText(extractedText, file.name),
        subtotal: 0,
        total: 0,
        paymentTerms: extractPaymentTermsFromText(extractedText) || 'A definir',
        delivery: 'A definir',
        extractedText: extractedText.substring(0, 500) // Manter amostra para análise manual
      };

      // Calcular totais se possível
      if (fallbackData.items.length > 0) {
        fallbackData.subtotal = fallbackData.items.reduce((sum, item) => sum + item.total, 0);
        fallbackData.total = fallbackData.subtotal;
      }

      console.log('✅ Fallback com extração real concluído:', {
        client: fallbackData.client,
        itemsFound: fallbackData.items.length,
        totalValue: fallbackData.total,
        textLength: extractedText.length
      });

      // Salvar dados do fallback no banco
      const savedData = await dbOps.saveExtractedData(user, file, { fallback: true, extractedText }, fallbackData);

      return new Response(
        JSON.stringify({
          success: true,
          method: 'Extração de Texto Simples (Fallback)',
          data: {
            id: savedData.id,
            ...fallbackData
          },
          warning: 'Dados extraídos via fallback. Recomenda-se revisão manual.'
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );

    } catch (fallbackError) {
      console.error('❌ Fallback com extração real também falhou:', fallbackError);
      
      // Se tudo falhar, retornar erro detalhado
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
        errorMessage = 'Adobe PDF Services não configurado. Extração de texto também falhou.';
      } else if (error.message.includes('Adobe credentials are invalid')) {
        statusCode = 500;
        errorMessage = 'Credenciais Adobe inválidas. Extração alternativa não funcionou.';
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
        errorMessage = 'Falha na extração de dados. Tanto Adobe quanto extração de texto falharam.';
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
