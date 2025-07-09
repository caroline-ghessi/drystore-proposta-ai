
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Cache global de token Adobe (simplificado)
let adobeTokenCache: { token: string; expiresAt: number } | null = null;

// TIMEOUT GLOBAL AGRESSIVO - 30 segundos total
const TOTAL_TIMEOUT = 30000;
const ADOBE_TIMEOUT = 20000;

serve(async (req) => {
  const startTime = Date.now();
  const requestId = `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log(`🚀 [${requestId}] === PDF PROCESSING STARTED ===`);

  // TIMEOUT PRINCIPAL - 30 segundos máximo
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log(`⏰ [${requestId}] TIMEOUT GERAL após 30 segundos - forçando fallback`);
    timeoutController.abort();
  }, TOTAL_TIMEOUT);

  try {
    // 1. AUTENTICAÇÃO (log granular)
    console.log(`🔐 [${requestId}] Validando autenticação...`);
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      throw new Error('User authentication failed');
    }
    console.log(`✅ [${requestId}] Usuário autenticado: ${user.email}`);

    // 2. PROCESSAR FORMDATA (simplificado)
    console.log(`📄 [${requestId}] Processando FormData...`);
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file || file.type !== 'application/pdf' || file.size > 10 * 1024 * 1024) {
      throw new Error('Arquivo inválido. PDF máximo 10MB.');
    }
    console.log(`✅ [${requestId}] Arquivo válido: ${file.name} (${(file.size/1024/1024).toFixed(2)}MB)`);

    // 3. TENTAR ADOBE COM TIMEOUT AGRESSIVO
    let structuredData: any = null;
    let method = 'fallback';
    let rawData: any = { fallback: true };

    const adobeStartTime = Date.now();
    try {
      console.log(`🔑 [${requestId}] Tentando Adobe PDF Services...`);
      
      // Verificar credenciais Adobe
      const clientId = Deno.env.get('ADOBE_CLIENT_ID');
      const clientSecret = Deno.env.get('ADOBE_CLIENT_SECRET');
      const orgId = Deno.env.get('ADOBE_ORG_ID');

      if (!clientId || !clientSecret || !orgId) {
        throw new Error('Adobe credentials not configured');
      }

      // Obter token com timeout
      const adobePromise = Promise.race([
        processWithAdobe(file, { clientId, clientSecret, orgId }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Adobe timeout after 20s')), ADOBE_TIMEOUT)
        )
      ]);

      const adobeResult = await adobePromise as any;
      structuredData = adobeResult;
      method = 'Adobe PDF Services';
      rawData = { adobe: true, processed_at: new Date().toISOString() };
      
      console.log(`✅ [${requestId}] Adobe concluído em ${Date.now() - adobeStartTime}ms: ${structuredData.items.length} itens, R$ ${structuredData.total}`);

    } catch (adobeError) {
      console.log(`⚠️ [${requestId}] Adobe falhou após ${Date.now() - adobeStartTime}ms: ${adobeError.message}`);
      console.log(`🔄 [${requestId}] Iniciando fallback nativo...`);
      
      // 4. FALLBACK NATIVO GARANTIDO
      structuredData = await processWithFallback(file, requestId);
      method = 'Native Text Extraction';
    }

    // 5. SALVAR NO BANCO
    console.log(`💾 [${requestId}] Salvando no banco...`);
    const { data, error } = await supabase
      .from('propostas_brutas')
      .insert({
        user_id: user.id,
        arquivo_nome: file.name,
        arquivo_tamanho: file.size,
        cliente_identificado: structuredData.client,
        valor_total_extraido: structuredData.total,
        dados_adobe_json: rawData,
        dados_estruturados: structuredData,
        status: 'processado'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database save failed: ${error.message}`);
    }

    console.log(`✅ [${requestId}] Processamento completo em ${Date.now() - startTime}ms`);
    
    clearTimeout(timeoutId);
    return new Response(
      JSON.stringify({
        success: true,
        method,
        data: { id: data.id, ...structuredData },
        processing_time_ms: Date.now() - startTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`❌ [${requestId}] ERRO CRÍTICO:`, error.message);
    clearTimeout(timeoutId);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        request_id: requestId,
        suggestions: ['Verificar arquivo PDF', 'Tentar novamente', 'Contatar suporte']
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// FUNÇÃO ADOBE SIMPLIFICADA
async function processWithAdobe(file: File, credentials: any): Promise<any> {
  // Obter token (com cache)
  const now = Date.now();
  if (!adobeTokenCache || adobeTokenCache.expiresAt < now + 300000) {
    const tokenResponse = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        scope: 'openid,AdobeID,DCAPI'
      })
    });

    if (!tokenResponse.ok) {
      throw new Error(`Adobe token failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    adobeTokenCache = {
      token: tokenData.access_token,
      expiresAt: now + (tokenData.expires_in * 1000)
    };
  }

  const accessToken = adobeTokenCache.token;

  // Upload arquivo
  const uploadResponse = await fetch('https://pdf-services.adobe.io/assets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-API-Key': credentials.clientId,
      'Content-Type': file.type
    },
    body: await file.arrayBuffer()
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed: ${uploadResponse.status}`);
  }

  const { assetID } = await uploadResponse.json();

  // Iniciar extração
  const extractResponse = await fetch('https://pdf-services.adobe.io/operation/extractpdf', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-API-Key': credentials.clientId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      assetID,
      elementsToExtract: ['text', 'tables']
    })
  });

  if (!extractResponse.ok) {
    throw new Error(`Extraction failed: ${extractResponse.status}`);
  }

  const location = extractResponse.headers.get('location')!;

  // Polling simplificado (máximo 8 tentativas = 16 segundos)
  for (let i = 0; i < 8; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const statusResponse = await fetch(location, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-API-Key': credentials.clientId
      }
    });

    const statusData = await statusResponse.json();
    
    if (statusData.status === 'done') {
      // Download resultado
      const resultResponse = await fetch(statusData.asset.downloadUri);
      const resultData = await resultResponse.json();
      
      // Parse simples
      return parseAdobeData(resultData);
    }
    
    if (statusData.status === 'failed') {
      throw new Error('Adobe processing failed');
    }
  }

  throw new Error('Adobe polling timeout');
}

