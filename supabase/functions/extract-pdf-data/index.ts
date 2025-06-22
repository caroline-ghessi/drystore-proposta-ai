
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

    console.log('File received:', file.name, 'Size:', file.size);

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

    console.log('Adobe credentials loaded');

    // 1. Obter Access Token da Adobe
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
      console.error('Adobe token error:', await tokenResponse.text());
      throw new Error('Failed to authenticate with Adobe API');
    }

    const { access_token } = await tokenResponse.json();
    console.log('Adobe access token obtained');

    // 2. Upload do arquivo para Adobe
    const fileBuffer = await file.arrayBuffer();
    const uploadResponse = await fetch('https://pdf-services.adobe.io/assets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'X-API-Key': adobeClientId,
        'Content-Type': 'application/pdf'
      },
      body: fileBuffer
    });

    if (!uploadResponse.ok) {
      console.error('Adobe upload error:', await uploadResponse.text());
      throw new Error('Failed to upload file to Adobe');
    }

    const uploadData = await uploadResponse.json();
    const assetID = uploadData.assetID;
    console.log('File uploaded to Adobe, Asset ID:', assetID);

    // 3. Iniciar extração
    const extractResponse = await fetch('https://pdf-services.adobe.io/operation/extractpdf', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'X-API-Key': adobeClientId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assetID: assetID,
        elementsToExtract: ['text', 'tables'],
        elementsToExtractRenditions: ['tables', 'figures'],
        tableOutputFormat: 'csv'
      })
    });

    if (!extractResponse.ok) {
      console.error('Adobe extract error:', await extractResponse.text());
      throw new Error('Failed to start PDF extraction');
    }

    const extractData = await extractResponse.json();
    const location = extractData.location;
    console.log('Extraction started, polling location:', location);

    // 4. Polling para aguardar conclusão
    let extractResult;
    let attempts = 0;
    const maxAttempts = 30; // 5 minutos máximo

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Aguardar 10 segundos
      
      const pollResponse = await fetch(location, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'X-API-Key': adobeClientId,
        }
      });

      const pollData = await pollResponse.json();
      console.log('Poll attempt:', attempts + 1, 'Status:', pollData.status);

      if (pollData.status === 'done') {
        extractResult = pollData;
        break;
      } else if (pollData.status === 'failed') {
        throw new Error('PDF extraction failed in Adobe API');
      }

      attempts++;
    }

    if (!extractResult) {
      throw new Error('PDF extraction timed out');
    }

    // 5. Baixar resultado
    const resultUrl = extractResult.asset.downloadUri;
    const resultResponse = await fetch(resultUrl);
    const resultData = await resultResponse.json();

    console.log('Adobe extraction completed successfully');

    // 6. Processar dados extraídos
    const structuredData = parseAdobeData(resultData);

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

    console.log('Data saved successfully to database');

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
        error: error.message
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

    // Tentar identificar cliente
    const clientMatch = allText.match(/(?:cliente|client|para):\s*([A-Z\s]+)/i);
    if (clientMatch) {
      result.client = clientMatch[1].trim();
    }

    // Extrair tabelas
    const tables = adobeData.tables || [];
    
    tables.forEach((table: any) => {
      const rows = table.rows || [];
      
      // Pular cabeçalho (primeira linha)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.cells || [];
        
        if (cells.length >= 4) {
          // Assumir formato: Descrição, Quantidade, Valor Unit, Total
          const description = cells[0]?.content || '';
          const quantityText = cells[1]?.content || '0';
          const unitPriceText = cells[2]?.content || '0';
          const totalText = cells[3]?.content || '0';
          
          // Limpar e converter números
          const quantity = parseFloat(quantityText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
          const unitPrice = parseFloat(unitPriceText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
          const total = parseFloat(totalText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
          
          if (description && quantity > 0) {
            result.items.push({
              description: description.trim(),
              quantity,
              unit: 'UN', // Padrão, pode ser melhorado
              unitPrice,
              total: total || (quantity * unitPrice)
            });
          }
        }
      }
    });

    // Calcular totais
    result.subtotal = result.items.reduce((sum, item) => sum + item.total, 0);
    result.total = result.subtotal;

    // Tentar extrair outras informações do texto
    const paymentMatch = allText.match(/(?:pagamento|payment):\s*([^.]+)/i);
    if (paymentMatch) {
      result.paymentTerms = paymentMatch[1].trim();
    }

    const deliveryMatch = allText.match(/(?:entrega|delivery):\s*([^.]+)/i);
    if (deliveryMatch) {
      result.delivery = deliveryMatch[1].trim();
    }

    console.log('Parsed', result.items.length, 'items, total:', result.total);

  } catch (error) {
    console.error('Error parsing Adobe data:', error);
  }

  return result;
}
