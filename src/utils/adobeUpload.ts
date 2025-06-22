
// Utility functions for Adobe API integration - VERSÃO DEFINITIVA
// Implementação simplificada focada em confiabilidade

export interface AdobeCredentials {
  clientId: string;
  clientSecret: string;
  orgId: string;
}

export class AdobeUploadClient {
  private credentials: AdobeCredentials;

  constructor(credentials: AdobeCredentials) {
    this.credentials = credentials;
  }

  async uploadFile(file: File): Promise<string> {
    console.log('🚀 Starting definitive Adobe file upload...');
    console.log('📄 File details:', { name: file.name, size: file.size, type: file.type });

    // Validar arquivo antes de processar
    this.validateFile(file);

    // Get Supabase session
    const { data: { session } } = await (await import('@/integrations/supabase/client')).supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Usuário não autenticado');
    }

    console.log('📤 Sending to upload-to-adobe Edge Function (V2)...');

    // Upload via Edge Function com implementação definitiva
    const uploadResponse = await fetch('https://mlzgeceiinjwpffgsxuy.supabase.co/functions/v1/upload-to-adobe', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/pdf',
        'X-File-Name': file.name,
        'X-File-Size': file.size.toString()
      },
      body: file
    });

    console.log('📨 Edge Function response status:', uploadResponse.status);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ Edge Function upload error:', errorText);
      throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    const responseData = await uploadResponse.json();
    
    if (!responseData.success) {
      console.error('❌ Upload failed:', responseData.error);
      throw new Error(responseData.error || 'Upload failed');
    }

    const assetID = responseData.assetID;
    console.log('✅ File uploaded successfully! Asset ID:', assetID);
    console.log('📊 Strategy used:', responseData.strategy);
    
    return assetID;
  }

  // Validação de arquivo local
  private validateFile(file: File): void {
    if (!file) {
      throw new Error('Nenhum arquivo fornecido');
    }

    if (file.type !== 'application/pdf') {
      throw new Error('Apenas arquivos PDF são suportados');
    }

    // Limite de 50MB para Edge Functions
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('Arquivo muito grande. Máximo permitido: 50MB');
    }

    if (file.size === 0) {
      throw new Error('Arquivo está vazio');
    }

    console.log('✅ File validation passed');
  }

  // Método mantido para compatibilidade
  async getAccessToken(): Promise<string> {
    throw new Error('getAccessToken() is deprecated. Use uploadFile() directly.');
  }
}

// Função simplificada para obter credenciais Adobe
export async function getAdobeCredentials(): Promise<AdobeCredentials> {
  console.log('🔑 Getting Adobe credentials...');
  
  try {
    const { data: { session } } = await (await import('@/integrations/supabase/client')).supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch('https://mlzgeceiinjwpffgsxuy.supabase.co/functions/v1/get-adobe-credentials', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📨 Credentials response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to get Adobe credentials:', errorText);
      throw new Error(`Failed to get Adobe credentials: ${response.status} - ${errorText}`);
    }

    const credentials = await response.json();
    console.log('✅ Adobe credentials obtained successfully');
    return credentials;
    
  } catch (error) {
    console.error('❌ Error getting Adobe credentials:', error);
    throw new Error('Failed to get Adobe credentials. Please check your configuration.');
  }
}
