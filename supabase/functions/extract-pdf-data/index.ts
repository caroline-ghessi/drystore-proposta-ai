
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { AdobeClient } from './adobe-client.ts'
import { DataParser } from './data-parser.ts'
import { DatabaseOperations } from './database-operations.ts'
import { FileValidator } from './validation.ts'

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
    console.log('=== ADOBE PDF EXTRACTION STARTED ===');
    
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Initialize services
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const dbOps = new DatabaseOperations(supabaseUrl, supabaseKey);

    // Verify authenticated user
    const token = authHeader.replace('Bearer ', '');
    const user = await dbOps.verifyUser(token);

    // Parse form data and validate file
    const formData = await req.formData();
    const file = formData.get('file') as File;
    FileValidator.validateFile(file);

    // Validate Adobe credentials and create client
    const adobeCredentials = FileValidator.validateAdobeCredentials();
    const adobeClient = new AdobeClient(adobeCredentials);

    // Adobe PDF extraction workflow
    const accessToken = await adobeClient.getAccessToken();
    const assetID = await adobeClient.uploadFile(file, accessToken);
    const location = await adobeClient.startExtraction(assetID, accessToken);
    const extractResult = await adobeClient.pollExtractionResult(location, accessToken);
    
    // Download and process results
    const resultUrl = extractResult.asset.downloadUri;
    const resultData = await adobeClient.downloadResult(resultUrl);

    // Parse extracted data
    const structuredData = DataParser.parseAdobeData(resultData);
    console.log('Data processing completed:', {
      itemsFound: structuredData.items.length,
      totalValue: structuredData.total,
      clientFound: !!structuredData.client
    });

    // Save to database
    const savedData = await dbOps.saveExtractedData(user, file, resultData, structuredData);

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
    console.error('Extract PDF Data Error:', error);
    
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
