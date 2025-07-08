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
  const adobeClientId = Deno.env.get('ADOBE_CLIENT_ID');
  const adobeClientSecret = Deno.env.get('ADOBE_CLIENT_SECRET');
  const adobeOrgId = Deno.env.get('ADOBE_ORG_ID');
  
  if (!adobeClientId || !adobeClientSecret || !adobeOrgId) {
    throw new Error('Adobe API credentials not configured');
  }

  console.log('🔧 Iniciando extração Adobe PDF Services...');
  
  try {
    // Step 1: Get access token
    console.log('🔐 Getting Adobe access token...');
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

    const { access_token } = await tokenResponse.json();
    console.log('✅ Adobe token obtained successfully');

    // Step 2: Convert and upload file
    const uint8Array = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));
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
        'X-API-Key': adobeClientId,
        'X-Adobe-Organization-Id': adobeOrgId,
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
    const assetId = uploadResult.assetID;
    
    console.log('📄 Arquivo enviado para Adobe, Asset ID:', assetId);

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

    // Step 4: Poll for completion
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 segundos
      
      const statusResponse = await fetch(`https://pdf-services.adobe.io/operation/extractpdf/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'X-API-Key': adobeClientId,
          'X-Adobe-Organization-Id': adobeOrgId
        }
      });

      const status = await statusResponse.json();
      
      if (status.status === 'done') {
        console.log('✅ Extração Adobe concluída');
        
        // Baixar resultado
        const resultResponse = await fetch(status.dowloadUri);
        const resultData = await resultResponse.json();
        
        // Extrair texto dos elementos
        let extractedText = '';
        if (resultData.elements) {
          extractedText = resultData.elements
            .filter((elem: any) => elem.Text)
            .map((elem: any) => elem.Text)
            .join(' ');
        }
        
        return {
          text: extractedText,
          metadata: {
            method: 'adobe_pdf_services',
            file_name: fileName,
            extraction_time: new Date().toISOString(),
            pages: resultData.pages?.length || 0,
            elements: resultData.elements?.length || 0
          }
        };
      } else if (status.status === 'failed') {
        throw new Error('Adobe extraction job failed');
      }
      
      attempts++;
      console.log(`⏳ Aguardando Adobe... tentativa ${attempts}/${maxAttempts}`);
    }
    
    throw new Error('Adobe extraction timeout');
    
  } catch (error) {
    console.error('❌ Erro na extração Adobe:', error);
    throw new Error(`Adobe extraction failed: ${error.message}`);
  }
}

async function extractWithGoogleVision(fileData: string) {
  const googleCredentials = Deno.env.get('GOOGLE_CLOUD_CREDENTIALS');
  
  if (!googleCredentials) {
    throw new Error('Google Vision credentials not configured');
  }

  console.log('🔧 Iniciando extração Google Vision...');
  
  try {
    // Parse das credenciais
    const credentials = JSON.parse(googleCredentials);
    
    // Criar token de acesso
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: await createJWT(credentials)
      })
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    if (!accessToken) {
      throw new Error('Failed to get Google access token');
    }

    console.log('🔑 Token Google obtido com sucesso');

    // Fazer OCR do PDF
    const visionResponse = await fetch('https://vision.googleapis.com/v1/images:annotate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [{
          image: {
            content: fileData
          },
          features: [{
            type: 'DOCUMENT_TEXT_DETECTION',
            maxResults: 1
          }]
        }]
      })
    });

    if (!visionResponse.ok) {
      throw new Error(`Google Vision API failed: ${visionResponse.status}`);
    }

    const visionResult = await visionResponse.json();
    
    if (visionResult.responses?.[0]?.error) {
      throw new Error(`Google Vision error: ${visionResult.responses[0].error.message}`);
    }

    const extractedText = visionResult.responses?.[0]?.fullTextAnnotation?.text || '';
    
    console.log('✅ Extração Google Vision concluída');
    
    return {
      text: extractedText,
      metadata: {
        method: 'google_vision',
        extraction_time: new Date().toISOString(),
        confidence: visionResult.responses?.[0]?.fullTextAnnotation?.confidence || 0,
        pages: visionResult.responses?.[0]?.fullTextAnnotation?.pages?.length || 0
      }
    };
    
  } catch (error) {
    console.error('❌ Erro na extração Google Vision:', error);
    throw new Error(`Google Vision extraction failed: ${error.message}`);
  }
}

async function createJWT(credentials: any): Promise<string> {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  
  const payload = btoa(JSON.stringify({
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-vision',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  }));

  const message = `${header}.${payload}`;
  
  // Importar chave privada
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    new TextEncoder().encode(credentials.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Assinar
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(message)
  );

  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  return `${message}.${signatureBase64}`;
}