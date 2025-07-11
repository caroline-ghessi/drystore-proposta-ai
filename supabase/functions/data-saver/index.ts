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
    const correlationId = `data-saver-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    console.log(`💾 [${correlationId}] data-saver: Iniciando salvamento de dados`);
    
    // Validar Content-Type
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Invalid Content-Type: ${contentType}. Expected application/json`);
    }

    // Parse do JSON com tratamento de erro
    let requestData;
    try {
      const requestText = await req.text();
      if (!requestText || requestText.trim() === '') {
        throw new Error('Request body is empty');
      }
      requestData = JSON.parse(requestText);
    } catch (parseError) {
      console.error(`❌ [${correlationId}] Erro ao fazer parse do JSON:`, parseError);
      throw new Error(`Invalid JSON in request body: ${parseError.message}`);
    }

    const { 
      formatted_data, 
      validation_result, 
      save_type = 'proposal_draft',
      user_id,
      product_group = 'geral' 
    } = requestData;
    
    console.log(`📋 [${correlationId}] Dados recebidos:`, {
      hasFormattedData: !!formatted_data,
      saveType: save_type,
      userId: user_id,
      productGroup: product_group,
      clientName: formatted_data?.client_name,
      dataSize: JSON.stringify(formatted_data || {}).length
    });
    
    // Validações mais detalhadas
    if (!formatted_data) {
      console.error(`❌ [${correlationId}] Dados formatados ausentes`);
      throw new Error('Dados formatados não fornecidos');
    }

    if (!user_id) {
      console.error(`❌ [${correlationId}] User ID ausente`);
      throw new Error('ID do usuário não fornecido');
    }

    if (typeof formatted_data !== 'object') {
      console.error(`❌ [${correlationId}] Dados formatados inválidos:`, typeof formatted_data);
      throw new Error('Dados formatados devem ser um objeto');
    }

    // Initialize Supabase client com validação
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error(`❌ [${correlationId}] Credenciais Supabase ausentes`);
      throw new Error('Supabase credentials not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log(`🔌 [${correlationId}] Cliente Supabase inicializado`);

    let savedData;

    console.log(`🔄 [${correlationId}] Iniciando salvamento tipo: ${save_type}`);
    
    switch (save_type) {
      case 'proposal_draft':
        savedData = await saveAsProposalDraft(supabase, formatted_data, validation_result, user_id, product_group, correlationId);
        break;
      case 'raw_data':
        savedData = await saveAsRawData(supabase, formatted_data, validation_result, user_id, correlationId);
        break;
      default:
        console.error(`❌ [${correlationId}] Tipo de salvamento inválido: ${save_type}`);
        throw new Error(`Tipo de salvamento não suportado: ${save_type}`);
    }

    console.log(`✅ [${correlationId}] Dados salvos com sucesso`);

    return new Response(
      JSON.stringify({
        success: true,
        saved_data: savedData,
        save_type: save_type,
        correlation_id: correlationId,
        processing_time: Date.now(),
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId
        } 
      }
    );

  } catch (error) {
    const correlationId = `error-${Date.now()}`;
    console.error(`❌ [${correlationId}] Erro no salvamento de dados:`, {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stage: 'data_saving',
        correlation_id: correlationId,
        timestamp: new Date().toISOString(),
        details: {
          error_type: error.constructor.name,
          stack: error.stack
        }
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId
        } 
      }
    );
  }
});

