
interface AdobeCredentials {
  clientId: string;
  clientSecret: string;
  orgId: string;
}

interface AdobeUploadResult {
  assetID: string;
}

export class AdobeUploadClient {
  private credentials: AdobeCredentials;

  constructor(credentials: AdobeCredentials) {
    this.credentials = credentials;
  }

  async getAccessToken(): Promise<string> {
    console.log('Getting Adobe access token from frontend...');
    
    const tokenResponse = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'client_id': this.credentials.clientId,
        'client_secret': this.credentials.clientSecret,
        'grant_type': 'client_credentials',
        'scope': 'openid,AdobeID,read_organizations,additional_info.projectedProductContext,additional_info.roles'
      }).toString()
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Adobe token error:', errorText);
      throw new Error(`Failed to authenticate with Adobe API: ${tokenResponse.status} - ${errorText}`);
    }

    const { access_token } = await tokenResponse.json();
    console.log('Adobe access token obtained successfully from frontend');
    return access_token;
  }

  async uploadFile(file: File): Promise<string> {
    console.log('Starting Adobe file upload from frontend...');
    console.log('File details:', file.name, 'Size:', file.size, 'Type:', file.type);

    const accessToken = await this.getAccessToken();

    // Criar FormData usando a API nativa do browser
    const formData = new FormData();
    formData.append('file', file);

    console.log('FormData created, uploading to Adobe...');
    console.log('Upload URL:', 'https://pdf-services.adobe.io/assets');
    console.log('Headers that will be sent:', {
      'Authorization': 'Bearer [HIDDEN]',
      'X-API-Key': this.credentials.clientId,
      'X-Adobe-Organization-Id': this.credentials.orgId
    });

    const uploadResponse = await fetch('https://pdf-services.adobe.io/assets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-API-Key': this.credentials.clientId,
        'X-Adobe-Organization-Id': this.credentials.orgId,
        // NÃO definir Content-Type - deixar o browser definir automaticamente com boundary
      },
      body: formData
    });

    console.log('Adobe upload response status:', uploadResponse.status);
    console.log('Adobe upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));

    // DEBUGGING: Ler resposta como texto primeiro para ver o que está vindo
    const rawResponse = await uploadResponse.text();
    console.log('💥 Resposta bruta da Adobe (primeiros 500 caracteres):', rawResponse.slice(0, 500));

    if (!uploadResponse.ok) {
      console.error('Adobe upload error - Status:', uploadResponse.status);
      console.error('Adobe upload error - Response:', rawResponse);
      throw new Error(`Failed to upload file to Adobe: ${uploadResponse.status} - ${rawResponse.slice(0, 200)}`);
    }

    // Tentar converter para JSON
    try {
      const uploadData = JSON.parse(rawResponse);
      const assetID = uploadData.assetID;
      
      if (!assetID) {
        console.error('No assetID found in response:', uploadData);
        throw new Error('Adobe API não retornou assetID válido');
      }
      
      console.log('File uploaded to Adobe successfully, Asset ID:', assetID);
      return assetID;
    } catch (jsonError) {
      console.error('❌ Erro ao converter resposta para JSON:', jsonError);
      console.error('Resposta que causou erro:', rawResponse);
      throw new Error(`Resposta inesperada da Adobe API: ${rawResponse.slice(0, 200)}`);
    }
  }
}

// Função auxiliar para obter credenciais da Adobe via Edge Function
export async function getAdobeCredentials(): Promise<AdobeCredentials> {
  console.log('Tentando obter credenciais Adobe...');
  
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

    console.log('Credentials response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to get Adobe credentials:', errorText);
      throw new Error(`Failed to get Adobe credentials: ${response.status} - ${errorText}`);
    }

    const credentials = await response.json();
    console.log('Adobe credentials obtained successfully');
    return credentials;
    
  } catch (error) {
    console.error('Error getting Adobe credentials:', error);
    
    // FALLBACK TEMPORÁRIO: usar credenciais hardcoded para teste
    console.warn('🚨 USANDO CREDENCIAIS FALLBACK PARA TESTE - REMOVER EM PRODUÇÃO');
    
    // TODO: Substituir por credenciais reais para teste
    return {
      clientId: process.env.ADOBE_CLIENT_ID || 'YOUR_ADOBE_CLIENT_ID',
      clientSecret: process.env.ADOBE_CLIENT_SECRET || 'YOUR_ADOBE_CLIENT_SECRET', 
      orgId: process.env.ADOBE_ORG_ID || 'YOUR_ADOBE_ORG_ID'
    };
  }
}
