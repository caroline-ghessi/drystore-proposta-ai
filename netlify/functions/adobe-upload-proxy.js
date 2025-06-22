
const https = require('https');
const http = require('http');
const { parse } = require('url');
const { parse: parseMultipart } = require('querystring');

exports.handler = async (event, context) => {
  // Headers CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-adobe-access-token, x-adobe-client-id, x-adobe-org-id',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('=== NETLIFY PROXY: Adobe Upload Started ===');
    
    // Extrair headers da Adobe
    const accessToken = event.headers['x-adobe-access-token'];
    const clientId = event.headers['x-adobe-client-id'];
    const orgId = event.headers['x-adobe-org-id'];

    if (!accessToken || !clientId || !orgId) {
      throw new Error('Missing Adobe credentials in headers');
    }

    console.log('Adobe credentials received, Client ID:', clientId.substring(0, 8) + '...');

    // Parse do body (base64 encoded file from Edge Function)
    const body = JSON.parse(event.body);
    const fileBuffer = Buffer.from(body.fileData, 'base64');
    const fileName = body.fileName;

    console.log('File received:', fileName, 'Size:', fileBuffer.length);

    // Criar multipart/form-data manualmente
    const boundary = '----formdata-' + Math.random().toString(36);
    const delimiter = `\r\n--${boundary}`;
    const closeDelimiter = `\r\n--${boundary}--`;

    let formData = '';
    formData += delimiter;
    formData += `\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"`;
    formData += '\r\nContent-Type: application/pdf\r\n\r\n';
    
    const formDataBuffer = Buffer.concat([
      Buffer.from(formData, 'utf8'),
      fileBuffer,
      Buffer.from(closeDelimiter, 'utf8')
    ]);

    console.log('FormData created, total size:', formDataBuffer.length);

    // Fazer upload para Adobe usando https module
    const uploadResult = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'pdf-services.adobe.io',
        port: 443,
        path: '/assets',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-API-Key': clientId,
          'X-Adobe-Organization-Id': orgId,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': formDataBuffer.length
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          console.log('Adobe response status:', res.statusCode);
          console.log('Adobe response data:', data);
          
          if (res.statusCode === 200 || res.statusCode === 201) {
            try {
              const parsedData = JSON.parse(data);
              resolve(parsedData);
            } catch (e) {
              reject(new Error(`Failed to parse Adobe response: ${data}`));
            }
          } else {
            reject(new Error(`Adobe API error: ${res.statusCode} - ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error('Request error:', error);
        reject(error);
      });

      req.write(formDataBuffer);
      req.end();
    });

    console.log('Upload successful, assetID:', uploadResult.assetID);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(uploadResult)
    };

  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: error.message,
        details: error.stack
      })
    };
  }
};
