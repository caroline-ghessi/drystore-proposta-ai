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
    const { transactionData, clientData, behaviorPatterns } = await req.json();
    
    const grokApiKey = Deno.env.get('GROK_API_KEY');
    if (!grokApiKey) {
      throw new Error('GROK_API_KEY not configured');
    }

    const prompt = `
    Você é um especialista em detecção de fraudes para o setor de construção civil no Brasil.
    
    Dados da transação: ${JSON.stringify(transactionData)}
    Dados do cliente: ${JSON.stringify(clientData)}
    Padrões de comportamento: ${JSON.stringify(behaviorPatterns)}
    
    Analise os dados para identificar possíveis riscos de fraude considerando:
    - Padrões de compra suspeitos
    - Inconsistências nos dados
    - Valores atípicos
    - Comportamento anômalo
    - Histórico de transações
    
    Responda em JSON:
    {
      "riskLevel": "baixo" | "médio" | "alto",
      "riskScore": 0.XX,
      "detectedPatterns": ["padrão1", "padrão2"],
      "recommendations": ["ação1", "ação2"],
      "summary": "resumo da análise",
      "requiresReview": boolean
    }
    
    Responda APENAS com o JSON, sem explicações adicionais.
    `;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-4-0709',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 1200,
        temperature: 0.2
      }),
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '{}';

    try {
      const analysis = JSON.parse(aiResponse);
      console.log('Fraud detection analysis completed successfully');
      
      return new Response(
        JSON.stringify(analysis),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      
      // Fallback response
      return new Response(
        JSON.stringify({
          riskLevel: 'baixo',
          riskScore: 0.2,
          detectedPatterns: [],
          recommendations: ['Monitorar transação'],
          summary: 'Análise não disponível',
          requiresReview: false
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

  } catch (error) {
    console.error('Error in ai-fraud-detection:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
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