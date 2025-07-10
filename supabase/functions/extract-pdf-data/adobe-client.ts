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

  async getAccessToken(correlationId?: string): Promise<string> {
    const logPrefix = correlationId ? `[${correlationId}]` : '';
    console.log(`${logPrefix} 🔐 Iniciando autenticação Adobe...`);
    
    // Validar credenciais antes de tentar autenticar
    if (!this.credentials.clientId || !this.credentials.clientSecret || !this.credentials.orgId) {
      throw new Error('Adobe credentials incomplete');
    }
    
    try {
      // Usar v1 da API conforme documentação Adobe
      const response = await fetch('https://ims-na1.adobelogin.com/ims/token/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.credentials.clientId,
          client_secret: this.credentials.clientSecret,
          grant_type: 'client_credentials',
          scope: 'openid,AdobeID,read_organizations,additional_info.projectedProductContext'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`${logPrefix} ❌ Erro na autenticação Adobe:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          clientId: this.credentials.clientId.substring(0, 8) + '...'
        });
        throw new Error(`Adobe authentication failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.access_token) {
        console.error(`${logPrefix} ❌ Token não encontrado na resposta:`, data);
        throw new Error('Access token not found in Adobe response');
      }
      
      console.log(`${logPrefix} ✅ Token Adobe obtido com sucesso (expires in ${data.expires_in || 'unknown'}s)`);
      return data.access_token;

    } catch (error) {
      console.error(`${logPrefix} ❌ Erro ao obter token Adobe:`, {
        error: error.message,
        stack: error.stack,
        credentials: {
          clientId: this.credentials.clientId ? this.credentials.clientId.substring(0, 8) + '...' : 'missing',
          hasSecret: !!this.credentials.clientSecret,
          hasOrgId: !!this.credentials.orgId
        }
      });
      throw new Error(`Failed to get Adobe access token: ${error.message}`);
    }
  }

  async uploadFile(file: File, accessToken: string, correlationId?: string): Promise<string> {
    const logPrefix = correlationId ? `[${correlationId}]` : '';
    console.log(`${logPrefix} 📤 Iniciando upload para Adobe...`);
    return await this.uploadFileDirect(file, accessToken, correlationId);
  }

  private async uploadFileDirect(file: File, accessToken: string, correlationId?: string): Promise<string> {
    const logPrefix = correlationId ? `[${correlationId}]` : '';
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log(`${logPrefix} 📤 Fazendo upload direto do arquivo:`, {
        nome: file.name,
        tamanho: file.size,
        tipo: file.type,
        correlationId
      });

      // Implementar timeout mais robusto (120 segundos)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      try {
        const uploadResponse = await fetch('https://pdf-services.adobe.io/assets', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-API-Key': this.credentials.clientId,
          },
          body: formData,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error(`${logPrefix} ❌ Erro no upload:`, {
            status: uploadResponse.status,
            statusText: uploadResponse.statusText,
            error: errorText,
            correlationId
          });
          throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
        }

        const uploadData = await uploadResponse.json();
        
        if (!uploadData.assetID) {
          console.error(`${logPrefix} ❌ Asset ID não encontrado na resposta:`, uploadData);
          throw new Error('Asset ID not found in upload response');
        }
        
        console.log(`${logPrefix} ✅ Upload concluído. Asset ID:`, uploadData.assetID);
        return uploadData.assetID;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Upload timeout (120s exceeded)');
        }
        throw error;
      }

    } catch (error) {
      console.error(`${logPrefix} ❌ Erro durante upload:`, {
        error: error.message,
        stack: error.stack,
        fileName: file.name,
        fileSize: file.size,
        correlationId
      });
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  async startExtraction(assetID: string, accessToken: string, correlationId?: string): Promise<string> {
    const logPrefix = correlationId ? `[${correlationId}]` : '';
    console.log(`${logPrefix} 🔄 Iniciando extração de dados...`);
    
    try {
      const extractionPayload = {
        assetID: assetID,
        getCharBounds: true,
        includeStyling: true,
        elementsToExtract: ['text', 'tables'],
        elementsToExtractRenditions: ['tables', 'figures'],
        renditionsToExtract: ['tables', 'figures']
      };

      console.log(`${logPrefix} 📋 Payload de extração:`, {
        ...extractionPayload,
        correlationId
      });

      // Implementar timeout robusto
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      try {
        const extractionResponse = await fetch('https://pdf-services.adobe.io/operation/extractpdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'X-API-Key': this.credentials.clientId,
          },
          body: JSON.stringify(extractionPayload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!extractionResponse.ok) {
          const errorText = await extractionResponse.text();
          console.error(`${logPrefix} ❌ Erro ao iniciar extração:`, {
            status: extractionResponse.status,
            statusText: extractionResponse.statusText,
            error: errorText,
            assetID,
            correlationId
          });
          throw new Error(`Extraction failed: ${extractionResponse.status} - ${errorText}`);
        }

        const extractionData = await extractionResponse.json();
        const location = extractionResponse.headers.get('location');
        
        if (!location) {
          console.error(`${logPrefix} ❌ Location header não encontrado na resposta:`, extractionData);
          throw new Error('Location header not found in extraction response');
        }

        console.log(`${logPrefix} ✅ Extração iniciada. Location:`, location);
        return location;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Extraction start timeout (120s exceeded)');
        }
        throw error;
      }

    } catch (error) {
      console.error(`${logPrefix} ❌ Erro ao iniciar extração:`, {
        error: error.message,
        stack: error.stack,
        assetID,
        correlationId
      });
      throw new Error(`Failed to start extraction: ${error.message}`);
    }
  }

  async pollExtractionResult(location: string, accessToken: string, correlationId?: string): Promise<any> {
    const logPrefix = correlationId ? `[${correlationId}]` : '';
    console.log(`${logPrefix} ⏳ Aguardando resultado da extração...`);
    
    // Polling mais inteligente baseado no timeout total
    const maxAttempts = 60; // 60 tentativas
    const pollInterval = 3000; // 3 segundos
    const maxTotalTime = 180000; // 3 minutos total
    const startTime = Date.now();
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // Verificar timeout total
      if (Date.now() - startTime > maxTotalTime) {
        throw new Error(`Extraction timeout: exceeded ${maxTotalTime / 1000}s total time`);
      }
      
      try {
        console.log(`${logPrefix} 🔄 Tentativa ${attempt}/${maxAttempts} - Verificando status... (${Math.round((Date.now() - startTime) / 1000)}s)`);
        
        // Implementar timeout para cada request de polling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s por request
        
        try {
          const response = await fetch(location, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'X-API-Key': this.credentials.clientId,
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.status === 200) {
            const result = await response.json();
            console.log(`${logPrefix} ✅ Extração concluída com sucesso! (${Math.round((Date.now() - startTime) / 1000)}s total)`);
            return result;
          } else if (response.status === 202) {
            console.log(`${logPrefix} ⏳ Processamento em andamento... (tentativa ${attempt}, ${Math.round((Date.now() - startTime) / 1000)}s)`);
            if (attempt < maxAttempts) {
              // Backoff exponencial limitado
              const delay = Math.min(pollInterval * Math.pow(1.1, attempt - 1), 10000);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          } else {
            const errorText = await response.text();
            console.error(`${logPrefix} ❌ Erro no polling (tentativa ${attempt}):`, {
              status: response.status,
              statusText: response.statusText,
              error: errorText,
              location,
              correlationId
            });
            throw new Error(`Polling failed: ${response.status} - ${errorText}`);
          }
        } catch (error) {
          clearTimeout(timeoutId);
          if (error.name === 'AbortError') {
            console.log(`${logPrefix} ⚠️ Polling request timeout (30s), retrying...`);
            continue;
          }
          throw error;
        }
      } catch (error) {
        console.error(`${logPrefix} ❌ Erro na tentativa ${attempt}:`, {
          error: error.message,
          attempt,
          totalTime: Math.round((Date.now() - startTime) / 1000),
          correlationId
        });
        
        if (attempt === maxAttempts) {
          throw error;
        }
        
        // Retry com delay
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
    
    throw new Error(`Extraction timed out after ${maxAttempts} attempts (${Math.round((Date.now() - startTime) / 1000)}s total)`);
  }

  async downloadResult(resultUrl: string, correlationId?: string): Promise<any> {
    const logPrefix = correlationId ? `[${correlationId}]` : '';
    console.log(`${logPrefix} 📥 Fazendo download do resultado...`);
    
    try {
      // Implementar timeout para download
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s para download
      
      try {
        const response = await fetch(resultUrl, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Download failed: ${response.status} - ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log(`${logPrefix} ✅ Download do resultado concluído (${JSON.stringify(result).length} chars)`);
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Download timeout (60s exceeded)');
        }
        throw error;
      }
    } catch (error) {
      console.error(`${logPrefix} ❌ Erro no download do resultado:`, {
        error: error.message,
        stack: error.stack,
        resultUrl,
        correlationId
      });
      throw new Error(`Failed to download result: ${error.message}`);
    }
  }
}