// ============================================================================
// FASE 05: Integração Supabase Otimizada - Versão Definitiva
// Implementa storage otimizado, cache inteligente e logging enriquecido
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface CacheEntry {
  id: string;
  file_hash: string;
  file_name: string;
  file_size: number;
  extraction_data: any;
  extraction_quality: 'high' | 'medium' | 'low';
  processing_method: string;
  created_at: string;
  user_id: string;
  hit_count: number;
  last_accessed: string;
}

export interface ProcessingLog {
  id: string;
  correlation_id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  processing_stage: string;
  stage_status: 'started' | 'completed' | 'failed';
  stage_duration_ms?: number;
  stage_details?: any;
  error_message?: string;
  created_at: string;
}

export interface OptimizedStorage {
  bucket: string;
  path: string;
  url?: string;
  metadata: {
    original_name: string;
    size: number;
    type: string;
    processing_id: string;
  };
}

export class SupabaseIntegration {
  private supabase: any;
  private correlationId?: string;

  constructor(correlationId?: string) {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.correlationId = correlationId;
  }

  private log(message: string, data?: any): void {
    const prefix = this.correlationId ? `[${this.correlationId}]` : '[Supabase]';
    console.log(`${prefix} ${message}`, data || '');
  }

  private logError(message: string, error: any): void {
    const prefix = this.correlationId ? `[${this.correlationId}]` : '[Supabase]';
    console.error(`${prefix} ❌ ${message}`, {
      error: error.message,
      stack: error.stack
    });
  }

