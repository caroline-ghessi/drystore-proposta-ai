export interface AdobeCredentials {
  clientId: string;
  clientSecret: string;
  orgId: string;
}

export class AdobeClient {
  private credentials: AdobeCredentials;

  constructor(credentials: AdobeCredentials) {
    this.credentials = credentials;
  }

  async getAccessToken(): Promise<string> {
    console.log('Getting Adobe access token...');
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
    console.log('Adobe access token obtained successfully');
    return access_token;
  }

  async uploadFile(file: File, accessToken: string): Promise<string> {
    console.log('🚀 Starting Adobe file upload - Direct method...');
    console.log('📄 File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // Validar token de acesso
    if (!accessToken || accessToken.length < 10) {
      throw new Error('Invalid Adobe access token');
    }

    try {
      return await this.uploadFileDirect(file, accessToken);
    } catch (error) {
      console.error('❌ Direct upload failed:', error);
      throw error;
    }
  }

  private async uploadFileDirect(file: File, accessToken: string): Promise<string> {
    console.log('📤 Starting direct Adobe file upload...');
    console.log('🔍 Upload details:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      accessTokenLength: accessToken.length
    });
    
    // Prepare FormData with correct file handling
    const uploadFormData = new FormData();
    uploadFormData.append('file', file, file.name);

    // Detailed headers for Adobe API
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'X-API-Key': this.credentials.clientId,
      'X-Adobe-Organization-Id': this.credentials.orgId,
    };

    console.log('📨 Making request to Adobe with headers:', {
      hasAuth: headers.Authorization.startsWith('Bearer '),
      apiKey: headers['X-API-Key'].substring(0, 8) + '...',
      orgId: headers['X-Adobe-Organization-Id'].substring(0, 15) + '...'
    });

    const uploadResponse = await fetch('https://pdf-services.adobe.io/assets', {
      method: 'POST',
      headers,
      body: uploadFormData
    });

    console.log('📨 Adobe upload response:', {
      status: uploadResponse.status,
      statusText: uploadResponse.statusText,
      headers: Object.fromEntries(uploadResponse.headers.entries())
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ Adobe upload error:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        error: errorText
      });
      
      // Provide specific error messages
      if (uploadResponse.status === 415) {
        throw new Error('Adobe rejected file format. Ensure PDF is valid and not corrupted.');
      } else if (uploadResponse.status === 401) {
        throw new Error('Adobe authentication failed. Check credentials configuration.');
      } else if (uploadResponse.status === 413) {
        throw new Error('File too large for Adobe API. Maximum size is 10MB.');
      }
      
      throw new Error(`Adobe upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    const uploadData = await uploadResponse.json();
    const assetID = uploadData.assetID;
    
    if (!assetID) {
      console.error('❌ No assetID in response:', uploadData);
      throw new Error('Adobe upload succeeded but no assetID returned');
    }

    console.log('✅ File uploaded to Adobe successfully!', {
      assetID: assetID,
      fileName: file.name
    });
    
    return assetID;
  }

  async startExtraction(assetID: string, accessToken: string): Promise<string> {
    const extractPayload = {
      assetID: assetID,
      elementsToExtract: ['text', 'tables'],
      tableOutputFormat: 'xlsx',
      renditionsToExtract: ['tables'],
      getCharBounds: true,
      includeStyling: true,
      getStylingInfo: true
    };

    console.log('Sending extract request with corrected payload:', JSON.stringify(extractPayload, null, 2));

    const extractResponse = await fetch('https://pdf-services.adobe.io/operation/extractpdf', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-API-Key': this.credentials.clientId,
        'X-Adobe-Organization-Id': this.credentials.orgId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(extractPayload)
    });

    if (!extractResponse.ok) {
      const errorText = await extractResponse.text();
      console.error('Adobe extract error:', errorText);
      throw new Error(`Failed to start PDF extraction: ${extractResponse.status} - ${errorText}`);
    }

    const extractData = await extractResponse.json();
    const location = extractData.location;
    console.log('Extraction started successfully, polling location:', location);
    return location;
  }

  async pollExtractionResult(location: string, accessToken: string): Promise<any> {
    let extractResult;
    let attempts = 0;
    const maxAttempts = 40;
    let waitTime = 3000;

    while (attempts < maxAttempts) {
      console.log(`Polling attempt ${attempts + 1}/${maxAttempts}, waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      const pollResponse = await fetch(location, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-API-Key': this.credentials.clientId,
          'X-Adobe-Organization-Id': this.credentials.orgId,
        }
      });

      if (!pollResponse.ok) {
        const errorText = await pollResponse.text();
        console.error('Poll response error:', errorText);
        throw new Error(`Polling failed: ${pollResponse.status} - ${errorText}`);
      }

      const pollData = await pollResponse.json();
      console.log('Poll result:', {
        attempt: attempts + 1,
        status: pollData.status,
        progress: pollData.progress || 'N/A'
      });

      if (pollData.status === 'done') {
        extractResult = pollData;
        console.log('Adobe extraction completed successfully!');
        break;
      } else if (pollData.status === 'failed') {
        console.error('Adobe extraction failed:', pollData);
        throw new Error(`PDF extraction failed in Adobe API: ${JSON.stringify(pollData)}`);
      }

      attempts++;
      waitTime = Math.min(waitTime * 1.3, 12000);
    }

    if (!extractResult) {
      throw new Error(`PDF extraction timed out after ${maxAttempts} attempts`);
    }

    return extractResult;
  }

  async downloadResult(resultUrl: string): Promise<any> {
    console.log('Downloading extraction result from:', resultUrl);
    
    const resultResponse = await fetch(resultUrl);
    if (!resultResponse.ok) {
      throw new Error(`Failed to download result: ${resultResponse.status}`);
    }
    
    const resultData = await resultResponse.json();
    console.log('Result data downloaded successfully, processing...');
    return resultData;
  }
}
