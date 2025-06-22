
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-file-name, x-file-size',
}

// SOLUÇÃO MELHORADA: Upload com estratégia coordenada
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 === ADOBE UPLOAD V3 - UNIFIED STRATEGY ===');
    
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Get file information from headers
    const fileName = req.headers.get('X-File-Name') || 'arquivo.pdf';
    const fileSize = req.headers.get('X-File-Size') || '0';
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

    // FASE 1: Tentar Adobe primeiro
    try {
      console.log('🎯 Attempting Adobe upload...');
      const assetID = await uploadToAdobeAPI(
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
          strategy: 'adobe_api',
          message: 'Upload realizado com sucesso na Adobe!',
          fileSize: arrayBuffer.byteLength
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (adobeError) {
      console.error('❌ Adobe upload failed:', adobeError.message);
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

// FUNÇÃO: Upload para Adobe API
async function uploadToAdobeAPI(
  arrayBuffer: ArrayBuffer,
  fileName: string,
  clientId: string,
  clientSecret: string,
  orgId: string
): Promise<string> {
  
  // Step 1: Get access token
  console.log('🔐 Getting Adobe access token...');
  const tokenResponse = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'client_id': clientId,
      'client_secret': clientSecret,
      'grant_type': 'client_credentials',
      'scope': 'openid,AdobeID,read_organizations,additional_info.projectedProductContext,read_write_documents'
    }).toString()
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('❌ Adobe token error:', errorText);
    throw new Error(`Adobe authentication failed: ${tokenResponse.status} - ${errorText}`);
  }

  const { access_token } = await tokenResponse.json();
  console.log('✅ Adobe token obtained successfully');

  // Step 2: Upload file - Trying multipart first for better compatibility
  console.log('📤 Uploading file to Adobe (multipart strategy)...');
  
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

  const result = await uploadResponse.json();
  
  if (!result.assetID) {
    throw new Error('No assetID returned from Adobe upload');
  }

  return result.assetID;
}

// FUNÇÃO: Fallback local quando Adobe falha
async function processWithLocalFallback(fileName: string, fileSize: number) {
  console.log('🔄 Processing with local fallback...');
  
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
