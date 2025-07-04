// Image processing utilities for energy bill analysis

import type { ProcessingConfig, ImageProcessingResult } from './types.ts';

export class ImageProcessor {
  private config: ProcessingConfig;

  constructor(config: ProcessingConfig) {
    this.config = config;
  }

  async validateImage(fileData: File, fileName: string): Promise<void> {
    const mimeType = fileData.type;
    const fileExtension = fileName.toLowerCase().split('.').pop();
    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const validExtensions = ['jpg', 'jpeg', 'png'];
    
    const isValidType = mimeType ? validMimeTypes.includes(mimeType) : validExtensions.includes(fileExtension);
    
    if (!isValidType) {
      console.error('❌ Invalid file type. Only JPEG and PNG images are supported.');
      throw new Error('Invalid file type. Only JPEG and PNG images are supported.');
    }
    
    if (fileData.size > this.config.maxImageSizeMB * 1024 * 1024) {
      console.error(`❌ Image size (${(fileData.size / (1024 * 1024)).toFixed(2)}MB) exceeds ${this.config.maxImageSizeMB}MB limit.`);
      throw new Error(`Image size exceeds ${this.config.maxImageSizeMB}MB limit.`);
    }

    console.log('✅ File validation passed');
  }

  async optimizeImage(fileData: File): Promise<string> {
    try {
      console.log('🔄 Starting image optimization, original size:', fileData.size);
      
      // Converter para arrayBuffer com timeout
      const arrayBuffer = await Promise.race([
        fileData.arrayBuffer(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout converting image')), this.config.timeoutConvertMs)
        )
      ]);

      console.log('✅ ArrayBuffer created, size:', arrayBuffer.byteLength);

      // Verificar se precisa redimensionar (> 2MB)
      let finalArrayBuffer = arrayBuffer;
      if (arrayBuffer.byteLength > 2 * 1024 * 1024) {
        console.log('📐 Large image detected, attempting resize...');
        finalArrayBuffer = await this.resizeImageIfNeeded(arrayBuffer, fileData.type);
      }

      // Converter para base64 usando método seguro (por chunks)
      const base64Data = this.arrayBufferToBase64(finalArrayBuffer);
      
      console.log('✅ Image optimization completed:', {
        originalSize: fileData.size,
        finalSize: finalArrayBuffer.byteLength,
        base64Length: base64Data.length,
        reduction: ((fileData.size - finalArrayBuffer.byteLength) / fileData.size * 100).toFixed(1) + '%'
      });
      
      return base64Data;
    } catch (error) {
      console.error('❌ Error optimizing image:', error);
      throw new Error('Failed to optimize image for processing: ' + error.message);
    }
  }

  // Conversão base64 segura por chunks (evita call stack overflow)
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 8192; // 8KB chunks para evitar overflow
    
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binary);
  }

  // Redimensionar imagem se necessário
  private async resizeImageIfNeeded(arrayBuffer: ArrayBuffer, mimeType: string): Promise<ArrayBuffer> {
    try {
      const maxWidth = this.config.maxImageWidth;
      const maxHeight = this.config.maxImageHeight;
      
      // Criar blob da imagem original
      const imageBlob = new Blob([arrayBuffer], { type: mimeType });
      const imageUrl = URL.createObjectURL(imageBlob);
      
      // Criar canvas para redimensionamento
      const canvas = new OffscreenCanvas(maxWidth, maxHeight);
      const ctx = canvas.getContext('2d');
      
      // Carregar imagem
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageUrl;
      });
      
      // Calcular dimensões proporcionais
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      // Redimensionar canvas e desenhar imagem
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Converter para blob e depois arrayBuffer
      const resizedBlob = await canvas.convertToBlob({ 
        type: 'image/jpeg', 
        quality: 0.85 // Boa qualidade para OCR
      });
      
      URL.revokeObjectURL(imageUrl);
      console.log('✅ Image resized successfully:', { 
        originalDimensions: `${img.width}x${img.height}`,
        newDimensions: `${width}x${height}`,
        originalSize: arrayBuffer.byteLength,
        newSize: resizedBlob.size
      });
      
      return await resizedBlob.arrayBuffer();
      
    } catch (error) {
      console.warn('⚠️ Image resize failed, using original:', error.message);
      return arrayBuffer; // Fallback para imagem original
    }
  }
}