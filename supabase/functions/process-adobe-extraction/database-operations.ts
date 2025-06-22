
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

export class DatabaseOperations {
  private supabase: any;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async verifyUser(token: string): Promise<any> {
    const { data: { user }, error } = await this.supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new Error('User authentication failed');
    }

    console.log('✅ User authenticated:', user.id);
    return user;
  }

  async saveExtractedData(user: any, file: File, adobeData: any, structuredData: any): Promise<any> {
    console.log('💾 Saving enhanced extracted data to database...');
    
    const { data, error } = await this.supabase
      .from('propostas_brutas')
      .insert({
        user_id: user.id,
        arquivo_nome: file.name,
        arquivo_tamanho: file.size,
        cliente_identificado: structuredData.client,
        valor_total_extraido: structuredData.total,
        dados_adobe_json: adobeData,
        dados_estruturados: structuredData,
        status: 'enhanced_processed'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Database save error:', error);
      throw new Error(`Failed to save data: ${error.message}`);
    }

    console.log('✅ Data saved successfully to database with ID:', data.id);
    return data;
  }
}
