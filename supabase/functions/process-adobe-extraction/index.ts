
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DataParser } from './data-parser.ts'
import { DatabaseOperations } from './database-operations.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== ADOBE PDF PROCESSING STARTED (assetID only) ===');
    
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Parse request body
    const { assetID, fileName, fileSize } = await req.json();
    
    if (!assetID) {
      throw new Error('AssetID is required');
    }

    console.log('Processing assetID:', assetID, 'for file:', fileName);

    // Initialize services
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const dbOps = new DatabaseOperations(supabaseUrl, supabaseKey);

    // Verify authenticated user
    const token = authHeader.replace('Bearer ', '');
    const user = await dbOps.verifyUser(token);

    // Get Adobe credentials
    const adobeClientId = Deno.env.get('ADOBE_CLIENT_ID');
    const adobeClientSecret = Deno.env.get('ADOBE_CLIENT_SECRET');
    const adobeOrgId = Deno.env.get('ADOBE_ORG_ID');

    if (!adobeClientId || !adobeClientSecret || !adobeOrgId) {
      throw new Error('Adobe API credentials not configured');
    }

    // Get Adobe access token
    console.log('Getting Adobe access token for processing...');
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

    // Start extraction with existing assetID
    console.log('Starting extraction with assetID:', assetID);
    const extractPayload = {
      assetID: assetID,
      elementsToExtract: ['text', 'tables'],
      tableOutputFormat: 'xlsx',
      getCharBounds: false,
      includeStyling: true
    };

    const extractResponse = await fetch('https://pdf-services.adobe.io/operation/extractpdf', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'X-API-Key': adobeClientId,
        'X-Adobe-Organization-Id': adobeOrgId,
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

    // Poll for result
    let extractResult;
    let attempts = 0;
    const maxAttempts = 40;
    let waitTime = 3000;

    while (attempts < maxAttempts) {
      console.log(`Polling attempt ${attempts + 1}/${maxAttempts}, waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      const pollResponse = await fetch(location, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'X-API-Key': adobeClientId,
          'X-Adobe-Organization-Id': adobeOrgId,
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

    // Download and process results
    const resultUrl = extractResult.asset.downloadUri;
    console.log('Downloading extraction result from:', resultUrl);
    
    const resultResponse = await fetch(resultUrl);
    if (!resultResponse.ok) {
      throw new Error(`Failed to download result: ${resultResponse.status}`);
    }
    
    const resultData = await resultResponse.json();
    console.log('Result data downloaded successfully, processing...');

    // Parse extracted data
    const structuredData = DataParser.parseAdobeData(resultData);
    console.log('Data processing completed:', {
      itemsFound: structuredData.items.length,
      totalValue: structuredData.total,
      clientFound: !!structuredData.client
    });

    // Save to database (create mock file object)
    const mockFile = {
      name: fileName,
      size: fileSize || 0
    };
    const savedData = await dbOps.saveExtractedData(user, mockFile as File, resultData, structuredData);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: savedData.id,
          ...structuredData
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Process Adobe Extraction Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.stack
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
