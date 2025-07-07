// Google Vision API integration utilities for ERP PDF processing

import type { ProcessingConfig } from './types.ts';

export class GoogleVisionClient {
  private config: ProcessingConfig;

  constructor(config: ProcessingConfig) {
    this.config = config;
  }

  async callGoogleVisionWithRetry(base64Data: string, accessToken: string, fileName: string): Promise<string> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      const startProcess = Date.now();
      console.log(`🚀 Google Vision API for ERP attempt ${attempt}/${this.config.maxRetries}...`);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutApiMs);

        const response = await fetch('https://vision.googleapis.com/v1/images:annotate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Drystore-ERP-Processor/1.0'
          },
          body: JSON.stringify({
            requests: [{
              image: { content: base64Data },
              features: [{ type: 'TEXT_DETECTION', maxResults: 1 }]
            }]
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log(`📡 Google Vision API Response for ERP (attempt ${attempt}):`, {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          processTime: Date.now() - startProcess + 'ms'
        });

        if (!response.ok) {
          const errorText = await response.text();
          const apiError = new Error(`Google Vision API failed: ${response.status} - ${errorText.substring(0, 200)}`);
          
          // Rate limiting ou erro temporário - tentar novamente
          if (response.status === 429 || response.status >= 500) {
            console.warn(`⚠️ Temporary error (${response.status}), will retry...`);
            lastError = apiError;
            
            if (attempt < this.config.maxRetries) {
              const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
              console.log(`⏳ Waiting ${delay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }
          
          throw apiError;
        }

        const result = await response.json();
        
        // Validação defensiva + diagnóstico detalhado para ERP
        console.log('🔍 Google Vision API Raw Response for ERP:', {
          hasResult: !!result,
          hasResponses: !!result?.responses,
          responsesType: Array.isArray(result?.responses) ? 'array' : typeof result?.responses,
          responsesLength: Array.isArray(result?.responses) ? result.responses.length : 'not array',
          firstResponse: result?.responses?.[0] ? 'exists' : 'null/undefined',
          hasTextAnnotations: !!result?.responses?.[0]?.textAnnotations,
          textAnnotationsType: Array.isArray(result?.responses?.[0]?.textAnnotations) ? 'array' : typeof result?.responses?.[0]?.textAnnotations,
          textAnnotationsLength: Array.isArray(result?.responses?.[0]?.textAnnotations) ? result.responses[0].textAnnotations.length : 'not array'
        });
        
        // Validação defensiva robusta
        if (!result) {
          console.error('❌ Google Vision API returned null/undefined result');
          throw new Error('Google Vision API returned empty result');
        }
        
        if (!result.responses || !Array.isArray(result.responses)) {
          console.error('❌ Google Vision API: responses is not an array:', typeof result.responses);
          throw new Error('Google Vision API: invalid responses structure');
        }
        
        if (result.responses.length === 0) {
          console.error('❌ Google Vision API: responses array is empty');
          throw new Error('Google Vision API: no responses returned');
        }
        
        const firstResponse = result.responses[0];
        if (!firstResponse) {
          console.error('❌ Google Vision API: first response is null/undefined');
          throw new Error('Google Vision API: first response is empty');
        }
        
        const textAnnotations = firstResponse.textAnnotations;
        if (!textAnnotations || !Array.isArray(textAnnotations)) {
          console.error('❌ Google Vision API: textAnnotations is not an array:', typeof textAnnotations);
          throw new Error('Google Vision API: textAnnotations is invalid or empty');
        }
        
        if (textAnnotations.length === 0) {
          console.warn('⚠️ Google Vision API: textAnnotations array is empty');
          throw new Error('No text detected by Google Vision API');
        }
        
        const firstAnnotation = textAnnotations[0];
        if (!firstAnnotation || !firstAnnotation.description) {
          console.error('❌ Google Vision API: first annotation has no description:', firstAnnotation);
          throw new Error('Google Vision API: first annotation is invalid');
        }

        const fullText = firstAnnotation.description;
        
        console.log('📊 ERP OCR Text Extraction Metrics:', {
          totalCharacters: fullText.length,
          totalLines: fullText.split('\n').length,
          confidence: firstAnnotation.confidence || 'not provided',
          processingTime: Date.now() - startProcess + 'ms',
          totalAnnotations: textAnnotations.length,
          annotationSample: fullText.substring(0, 100) + '...'
        });

        return fullText;

      } catch (error) {
        console.error(`❌ Google Vision API attempt ${attempt} failed:`, error.message);
        lastError = error as Error;
        
        if (error.name === 'AbortError') {
          lastError = new Error(`Google Vision API timeout after ${this.config.timeoutApiMs}ms`);
        }
        
        // Se não é o último attempt, aguardar antes de tentar novamente
        if (attempt < this.config.maxRetries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
          console.log(`⏳ Waiting ${delay}ms before retry ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // Todos os attempts falharam
    console.error(`❌ All ${this.config.maxRetries} attempts failed. Last error:`, lastError!.message);
    throw lastError!;
  }
}