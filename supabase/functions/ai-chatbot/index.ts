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
    const { message, conversationHistory, clientContext } = await req.json();
    
    const grokApiKey = Deno.env.get('GROK_API_KEY');
    if (!grokApiKey) {
      throw new Error('GROK_API_KEY not configured');
    }

    const systemPrompt = `
    Você é um assistente virtual especializado em atendimento ao cliente para a DryStore - Soluções Inteligentes, 
    uma empresa brasileira do setor de construção civil.
    
    Contexto do cliente: ${JSON.stringify(clientContext)}
    
    Suas responsabilidades:
    - Responder dúvidas sobre produtos e serviços
    - Fornecer informações sobre prazos e orçamentos
    - Agendar reuniões com vendedores
    - Dar suporte técnico básico
    - Escalar para humanos quando necessário
    
    Diretrizes:
    - Sempre responda em português brasileiro
    - Seja cordial e profissional
    - Mantenha o foco em construção e materiais
    - Ofereça soluções práticas
    - Se não souber algo, seja honesto e ofereça alternativas
    `;

    // Construir mensagens incluindo histórico
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-2-latest',
        messages,
        max_tokens: 400,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';

    console.log('Chatbot response generated successfully');

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in ai-chatbot:', error);
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