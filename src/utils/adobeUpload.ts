
// Utility functions for Adobe API integration
// Note: This file is now simplified as the main logic is handled by Edge Functions

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
    console.log('Starting Adobe file upload via Edge Function...');
    console.log('File details:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Get Supabase session
    const { data: { session } } = await (await import('@/integrations/supabase/client')).supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Usuário não autenticado');
    }

    console.log('Sending file to upload-to-adobe Edge Function...');

    // Send file directly to Edge Function
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

    console.log('Edge Function response status:', uploadResponse.status);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Edge Function upload error:', errorText);
      throw new Error(`Failed to upload via Edge Function: ${uploadResponse.status} - ${errorText}`);
    }

    const responseData = await uploadResponse.json();
    
    if (!responseData.success) {
      console.error('Upload failed:', responseData.error);
      throw new Error(responseData.error || 'Upload failed');
    }

    const assetID = responseData.assetID;
    console.log('File uploaded successfully via Edge Function, Asset ID:', assetID);
    return assetID;
  }

  // Deprecated method - kept for compatibility
  async getAccessToken(): Promise<string> {
    throw new Error('getAccessToken() is deprecated. Use uploadFile() directly.');
  }
}

// Function to get Adobe credentials (now simplified without mock fallback)
export async function getAdobeCredentials(): Promise<AdobeCredentials> {
  console.log('Getting Adobe credentials...');
  
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
    throw new Error('Failed to get Adobe credentials. Please check your configuration.');
  }
}
