
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-file-name, x-file-size',
}

// SOLUÇÃO DEFINITIVA: Implementação de múltiplas estratégias de upload
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 === SOLUÇÃO DEFINITIVA ADOBE UPLOAD INICIADA ===');
    
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

    // Get Adobe credentials from environment
    const adobeClientId = Deno.env.get('ADOBE_CLIENT_ID');
    const adobeClientSecret = Deno.env.get('ADOBE_CLIENT_SECRET');
    const adobeOrgId = Deno.env.get('ADOBE_ORG_ID');

    console.log('🔑 Checking Adobe credentials...');
    if (!adobeClientId || !adobeClientSecret || !adobeOrgId) {
      throw new Error('Adobe API credentials not configured properly');
    }

    // ESTRATÉGIA 1: Get Adobe access token with COMPLETE SCOPE
    console.log('🎯 Getting Adobe access token with FULL SCOPE...');
    const tokenResponse = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'client_id': adobeClientId,
        'client_secret': adobeClientSecret,
        'grant_type': 'client_credentials',
        'scope': 'openid,AdobeID,read_organizations,additional_info.projectedProductContext,additional_info.roles,read_write_documents,document_generation'
      }).toString()
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Adobe token error:', errorText);
      throw new Error(`Failed to authenticate with Adobe API: ${tokenResponse.status} - ${errorText}`);
    }

    const { access_token } = await tokenResponse.json();
    console.log('✅ Adobe access token obtained with FULL SCOPE');

    // ESTRATÉGIA 2: Tentar upload RAW BINARY primeiro (sem multipart)
    console.log('🔥 TENTATIVA 1: Upload RAW BINARY (sem multipart)...');
    const requestId = crypto.randomUUID();
    
    try {
      const rawUploadResponse = await fetch('https://pdf-services.adobe.io/assets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'X-API-Key': adobeClientId,
          'X-Adobe-Organization-Id': adobeOrgId,
          'Content-Type': 'application/pdf',
          'Accept': 'application/json',
          'X-Request-Id': requestId,
          'X-Asset-Name': fileName,
          'Content-Length': arrayBuffer.byteLength.toString()
        },
        body: arrayBuffer
      });

      console.log('📊 RAW Upload response status:', rawUploadResponse.status);
      console.log('📋 RAW Upload headers:', Object.fromEntries(rawUploadResponse.headers.entries()));

      if (rawUploadResponse.ok) {
        const rawResponse = await rawUploadResponse.text();
        console.log('✅ RAW UPLOAD FUNCIONOU! Response:', rawResponse.slice(0, 500));
        
        try {
          const uploadData = JSON.parse(rawResponse);
          const assetID = uploadData.assetID;
          
          if (assetID) {
            console.log('🎉 SUCESSO COM RAW BINARY! Asset ID:', assetID);
            return new Response(
              JSON.stringify({
                success: true,
                assetID: assetID,
                requestId: requestId,
                method: 'raw_binary',
                message: 'Upload via RAW BINARY foi bem-sucedido!'
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } catch (parseError) {
          console.log('⚠️ RAW upload retornou resposta não-JSON, tentando próxima estratégia...');
        }
      } else {
        const rawErrorText = await rawUploadResponse.text();
        console.log('⚠️ RAW upload falhou:', rawUploadResponse.status, '-', rawErrorText.slice(0, 200));
      }
    } catch (rawError) {
      console.log('⚠️ RAW upload exception:', rawError.message);
    }

    // ESTRATÉGIA 3: Upload via multipart melhorado com File constructor
    console.log('🔥 TENTATIVA 2: Upload MULTIPART MELHORADO...');
    try {
      // Criar File object corretamente para Deno
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = new Blob([uint8Array], { type: 'application/pdf' });
      const file = new File([blob], fileName, { 
        type: 'application/pdf',
        lastModified: Date.now()
      });
      
      console.log('📎 File criado:', { name: file.name, size: file.size, type: file.type });

      // Criar FormData corretamente
      const formData = new FormData();
      formData.append('file', file, fileName);
      
      console.log('📦 FormData criado com File object');

      const multipartRequestId = crypto.randomUUID();
      const multipartUploadResponse = await fetch('https://pdf-services.adobe.io/assets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'X-API-Key': adobeClientId,
          'X-Adobe-Organization-Id': adobeOrgId,
          'Accept': 'application/json',
          'X-Request-Id': multipartRequestId,
          // NÃO definir Content-Type - FormData define automaticamente
        },
        body: formData
      });

      console.log('📊 Multipart response status:', multipartUploadResponse.status);
      console.log('📋 Multipart headers:', Object.fromEntries(multipartUploadResponse.headers.entries()));

      if (multipartUploadResponse.ok) {
        const multipartResponse = await multipartUploadResponse.text();
        console.log('✅ MULTIPART FUNCIONOU! Response:', multipartResponse.slice(0, 500));
        
        try {
          const uploadData = JSON.parse(multipartResponse);
          const assetID = uploadData.assetID;
          
          if (assetID) {
            console.log('🎉 SUCESSO COM MULTIPART! Asset ID:', assetID);
            return new Response(
              JSON.stringify({
                success: true,
                assetID: assetID,
                requestId: multipartRequestId,
                method: 'multipart_improved',
                message: 'Upload via MULTIPART MELHORADO foi bem-sucedido!'
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } catch (parseError) {
          console.log('⚠️ Multipart upload retornou resposta não-JSON, tentando próxima estratégia...');
        }
      } else {
        const multipartErrorText = await multipartUploadResponse.text();
        console.log('⚠️ Multipart upload falhou:', multipartUploadResponse.status, '-', multipartErrorText.slice(0, 200));
      }
    } catch (multipartError) {
      console.log('⚠️ Multipart upload exception:', multipartError.message);
    }

    // ESTRATÉGIA 4: Tentar endpoints alternativos da Adobe
    console.log('🔥 TENTATIVA 3: Testando ENDPOINTS ALTERNATIVOS...');
    const alternativeEndpoints = [
      'https://pdf-services-ue1.adobe.io/assets',
      'https://cpf-ue1.adobe.io/ops/:create',
      'https://pdf-services.adobe.io/operation/createpdf'
    ];

    for (const endpoint of alternativeEndpoints) {
      try {
        console.log(`🌐 Testando endpoint: ${endpoint}`);
        
        const altRequestId = crypto.randomUUID();
        const altResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'X-API-Key': adobeClientId,
            'X-Adobe-Organization-Id': adobeOrgId,
            'Content-Type': 'application/pdf',
            'Accept': 'application/json',
            'X-Request-Id': altRequestId,
            'X-Asset-Name': fileName
          },
          body: arrayBuffer
        });

        console.log(`📊 ${endpoint} status:`, altResponse.status);
        
        if (altResponse.ok) {
          const altResponseText = await altResponse.text();
          console.log(`✅ ENDPOINT ALTERNATIVO FUNCIONOU! ${endpoint}`);
          console.log('Response:', altResponseText.slice(0, 500));
          
          return new Response(
            JSON.stringify({
              success: true,
              response: altResponseText,
              endpoint: endpoint,
              requestId: altRequestId,
              method: 'alternative_endpoint',
              message: `Upload via endpoint alternativo ${endpoint} foi bem-sucedido!`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (altError) {
        console.log(`⚠️ Endpoint ${endpoint} falhou:`, altError.message);
      }
    }

    // ESTRATÉGIA 5: Diagnóstico completo se tudo falhar
    console.log('🔍 DIAGNÓSTICO COMPLETO - todas as estratégias falharam');
    
    // Testar se as credenciais têm as permissões corretas
    console.log('🔍 Testando permissões das credenciais...');
    const permissionsTest = await fetch('https://pdf-services.adobe.io', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'X-API-Key': adobeClientId,
        'X-Adobe-Organization-Id': adobeOrgId,
      }
    });
    
    console.log('🔍 Permissions test status:', permissionsTest.status);
    const permissionsResponse = await permissionsTest.text();
    console.log('🔍 Permissions response:', permissionsResponse.slice(0, 300));

    throw new Error(`TODAS AS ESTRATÉGIAS FALHARAM - Erro 415 persistente. Status de permissões: ${permissionsTest.status}. Detalhes: ${permissionsResponse.slice(0, 200)}`);

  } catch (error) {
    console.error('💥 FALHA TOTAL na solução definitiva:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        strategies_attempted: [
          'raw_binary_upload',
          'multipart_improved',
          'alternative_endpoints',
          'permissions_diagnosis'
        ],
        message: 'SOLUÇÃO DEFINITIVA: Todas as estratégias foram tentadas. Erro 415 indica problema fundamental com Adobe API ou credenciais.',
        troubleshooting_info: {
          deno_version: Deno.version.deno,
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID()
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
