
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { AdobeClient, AdobeCredentials } from './adobe-client.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// TIMEOUT OTIMIZADO - 60 segundos total para arquivos maiores
const TOTAL_TIMEOUT = 60000;
const ADOBE_TIMEOUT = 45000;

serve(async (req) => {
  const startTime = Date.now();
  const requestId = `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log(`🚀 [${requestId}] === PDF PROCESSING STARTED ===`);

  // TIMEOUT PRINCIPAL - 60 segundos máximo para arquivos maiores
  const timeoutId = setTimeout(() => {
    console.log(`⏰ [${requestId}] TIMEOUT GERAL após 60 segundos - forçando fallback`);
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

    // 2. PROCESSAR FORMDATA (ultra-simplificado e robusto)
    console.log(`📄 [${requestId}] Processando FormData...`);
    let formData: FormData;
    let file: File;
    
    try {
      formData = await req.formData();
      console.log(`📄 [${requestId}] FormData obtido com sucesso`);
      
      file = formData.get('file') as File;
      console.log(`📄 [${requestId}] Arquivo extraído: ${file?.name || 'undefined'}`);
      
      if (!file) {
        throw new Error('Nenhum arquivo encontrado no FormData');
      }
      
      if (!(file instanceof File)) {
        throw new Error('Objeto não é um arquivo válido');
      }
      
      if (file.type !== 'application/pdf') {
        throw new Error(`Tipo de arquivo inválido: ${file.type}. Esperado: application/pdf`);
      }
      
      if (file.size === 0) {
        throw new Error('Arquivo está vazio (0 bytes)');
      }
      
      if (file.size > 15 * 1024 * 1024) { // Aumentado para 15MB
        throw new Error(`Arquivo muito grande: ${(file.size/1024/1024).toFixed(2)}MB. Máximo: 15MB`);
      }
      
      console.log(`✅ [${requestId}] Arquivo válido: "${file.name}" (${(file.size/1024/1024).toFixed(2)}MB)`);
      
    } catch (formError) {
      console.error(`❌ [${requestId}] Erro no FormData:`, formError.message);
      throw new Error(`Erro ao processar arquivo: ${formError.message}`);
    }

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

      // Usar AdobeClient corretamente com timeout de 25s
      const adobeCredentials: AdobeCredentials = { clientId, clientSecret, orgId };
      const adobeClient = new AdobeClient(adobeCredentials);
      
      const adobePromise = Promise.race([
        processWithAdobeClient(file, adobeClient),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Adobe timeout after 45s')), ADOBE_TIMEOUT)
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
    const errorTime = Date.now() - startTime;
    console.error(`❌ [${requestId}] ERRO CRÍTICO após ${errorTime}ms:`, error.message);
    console.error(`❌ [${requestId}] Stack trace:`, error.stack);
    
    // Tentar fallback de emergência mesmo com erro
    let emergencyData = null;
    try {
      console.log(`🚨 [${requestId}] Tentando fallback de emergência...`);
      const formData = await req.formData();
      const file = formData.get('file') as File;
      if (file) {
        emergencyData = await processWithFallback(file, requestId);
      }
    } catch (emergencyError) {
      console.error(`❌ [${requestId}] Fallback de emergência falhou:`, emergencyError.message);
    }
    
    clearTimeout(timeoutId);
    
    // Se conseguiu dados de emergência, retornar com sucesso parcial
    if (emergencyData) {
      console.log(`✅ [${requestId}] Recuperado com fallback de emergência`);
      return new Response(
        JSON.stringify({
          success: true,
          method: 'Emergency Fallback',
          data: emergencyData,
          warning: 'Processamento parcial devido a erro técnico',
          original_error: error.message,
          processing_time_ms: errorTime
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Erro definitivo
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        request_id: requestId,
        processing_time_ms: errorTime,
        timestamp: new Date().toISOString(),
        suggestions: [
          'Verificar se o arquivo é um PDF válido',
          'Verificar se o arquivo não está corrompido',
          'Tentar com um arquivo menor (máx 15MB)',
          'Tentar novamente em alguns minutos',
          'Contatar suporte técnico se persistir'
        ]
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// FUNÇÃO ADOBE CORRIGIDA - usando AdobeClient class
async function processWithAdobeClient(file: File, adobeClient: AdobeClient): Promise<any> {
  console.log('🔑 Iniciando processamento Adobe com implementação correta...');
  
  // 1. Obter token de acesso
  const accessToken = await adobeClient.getAccessToken();
  console.log('✅ Token Adobe obtido com sucesso');
  
  // 2. Upload do arquivo
  const assetID = await adobeClient.uploadFile(file, accessToken);
  console.log('✅ Arquivo enviado para Adobe, Asset ID:', assetID);
  
  // 3. Iniciar extração
  const location = await adobeClient.startExtraction(assetID, accessToken);
  console.log('✅ Extração iniciada, polling location:', location);
  
  // 4. Polling para obter resultado
  const extractResult = await adobeClient.pollExtractionResult(location, accessToken);
  console.log('✅ Extração completa:', extractResult.status);
  
  // 5. Download dos dados extraídos
  const resultData = await adobeClient.downloadResult(extractResult.asset.downloadUri);
  console.log('✅ Dados baixados com sucesso');
  
  // 6. Parse dos dados Adobe
  return parseAdobeData(resultData);
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

// FALLBACK NATIVO ULTRA-ROBUSTO (nunca falha)
async function processWithFallback(file: File, requestId: string): Promise<any> {
  console.log(`🔄 [${requestId}] Extraindo texto nativo robusto...`);
  
  let text = '';
  let extractionMethod = 'basic';
  
  try {
    // Método 1: Tentar extração direta
    console.log(`🔄 [${requestId}] Tentando extração direta...`);
    const arrayBuffer = await file.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);
    
    if (pdfBytes.length > 0) {
      // Converter para string e extrair padrões de texto
      const pdfString = String.fromCharCode(...pdfBytes.slice(0, Math.min(50000, pdfBytes.length)));
      
      // Buscar por padrões de texto legíveis
      const textPatterns = [
        /[A-Za-zÀ-ÿ0-9\s\.,\-\(\)R\$\%]+/g,
        /\w+[\s\w\.,\-\(\)R\$\%]*/g,
        /[^\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F]+/g
      ];
      
      for (const pattern of textPatterns) {
        const matches = pdfString.match(pattern) || [];
        if (matches.length > 0) {
          text = matches.join(' ').substring(0, 5000);
          extractionMethod = 'pattern';
          break;
        }
      }
      
      console.log(`✅ [${requestId}] Extração ${extractionMethod}: ${text.length} caracteres`);
    }
    
  } catch (extractError) {
    console.log(`⚠️ [${requestId}] Erro na extração: ${extractError.message}`);
  }
  
  // Método 2: Fallback limitado se não conseguiu extrair texto
  if (!text || text.length < 10) {
    console.log(`🔄 [${requestId}] Aplicando fallback limitado...`);
    text = `Arquivo PDF recebido: ${file.name}
    Extração manual necessária.
    Revisar conteúdo do PDF para extrair dados corretos.`;
    extractionMethod = 'manual_review_required';
  }

  console.log(`✅ [${requestId}] Texto final (${extractionMethod}): ${text.length} caracteres`);

  // Extrair dados com método robusto
  const items = extractItemsFromText(text, `${file.name} (${extractionMethod})`);
  const total = items.reduce((sum: number, item: any) => sum + item.total, 0);

  // Dados sempre válidos
  const result = {
    client: extractClient(text) || 'Cliente a ser identificado',
    vendor: 'DryStore - Soluções Inteligentes',
    proposalNumber: extractProposalNumber(text) || `PROP-${Date.now().toString().slice(-8)}`,
    items,
    subtotal: total,
    total: total || 0, // Não criar valores fictícios
    paymentTerms: 'À vista ou parcelado - a definir',
    delivery: 'Prazo a definir conforme projeto',
    extractionMethod,
    processedAt: new Date().toISOString()
  };

  console.log(`✅ [${requestId}] Dados estruturados: ${items.length} itens, Total: R$ ${result.total}`);
  return result;
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
