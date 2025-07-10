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
    const { products, marketData, competitorData } = await req.json();
    
    const grokApiKey = Deno.env.get('GROK_API_KEY');
    if (!grokApiKey) {
      throw new Error('GROK_API_KEY not configured');
    }

    const prompt = `
    Você é um especialista em precificação dinâmica para o setor de construção civil no Brasil.
    
    Produtos para análise: ${JSON.stringify(products)}
    Dados de mercado: ${JSON.stringify(marketData)}
    Dados da concorrência: ${JSON.stringify(competitorData)}
    
    Analise e forneça recomendações de precificação considerando:
    - Demanda atual e sazonalidade
    - Preços da concorrência
    - Margem de lucro otimizada
    - Estratégias de penetração/premium
    
    Responda em JSON com array de objetos:
    {
      "recommendations": [
        {
          "product": "nome do produto",
          "currentPrice": valor_atual,
          "suggestedPrice": valor_sugerido,
          "reason": "motivo da sugestão",
          "impact": "impacto esperado",
          "confidence": 0.XX
        }
      ]
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
        max_tokens: 1500,
        temperature: 0.4
      }),
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '{}';

    try {
      const analysis = JSON.parse(aiResponse);
      console.log('Dynamic pricing analysis completed successfully');
      
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
          recommendations: [
            {
              product: 'Produto exemplo',
              currentPrice: 100,
              suggestedPrice: 105,
              reason: 'Análise não disponível',
              impact: 'Impacto não calculado',
              confidence: 0.5
            }
          ]
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
    console.error('Error in ai-dynamic-pricing:', error);
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