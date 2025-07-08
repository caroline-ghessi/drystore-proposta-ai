import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('💾 data-saver: Iniciando salvamento de dados');
    
    const { 
      formatted_data, 
      validation_result, 
      save_type = 'proposal_draft',
      user_id 
    } = await req.json();
    
    if (!formatted_data) {
      throw new Error('Dados formatados não fornecidos');
    }

    if (!user_id) {
      throw new Error('ID do usuário não fornecido');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let savedData;

    switch (save_type) {
      case 'proposal_draft':
        savedData = await saveAsProposalDraft(supabase, formatted_data, validation_result, user_id);
        break;
      case 'raw_data':
        savedData = await saveAsRawData(supabase, formatted_data, validation_result, user_id);
        break;
      default:
        throw new Error(`Tipo de salvamento não suportado: ${save_type}`);
    }

    console.log('✅ Dados salvos com sucesso');

    return new Response(
      JSON.stringify({
        success: true,
        saved_data: savedData,
        save_type: save_type,
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
    console.error('❌ Erro no salvamento de dados:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stage: 'data_saving'
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

async function saveAsProposalDraft(
  supabase: any, 
  formattedData: any, 
  validationResult: any, 
  userId: string
) {
  // Primeiro, verificar/criar cliente se necessário
  let clientId;
  
  if (formattedData.client_name && formattedData.client_name !== 'N/A') {
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('nome', formattedData.client_name)
      .single();

    if (existingClient) {
      clientId = existingClient.id;
    } else {
      // Criar novo cliente
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          nome: formattedData.client_name,
          email: formattedData.client_email || 'cliente@exemplo.com',
          origem_dados: 'pdf_extraction'
        })
        .select()
        .single();

      if (clientError) {
        throw new Error(`Erro ao criar cliente: ${clientError.message}`);
      }
      
      clientId = newClient.id;
    }
  } else {
    throw new Error('Nome do cliente é obrigatório para criar proposta');
  }

  // Criar proposta
  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .insert({
      client_id: clientId,
      user_id: userId,
      valor_total: formattedData.valor_total,
      status: 'draft',
      observacoes: formattedData.observacoes,
      proposal_number: formattedData.proposal_number,
      validade: formattedData.validade
    })
    .select()
    .single();

  if (proposalError) {
    throw new Error(`Erro ao criar proposta: ${proposalError.message}`);
  }

  // Inserir itens da proposta
  if (formattedData.items && formattedData.items.length > 0) {
    const itemsToInsert = formattedData.items.map((item: any) => ({
      proposal_id: proposal.id,
      produto_nome: item.produto_nome,
      descricao_item: item.descricao_item,
      quantidade: item.quantidade,
      preco_unit: item.preco_unit,
      preco_total: item.preco_total
    }));

    const { error: itemsError } = await supabase
      .from('proposal_items')
      .insert(itemsToInsert);

    if (itemsError) {
      throw new Error(`Erro ao inserir itens: ${itemsError.message}`);
    }
  }

  // Salvar dados de validação como metadata
  const { error: metadataError } = await supabase
    .from('propostas_brutas')
    .insert({
      user_id: userId,
      arquivo_nome: 'extracted_from_pdf.json',
      arquivo_tamanho: JSON.stringify(formattedData).length,
      status: 'processed',
      dados_estruturados: formattedData,
      valor_total_extraido: formattedData.valor_total,
      cliente_identificado: formattedData.client_name
    });

  if (metadataError) {
    console.warn('⚠️ Erro ao salvar metadata (não crítico):', metadataError.message);
  }

  return {
    proposal_id: proposal.id,
    client_id: clientId,
    items_count: formattedData.items ? formattedData.items.length : 0,
    confidence_score: validationResult?.confidence_score || 0
  };
}

async function saveAsRawData(
  supabase: any, 
  formattedData: any, 
  validationResult: any, 
  userId: string
) {
  const { data, error } = await supabase
    .from('propostas_brutas')
    .insert({
      user_id: userId,
      arquivo_nome: 'processed_data.json',
      arquivo_tamanho: JSON.stringify(formattedData).length,
      status: 'pending_review',
      dados_estruturados: formattedData,
      valor_total_extraido: formattedData.valor_total,
      cliente_identificado: formattedData.client_name || 'N/A'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao salvar dados brutos: ${error.message}`);
  }

  return {
    raw_data_id: data.id,
    confidence_score: validationResult?.confidence_score || 0
  };
}