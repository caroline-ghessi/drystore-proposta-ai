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

  let requestBody;
  let processingStartTime = Date.now();
  
  try {
    console.log('🎬 pdf-processing-orchestrator: Iniciando orquestração');
    console.log('📥 Headers recebidos:', Object.fromEntries(req.headers.entries()));
    console.log('📝 Method:', req.method);
    console.log('🌐 URL:', req.url);
    
    // CORREÇÃO CRÍTICA: Verificar se há body disponível
    if (!req.body) {
      console.error('❌ ERRO: Sem body na requisição');
      throw new Error('Request body está vazio');
    }
    
    // CRÍTICO: Try/catch específico para parsing JSON com mais detalhes
    try {
      const requestText = await req.text();
      console.log('📄 Texto bruto recebido (primeiros 200 chars):', requestText.substring(0, 200));
      console.log('📏 Tamanho do texto:', requestText.length);
      
      requestBody = JSON.parse(requestText);
      console.log('✅ JSON parseado com sucesso');
    } catch (jsonError) {
      console.error('❌ ERRO CRÍTICO no parsing JSON:', {
        error: jsonError.message,
        name: jsonError.name,
        stack: jsonError.stack?.substring(0, 200),
        bodyType: typeof req.body
      });
      throw new Error(`Parsing JSON falhou: ${jsonError.message}`);
    }
    
    console.log('📋 Payload recebido:', { 
      hasFileData: !!requestBody?.fileData, 
      fileName: requestBody?.fileName,
      userId: requestBody?.userId,
      options: requestBody?.options,
      rawKeys: requestBody ? Object.keys(requestBody) : [],
      payloadType: typeof requestBody
    });
    
    // CORREÇÃO CRÍTICA: Verificar se requestBody existe antes do destructuring
    if (!requestBody || typeof requestBody !== 'object') {
      console.error('❌ ERRO: requestBody inválido:', requestBody);
      throw new Error('Payload recebido não é um objeto válido');
    }
    
    const { 
      fileData, 
      fileName, 
      userId,
      options = {},
      productGroup = 'geral'
    } = requestBody;
    
    console.log('🏷️ Product Group recebido:', productGroup);
    
    // Validação robusta de campos obrigatórios
    if (!fileData) {
      console.error('❌ Campo fileData ausente');
      throw new Error('Campo fileData é obrigatório');
    }
    if (!userId) {
      console.error('❌ Campo userId ausente');
      throw new Error('Campo userId é obrigatório'); 
    }
    if (!fileName) {
      console.error('❌ Campo fileName ausente');
      throw new Error('Campo fileName é obrigatório');
    }
    
    console.log('✅ Validação de campos concluída com sucesso');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const processingLog = {
      stages: [] as any[],
      start_time: Date.now(),
      errors: [] as string[],
      warnings: [] as string[]
    };

    let result = {
      success: false,
      data: null,
      processing_log: processingLog,
      final_confidence_score: 0
    };

    try {
      // Etapa 1: Extração de texto
      console.log('📄 Etapa 1: Extração de texto...', { fileName, userId });
      const textResult = await extractText(fileData, fileName, options);
      console.log('📄 Etapa 1 CONCLUÍDA:', { success: textResult.success, hasText: !!textResult.extracted_text });
      processingLog.stages.push({
        stage: 'text_extraction',
        success: textResult.success,
        duration: Date.now() - processingLog.start_time,
        method: textResult.metadata?.method || 'unknown'
      });

      if (!textResult.success) {
        throw new Error(`Falha na extração: ${textResult.error}`);
      }

      // Etapa 2: Organização de dados
      console.log('🧠 Etapa 2: Organização de dados...', { textLength: textResult.extracted_text?.length });
      const stageStart = Date.now();
      const organizationResult = await organizeData(textResult.extracted_text);
      console.log('🧠 Etapa 2 CONCLUÍDA:', { success: organizationResult.success, itemsFound: organizationResult.organized_data?.items?.length });
      processingLog.stages.push({
        stage: 'data_organization',
        success: organizationResult.success,
        duration: Date.now() - stageStart,
        items_found: organizationResult.organized_data?.items?.length || 0
      });

      if (!organizationResult.success) {
        throw new Error(`Falha na organização: ${organizationResult.error}`);
      }

      // Etapa 3: Formatação
      console.log('📝 Etapa 3: Formatação...', { hasOrganizedData: !!organizationResult.organized_data });
      const formatStart = Date.now();
      const formatResult = await formatData(organizationResult.organized_data);
      console.log('📝 Etapa 3 CONCLUÍDA:', { success: formatResult.success, hasFormattedData: !!formatResult.formatted_data });
      processingLog.stages.push({
        stage: 'data_formatting',
        success: formatResult.success,
        duration: Date.now() - formatStart
      });

      if (!formatResult.success) {
        throw new Error(`Falha na formatação: ${formatResult.error}`);
      }

      // Etapa 4: Validação
      console.log('✅ Etapa 4: Validação...', { hasFormattedData: !!formatResult.formatted_data });
      const validationStart = Date.now();
      const validationResult = await validateData(formatResult.formatted_data);
      console.log('✅ Etapa 4 CONCLUÍDA:', { success: validationResult.success, confidence: validationResult.validation_result?.confidence_score });
      processingLog.stages.push({
        stage: 'data_validation',
        success: validationResult.success,
        duration: Date.now() - validationStart,
        confidence_score: validationResult.validation_result?.confidence_score || 0
      });

      if (!validationResult.success) {
        processingLog.warnings.push(`Validação com problemas: ${validationResult.error}`);
      }

      // Etapa 5: Salvamento
      console.log('💾 Etapa 5: Salvamento...', { userId, productGroup, hasValidationResult: !!validationResult.validation_result });
      const saveStart = Date.now();
      const saveResult = await saveData(
        formatResult.formatted_data, 
        validationResult.validation_result,
        userId,
        productGroup
      );
      console.log('💾 Etapa 5 CONCLUÍDA:', { success: saveResult.success, proposalId: saveResult.saved_data?.proposal_id });
      processingLog.stages.push({
        stage: 'data_saving',
        success: saveResult.success,
        duration: Date.now() - saveStart,
        proposal_id: saveResult.saved_data?.proposal_id
      });

      if (!saveResult.success) {
        throw new Error(`Falha no salvamento: ${saveResult.error}`);
      }

      // Sucesso completo
      result = {
        success: true,
        data: {
          proposal_id: saveResult.saved_data.proposal_id,
          client_id: saveResult.saved_data.client_id,
          items_count: saveResult.saved_data.items_count,
          formatted_data: formatResult.formatted_data
        },
        processing_log: processingLog,
        final_confidence_score: validationResult.validation_result?.confidence_score || 0
      };

      console.log('🎉 Processamento concluído com sucesso!');

    } catch (error) {
      console.error('❌ Erro no processamento:', error);
      processingLog.errors.push(error.message);
      result.success = false;
      result.data = { error: error.message };
    }

    // Log total do processamento
    processingLog.stages.push({
      stage: 'total_processing',
      success: result.success,
      duration: Date.now() - processingLog.start_time
    });

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Erro crítico no orquestrador:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stage: 'orchestration'
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

async function extractText(fileData: string, fileName: string, options: any) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos timeout (OTIMIZADO)
  
  try {
    const response = await fetch(
      `https://mlzgeceiinjwpffgsxuy.supabase.co/functions/v1/pdf-text-extractor`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          file_data: fileData,
          file_name: fileName,
          extraction_method: options.extractionMethod || 'adobe'
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Text extraction failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return { success: false, error: 'Text extraction timeout' };
    }
    
    return { success: false, error: error.message };
  }
}

