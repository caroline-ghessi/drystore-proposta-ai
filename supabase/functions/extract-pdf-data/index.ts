
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExtractedData {
  client?: string;
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  total: number;
  paymentTerms?: string;
  delivery?: string;
  vendor?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== ADOBE PDF EXTRACTION STARTED ===');
    
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Inicializar Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar usuário autenticado
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid authentication token');
    }

    console.log('User authenticated:', user.id);

    // Parse do form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file provided');
    }

    console.log('File received:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Validar tipo de arquivo
    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are supported');
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB');
    }

    // Obter credenciais da Adobe
    const adobeClientId = Deno.env.get('ADOBE_CLIENT_ID');
    const adobeClientSecret = Deno.env.get('ADOBE_CLIENT_SECRET');
    const adobeOrgId = Deno.env.get('ADOBE_ORG_ID');

    if (!adobeClientId || !adobeClientSecret || !adobeOrgId) {
      throw new Error('Adobe API credentials not configured');
    }

    console.log('Adobe credentials loaded - Client ID:', adobeClientId.substring(0, 8) + '...');
    console.log('Adobe Org ID:', adobeOrgId);

    // 1. Obter Access Token da Adobe
    console.log('Getting Adobe access token...');
    const tokenResponse = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'client_id': adobeClientId,
        'client_secret': adobeClientSecret,
        'grant_type': 'client_credentials',
        'scope': 'openid,AdobeID,read_organizations,additional_info.projectedProductContext,additional_info.roles'
      }).toString()
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Adobe token error:', errorText);
      throw new Error(`Failed to authenticate with Adobe API: ${tokenResponse.status} - ${errorText}`);
    }

    const { access_token } = await tokenResponse.json();
    console.log('Adobe access token obtained successfully');

    // 2. Upload do arquivo para Adobe - CORREÇÃO CRÍTICA
    console.log('Starting Adobe file upload with corrected file handling...');
    
    // Transformar o arquivo corretamente para FormData
    const buffer = await file.arrayBuffer();
    console.log('File converted to ArrayBuffer, size:', buffer.byteLength);
    
    const blob = new Blob([buffer], { type: 'application/pdf' });
    console.log('Blob created, type:', blob.type, 'size:', blob.size);
    
    const fixedFile = new File([blob], file.name, { type: 'application/pdf' });
    console.log('File recreated:', fixedFile.name, 'type:', fixedFile.type, 'size:', fixedFile.size);
    
    const uploadFormData = new FormData();
    uploadFormData.append('file', fixedFile);

    const uploadResponse = await fetch('https://pdf-services.adobe.io/assets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'X-API-Key': adobeClientId,
        'X-Adobe-Organization-Id': adobeOrgId,
        // NÃO definir Content-Type - deixar o FormData definir automaticamente com boundary
      },
      body: uploadFormData
    });

    console.log('Upload response status:', uploadResponse.status);
    console.log('Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Adobe upload error details:', errorText);
      
      // Log adicional para debug
      console.error('Request sent with file details:', {
        originalName: file.name,
        originalSize: file.size,
        originalType: file.type,
        recreatedName: fixedFile.name,
        recreatedSize: fixedFile.size,
        recreatedType: fixedFile.type,
        bufferSize: buffer.byteLength
      });
      
      throw new Error(`Failed to upload file to Adobe: ${uploadResponse.status} - ${errorText}`);
    }

    const uploadData = await uploadResponse.json();
    const assetID = uploadData.assetID;
    console.log('File uploaded to Adobe successfully, Asset ID:', assetID);

    // 3. Iniciar extração com payload corrigido segundo documentação Adobe
    const extractPayload = {
      assetID: assetID,
      elementsToExtract: ['text', 'tables'],
      tableOutputFormat: 'xlsx',  // Campo correto conforme documentação
      getCharBounds: false,
      includeStyling: true
    };

    console.log('Sending extract request with corrected payload:', JSON.stringify(extractPayload, null, 2));

    const extractResponse = await fetch('https://pdf-services.adobe.io/operation/extractpdf', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'X-API-Key': adobeClientId,
        'X-Adobe-Organization-Id': adobeOrgId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(extractPayload)
    });

    if (!extractResponse.ok) {
      const errorText = await extractResponse.text();
      console.error('Adobe extract error:', errorText);
      throw new Error(`Failed to start PDF extraction: ${extractResponse.status} - ${errorText}`);
    }

    const extractData = await extractResponse.json();
    const location = extractData.location;
    console.log('Extraction started successfully, polling location:', location);

    // 4. Polling para aguardar conclusão com backoff exponencial melhorado
    let extractResult;
    let attempts = 0;
    const maxAttempts = 40;
    let waitTime = 3000;

    while (attempts < maxAttempts) {
      console.log(`Polling attempt ${attempts + 1}/${maxAttempts}, waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      const pollResponse = await fetch(location, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'X-API-Key': adobeClientId,
          'X-Adobe-Organization-Id': adobeOrgId,
        }
      });

      if (!pollResponse.ok) {
        const errorText = await pollResponse.text();
        console.error('Poll response error:', errorText);
        throw new Error(`Polling failed: ${pollResponse.status} - ${errorText}`);
      }

      const pollData = await pollResponse.json();
      console.log('Poll result:', {
        attempt: attempts + 1,
        status: pollData.status,
        progress: pollData.progress || 'N/A'
      });

      if (pollData.status === 'done') {
        extractResult = pollData;
        console.log('Adobe extraction completed successfully!');
        break;
      } else if (pollData.status === 'failed') {
        console.error('Adobe extraction failed:', pollData);
        throw new Error(`PDF extraction failed in Adobe API: ${JSON.stringify(pollData)}`);
      }

      attempts++;
      waitTime = Math.min(waitTime * 1.3, 12000);
    }

    if (!extractResult) {
      throw new Error(`PDF extraction timed out after ${maxAttempts} attempts`);
    }

    // 5. Baixar resultado
    const resultUrl = extractResult.asset.downloadUri;
    console.log('Downloading extraction result from:', resultUrl);
    
    const resultResponse = await fetch(resultUrl);
    if (!resultResponse.ok) {
      throw new Error(`Failed to download result: ${resultResponse.status}`);
    }
    
    const resultData = await resultResponse.json();
    console.log('Result data downloaded successfully, processing...');

    // 6. Processar dados extraídos
    const structuredData = parseAdobeData(resultData);
    console.log('Data processing completed:', {
      itemsFound: structuredData.items.length,
      totalValue: structuredData.total,
      clientFound: !!structuredData.client
    });

    // 7. Salvar na tabela propostas_brutas
    const { data: savedData, error: saveError } = await supabase
      .from('propostas_brutas')
      .insert({
        user_id: user.id,
        arquivo_nome: file.name,
        arquivo_tamanho: file.size,
        dados_adobe_json: resultData,
        dados_estruturados: structuredData,
        cliente_identificado: structuredData.client,
        valor_total_extraido: structuredData.total,
        status: 'pending_review'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving to database:', saveError);
      throw new Error('Failed to save extracted data');
    }

    console.log('Data saved successfully to database with ID:', savedData.id);

    return new Response(
      JSON.stringify({
        success: true,
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
    console.error('Extract PDF Data Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.stack
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

// Função melhorada de parsing dos dados da Adobe
function parseAdobeData(adobeData: any): ExtractedData {
  console.log('Parsing Adobe data...');
  
  const result: ExtractedData = {
    items: [],
    subtotal: 0,
    total: 0
  };

  try {
    // Extrair texto para identificar cliente e outras informações
    const elements = adobeData.elements || [];
    let allText = '';
    
    elements.forEach((element: any) => {
      if (element.Text) {
        allText += element.Text + ' ';
      }
    });

    console.log('Extracted text length:', allText.length);

    // Melhorar identificação do cliente
    const clientPatterns = [
      /(?:cliente|client|para):\s*([A-Z\s&\-\.]+)/i,
      /(?:razão social|empresa):\s*([A-Z\s&\-\.]+)/i,
      /(?:cnpj)[\s:]*\d+[\s\/\-]*\d+[\s\/\-]*\d+[\s\/\-]*\d+[\s\-]*\d+\s*([A-Z\s&\-\.]+)/i
    ];

    for (const pattern of clientPatterns) {
      const match = allText.match(pattern);
      if (match && match[1].trim().length > 3) {
        result.client = match[1].trim();
        break;
      }
    }

    // Extrair tabelas
    const tables = adobeData.tables || [];
    
    tables.forEach((table: any, tableIndex: number) => {
      console.log(`Processing table ${tableIndex + 1}:`, table);
      
      const rows = table.rows || [];
      
      // Identificar cabeçalho automaticamente
      let headerRowIndex = 0;
      for (let i = 0; i < Math.min(3, rows.length); i++) {
        const row = rows[i];
        const cells = row.cells || [];
        const headerText = cells.map((cell: any) => cell.content || '').join(' ').toLowerCase();
        
        if (headerText.includes('descrição') || headerText.includes('item') || 
            headerText.includes('produto') || headerText.includes('quantidade')) {
          headerRowIndex = i;
          break;
        }
      }

      // Processar linhas de dados
      for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.cells || [];
        
        if (cells.length >= 3) {
          // Extrair dados das células
          const description = (cells[0]?.content || '').trim();
          const quantityText = (cells[1]?.content || '0').trim();
          const unitPriceText = (cells[2]?.content || '0').trim();
          const totalText = cells[3] ? (cells[3].content || '0').trim() : '';
          
          // Limpar e converter números
          const quantity = parseFloat(quantityText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
          const unitPrice = parseFloat(unitPriceText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
          const total = totalText ? 
            parseFloat(totalText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0 : 
            (quantity * unitPrice);
          
          // Extrair unidade se possível
          const unitMatch = quantityText.match(/([A-Z]{1,4})\s*$/i);
          const unit = unitMatch ? unitMatch[1] : 'UN';
          
          if (description && description.length > 3 && quantity > 0) {
            result.items.push({
              description: description,
              quantity,
              unit,
              unitPrice,
              total
            });
            console.log(`Added item: ${description} - Qty: ${quantity} - Price: ${unitPrice} - Total: ${total}`);
          }
        }
      }
    });

    // Calcular totais
    result.subtotal = result.items.reduce((sum, item) => sum + item.total, 0);
    result.total = result.subtotal;

    // Extrair informações adicionais
    const paymentPatterns = [
      /(?:pagamento|payment|condições):\s*([^.\n\r]+)/i,
      /(?:prazo|forma de pagamento):\s*([^.\n\r]+)/i
    ];

    for (const pattern of paymentPatterns) {
      const match = allText.match(pattern);
      if (match) {
        result.paymentTerms = match[1].trim();
        break;
      }
    }

    const deliveryPatterns = [
      /(?:entrega|delivery|prazo de entrega):\s*([^.\n\r]+)/i,
      /(?:data de entrega|entregar em):\s*([^.\n\r]+)/i
    ];

    for (const pattern of deliveryPatterns) {
      const match = allText.match(pattern);
      if (match) {
        result.delivery = match[1].trim();
        break;
      }
    }

    const vendorPatterns = [
      /(?:vendedor|representante|atendente):\s*([A-Z\s]+)/i,
      /(?:responsável|consultor):\s*([A-Z\s]+)/i
    ];

    for (const pattern of vendorPatterns) {
      const match = allText.match(pattern);
      if (match && match[1].trim().length > 3) {
        result.vendor = match[1].trim();
        break;
      }
    }

    console.log(`Parsing completed: ${result.items.length} items, total: R$ ${result.total.toFixed(2)}`);

  } catch (error) {
    console.error('Error parsing Adobe data:', error);
  }

  return result;
}
