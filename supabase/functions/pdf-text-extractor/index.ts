import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Cache global para tokens Adobe (válido por 24h)
interface AdobeTokenCache {
  token: string;
  expires: number;
}

let adobeTokenCache: AdobeTokenCache | null = null;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    console.log('🔧 pdf-text-extractor: Iniciando extração de texto');
    
    // CORREÇÃO CRÍTICA: Validação robusta do request
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('✅ Request JSON parseado com sucesso');
    } catch (jsonError) {
      console.error('❌ ERRO: Falha no parsing JSON:', jsonError.message);
      throw new Error(`Request inválido: ${jsonError.message}`);
    }
    
    const { file_data, file_name, extraction_method = 'adobe' } = requestBody;
    
    console.log('📋 Parâmetros recebidos:', {
      hasFileData: !!file_data,
      fileName: file_name,
      extractionMethod: extraction_method,
      fileDataSize: file_data?.length || 0
    });
    
    // CORREÇÃO CRÍTICA: Validação de fileData
    if (!file_data || typeof file_data !== 'string') {
      console.error('❌ ERRO: file_data inválido:', { type: typeof file_data, length: file_data?.length });
      throw new Error('file_data deve ser uma string base64 válida');
    }
    
    // CORREÇÃO CRÍTICA: Validar se é base64 válido
    try {
      // Testa se consegue decodificar base64
      atob(file_data.substring(0, 100)); // Testa apenas os primeiros 100 chars
      console.log('✅ file_data é base64 válido');
    } catch (base64Error) {
      console.error('❌ ERRO: file_data não é base64 válido:', base64Error.message);
      throw new Error('file_data deve estar em formato base64 válido');
    }

    let extractedText = '';
    let extraction_metadata = {};

    // CORREÇÃO: Método Adobe PDF Services com fallback nativo
    if (extraction_method === 'adobe') {
      try {
        console.log('📄 Tentando extração via Adobe PDF Services...');
        
        const adobeResult = await extractWithAdobe(file_data, file_name);
        extractedText = adobeResult.text;
        extraction_metadata = adobeResult.metadata;
        
        console.log('✅ Adobe extraction successful');
        
      } catch (adobeError) {
        console.warn('⚠️ Adobe falhou, tentando fallback nativo...', adobeError.message);
        
        // CORREÇÃO: Fallback nativo simples (sem Google)
        try {
          const nativeResult = await extractWithNativeFallback(file_data, file_name);
          extractedText = nativeResult.text;
          extraction_metadata = { method: 'native_fallback', error_message: adobeError.message, ...nativeResult.metadata };
          console.log('✅ Fallback nativo bem-sucedido');
        } catch (fallbackError) {
          console.error('❌ Fallback nativo também falhou:', fallbackError.message);
          throw new Error(`Adobe falhou: ${adobeError.message}. Fallback falhou: ${fallbackError.message}`);
        }
      }
    } else {
      // Método direto nativo se especificado
      console.log('📄 Usando extração nativa direta...');
      const nativeResult = await extractWithNativeFallback(file_data, file_name);
      extractedText = nativeResult.text;
      extraction_metadata = { method: 'native_direct', ...nativeResult.metadata };
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

// CORREÇÃO CRÍTICA: Cache de token Adobe (24h conforme documentação)
async function getAdobeAccessToken(): Promise<string> {
  const adobeClientId = Deno.env.get('ADOBE_CLIENT_ID');
  const adobeClientSecret = Deno.env.get('ADOBE_CLIENT_SECRET');
  
  if (!adobeClientId || !adobeClientSecret) {
    throw new Error('Adobe API credentials not configured');
  }

  // Verificar se o token em cache ainda é válido (24h - 5 min de margem)
  const now = Date.now();
  if (adobeTokenCache && adobeTokenCache.expires > now + (5 * 60 * 1000)) {
    console.log('✅ Usando token Adobe em cache (válido por mais', Math.round((adobeTokenCache.expires - now) / 1000 / 60), 'minutos)');
    return adobeTokenCache.token;
  }

  console.log('🔐 Renovando token Adobe (cache expirado ou inexistente)...');
  
  const tokenResponse = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'client_id': adobeClientId,
      'client_secret': adobeClientSecret,
      'grant_type': 'client_credentials',
      'scope': 'openid,AdobeID,read_organizations,additional_info.projectedProductContext,read_write_documents'
    }).toString()
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('❌ Adobe token error:', errorText);
    throw new Error(`Adobe authentication failed: ${tokenResponse.status} - ${errorText}`);
  }

  const { access_token, expires_in } = await tokenResponse.json();
  
  // Cache do token por 24h (ou pelo tempo retornado pela API - 5 min de margem)
  const expirationTime = now + ((expires_in || 86400) * 1000) - (5 * 60 * 1000);
  adobeTokenCache = {
    token: access_token,
    expires: expirationTime
  };
  
  console.log('✅ Token Adobe renovado e armazenado em cache por 24h');
  return access_token;
}