async function organizeData(extractedText: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos timeout (OTIMIZADO)
  
  try {
    const response = await fetch(
      `https://mlzgeceiinjwpffgsxuy.supabase.co/functions/v1/ai-data-organizer`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          extracted_text: extractedText,
          context: 'erp_pdf'
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Data organization failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return { success: false, error: 'Data organization timeout' };
    }
    
    return { success: false, error: error.message };
  }
}

async function formatData(organizedData: any) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 segundos timeout (OTIMIZADO)
  
  try {
    const response = await fetch(
      `https://mlzgeceiinjwpffgsxuy.supabase.co/functions/v1/proposal-formatter`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          organized_data: organizedData,
          format_type: 'drystore_proposal'
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Data formatting failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return { success: false, error: 'Data formatting timeout' };
    }
    
    return { success: false, error: error.message };
  }
}

async function validateData(formattedData: any) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout (OTIMIZADO)
  
  try {
    const response = await fetch(
      `https://mlzgeceiinjwpffgsxuy.supabase.co/functions/v1/data-validator`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          formatted_data: formattedData,
          validation_rules: 'standard'
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Data validation failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return { success: false, error: 'Data validation timeout' };
    }
    
    return { success: false, error: error.message };
  }
}

async function saveData(formattedData: any, validationResult: any, userId: string, productGroup: string = 'geral') {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos timeout (OTIMIZADO)
  
  try {
    const response = await fetch(
      `https://mlzgeceiinjwpffgsxuy.supabase.co/functions/v1/data-saver`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          formatted_data: formattedData,
          validation_result: validationResult,
          save_type: 'proposal_draft',
          user_id: userId,
          product_group: productGroup
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Data saving failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return { success: false, error: 'Data saving timeout' };
    }
    
    return { success: false, error: error.message };
  }
}