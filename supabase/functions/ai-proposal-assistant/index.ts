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
    const { message, proposalData, clientQuestions } = await req.json();
    
    const grokApiKey = Deno.env.get('GROK_API_KEY');
    if (!grokApiKey) {
      throw new Error('GROK_API_KEY not configured');
    }

    // Criar contexto especializado para vendas
    const context = `
    Você é um assistente de vendas especializado em construção e materiais para o setor de construção civil no Brasil.
    
    Dados da proposta: ${JSON.stringify(proposalData)}
    Dúvidas do cliente: ${clientQuestions?.join(', ') || 'Nenhuma dúvida específica'}
    
    Sua função é ajudar vendedores a quebrar objeções e aumentar conversões. 
    Sempre responda em português brasileiro, seja específico e prático.
    Foque em benefícios tangíveis, ROI e valor agregado.
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
          { role: 'system', content: context },
          { role: 'user', content: message }
        ],
        max_tokens: 1200,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua solicitação.';

    console.log('AI Assistant response generated successfully');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in ai-proposal-assistant:', error);
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