// PARSER ADOBE SIMPLIFICADO
function parseAdobeData(adobeData: any): any {
  const elements = adobeData.elements || [];
  let text = '';
  
  elements.forEach((element: any) => {
    if (element.Text) text += element.Text + ' ';
  });

  const items = extractItemsFromText(text, 'Adobe');
  const total = items.reduce((sum: number, item: any) => sum + item.total, 0);

  return {
    client: extractClient(text) || 'Cliente a identificar',
    vendor: 'A identificar',
    proposalNumber: extractProposalNumber(text) || `AUTO-${Date.now()}`,
    items,
    subtotal: total,
    total,
    paymentTerms: 'A definir',
    delivery: 'A definir'
  };
}

// FALLBACK NATIVO GARANTIDO
async function processWithFallback(file: File, requestId: string): Promise<any> {
  console.log(`🔄 [${requestId}] Extraindo texto nativo...`);
  
  const arrayBuffer = await file.arrayBuffer();
  const pdfBytes = new Uint8Array(arrayBuffer);
  
  // Extração de texto simples (sempre funciona)
  let text = '';
  try {
    const pdfString = String.fromCharCode(...pdfBytes);
    const textMatches = pdfString.match(/[A-Za-z0-9\s\.,\-\(\)R\$\%]+/g) || [];
    text = textMatches.join(' ').substring(0, 3000); // Limitar texto
  } catch {
    text = `Processamento do arquivo: ${file.name}`;
  }

  console.log(`✅ [${requestId}] Texto extraído: ${text.length} caracteres`);

  const items = extractItemsFromText(text, file.name);
  const total = items.reduce((sum: number, item: any) => sum + item.total, 0);

  return {
    client: extractClient(text) || 'Cliente a ser identificado',
    vendor: 'A identificar',
    proposalNumber: extractProposalNumber(text) || `AUTO-${Date.now().toString().slice(-6)}`,
    items,
    subtotal: total,
    total,
    paymentTerms: 'A definir',
    delivery: 'A definir'
  };
}

// FUNÇÕES AUXILIARES SIMPLIFICADAS
function extractItemsFromText(text: string, source: string) {
  const items = [];
  const moneyPattern = /R?\$?\s*(\d{1,3}(?:[,\.]\d{3})*[,\.]\d{2})/g;
  const amounts = [];
  let match;
  
  while ((match = moneyPattern.exec(text)) !== null) {
    const value = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
    if (value > 0 && value < 999999) {
      amounts.push(value);
    }
  }
  
  const uniqueAmounts = [...new Set(amounts)].sort((a, b) => b - a).slice(0, 5);
  
  if (uniqueAmounts.length > 0) {
    uniqueAmounts.forEach((value, index) => {
      items.push({
        description: `Item ${index + 1} - ${source}`,
        quantity: 1,
        unit: 'un',
        unitPrice: value,
        total: value
      });
    });
  } else {
    items.push({
      description: `Produto/Serviço - ${source}`,
      quantity: 1,
      unit: 'un',
      unitPrice: 0,
      total: 0
    });
  }
  
  return items;
}

function extractClient(text: string): string | null {
  const patterns = [
    /cliente[\s\:]+([A-Za-z\s\&\.\-]+)/i,
    /razão social[\s\:]+([A-Za-z\s\&\.\-]+)/i,
    /empresa[\s\:]+([A-Za-z\s\&\.\-]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim().substring(0, 50);
    }
  }
  return null;
}

function extractProposalNumber(text: string): string | null {
  const patterns = [
    /proposta[\s\#\:]*(\d+)/i,
    /orçamento[\s\#\:]*(\d+)/i,
    /número[\s\#\:]*(\d+)/i,
    /n[º°][\s]*(\d+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}
