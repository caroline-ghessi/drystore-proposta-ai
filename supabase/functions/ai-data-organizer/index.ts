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
    console.log('🧠 ai-data-organizer: Iniciando organização de dados');
    
    const { extracted_text, context = 'erp_pdf' } = await req.json();
    
    if (!extracted_text) {
      throw new Error('Texto extraído não fornecido');
    }

    const grokApiKey = Deno.env.get('GROK_API_KEY');
    if (!grokApiKey) {
      throw new Error('GROK_API_KEY não configurado');
    }

    const prompt = createOrganizationPrompt(extracted_text, context);
    
    console.log('📤 Enviando para Grok AI...');
    
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-4-0709',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um especialista em extração e estruturação de dados de documentos comerciais brasileiros. Sempre responda apenas com JSON válido estruturado conforme o schema fornecido.' 
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 8000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    const organizedDataText = data.choices[0]?.message?.content;

    if (!organizedDataText) {
      throw new Error('Nenhuma resposta da IA');
    }

    let organizedData;
    try {
      organizedData = JSON.parse(organizedDataText);
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse da resposta da IA:', parseError);
      throw new Error('IA retornou dados em formato inválido');
    }

    // Validação básica dos dados organizados
    if (!organizedData.items || !Array.isArray(organizedData.items)) {
      throw new Error('Dados organizados não contêm lista de itens válida');
    }

    console.log(`✅ Dados organizados com sucesso: ${organizedData.items.length} itens identificados`);

    return new Response(
      JSON.stringify({
        success: true,
        organized_data: organizedData,
        confidence_score: calculateConfidenceScore(organizedData),
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
    console.error('❌ Erro na organização de dados:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stage: 'data_organization'
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

function createOrganizationPrompt(extractedText: string, context: string): string {
  return `
Analise o seguinte texto extraído de um PDF do ERP e estruture as informações em JSON:

TEXTO EXTRAÍDO:
${extractedText}

Extraia e organize os dados seguindo EXATAMENTE este formato JSON:

{
  "client": "Nome do cliente (se identificado)",
  "vendor": "Nome do vendedor/empresa (se identificado)",
  "proposalNumber": "Número da proposta/orçamento (se identificado)",
  "date": "Data do documento (formato YYYY-MM-DD se identificado)",
  "items": [
    {
      "description": "Descrição do produto/serviço",
      "quantity": 0.0,
      "unit": "Unidade (UN, M2, KG, etc.)",
      "unitPrice": 0.0,
      "total": 0.0
    }
  ],
  "subtotal": 0.0,
  "total": 0.0,
  "paymentTerms": "Condições de pagamento (se identificado)",
  "delivery": "Prazo de entrega (se identificado)"
}

INSTRUÇÕES:
- Use 0 para valores numéricos não identificados
- Use "N/A" para textos não identificados
- Seja preciso na extração de valores monetários
- Mantenha descrições concisas mas completas
- Responda APENAS com o JSON, sem explicações
`;
}

function calculateConfidenceScore(organizedData: any): number {
  let score = 0;
  let maxScore = 0;

  // Pontuação por campo preenchido
  const fields = [
    'client', 'vendor', 'proposalNumber', 'date', 
    'subtotal', 'total', 'paymentTerms', 'delivery'
  ];

  fields.forEach(field => {
    maxScore += 10;
    if (organizedData[field] && organizedData[field] !== 'N/A' && organizedData[field] !== 0) {
      score += 10;
    }
  });

  // Pontuação por itens com dados completos
  if (organizedData.items && Array.isArray(organizedData.items)) {
    organizedData.items.forEach((item: any) => {
      maxScore += 20;
      if (item.description && item.quantity > 0 && item.unitPrice > 0) {
        score += 20;
      }
    });
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}