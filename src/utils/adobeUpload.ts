
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

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Adobe upload error:', errorText);
      throw new Error(`Failed to upload file to Adobe: ${uploadResponse.status} - ${errorText}`);
    }

    const uploadData = await uploadResponse.json();
    const assetID = uploadData.assetID;
    console.log('File uploaded to Adobe successfully, Asset ID:', assetID);
    return assetID;
  }
}

// Função auxiliar para obter credenciais da Adobe via Edge Function
export async function getAdobeCredentials(): Promise<AdobeCredentials> {
  const response = await fetch('/api/get-adobe-credentials', {
    headers: {
      'Authorization': `Bearer ${(await import('@/integrations/supabase/client')).supabase.auth.getSession().then(({data}) => data.session?.access_token)}`,
    }
  });

  if (!response.ok) {
    throw new Error('Failed to get Adobe credentials');
  }

  return response.json();
}