async function extractWithAdobe(fileData: string, fileName: string) {
  const adobeClientId = Deno.env.get('ADOBE_CLIENT_ID');
  const adobeOrgId = Deno.env.get('ADOBE_ORG_ID');
  
  if (!adobeClientId || !adobeOrgId) {
    throw new Error('Adobe API credentials not configured');
  }

  console.log('🔧 Iniciando extração Adobe PDF Services...');
  const extractionStartTime = Date.now();
  
  try {
    // CORREÇÃO CRÍTICA: Usar token em cache
    const access_token = await getAdobeAccessToken();
    console.log('✅ Token Adobe obtido (cache ou renovado)');

    // Step 2: Convert and upload file
    console.log('📤 Convertendo e enviando arquivo para Adobe...');
    const uploadStartTime = Date.now();
    
    const uint8Array = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));
    const blob = new Blob([uint8Array], { type: 'application/pdf' });
    const file = new File([blob], fileName, { 
      type: 'application/pdf',
      lastModified: Date.now()
    });
    
    console.log('📋 Detalhes do arquivo:', {
      name: fileName,
      size: file.size,
      type: file.type,
      dataLength: fileData.length
    });
    
    const formData = new FormData();
    formData.append('file', file, fileName);
    
    const uploadResponse = await fetch('https://pdf-services.adobe.io/assets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'X-API-Key': adobeClientId,
        'X-Adobe-Organization-Id': adobeOrgId,
        'Accept': 'application/json',
      },
      body: formData
    });

    const uploadTime = Date.now() - uploadStartTime;
    console.log(`📤 Upload concluído em ${uploadTime}ms`);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ Adobe upload error:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        error: errorText,
        uploadTime
      });
      throw new Error(`Adobe upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    const uploadResult = await uploadResponse.json();
    const assetId = uploadResult.assetID;
    
    console.log('✅ Arquivo enviado para Adobe com sucesso:', {
      assetId,
      uploadTime,
      response: uploadResult
    });

    // Step 3: Create extraction job
    const extractResponse = await fetch('https://pdf-services.adobe.io/operation/extractpdf', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'X-API-Key': adobeClientId,
        'X-Adobe-Organization-Id': adobeOrgId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assetID: assetId,
        elementsToExtract: ['text', 'tables'],
        elementsToExtractRenditions: ['tables']
      })
    });

    if (!extractResponse.ok) {
      const errorText = await extractResponse.text();
      console.error('❌ Adobe extraction error:', errorText);
      throw new Error(`Adobe extraction failed: ${extractResponse.status} - ${errorText}`);
    }

    const extractResult = await extractResponse.json();
    const jobId = extractResult.location.split('/').pop();
    
    console.log('⏳ Job de extração criado:', jobId);

    // Step 4: Poll for completion (timeout aumentado para 45s)
    let attempts = 0;
    const maxAttempts = 15; // 15 tentativas x 3s = 45s máximo
    const pollingStartTime = Date.now();
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 segundos entre tentativas
      attempts++;
      
      console.log(`⏳ Verificando status Adobe... tentativa ${attempts}/${maxAttempts} (${Date.now() - pollingStartTime}ms)`);
      
      const statusResponse = await fetch(`https://pdf-services.adobe.io/operation/extractpdf/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'X-API-Key': adobeClientId,
          'X-Adobe-Organization-Id': adobeOrgId
        }
      });

      if (!statusResponse.ok) {
        console.warn(`⚠️ Status check falhou (tentativa ${attempts}):`, statusResponse.status);
        continue;
      }

      const status = await statusResponse.json();
      console.log(`📊 Status Adobe atual: ${status.status} (tentativa ${attempts})`);
      
      if (status.status === 'done') {
        const pollingTime = Date.now() - pollingStartTime;
        const totalTime = Date.now() - extractionStartTime;
        console.log(`✅ Extração Adobe concluída em ${pollingTime}ms de polling (total: ${totalTime}ms)`);
        
        // Baixar resultado
        console.log('📥 Baixando resultado da extração...');
        const downloadStartTime = Date.now();
        
        const resultResponse = await fetch(status.dowloadUri);
        if (!resultResponse.ok) {
          throw new Error(`Download do resultado falhou: ${resultResponse.status}`);
        }
        
        const resultData = await resultResponse.json();
        const downloadTime = Date.now() - downloadStartTime;
        
        console.log(`📥 Resultado baixado em ${downloadTime}ms:`, {
          pages: resultData.pages?.length || 0,
          elements: resultData.elements?.length || 0,
          hasText: !!resultData.elements?.some((e: any) => e.Text)
        });
        
        // Extrair texto dos elementos
        let extractedText = '';
        if (resultData.elements) {
          extractedText = resultData.elements
            .filter((elem: any) => elem.Text)
            .map((elem: any) => elem.Text)
            .join(' ');
        }
        
        console.log(`📄 Texto extraído: ${extractedText.length} caracteres`);
        
        return {
          text: extractedText,
          metadata: {
            method: 'adobe_pdf_services',
            file_name: fileName,
            extraction_time: new Date().toISOString(),
            total_time_ms: Date.now() - extractionStartTime,
            polling_time_ms: pollingTime,
            download_time_ms: downloadTime,
            pages: resultData.pages?.length || 0,
            elements: resultData.elements?.length || 0,
            polling_attempts: attempts
          }
        };
      } else if (status.status === 'failed') {
        console.error('❌ Adobe extraction job failed:', status);
        throw new Error(`Adobe extraction job failed: ${JSON.stringify(status)}`);
      }
    }
    
    const timeoutDuration = Date.now() - pollingStartTime;
    console.error(`❌ Adobe extraction timeout após ${timeoutDuration}ms (${attempts} tentativas)`);
    throw new Error(`Adobe extraction timeout after ${timeoutDuration}ms`);
    
  } catch (error) {
    console.error('❌ Erro na extração Adobe:', error);
    throw new Error(`Adobe extraction failed: ${error.message}`);
  }
}

