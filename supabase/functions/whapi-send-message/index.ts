import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendMessageRequest {
  instanceId: string;
  clientPhone: string;
  message: string;
  proposalId?: string;
  clientId: string;
}

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

    const { instanceId, clientPhone, message, proposalId, clientId }: SendMessageRequest = await req.json();

    if (!instanceId || !clientPhone || !message || !clientId) {
      throw new Error('Parâmetros obrigatórios: instanceId, clientPhone, message, clientId');
    }

    console.log(`Enviando mensagem via Whapi para ${clientPhone} usando instância ${instanceId}`);

    // Buscar configuração da instância Whapi
    const { data: instance, error: instanceError } = await supabase
      .from('whapi_instances')
      .select('*')
      .eq('instance_id', instanceId)
      .eq('is_active', true)
      .single();

    if (instanceError || !instance) {
      throw new Error(`Instância Whapi não encontrada ou inativa: ${instanceId}`);
    }

    // Validar se o cliente tem propostas (segurança)
    if (proposalId) {
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .select('id, client_id')
        .eq('id', proposalId)
        .eq('client_id', clientId)
        .single();

      if (proposalError || !proposal) {
        throw new Error('Proposta não encontrada ou não pertence ao cliente');
      }
    }

    // Preparar dados para Whapi API
    const whapiPayload = {
      typing_time: 0,
      to: clientPhone,
      body: message
    };

    console.log('Payload para Whapi:', JSON.stringify(whapiPayload, null, 2));

    // Chamar Whapi API
    const whapiResponse = await fetch(`https://gate.whapi.cloud/messages/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${instance.token}`
      },
      body: JSON.stringify(whapiPayload)
    });

    const whapiResult = await whapiResponse.json();
    console.log('Resposta da Whapi:', JSON.stringify(whapiResult, null, 2));

    if (!whapiResponse.ok) {
      throw new Error(`Erro da Whapi API: ${whapiResult.message || 'Erro desconhecido'}`);
    }

    // Registrar mensagem no banco
    const { data: messageRecord, error: messageError } = await supabase
      .from('whatsapp_messages')
      .insert({
        whapi_instance_id: instance.id,
        proposal_id: proposalId,
        client_id: clientId,
        message_content: message,
        client_phone: clientPhone,
        vendor_phone: instance.phone_number || 'N/A',
        whapi_message_id: whapiResult.id,
        status: whapiResult.sent ? 'sent' : 'failed',
        error_message: whapiResult.sent ? null : JSON.stringify(whapiResult)
      })
      .select()
      .single();

    if (messageError) {
      console.error('Erro ao salvar mensagem no banco:', messageError);
    }

    // Atualizar último heartbeat da instância
    await supabase
      .from('whapi_instances')
      .update({ last_heartbeat: new Date().toISOString() })
      .eq('id', instance.id);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: whapiResult.id,
        sent: whapiResult.sent,
        recordId: messageRecord?.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro ao enviar mensagem Whapi:', error);
    
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