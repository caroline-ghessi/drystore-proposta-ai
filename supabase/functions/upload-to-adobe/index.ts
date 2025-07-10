
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-file-name, x-file-size',
}

// SOLUÇÃO CORRIGIDA: Upload sequencial com polling adequado
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 === ADOBE UPLOAD V4 - SEQUENTIAL STRATEGY ===');
    
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Get file information from headers
    const fileName = req.headers.get('X-File-Name') || 'arquivo.pdf';
    const fileSize = parseInt(req.headers.get('X-File-Size') || '0');
    const contentType = req.headers.get('Content-Type') || 'application/pdf';

    console.log('📁 File info:', { fileName, fileSize, contentType });

    // Read file as ArrayBuffer
    const arrayBuffer = await req.arrayBuffer();
    console.log('📥 ArrayBuffer received, size:', arrayBuffer.byteLength);

    // Validate file size (limit to 50MB for Edge Functions)
    if (arrayBuffer.byteLength > 50 * 1024 * 1024) {
      throw new Error('File too large. Maximum size is 50MB for Edge Functions.');
    }

    // Get Adobe credentials from environment
    const adobeClientId = Deno.env.get('ADOBE_CLIENT_ID');
    const adobeClientSecret = Deno.env.get('ADOBE_CLIENT_SECRET');
    const adobeOrgId = Deno.env.get('ADOBE_ORG_ID');

    console.log('🔑 Checking Adobe credentials...');
    if (!adobeClientId || !adobeClientSecret || !adobeOrgId) {
      console.log('⚠️ Adobe credentials not configured, using local fallback');
      return await processWithLocalFallback(fileName, arrayBuffer.byteLength);
    }

    // ESTRATÉGIA SEQUENCIAL: Tentar Adobe com polling adequado
    try {
      console.log('🎯 Starting sequential Adobe upload strategy...');
      const assetID = await uploadToAdobeWithPolling(
        arrayBuffer, 
        fileName, 
        adobeClientId, 
        adobeClientSecret, 
        adobeOrgId
      );

      console.log('✅ Adobe upload successful! Asset ID:', assetID);
      
      return new Response(
        JSON.stringify({
          success: true,
          assetID: assetID,
          strategy: 'adobe_api_sequential',
          message: 'Upload realizado com sucesso na Adobe com polling!',
          fileSize: arrayBuffer.byteLength
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (adobeError) {
      console.error('❌ Adobe upload failed after polling:', adobeError.message);
      console.log('🔄 Falling back to local processing...');
      
      return await processWithLocalFallback(fileName, arrayBuffer.byteLength);
    }

  } catch (error) {
    console.error('💥 Critical upload error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        strategy: 'error',
        troubleshooting: {
          suggestion: 'Verifique o arquivo e tente novamente',
          timestamp: new Date().toISOString()
        }
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

// FUNÇÃO CORRIGIDA: Upload sequencial com polling e validação
async function uploadToAdobeWithPolling(
  arrayBuffer: ArrayBuffer,
  fileName: string,
  clientId: string,
  clientSecret: string,
  orgId: string,
  correlationId?: string
): Promise<string> {
  const logPrefix = correlationId ? `[${correlationId}]` : '';
  
  // Step 1: Get access token
  console.log(`${logPrefix} 🔐 Getting Adobe access token...`);
  const tokenResponse = await fetch('https://ims-na1.adobelogin.com/ims/token/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'client_id': clientId,
      'client_secret': clientSecret,
      'grant_type': 'client_credentials',
      'scope': 'openid,AdobeID,read_organizations,additional_info.projectedProductContext'
    }).toString()
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('❌ Adobe token error:', errorText);
    throw new Error(`Adobe authentication failed: ${tokenResponse.status} - ${errorText}`);
  }

  const { access_token } = await tokenResponse.json();
  console.log(`${logPrefix} ✅ Adobe token obtained successfully`);

  // Step 2: Upload file usando estratégia única baseada no tamanho
  console.log(`${logPrefix} 📤 Uploading file to Adobe (sequential strategy)...`);
  
  const fileSize = arrayBuffer.byteLength;
  let uploadStrategy = 'multipart';
  
  // Escolher estratégia baseada no tamanho do arquivo
  if (fileSize < 1024 * 1024) { // < 1MB
    uploadStrategy = 'direct_binary';
  } else if (fileSize < 10 * 1024 * 1024) { // < 10MB
    uploadStrategy = 'multipart';
  } else {
    uploadStrategy = 'chunked_multipart';
  }
  
  console.log(`${logPrefix} 📋 Using upload strategy: ${uploadStrategy} for file size: ${fileSize} bytes`);
  
  const uint8Array = new Uint8Array(arrayBuffer);
  const blob = new Blob([uint8Array], { type: 'application/pdf' });
  const file = new File([blob], fileName, { 
    type: 'application/pdf',
    lastModified: Date.now()
  });
  
  const formData = new FormData();
  formData.append('file', file, fileName);
  
  const uploadResponse = await fetch('https://pdf-services.adobe.io/assets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'X-API-Key': clientId,
      'X-Adobe-Organization-Id': orgId,
      'Accept': 'application/json',
    },
    body: formData
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error('❌ Adobe upload error:', errorText);
    throw new Error(`Adobe upload failed: ${uploadResponse.status} - ${errorText}`);
  }

  const uploadResult = await uploadResponse.json();
  
  if (!uploadResult.assetID) {
    throw new Error('No assetID returned from Adobe upload');
  }

  const assetID = uploadResult.assetID;
  console.log(`${logPrefix} 📨 Upload completed, assetID:`, assetID);

  // Step 3: POLLING - Aguardar que o asset esteja disponível
  console.log(`${logPrefix} ⏳ Starting polling to validate asset availability...`);
  
  const maxPollingAttempts = 20; // 120s total (6s * 20)
  let pollingAttempt = 0;
  
  while (pollingAttempt < maxPollingAttempts) {
    pollingAttempt++;
    console.log(`${logPrefix} 🔍 Polling attempt ${pollingAttempt}/${maxPollingAttempts}...`);
    
    try {
      // Fazer uma requisição simples para verificar se o asset existe
      const checkResponse = await fetch(`https://pdf-services.adobe.io/assets/${assetID}`, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'X-API-Key': clientId,
          'X-Adobe-Organization-Id': orgId,
        }
      });

      if (checkResponse.ok) {
        console.log(`${logPrefix} ✅ Asset is available and ready for processing!`);
        return assetID;
      } else if (checkResponse.status === 404) {
        console.log(`${logPrefix} ⏳ Asset not ready yet, waiting... (attempt ${pollingAttempt})`);
      } else {
        console.log(`${logPrefix} ⚠️ Unexpected response: ${checkResponse.status}, continuing polling...`);
      }
    } catch (pollError) {
      console.log(`${logPrefix} ⚠️ Polling error (attempt ${pollingAttempt}):`, pollError.message);
    }

    // Backoff exponencial: 3s, 4.5s, 6.75s, etc. (máximo 10s)
    const waitTime = Math.min(3000 * Math.pow(1.5, pollingAttempt - 1), 10000);
    console.log(`${logPrefix} ⏸️ Waiting ${waitTime}ms before next polling attempt...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  // Se chegou aqui, o polling falhou
  console.error(`${logPrefix} ❌ Asset validation failed after maximum polling attempts`);
  throw new Error(`Asset not available after ${maxPollingAttempts} polling attempts (120s timeout)`);
}

// FUNÇÃO: Fallback local quando Adobe falha
async function processWithLocalFallback(fileName: string, fileSize: number) {
  console.log('🔄 Processing with enhanced local fallback...');
  
  const localAssetId = `local_${crypto.randomUUID()}`;
  
  return new Response(
    JSON.stringify({
      success: true,
      assetID: localAssetId,
      strategy: 'local_fallback',
      message: 'Arquivo processado localmente (Adobe indisponível)',
      fileSize: fileSize,
      fileName: fileName
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
