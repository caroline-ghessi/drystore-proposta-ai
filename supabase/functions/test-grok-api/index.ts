import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🤖 Função test-grok-api iniciada');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const grokApiKey = Deno.env.get('GROK_API_KEY');
    
    console.log('🔍 Verificando API Key do Grok:', {
      hasGrokKey: !!grokApiKey,
      keyPreview: grokApiKey ? grokApiKey.substring(0, 10) + '...' : null
    });

    if (!grokApiKey) {
      console.error('❌ API Key do Grok não encontrada');
      return new Response(JSON.stringify({
        success: false,
        error: 'GROK_API_KEY não configurada',
        timestamp: new Date().toISOString()
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Teste 1: Verificar conectividade básica
    console.log('🌐 Testando conectividade com Grok API...');
    
    const testPayload = {
      messages: [
        {
          role: "system",
          content: "Você é um assistente de teste. Responda apenas 'TESTE_OK' se estiver funcionando."
        },
        {
          role: "user",
          content: "Este é um teste de conectividade. Responda apenas 'TESTE_OK'."
        }
      ],
      model: "grok-beta",
      stream: false,
      temperature: 0
    };

    console.log('📤 Enviando requisição para Grok...');
    
    const startTime = Date.now();
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const duration = Date.now() - startTime;
    
    console.log('📥 Resposta recebida:', {
      status: response.status,
      statusText: response.statusText,
      duration: `${duration}ms`,
      headers: Object.fromEntries(response.headers.entries())
    });

    let grokResponse = null;
    let responseText = '';
    
    try {
      responseText = await response.text();
      console.log('📄 Texto da resposta:', responseText.substring(0, 500));
      
      if (response.headers.get('content-type')?.includes('application/json')) {
        grokResponse = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('❌ Erro ao parsear resposta:', parseError);
    }

    const testResult = {
      timestamp: new Date().toISOString(),
      success: response.ok,
      api: {
        hasKey: !!grokApiKey,
        keyValid: response.status !== 401,
        responseStatus: response.status,
        responseTime: duration,
        rateLimitRemaining: response.headers.get('x-ratelimit-remaining'),
        rateLimitReset: response.headers.get('x-ratelimit-reset')
      },
      response: {
        hasContent: !!grokResponse,
        messageContent: grokResponse?.choices?.[0]?.message?.content || null,
        usage: grokResponse?.usage || null,
        model: grokResponse?.model || null
      },
      error: !response.ok ? {
        status: response.status,
        message: responseText,
        headers: Object.fromEntries(response.headers.entries())
      } : null
    };

    console.log('✅ Teste Grok concluído:', testResult);

    return new Response(JSON.stringify(testResult), {
      status: response.ok ? 200 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('🚨 Erro crítico no teste Grok:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});