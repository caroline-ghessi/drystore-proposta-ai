
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-file-name, x-file-size',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== ADOBE UPLOAD PROXY STARTED ===');
    
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Get file information from headers
    const fileName = req.headers.get('X-File-Name') || 'arquivo.pdf';
    const fileSize = req.headers.get('X-File-Size') || '0';
    const contentType = req.headers.get('Content-Type') || 'application/pdf';

    console.log('File info from headers:', fileName, 'Size:', fileSize, 'Type:', contentType);

    // Read file as ArrayBuffer
    const arrayBuffer = await req.arrayBuffer();
    console.log('ArrayBuffer received, size:', arrayBuffer.byteLength);

    // Get Adobe credentials from environment
    const adobeClientId = Deno.env.get('ADOBE_CLIENT_ID');
    const adobeClientSecret = Deno.env.get('ADOBE_CLIENT_SECRET');
    const adobeOrgId = Deno.env.get('ADOBE_ORG_ID');

    console.log('Checking Adobe credentials...');
    console.log('Client ID exists:', !!adobeClientId);
    console.log('Client Secret exists:', !!adobeClientSecret);
    console.log('Org ID exists:', !!adobeOrgId);

    if (!adobeClientId || !adobeClientSecret || !adobeOrgId) {
      throw new Error('Adobe API credentials not configured properly');
    }

    // Get Adobe access token
    console.log('Getting Adobe access token...');
    const tokenResponse = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'client_id': adobeClientId,
        'client_secret': adobeClientSecret,
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

    // Create Blob (not File!) for Deno compatibility
    console.log('Creating Blob for Adobe upload...');
    const blob = new Blob([arrayBuffer], { type: contentType });
    console.log('Blob created, size:', blob.size, 'type:', blob.type);

    // Create FormData with Blob and filename (3 parameters)
    const adobeFormData = new FormData();
    adobeFormData.append('file', blob, fileName);
    console.log('FormData created with Blob and filename');

    // Upload to Adobe - DO NOT set Content-Type manually!
    console.log('Uploading to Adobe PDF Services API...');
    const uploadResponse = await fetch('https://pdf-services.adobe.io/assets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'X-API-Key': adobeClientId,
        'X-Adobe-Organization-Id': adobeOrgId,
        // NO Content-Type here! FormData sets it automatically with boundary
      },
      body: adobeFormData
    });

    console.log('Adobe upload response status:', uploadResponse.status);

    // Read response as text first for debugging
    const rawResponse = await uploadResponse.text();
    console.log('Adobe response (first 200 chars):', rawResponse.slice(0, 200));

    if (!uploadResponse.ok) {
      console.error('Adobe upload failed:', rawResponse);
      throw new Error(`Adobe upload failed: ${uploadResponse.status} - ${rawResponse.slice(0, 200)}`);
    }

    // Parse JSON response
    try {
      const uploadData = JSON.parse(rawResponse);
      const assetID = uploadData.assetID;
      
      if (!assetID) {
        console.error('No assetID in response:', uploadData);
        throw new Error('Adobe API did not return valid assetID');
      }
      
      console.log('✅ File uploaded successfully to Adobe! Asset ID:', assetID);

      return new Response(
        JSON.stringify({
          success: true,
          assetID: assetID
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );

    } catch (jsonError) {
      console.error('Error parsing Adobe response:', jsonError);
      throw new Error(`Unexpected response from Adobe API: ${rawResponse.slice(0, 200)}`);
    }

  } catch (error) {
    console.error('❌ Upload to Adobe Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
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