  // ========================================
  // CACHE INTELIGENTE BASEADO EM HASH
  // ========================================
  async generateFileHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async checkCache(fileHash: string, userId: string): Promise<CacheEntry | null> {
    this.log('🔍 Verificando cache para arquivo...');
    
    try {
      const { data, error } = await this.supabase
        .from('pdf_extraction_cache')
        .select('*')
        .eq('file_hash', fileHash)
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Cache válido por 7 dias
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        this.logError('Erro ao consultar cache', error);
        return null;
      }

      if (data) {
        // Atualizar estatísticas do cache
        await this.updateCacheStats(data.id);
        this.log('✅ Cache hit encontrado', { id: data.id, quality: data.extraction_quality });
        return data;
      }

      this.log('ℹ️ Cache miss - arquivo não encontrado no cache');
      return null;

    } catch (error) {
      this.logError('Erro inesperado no cache', error);
      return null;
    }
  }

  private async updateCacheStats(cacheId: string): Promise<void> {
    try {
      await this.supabase
        .from('pdf_extraction_cache')
        .update({
          hit_count: this.supabase.sql`hit_count + 1`,
          last_accessed: new Date().toISOString()
        })
        .eq('id', cacheId);
    } catch (error) {
      this.logError('Erro ao atualizar estatísticas do cache', error);
    }
  }

  async saveToCache(
    fileHash: string,
    fileName: string,
    fileSize: number,
    extractionData: any,
    extractionQuality: 'high' | 'medium' | 'low',
    processingMethod: string,
    userId: string
  ): Promise<void> {
    this.log('💾 Salvando no cache...');
    
    try {
      const { error } = await this.supabase
        .from('pdf_extraction_cache')
        .insert({
          file_hash: fileHash,
          file_name: fileName,
          file_size: fileSize,
          extraction_data: extractionData,
          extraction_quality: extractionQuality,
          processing_method: processingMethod,
          user_id: userId,
          hit_count: 0,
          created_at: new Date().toISOString(),
          last_accessed: new Date().toISOString()
        });

      if (error) {
        this.logError('Erro ao salvar no cache', error);
        return;
      }

      this.log('✅ Dados salvos no cache com sucesso');

      // Limpeza automática do cache (manter apenas os 100 mais recentes por usuário)
      await this.cleanupCache(userId);

    } catch (error) {
      this.logError('Erro inesperado ao salvar cache', error);
    }
  }

  private async cleanupCache(userId: string): Promise<void> {
    try {
      // Manter apenas os 100 registros mais recentes por usuário
      const { data: oldEntries } = await this.supabase
        .from('pdf_extraction_cache')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(50); // Remove em batches de 50

      if (oldEntries && oldEntries.length > 0) {
        const { count } = await this.supabase
          .from('pdf_extraction_cache')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);

        if (count && count > 100) {
          const idsToDelete = oldEntries.map(entry => entry.id);
          await this.supabase
            .from('pdf_extraction_cache')
            .delete()
            .in('id', idsToDelete);
          
          this.log(`🧹 Limpeza do cache: ${idsToDelete.length} entradas antigas removidas`);
        }
      }
    } catch (error) {
      this.logError('Erro na limpeza do cache', error);
    }
  }

  // ========================================
  // STORAGE OTIMIZADO
  // ========================================
  async storeFile(file: File, processingId: string): Promise<OptimizedStorage> {
    this.log('📁 Armazenando arquivo no storage...');
    
    try {
      const bucket = 'pdf-processing';
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `${processingId}/${timestamp}_${safeName}`;

      // Upload do arquivo
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: {
            originalName: file.name,
            processingId: processingId,
            uploadedAt: new Date().toISOString()
          }
        });

      if (error) {
        this.logError('Erro no upload do arquivo', error);
        throw new Error(`Storage upload failed: ${error.message}`);
      }

      // Gerar URL pública se necessário
      const { data: urlData } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      this.log('✅ Arquivo armazenado com sucesso', { path, url: urlData.publicUrl });

      return {
        bucket,
        path,
        url: urlData.publicUrl,
        metadata: {
          original_name: file.name,
          size: file.size,
          type: file.type,
          processing_id: processingId
        }
      };

    } catch (error) {
      this.logError('Erro inesperado no storage', error);
      throw error;
    }
  }

  async cleanupOldFiles(retentionDays: number = 30): Promise<void> {
    this.log(`🧹 Iniciando limpeza de arquivos antigos (>${retentionDays} dias)...`);
    
    try {
      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
      
      const { data: files, error } = await this.supabase.storage
        .from('pdf-processing')
        .list('', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'asc' }
        });

      if (error) {
        this.logError('Erro ao listar arquivos para limpeza', error);
        return;
      }

      const filesToDelete = files?.filter(file => 
        new Date(file.created_at) < cutoffDate
      ) || [];

      if (filesToDelete.length > 0) {
        const pathsToDelete = filesToDelete.map(file => file.name);
        
        const { error: deleteError } = await this.supabase.storage
          .from('pdf-processing')
          .remove(pathsToDelete);

        if (deleteError) {
          this.logError('Erro ao deletar arquivos antigos', deleteError);
        } else {
          this.log(`✅ ${filesToDelete.length} arquivos antigos removidos`);
        }
      } else {
        this.log('ℹ️ Nenhum arquivo antigo encontrado para remoção');
      }

    } catch (error) {
      this.logError('Erro inesperado na limpeza de arquivos', error);
    }
  }

  // ========================================
  // LOGGING ENRIQUECIDO
  // ========================================
  async logProcessingStage(
    stage: string,
    status: 'started' | 'completed' | 'failed',
    userId: string,
    fileName: string,
    fileSize: number,
    details?: any,
    error?: string,
    duration?: number
  ): Promise<void> {
    try {
      const logEntry = {
        correlation_id: this.correlationId || crypto.randomUUID(),
        user_id: userId,
        file_name: fileName,
        file_size: fileSize,
        processing_stage: stage,
        stage_status: status,
        stage_duration_ms: duration,
        stage_details: details,
        error_message: error,
        created_at: new Date().toISOString()
      };

      const { error: logError } = await this.supabase
        .from('pdf_processing_logs')
        .insert(logEntry);

      if (logError) {
        this.logError('Erro ao salvar log de processamento', logError);
      }

    } catch (error) {
      this.logError('Erro inesperado no logging', error);
    }
  }

  async getProcessingMetrics(userId?: string, days: number = 7): Promise<any> {
    this.log('📊 Consultando métricas de processamento...');
    
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      
      let query = this.supabase
        .from('pdf_processing_logs')
        .select('*')
        .gte('created_at', cutoffDate);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        this.logError('Erro ao consultar métricas', error);
        return null;
      }

      // Agregar métricas
      const metrics = {
        total_processes: data.length,
        success_rate: 0,
        avg_duration: 0,
        stage_performance: {},
        error_summary: {},
        daily_counts: {}
      };

      if (data.length > 0) {
        const successful = data.filter(log => log.stage_status === 'completed');
        metrics.success_rate = (successful.length / data.length) * 100;

        const durationsWithValue = data.filter(log => log.stage_duration_ms);
        if (durationsWithValue.length > 0) {
          metrics.avg_duration = durationsWithValue.reduce((sum, log) => 
            sum + (log.stage_duration_ms || 0), 0
          ) / durationsWithValue.length;
        }

        // Agrupar por estágio
        const stageGroups = data.reduce((acc, log) => {
          if (!acc[log.processing_stage]) {
            acc[log.processing_stage] = [];
          }
          acc[log.processing_stage].push(log);
          return acc;
        }, {});

        metrics.stage_performance = Object.entries(stageGroups).reduce((acc, [stage, logs]: [string, any[]]) => {
          const successfulLogs = logs.filter(log => log.stage_status === 'completed');
          acc[stage] = {
            total: logs.length,
            success_rate: (successfulLogs.length / logs.length) * 100,
            avg_duration: logs.filter(log => log.stage_duration_ms).reduce((sum, log) => 
              sum + (log.stage_duration_ms || 0), 0
            ) / logs.filter(log => log.stage_duration_ms).length || 0
          };
          return acc;
        }, {});

        // Resumo de erros
        const errors = data.filter(log => log.stage_status === 'failed' && log.error_message);
        metrics.error_summary = errors.reduce((acc, log) => {
          const errorKey = log.error_message.substring(0, 100);
          acc[errorKey] = (acc[errorKey] || 0) + 1;
          return acc;
        }, {});
      }

      this.log('✅ Métricas consultadas com sucesso');
      return metrics;

    } catch (error) {
      this.logError('Erro inesperado ao consultar métricas', error);
      return null;
    }
  }

  // ========================================
  // SALVAMENTO DE DADOS PROCESSADOS
  // ========================================
  async saveProcessedData(
    userId: string,
    fileName: string,
    fileSize: number,
    extractedData: any,
    processingMethod: string,
    extractionQuality: 'high' | 'medium' | 'low'
  ): Promise<string> {
    this.log('💾 Salvando dados processados...');
    
    try {
      const { data, error } = await this.supabase
        .from('propostas_brutas')
        .insert({
          user_id: userId,
          arquivo_nome: fileName,
          arquivo_tamanho: fileSize,
          cliente_identificado: extractedData.client || 'Cliente a identificar',
          valor_total_extraido: extractedData.total || 0,
          dados_adobe_json: {
            processing_method: processingMethod,
            extraction_quality: extractionQuality,
            processed_at: new Date().toISOString(),
            correlation_id: this.correlationId
          },
          dados_estruturados: extractedData,
          status: 'processado'
        })
        .select()
        .single();

      if (error) {
        this.logError('Erro ao salvar dados processados', error);
        throw new Error(`Database save failed: ${error.message}`);
      }

      this.log('✅ Dados processados salvos com sucesso', { id: data.id });
      return data.id;

    } catch (error) {
      this.logError('Erro inesperado ao salvar dados', error);
      throw error;
    }
  }

  // ========================================
  // AUTENTICAÇÃO
  // ========================================
  async authenticateUser(authHeader: string): Promise<any> {
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await this.supabase.auth.getUser(token);

    if (error || !user) {
      this.logError('Falha na autenticação', error);
      throw new Error('User authentication failed');
    }

    this.log('✅ Usuário autenticado', { email: user.email, id: user.id });
    return user;
  }
}