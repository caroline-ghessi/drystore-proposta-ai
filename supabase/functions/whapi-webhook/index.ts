import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method !== 'POST') {
      throw new Error('Apenas POST é permitido');
    }

    // Extrair parâmetros da URL
    const url = new URL(req.url);
    const instanceId = url.searchParams.get('instance');
    const secret = url.searchParams.get('secret');

    if (!instanceId || !secret) {
      throw new Error('Parâmetros obrigatórios: instance e secret');
    }

    console.log(`Webhook recebido para instância: ${instanceId}`);

    // Validar instância e segredo
    const { data: instance, error: instanceError } = await supabase
      .from('whapi_instances')
      .select('*')
      .eq('instance_id', instanceId)
      .eq('webhook_secret', secret)
      .eq('is_active', true)
      .single();

    if (instanceError || !instance) {
      console.error('Instância não encontrada ou segredo inválido:', instanceError);
      throw new Error('Instância não encontrada ou credenciais inválidas');
    }

    // Ler payload do webhook
    const webhookPayload = await req.json();
    console.log('Payload do webhook:', JSON.stringify(webhookPayload, null, 2));

    // Determinar tipo de evento
    const eventType = webhookPayload.type || 'unknown';
    let processed = false;
    let errorMessage = null;

    try {
      // Processar diferentes tipos de eventos
      switch (eventType) {
        case 'message_status':
          processed = await processMessageStatus(supabase, webhookPayload, instance.id);
          break;
        
        case 'message':
          // Para mensagens recebidas, apenas logamos (não processamos)
          console.log('Mensagem recebida (não processada):', webhookPayload);
          processed = true;
          break;
        
        case 'status':
          // Status da instância
          processed = await processInstanceStatus(supabase, webhookPayload, instance.id);
          break;
        
        default:
          console.log(`Tipo de evento não processado: ${eventType}`);
          processed = true;
      }
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      errorMessage = error.message;
      processed = false;
    }

    // Registrar log do webhook
    await supabase
      .from('whapi_webhook_logs')
      .insert({
        whapi_instance_id: instance.id,
        webhook_event_type: eventType,
        raw_payload: webhookPayload,
        processed_successfully: processed,
        error_message: errorMessage
      });

    // Atualizar último heartbeat
    await supabase
      .from('whapi_instances')
      .update({ last_heartbeat: new Date().toISOString() })
      .eq('id', instance.id);

    return new Response(
      JSON.stringify({ success: true, processed }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro no webhook Whapi:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

async function processMessageStatus(supabase: any, payload: any, instanceId: string): Promise<boolean> {
  const { id: messageId, status } = payload;
  
  if (!messageId || !status) {
    console.log('Status de mensagem incompleto:', payload);
    return true;
  }

  // Mapear status do Whapi para nosso sistema
  const statusMap: Record<string, string> = {
    'sent': 'sent',
    'delivered': 'delivered',
    'read': 'read',
    'failed': 'failed'
  };

  const mappedStatus = statusMap[status] || status;

  // Atualizar status da mensagem
  const { error } = await supabase
    .from('whatsapp_messages')
    .update({
      status: mappedStatus,
      delivered_at: status === 'delivered' || status === 'read' ? new Date().toISOString() : null
    })
    .eq('whapi_message_id', messageId)
    .eq('whapi_instance_id', instanceId);

  if (error) {
    console.error('Erro ao atualizar status da mensagem:', error);
    return false;
  }

  console.log(`Status da mensagem ${messageId} atualizado para: ${mappedStatus}`);
  return true;
}

async function processInstanceStatus(supabase: any, payload: any, instanceId: string): Promise<boolean> {
  console.log('Status da instância:', payload);
  
  // Aqui podemos processar status da instância como online/offline
  // Por enquanto apenas registramos o heartbeat
  return true;
}