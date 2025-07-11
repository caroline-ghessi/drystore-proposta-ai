import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🚀 PDF PROCESSING ORCHESTRATOR STARTED - FUNCTION INVOKED!');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('⚙️ Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  const processingStartTime = Date.now();
  const processingId = crypto.randomUUID();
  
  try {
    console.log(`📋 [${processingId}] Parsing request body...`);
    console.log(`📥 [${processingId}] Headers:`, Object.fromEntries(req.headers.entries()));
    console.log(`📝 [${processingId}] Method:`, req.method);
    
    // Parse JSON request body with proper error handling
    let requestBody;
    try {
      requestBody = await req.json();
      console.log(`✅ [${processingId}] JSON parsed successfully`);
    } catch (parseError) {
      console.error(`❌ [${processingId}] JSON Parse Error:`, parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON in request body',
          details: parseError.message
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Extract and validate parameters
    const { fileData, fileName, userId, productGroup = 'geral', options = {} } = requestBody;
    
    console.log(`🔍 [${processingId}] Request parameters:`, {
      hasFileData: !!fileData,
      fileDataLength: fileData?.length || 0,
      fileName,
      userId,
      productGroup,
      optionsKeys: Object.keys(options)
    });

    // Validate required parameters
    if (!fileData || !fileName || !userId) {
      console.error(`❌ [${processingId}] Missing required parameters:`, { 
        fileData: !!fileData, 
        fileName: !!fileName, 
        userId: !!userId 
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required parameters: fileData, fileName, or userId' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
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
      console.log(`📄 [${processingId}] Etapa 1: Extração de texto...`, { fileName, userId });
      const textResult = await extractText(fileData, fileName, options, processingId);
      console.log(`📄 [${processingId}] Etapa 1 CONCLUÍDA:`, { success: textResult.success, hasText: !!textResult.extracted_text });
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
      console.log(`🧠 [${processingId}] Etapa 2: Organização de dados...`, { textLength: textResult.extracted_text?.length });
      const stageStart = Date.now();
      const organizationResult = await organizeData(textResult.extracted_text, processingId);
      console.log(`🧠 [${processingId}] Etapa 2 CONCLUÍDA:`, { success: organizationResult.success, itemsFound: organizationResult.organized_data?.items?.length });
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
      console.log(`📝 [${processingId}] Etapa 3: Formatação...`, { hasOrganizedData: !!organizationResult.organized_data });
      const formatStart = Date.now();
      const formatResult = await formatData(organizationResult.organized_data, processingId);
      console.log(`📝 [${processingId}] Etapa 3 CONCLUÍDA:`, { success: formatResult.success, hasFormattedData: !!formatResult.formatted_data });
      processingLog.stages.push({
        stage: 'data_formatting',
        success: formatResult.success,
        duration: Date.now() - formatStart
      });

      if (!formatResult.success) {
        throw new Error(`Falha na formatação: ${formatResult.error}`);
      }

      // Etapa 4: Validação
      console.log(`✅ [${processingId}] Etapa 4: Validação...`, { hasFormattedData: !!formatResult.formatted_data });
      const validationStart = Date.now();
      const validationResult = await validateData(formatResult.formatted_data, processingId);
      console.log(`✅ [${processingId}] Etapa 4 CONCLUÍDA:`, { success: validationResult.success, confidence: validationResult.validation_result?.confidence_score });
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
      console.log(`💾 [${processingId}] Etapa 5: Salvamento...`, { userId, productGroup, hasValidationResult: !!validationResult.validation_result });
      const saveStart = Date.now();
      const saveResult = await saveData(
        formatResult.formatted_data, 
        validationResult.validation_result,
        userId,
        productGroup,
        processingId
      );
      console.log(`💾 [${processingId}] Etapa 5 CONCLUÍDA:`, { success: saveResult.success, proposalId: saveResult.saved_data?.proposal_id });
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

async function extractText(fileData: string, fileName: string, options: any, processingId?: string) {
  // Implementar retry com backoff exponencial e verificação de token
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`📤 [${processingId}] extractText attempt ${attempt}/3`);
      
      // Verificar token Adobe antes da tentativa
      if (attempt === 1) {
        try {
          console.log(`🔑 [${processingId}] Verificando token Adobe...`);
          await fetch(
            `${Deno.env.get('SUPABASE_URL')}/functions/v1/adobe-token-manager`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
              },
              body: JSON.stringify({ action: 'get_token' })
            }
          );
          console.log(`✅ [${processingId}] Token Adobe verificado`);
        } catch (tokenError) {
          console.log(`⚠️ [${processingId}] Aviso na verificação do token: ${tokenError.message}`);
        }
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 segundos timeout aumentado
      
      try {
        const response = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/pdf-text-extractor`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            },
            body: JSON.stringify({
              file_data: fileData,
              file_name: fileName,
              extraction_method: options.extractionMethod || 'adobe',
              processing_id: processingId
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
          throw new Error('Text extraction timeout');
        }
        
        throw error;
      }
    } catch (error) {
      lastError = error;
      console.log(`⚠️ [${processingId}] extractText attempt ${attempt} failed: ${error.message}`);
      
      if (attempt < 3) {
        const backoffTime = Math.pow(2, attempt - 1) * 2000; // 2s, 4s - backoff aumentado
        console.log(`🔄 [${processingId}] Retrying in ${backoffTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }
  
  throw lastError || new Error('Text extraction failed after 3 attempts');
}

async function organizeData(extractedText: string, processingId?: string) {
  // Implementar retry com backoff exponencial
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🧠 [${processingId}] organizeData attempt ${attempt}/3`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout
      
      try {
        const response = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-data-organizer`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            },
            body: JSON.stringify({
              extracted_text: extractedText,
              context: 'erp_pdf',
              processing_id: processingId
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
          throw new Error('Data organization timeout');
        }
        
        throw error;
      }
    } catch (error) {
      lastError = error;
      console.log(`⚠️ [${processingId}] organizeData attempt ${attempt} failed: ${error.message}`);
      
      if (attempt < 3) {
        const backoffTime = Math.pow(2, attempt - 1) * 1000; // 1s, 2s
        console.log(`🔄 [${processingId}] Retrying in ${backoffTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }
  
  throw lastError || new Error('Data organization failed after 3 attempts');
}

async function formatData(organizedData: any, processingId?: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout
  
  try {
    const response = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/proposal-formatter`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          organized_data: organizedData,
          format_type: 'drystore_proposal',
          processing_id: processingId
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

async function validateData(formattedData: any, processingId?: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout
  
  try {
    const response = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/data-validator`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          formatted_data: formattedData,
          validation_rules: 'standard',
          processing_id: processingId
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

async function saveData(formattedData: any, validationResult: any, userId: string, productGroup: string = 'geral', processingId?: string) {
  // Implementar retry para salvamento
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`💾 [${processingId}] saveData attempt ${attempt}/3`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 segundos timeout aumentado
      
      try {
        const response = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/data-saver`,
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
              product_group: productGroup,
              processing_id: processingId
            }),
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Data saving failed with status: ${response.status} - ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          throw new Error('Data saving timeout');
        }
        
        throw error;
      }
    } catch (error) {
      lastError = error;
      console.log(`⚠️ [${processingId}] saveData attempt ${attempt} failed: ${error.message}`);
      
      if (attempt < 3) {
        const backoffTime = Math.pow(2, attempt - 1) * 1500; // 1.5s, 3s
        console.log(`🔄 [${processingId}] Retrying save in ${backoffTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }
  
  return { success: false, error: lastError?.message || 'Data saving failed after 3 attempts' };
}