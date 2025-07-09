
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validador de arquivo consolidado
class FileValidator {
  static validateFile(file: File) {
    if (!file) {
      throw new Error('Nenhum arquivo fornecido');
    }
    if (file.type !== 'application/pdf') {
      throw new Error('Apenas arquivos PDF são aceitos');
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('Arquivo muito grande. Máximo 10MB');
    }
  }

  static validateAdobeCredentials() {
    const clientId = Deno.env.get('ADOBE_CLIENT_ID');
    const clientSecret = Deno.env.get('ADOBE_CLIENT_SECRET');
    const orgId = Deno.env.get('ADOBE_ORG_ID');

    if (!clientId || !clientSecret || !orgId) {
      throw new Error('Adobe credentials not configured');
    }

    if (clientId.length < 20) {
      throw new Error('Client ID appears to be too short');
    }

    return { clientId, clientSecret, orgId };
  }
}

// Cliente Adobe consolidado com cache de token
class AdobeClient {
  private static tokenCache: { token: string; expiresAt: number } | null = null;
  
  constructor(private credentials: { clientId: string; clientSecret: string; orgId: string }) {}

  async getAccessToken(): Promise<string> {
    // Verificar se o token cached ainda é válido (com 5 min de margem)
    const now = Date.now();
    if (AdobeClient.tokenCache && AdobeClient.tokenCache.expiresAt > now + 300000) {
      console.log('🔄 Reutilizando token Adobe cached (válido por mais', Math.round((AdobeClient.tokenCache.expiresAt - now) / 60000), 'minutos)');
      return AdobeClient.tokenCache.token;
    }

    console.log('🔑 Gerando novo token Adobe...');
    const response = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.credentials.clientId,
        client_secret: this.credentials.clientSecret,
        scope: 'openid,AdobeID,DCAPI'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Adobe authentication failed:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Adobe API rate limit exceeded. Too many token requests.');
      }
      if (response.status === 401) {
        throw new Error('Adobe credentials invalid. Check CLIENT_ID and CLIENT_SECRET.');
      }
      