// CORREÇÃO: Fallback nativo simples (sem dependências externas)
async function extractWithNativeFallback(fileData: string, fileName: string) {
  console.log('🔧 Iniciando extração nativa de fallback...');
  
  try {
    // Simular extração básica de texto (placeholder)
    // Em um cenário real, você poderia usar uma biblioteca nativa de PDF parsing
    // Por enquanto, retorna uma estrutura padrão para indicar falha
    
    console.log('⚠️ Fallback nativo executado - extração limitada');
    
    // Retorna um texto de fallback indicando que a extração precisa ser manual
    const fallbackText = `
    EXTRAÇÃO AUTOMÁTICA INDISPONÍVEL
    
    Arquivo: ${fileName}
    Data: ${new Date().toLocaleString('pt-BR')}
    
    A extração automática de texto não foi possível. 
    Por favor, revise manualmente o conteúdo do PDF e insira as informações necessárias.
    
    Status: Adobe PDF Services indisponível
    Fallback: Extração nativa limitada
    
    [REVISAR MANUALMENTE]
    `;
    
    return {
      text: fallbackText,
      metadata: {
        method: 'native_fallback',
        file_name: fileName,
        extraction_time: new Date().toISOString(),
        warning: 'Extração automática falhou - revisão manual necessária',
        adobe_failed: true,
        fallback_used: true
      }
    };
    
  } catch (error) {
    console.error('❌ Erro no fallback nativo:', error);
    throw new Error(`Fallback nativo falhou: ${error.message}`);
  }
}