async function saveAsProposalDraft(
  supabase: any, 
  formattedData: any, 
  validationResult: any, 
  userId: string,
  productGroup: string = 'geral',
  correlationId: string = 'unknown'
) {
  try {
    console.log('🔄 Iniciando saveAsProposalDraft...');
    console.log('📊 Dados formatados recebidos:', JSON.stringify(formattedData, null, 2));
    console.log('🏷️ Product group:', productGroup);

    // Verificar se há dados do cliente - mapear corretamente
    let clientId = null;
    const rawClientName = formattedData.client_name || formattedData.client?.name || formattedData.client;
    
    // VALIDAÇÃO ULTRA FLEXÍVEL: Aceitar qualquer nome não vazio
    function isValidClientName(name: string): boolean {
      if (!name || name.trim() === '') {
        console.log('❌ Nome inválido: vazio ou null');
        return false;
      }
      
      const trimmedName = name.trim();
      console.log('🔍 Validando nome do cliente:', trimmedName);
      
      // Validação mínima - apenas comprimento
      const isValid = trimmedName.length >= 2 && trimmedName.length <= 100;
      console.log('✅ Nome válido:', isValid);
      
      return isValid;
    }
    
    const clientName = isValidClientName(rawClientName) ? rawClientName.trim() : null;
    
    if (clientName) {
      console.log('👤 Processando dados do cliente:', clientName);
      
      // Buscar cliente existente por nome
      const { data: existingClient, error: searchError } = await supabase
        .from('clients')
        .select('*')
        .eq('nome', clientName)
        .maybeSingle();

      if (searchError) {
        console.error('❌ Erro ao buscar cliente:', searchError);
        throw new Error(`Erro ao buscar cliente: ${searchError.message}`);
      }

      if (existingClient) {
        console.log('✅ Cliente existente encontrado:', existingClient.id);
        clientId = existingClient.id;
        
        // Atualizar dados se necessário
        const updateData: any = {};
        if (formattedData.client?.phone && !existingClient.telefone) {
          updateData.telefone = formattedData.client.phone;
        }
        if (formattedData.client?.company && !existingClient.empresa) {
          updateData.empresa = formattedData.client.company;
        }
        
        if (Object.keys(updateData).length > 0) {
          await supabase
            .from('clients')
            .update(updateData)
            .eq('id', clientId);
          console.log('✅ Cliente atualizado com dados adicionais');
        }
      } else {
        console.log('➕ Criando novo cliente (sem email - será adicionado na revisão)...');
        
        // Criar novo cliente SEM email obrigatório
        const clientData = {
          nome: clientName,
          telefone: formattedData.client?.phone || null,
          empresa: formattedData.client?.company || null,
          origem_dados: 'pdf_extraction'
        };
        
        console.log('📋 Dados do cliente a inserir:', clientData);
        
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert(clientData)
          .select()
          .single();

        if (clientError) {
          console.error('❌ Erro ao criar cliente:', clientError);
          console.error('❌ Dados do cliente:', clientData);
          throw new Error(`Erro ao criar cliente: ${clientError.message}`);
        }
        
        console.log('✅ Cliente criado com sucesso:', newClient.id);
        clientId = newClient.id;
      }
    } else {
      console.log('❌ Nome do cliente não identificado nos dados:', {
        rawClientName,
        formattedDataClient: formattedData.client,
        allFormattedData: JSON.stringify(formattedData, null, 2)
      });
      throw new Error(`Nome do cliente não identificado nos dados. Raw: "${rawClientName}"`);
    }

    // Criar proposta com todos os campos obrigatórios
    console.log('📝 Criando proposta...');
    const proposalData = {
      client_id: clientId,
      user_id: userId,
      valor_total: formattedData.valor_total || formattedData.total || 0,
      status: 'draft',
      product_group: productGroup, // CAMPO OBRIGATÓRIO
      proposal_number: `PROP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      observacoes: formattedData.observacoes || formattedData.summary?.notes || formattedData.paymentTerms || null,
      discount_percentage: formattedData.discount_percentage || 0,
      show_detailed_values: true,
      include_technical_details: false,
      include_video: false
    };
    
    console.log('📋 Dados da proposta a inserir:', proposalData);
    
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .insert(proposalData)
      .select()
      .single();

    if (proposalError) {
      console.error('❌ Erro ao criar proposta:', proposalError);
      console.error('❌ Dados da proposta:', proposalData);
      throw new Error(`Erro ao criar proposta: ${proposalError.message}`);
    }

    console.log('✅ Proposta criada com sucesso:', proposal.id);

    // Inserir itens da proposta
    let itemCount = 0;
    if (formattedData.items && Array.isArray(formattedData.items) && formattedData.items.length > 0) {
      console.log(`📦 Inserindo ${formattedData.items.length} itens da proposta...`);
      
      const itemsToInsert = formattedData.items.map((item: any, index: number) => ({
        proposal_id: proposal.id,
        produto_nome: item.produto_nome || item.name || item.description || `Item ${index + 1}`,
        descricao_item: item.descricao_item || item.description || null,
        quantidade: parseFloat(item.quantidade || item.quantity) || 1,
        preco_unit: parseFloat(item.preco_unit || item.unit_price || item.unitPrice) || 0,
        preco_total: parseFloat(item.preco_total || item.total_price || item.total) || 
                    (parseFloat(item.quantidade || item.quantity) || 1) * 
                    (parseFloat(item.preco_unit || item.unit_price || item.unitPrice) || 0)
      }));

      console.log('📦 Itens a inserir:', itemsToInsert);

      const { error: itemsError } = await supabase
        .from('proposal_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('❌ Erro ao inserir itens:', itemsError);
        console.error('❌ Itens enviados:', itemsToInsert);
        throw new Error(`Erro ao inserir itens: ${itemsError.message}`);
      }

      itemCount = itemsToInsert.length;
      console.log(`✅ ${itemCount} itens inseridos com sucesso`);
    }

    // Forçar criação de novo registro com timestamp único
    console.log('💾 Salvando metadados de validação...');
    const uniqueTimestamp = Date.now();
    const { error: metadataError } = await supabase
      .from('propostas_brutas')
      .insert({
        user_id: userId,
        arquivo_nome: `extracted_${uniqueTimestamp}.json`,
        arquivo_tamanho: JSON.stringify(formattedData).length,
        status: 'processed',
        dados_estruturados: formattedData,
        valor_total_extraido: formattedData.valor_total || formattedData.total || 0,
        cliente_identificado: clientName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (metadataError) {
      console.error('❌ Erro ao salvar metadados:', metadataError);
      throw new Error(`Erro ao salvar metadados: ${metadataError.message}`);
    } else {
      console.log('✅ Metadados salvos com sucesso');
    }

    return {
      proposal_id: proposal.id,
      client_id: clientId,
      items_count: itemCount,
      confidence_score: validationResult?.confidence_score || 0,
      needs_client_email: true, // Sempre precisa coletar email na revisão
      client_name: clientName
    };

  } catch (error) {
    console.error('❌ Erro em saveAsProposalDraft:', error);
    throw error;
  }
}

async function saveAsRawData(
  supabase: any, 
  formattedData: any, 
  validationResult: any, 
  userId: string,
  correlationId: string = 'unknown'
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