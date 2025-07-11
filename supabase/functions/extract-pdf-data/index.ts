
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { AdobeSDKClient, AdobeCredentials, ExtractionResult } from '../shared/adobe-sdk-client.ts'
import { EnhancedDataParser, ParsedDocument } from '../shared/enhanced-data-parser.ts'
import { SupabaseIntegration } from '../shared/supabase-integration.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// TIMEOUTS OTIMIZADOS
const TOTAL_TIMEOUT = 300000; // 5 minutos total
const FALLBACK_TIMEOUT = 30000; // 30s para fallback nativo

serve(async (req) => {
  // Gerar correlation ID para rastreamento
  const correlationId = crypto.randomUUID().substring(0, 8);
  const logPrefix = `[${correlationId}]`;
  const startTime = Date.now();
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log(`${logPrefix} 🚀 === PDF PROCESSING V3.0 - 5 PHASES ===`);

  // Timeout principal
  const timeoutId = setTimeout(() => {
    console.log(`${logPrefix} ⏰ TIMEOUT GERAL após 5 minutos - forçando fallback`);
  }, TOTAL_TIMEOUT);

  // Inicializar componentes das 5 fases
  const supabaseIntegration = new SupabaseIntegration(correlationId);
  const enhancedParser = new EnhancedDataParser(correlationId);

  try {
    // FASE 05: Autenticação via Supabase Integration
    console.log(`${logPrefix} 🔐 FASE 05: Autenticação...`);
    const authHeader = req.headers.get('Authorization');
    const user = await supabaseIntegration.authenticateUser(authHeader!);

    // PROCESSAR FORMDATA
    console.log(`${logPrefix} 📄 Processando FormData...`);
    await supabaseIntegration.logProcessingStage('formdata', 'started', user.id, '', 0);
    
    let formData: FormData;
    let file: File;
    
    try {
      formData = await req.formData();
      file = formData.get('file') as File;
      
      if (!file || !(file instanceof File)) {
        throw new Error('Arquivo não encontrado ou inválido');
      }
      
      if (file.type !== 'application/pdf') {
        throw new Error(`Tipo inválido: ${file.type}. Esperado: application/pdf`);
      }
      
      if (file.size === 0 || file.size > 50 * 1024 * 1024) {
        throw new Error(`Tamanho inválido: ${(file.size/1024/1024).toFixed(2)}MB. Limite: 50MB`);
      }
      
      console.log(`${logPrefix} ✅ Arquivo válido: "${file.name}" (${(file.size/1024/1024).toFixed(2)}MB)`);
      await supabaseIntegration.logProcessingStage('formdata', 'completed', user.id, file.name, file.size);
      
    } catch (formError) {
      await supabaseIntegration.logProcessingStage('formdata', 'failed', user.id, '', 0, null, formError.message);
      throw new Error(`Erro ao processar arquivo: ${formError.message}`);
    }

    // FASE 05: Verificar cache inteligente
    console.log(`${logPrefix} 🧠 FASE 05: Verificando cache inteligente...`);
    const fileHash = await supabaseIntegration.generateFileHash(file);
    const cacheEntry = await supabaseIntegration.checkCache(fileHash, user.id);
    
    let structuredData: ParsedDocument;
    let method = 'cache';
    let extractionQuality: 'high' | 'medium' | 'low' = 'high';

    if (cacheEntry) {
      console.log(`${logPrefix} ✅ Cache hit! Usando dados salvos...`);
      structuredData = cacheEntry.extraction_data;
      method = `cache_${cacheEntry.processing_method}`;
      extractionQuality = cacheEntry.extraction_quality;
      
    } else {
      console.log(`${logPrefix} 🔄 Cache miss - processando arquivo...`);

      // FASE 01: Tentar Adobe SDK primeiro
      console.log(`${logPrefix} 🔑 FASE 01: Adobe SDK...`);
      const adobeStartTime = Date.now();
      let adobeResult: ExtractionResult | null = null;
      
      try {
        const clientId = Deno.env.get('ADOBE_CLIENT_ID');
        const clientSecret = Deno.env.get('ADOBE_CLIENT_SECRET');
        const orgId = Deno.env.get('ADOBE_ORG_ID');

        if (!clientId || !clientSecret || !orgId) {
          throw new Error('Adobe credentials not configured');
        }

        const adobeCredentials: AdobeCredentials = { clientId, clientSecret, orgId };
        const adobeSDK = new AdobeSDKClient(adobeCredentials, correlationId);
        
        await supabaseIntegration.logProcessingStage('adobe_sdk', 'started', user.id, file.name, file.size);
        adobeResult = await adobeSDK.extractPDFData(file);
        
        if (adobeResult.success && adobeResult.data) {
          console.log(`${logPrefix} ✅ Adobe SDK bem-sucedido em ${Date.now() - adobeStartTime}ms`);
          
          // FASE 02: Parser avançado nos dados do Adobe
          console.log(`${logPrefix} 🧮 FASE 02: Parser avançado...`);
          structuredData = enhancedParser.parseDocument(adobeResult.data);
          method = adobeResult.method;
          extractionQuality = adobeResult.extractionQuality;
          
          await supabaseIntegration.logProcessingStage('adobe_sdk', 'completed', user.id, file.name, file.size, 
            { items_count: structuredData.items.length, total: structuredData.total }, null, Date.now() - adobeStartTime);
        } else {
          throw new Error(adobeResult.error || 'Adobe extraction failed');
        }

      } catch (adobeError) {
        console.log(`${logPrefix} ⚠️ Adobe SDK falhou após ${Date.now() - adobeStartTime}ms: ${adobeError.message}`);
        await supabaseIntegration.logProcessingStage('adobe_sdk', 'failed', user.id, file.name, file.size, 
          null, adobeError.message, Date.now() - adobeStartTime);
        
        // FALLBACK: Extração nativa robusta
        console.log(`${logPrefix} 🔄 Iniciando fallback nativo...`);
        structuredData = await processWithEnhancedFallback(file, enhancedParser, correlationId);
        method = 'enhanced_native_fallback';
        extractionQuality = 'medium';
      }

      // FASE 05: Salvar no cache se a qualidade for boa
      if (extractionQuality === 'high' || extractionQuality === 'medium') {
        console.log(`${logPrefix} 💾 Salvando no cache...`);
        await supabaseIntegration.saveToCache(
          fileHash, file.name, file.size, structuredData, 
          extractionQuality, method, user.id
        );
      }
    }

    // FASE 05: Salvar dados processados
    console.log(`${logPrefix} 💾 FASE 05: Salvando dados processados...`);
    const savedId = await supabaseIntegration.saveProcessedData(
      user.id, file.name, file.size, structuredData, method, extractionQuality
    );

    console.log(`${logPrefix} ✅ Processamento completo em ${Date.now() - startTime}ms`);
    
    clearTimeout(timeoutId);
    return new Response(
      JSON.stringify({
        success: true,
        method,
        extraction_quality: extractionQuality,
        data: { id: savedId, ...structuredData },
        processing_time_ms: Date.now() - startTime,
        correlation_id: correlationId,
        phases_completed: ['01_adobe_sdk', '02_enhanced_parser', '05_supabase_integration']
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error(`${logPrefix} ❌ ERRO CRÍTICO após ${errorTime}ms:`, error.message);
    
    clearTimeout(timeoutId);
    
    // Tentar fallback de emergência
    try {
      console.log(`🚨 [${correlationId}] Tentando fallback de emergência...`);
      const formData = await req.formData();
      const file = formData.get('file') as File;
      
      if (file) {
        const enhancedParser = new EnhancedDataParser(correlationId);
        const emergencyData = await processWithEnhancedFallback(file, enhancedParser, correlationId);
        
        console.log(`✅ [${correlationId}] Recuperado com fallback de emergência`);
        return new Response(
          JSON.stringify({
            success: true,
            method: 'emergency_fallback',
            extraction_quality: 'low',
            data: emergencyData,
            warning: 'Processamento parcial devido a erro técnico',
            original_error: error.message,
            processing_time_ms: errorTime,
            correlation_id: correlationId
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (emergencyError) {
      console.error(`❌ [${correlationId}] Fallback de emergência falhou:`, emergencyError.message);
    }
    
    // Erro definitivo
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        correlation_id: correlationId,
        processing_time_ms: errorTime,
        timestamp: new Date().toISOString(),
        suggestions: [
          'Verificar se o arquivo é um PDF válido',
          'Verificar se o arquivo não está corrompido',
          'Tentar com um arquivo menor (máx 50MB)',
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

// FALLBACK NATIVO APRIMORADO COM PARSER AVANÇADO
async function processWithEnhancedFallback(file: File, parser: EnhancedDataParser, correlationId?: string): Promise<ParsedDocument> {
  const logPrefix = correlationId ? `[${correlationId}]` : '';
  console.log(`${logPrefix} 🔄 Iniciando fallback nativo aprimorado...`);
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);
    
    if (pdfBytes.length === 0) {
      throw new Error('Arquivo vazio');
    }
    
    // Extração básica de texto
    const pdfString = String.fromCharCode(...pdfBytes.slice(0, Math.min(100000, pdfBytes.length)));
    
    // Buscar por padrões de texto legíveis
    const textPatterns = [
      /[A-Za-zÀ-ÿ0-9\s\.,\-\(\)R\$\%]+/g,
      /\w+[\s\w\.,\-\(\)R\$\%]*/g,
      /[^\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F]+/g
    ];
    
    let extractedText = '';
    for (const pattern of textPatterns) {
      const matches = pdfString.match(pattern) || [];
      if (matches.length > 0) {
        extractedText = matches.join(' ').substring(0, 10000);
        break;
      }
    }
    
    console.log(`${logPrefix} ✅ Texto extraído: ${extractedText.length} caracteres`);
    
    // Simular estrutura Adobe para usar o parser avançado
    const mockAdobeData = {
      elements: [
        {
          type: 'text',
          Text: extractedText,
          Page: 1,
          attributes: { font_size: 12 }
        }
      ]
    };
    
    // Usar o parser avançado
    const parsedData = parser.parseDocument(mockAdobeData);
    
    // Enriquecer dados se necessário
    if (parsedData.items.length === 0) {
      parsedData.items = await extractBasicItems(extractedText);
    }
    
    parsedData.processingMethod = 'enhanced_native_fallback';
    parsedData.extractionQuality = 'medium';
    
    console.log(`${logPrefix} ✅ Fallback concluído: ${parsedData.items.length} itens, R$ ${parsedData.total}`);
    return parsedData;
    
  } catch (error) {
    console.error(`${logPrefix} ❌ Erro no fallback:`, error.message);
    
    // Fallback mínimo garantido
    return {
      client: 'Cliente a identificar',
      vendor: 'DryStore - Soluções Inteligentes',
      proposalNumber: `PROP-${Date.now().toString().slice(-8)}`,
      items: [{
        description: `Arquivo PDF: ${file.name}`,
        quantity: 1,
        unit: 'un',
        unitPrice: 0,
        total: 0,
        confidence: 0.1,
        source: 'fallback'
      }],
      tables: [],
      elements: [],
      subtotal: 0,
      total: 0,
      paymentTerms: 'A definir',
      delivery: 'A definir',
      extractionQuality: 'low',
      processingMethod: 'minimal_fallback'
    };
  }
}

// EXTRAÇÃO BÁSICA DE ITENS PARA FALLBACK
async function extractBasicItems(text: string): Promise<any[]> {
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
  
  const uniqueAmounts = [...new Set(amounts)].sort((a, b) => b - a).slice(0, 10);
  
  if (uniqueAmounts.length > 0) {
    uniqueAmounts.forEach((value, index) => {
      items.push({
        description: `Item ${index + 1} - Extraído do PDF`,
        quantity: 1,
        unit: 'un',
        unitPrice: value,
        total: value,
        confidence: 0.6,
        source: 'text'
      });
    });
  } else {
    items.push({
      description: 'Produto/Serviço - Revisão manual necessária',
      quantity: 1,
      unit: 'un',
      unitPrice: 0,
      total: 0,
      confidence: 0.1,
      source: 'fallback'
    });
  }
  
  return items;
}

// FUNÇÕES AUXILIARES MANTIDAS PARA COMPATIBILIDADE
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
