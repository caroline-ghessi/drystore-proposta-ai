
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ExtractedData } from './data-parser.ts'

export class DatabaseOperations {
  private supabase: any;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async verifyUser(token: string): Promise<any> {
    const { data: { user }, error: userError } = await this.supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid authentication token');
    }

    console.log('User authenticated:', user.id);
    return user;
  }

  async saveExtractedData(
    user: any,
    file: File,
    adobeRawData: any,
    structuredData: ExtractedData
  ): Promise<any> {
    const { data: savedData, error: saveError } = await this.supabase
      .from('propostas_brutas')
      .insert({
        user_id: user.id,
        arquivo_nome: file.name,
        arquivo_tamanho: file.size,
        dados_adobe_json: adobeRawData,
        dados_estruturados: structuredData,
        cliente_identificado: structuredData.client,
        valor_total_extraido: structuredData.total,
        status: 'pending_review'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving to database:', saveError);
      throw new Error('Failed to save extracted data');
    }

    console.log('Data saved successfully to database with ID:', savedData.id);
    return savedData;
  }
}
