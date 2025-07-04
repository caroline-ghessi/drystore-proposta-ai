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
    console.log('Starting Adobe file upload via Netlify proxy...');
    
    try {
      // Converter file para base64 para enviar via proxy
      const buffer = await file.arrayBuffer();
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      
      console.log('File converted to base64, size:', buffer.byteLength);

      // URL do proxy Netlify (substitua pela sua URL real após deploy)
      const proxyUrl = 'https://your-netlify-app.netlify.app/.netlify/functions/adobe-upload-proxy';
      
      const proxyResponse = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Adobe-Access-Token': accessToken,
          'X-Adobe-Client-Id': this.credentials.clientId,
          'X-Adobe-Org-Id': this.credentials.orgId,
        },
        body: JSON.stringify({
          fileData: base64Data,
          fileName: file.name
        })
      });

      console.log('Proxy response status:', proxyResponse.status);

      if (!proxyResponse.ok) {
        const errorText = await proxyResponse.text();
        console.error('Proxy error details:', errorText);
        
        // Fallback: tentar upload direto
        console.log('Attempting fallback direct upload...');
        return await this.uploadFileDirect(file, accessToken);
      }

      const proxyData = await proxyResponse.json();
      const assetID = proxyData.assetID;
      console.log('File uploaded via proxy successfully, Asset ID:', assetID);
      return assetID;

    } catch (error) {
      console.error('Proxy upload failed:', error);
      
      // Fallback: tentar upload direto
      console.log('Attempting fallback direct upload...');
      return await this.uploadFileDirect(file, accessToken);
    }
  }

  private async uploadFileDirect(file: File, accessToken: string): Promise<string> {
    console.log('Starting fallback direct Adobe file upload...');
    
    // Transform file correctly for FormData
    const buffer = await file.arrayBuffer();
    console.log('File converted to ArrayBuffer, size:', buffer.byteLength);
    
    const blob = new Blob([buffer], { type: 'application/pdf' });
    console.log('Blob created, type:', blob.type, 'size:', blob.size);
    
    const fixedFile = new File([blob], file.name, { type: 'application/pdf' });
    console.log('File recreated:', fixedFile.name, 'type:', fixedFile.type, 'size:', fixedFile.size);
    
    const uploadFormData = new FormData();
    uploadFormData.append('file', fixedFile);

    const uploadResponse = await fetch('https://pdf-services.adobe.io/assets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-API-Key': this.credentials.clientId,
        'X-Adobe-Organization-Id': this.credentials.orgId,
      },
      body: uploadFormData
    });

    console.log('Direct upload response status:', uploadResponse.status);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Direct upload error details:', errorText);
      throw new Error(`Failed to upload file to Adobe: ${uploadResponse.status} - ${errorText}`);
    }

    const uploadData = await uploadResponse.json();
    const assetID = uploadData.assetID;
    console.log('File uploaded directly to Adobe successfully, Asset ID:', assetID);
    return assetID;
  }

  async startExtraction(assetID: string, accessToken: string): Promise<string> {
    const extractPayload = {
      assetID: assetID,
      elementsToExtract: ['text', 'tables'],
      tableOutputFormat: 'xlsx',
      getCharBounds: false,
      includeStyling: true
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