      throw new Error(`Adobe authentication failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Adobe token gerado com sucesso. Expires in:', data.expires_in, 'seconds');
    
    // Cache do token com timestamp de expiração
    AdobeClient.tokenCache = {
      token: data.access_token,
      expiresAt: now + (data.expires_in * 1000) // expires_in vem em segundos
    };
    
    return data.access_token;
  }

  async uploadFile(file: File, accessToken: string): Promise<string> {
    const uploadResponse = await fetch('https://pdf-services.adobe.io/assets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-API-Key': this.credentials.clientId,
        'Content-Type': file.type
      },
      body: await file.arrayBuffer()
    });

    if (!uploadResponse.ok) {
      throw new Error(`File upload failed: ${uploadResponse.status}`);
    }

    const uploadData = await uploadResponse.json();
    return uploadData.assetID;
  }

  async startExtraction(assetID: string, accessToken: string): Promise<string> {
    const extractResponse = await fetch('https://pdf-services.adobe.io/operation/extractpdf', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-API-Key': this.credentials.clientId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assetID,
        elementsToExtract: ['text', 'tables'],
        elementsToExtractRenditions: ['tables', 'figures']
      })
    });

    if (!extractResponse.ok) {
      throw new Error(`Extraction failed: ${extractResponse.status}`);
    }

    return extractResponse.headers.get('location') || '';
  }

  async pollExtractionResult(location: string, accessToken: string): Promise<any> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const statusResponse = await fetch(location, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-API-Key': this.credentials.clientId
        }
      });

      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();
      
      if (statusData.status === 'done') {
        return statusData;
      }
      
      if (statusData.status === 'failed') {
        throw new Error('Adobe processing failed');
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }

    throw new Error('Processing timeout');
  }

  async downloadResult(url: string): Promise<any> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    return await response.json();
  }
}

// Parser de dados consolidado
class DataParser {
  static parseAdobeData(adobeData: any): any {
    const elements = adobeData.elements || [];
    let text = '';
    const items: any[] = [];

    // Extrair texto
    elements.forEach((element: any) => {
      if (element.Text) {
        text += element.Text + ' ';
      }
    });

    // Procurar por itens e valores
    const moneyPattern = /R?\$?\s*(\d+[,\.]\d{2})/g;
    const moneyMatches = text.match(moneyPattern) || [];
    
    moneyMatches.slice(0, 10).forEach((match, index) => {
      const value = parseFloat(match.replace(/[R\$\s]/g, '').replace(',', '.'));
      if (value > 0) {
        items.push({
          description: `Item ${index + 1} (extraído do PDF)`,
          quantity: 1,
          unit: 'un',
          unitPrice: value,
          total: value
        });
      }
    });

    const total = items.reduce((sum, item) => sum + item.total, 0);

    return {
      client: this.extractClientFromText(text) || 'Cliente a identificar',
      vendor: this.extractVendorFromText(text) || 'Fornecedor a identificar',
      proposalNumber: this.extractProposalNumber(text) || `AUTO-${Date.now()}`,
      items,
      subtotal: total,
      total,
      paymentTerms: this.extractPaymentTerms(text) || 'A definir',
      delivery: 'A definir'
    };
  }

  private static extractClientFromText(text: string): string | null {
    const patterns = [
      /cliente[\s\:]+([A-Za-z\s]+)/i,
      /razão social[\s\:]+([A-Za-z\s]+)/i,
      /empresa[\s\:]+([A-Za-z\s]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim().substring(0, 50);
      }
    }
    return null;
  }

  private static extractVendorFromText(text: string): string | null {
    const patterns = [
      /fornecedor[\s\:]+([A-Za-z\s]+)/i,
      /empresa emitente[\s\:]+([A-Za-z\s]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim().substring(0, 50);
      }
    }
    return null;
  }

  private static extractProposalNumber(text: string): string | null {
    const patterns = [
      /proposta[\s\#\:]*(\d+)/i,
      /orçamento[\s\#\:]*(\d+)/i,
      /número[\s\#\:]*(\d+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  private static extractPaymentTerms(text: string): string | null {
    const patterns = [
      /pagamento[\s\:]+([^\.]+)/i,
      /prazo[\s\:]+([^\.]+)/i,
      /condições[\s\:]+([^\.]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim().substring(0, 100);
      }
    }
    return null;
  }
}

// Operações de banco consolidadas
class DatabaseOperations {
  private supabase: any;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async verifyUser(token: string): Promise<any> {
    const { data: { user }, error } = await this.supabase.auth.getUser(token);
    if (error || !user) {
      throw new Error('User authentication failed');
    }
    return user;
  }

  async saveExtractedData(user: any, file: File, rawData: any, structuredData: any): Promise<any> {
    const { data, error } = await this.supabase
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

    return data;
  }
}

serve(async (req) => {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log(`🚀 [${requestId}] === PROCESSAMENTO PDF INICIADO ===`);

  try {
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Inicializar serviços
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const dbOps = new DatabaseOperations(supabaseUrl, supabaseKey);

    // Verificar usuário
    const token = authHeader.replace('Bearer ', '');
    const user = await dbOps.verifyUser(token);
    console.log(`✅ [${requestId}] Usuário autenticado: ${user.email}`);

    // Processar arquivo
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    console.log(`📄 [${requestId}] Arquivo: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    
    FileValidator.validateFile(file);

    // Tentar Adobe PDF Services primeiro
    try {
      console.log(`🔑 [${requestId}] Validando credenciais Adobe...`);
      const adobeCredentials = FileValidator.validateAdobeCredentials();
      const adobeClient = new AdobeClient(adobeCredentials);

      console.log(`🔄 [${requestId}] Processando com Adobe PDF Services...`);
      const accessToken = await adobeClient.getAccessToken();
      const assetID = await adobeClient.uploadFile(file, accessToken);
      const location = await adobeClient.startExtraction(assetID, accessToken);
      const extractResult = await adobeClient.pollExtractionResult(location, accessToken);
      const resultData = await adobeClient.downloadResult(extractResult.asset.downloadUri);
      const structuredData = DataParser.parseAdobeData(resultData);
      
      console.log(`✅ [${requestId}] Adobe concluído: ${structuredData.items.length} itens, R$ ${structuredData.total}`);

      const savedData = await dbOps.saveExtractedData(user, file, resultData, structuredData);

      return new Response(
        JSON.stringify({
          success: true,
          method: 'Adobe PDF Services',
          data: { id: savedData.id, ...structuredData }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (adobeError) {
      console.log(`⚠️ [${requestId}] Adobe falhou: ${adobeError.message}`);
      console.log(`🔄 [${requestId}] Iniciando fallback com extração de texto...`);
      
      // FALLBACK ROBUSTO: Extração de texto nativa
      const arrayBuffer = await file.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      
      // Extrair texto do PDF
      let extractedText = '';
      try {
        const pdfString = String.fromCharCode(...pdfBytes);
        const textMatches = pdfString.match(/[A-Za-z0-9\s\.,\-\(\)R\$]+/g) || [];
        extractedText = textMatches.join(' ').substring(0, 5000);
      } catch {
        extractedText = `Processamento do arquivo: ${file.name}`;
      }

      // Extrair informações estruturadas do texto
      const extractClient = (text: string): string => {
        const patterns = [
          /cliente[\s\:]+([A-Za-z\s\&\.\-]+)/i,
          /razão social[\s\:]+([A-Za-z\s\&\.\-]+)/i,
          /empresa[\s\:]+([A-Za-z\s\&\.\-]+)/i
        ];
        
        for (const pattern of patterns) {
          const match = text.match(pattern);
          if (match && match[1]) return match[1].trim().substring(0, 50);
        }
        return 'Cliente a ser identificado';
      };

      const extractItems = (text: string, fileName: string) => {
        const items = [];
        const moneyPattern = /R?\$?\s*(\d{1,3}(?:[,\.]\d{3})*[,\.]\d{2})/g;
        const amounts = [];
        let match;
        
        while ((match = moneyPattern.exec(text)) !== null) {
          const value = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
          if (value > 0 && value < 1000000) { // Validar valores razoáveis
            amounts.push(value);
          }
        }
        
        // Remover duplicatas e pegar os maiores valores
        const uniqueAmounts = [...new Set(amounts)].sort((a, b) => b - a).slice(0, 10);
        
        if (uniqueAmounts.length > 0) {
          uniqueAmounts.forEach((value, index) => {
            items.push({
              description: `Item ${index + 1} - ${fileName}`,
              quantity: 1,
              unit: 'un',
              unitPrice: value,
              total: value
            });
          });
        } else {
          items.push({
            description: `Produto/Serviço - ${fileName}`,
            quantity: 1,
            unit: 'un',
            unitPrice: 0,
            total: 0
          });
        }
        
        return items;
      };

      const extractProposalNumber = (text: string): string => {
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
        return `AUTO-${Date.now().toString().slice(-6)}`;
      };

      // Construir dados estruturados do fallback
      const items = extractItems(extractedText, file.name);
      const total = items.reduce((sum, item) => sum + item.total, 0);
      
      const fallbackData = {
        client: extractClient(extractedText),
        vendor: 'A ser identificado',
        proposalNumber: extractProposalNumber(extractedText),
        date: new Date().toISOString().split('T')[0],
        items,
        subtotal: total,
        total,
        paymentTerms: 'A definir',
        delivery: 'A definir'
      };

      console.log(`✅ [${requestId}] Fallback concluído: ${items.length} itens, R$ ${total}`);

      // Salvar dados do fallback
      const savedData = await dbOps.saveExtractedData(
        user, 
        file, 
        { fallback: true, extractedText: extractedText.substring(0, 1000) }, 
        fallbackData
      );

      return new Response(
        JSON.stringify({
          success: true,
          method: 'Extração de Texto (Fallback)',
          data: { id: savedData.id, ...fallbackData },
          warning: 'Dados extraídos via fallback. Adobe PDF Services indisponível.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error(`❌ [${requestId}] Erro crítico:`, error.message);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Falha no processamento do PDF',
        details: error.message,
        suggestions: [
          'Verificar se o PDF não está corrompido',
          'Tentar com um arquivo menor (máx. 10MB)',
          'Contatar suporte técnico se o problema persistir'
        ]
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
