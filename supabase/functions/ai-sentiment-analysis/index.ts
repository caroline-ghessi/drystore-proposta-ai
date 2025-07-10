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
    const { text, context } = await req.json();
    
    const grokApiKey = Deno.env.get('GROK_API_KEY');
    if (!grokApiKey) {
      throw new Error('GROK_API_KEY not configured');
    }

    const prompt = `
    Analise o sentimento do seguinte texto em português brasileiro. 
    Contexto: ${context || 'Interação comercial no setor de construção'}
    
    Texto para análise: "${text}"
    
    Forneça uma análise em JSON com:
    - sentiment: "positivo", "negativo", "neutro"
    - score: número de 0 a 1 (confiança)
    - emotions: array com até 3 emoções principais
    - summary: resumo da análise em português
    - recommendations: sugestões de como responder
    
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
        max_tokens: 1000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '{}';

    try {
      const analysis = JSON.parse(aiResponse);
      console.log('Sentiment analysis completed successfully');
      
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
          sentiment: 'neutro',
          score: 0.5,
          emotions: ['incerteza'],
          summary: 'Análise não disponível',
          recommendations: ['Solicite mais informações']
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
    console.error('Error in ai-sentiment-analysis:', error);
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