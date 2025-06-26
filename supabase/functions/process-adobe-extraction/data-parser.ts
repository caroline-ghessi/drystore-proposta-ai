
import type { ExtractedData } from './types.ts';
import { ClientExtractor } from './client-extractor.ts';
import { TableProcessor } from './table-processor.ts';
import { TextParsers } from './text-parsers.ts';
import { ItemValidator } from './validation.ts';

export class DataParser {
  static parseAdobeData(adobeData: any): ExtractedData {
    console.log('🔍 Starting enhanced Brazilian PDF parsing...');
    
    const result: ExtractedData = {
      items: [],
      subtotal: 0,
      total: 0
    };

    try {
      // Extract text to identify client and other information
      const elements = adobeData.elements || [];
      let allText = '';
      
      elements.forEach((element: any) => {
        if (element.Text) {
          allText += element.Text + ' ';
        }
      });

      console.log('📄 Extracted text length:', allText.length);
      console.log('🔤 First 500 chars:', allText.substring(0, 500));

      // Extract Brazilian client information
      result.client = ClientExtractor.extractBrazilianClient(allText);

      // Extract tables with enhanced Brazilian logic
      const tables = adobeData.tables || [];
      
      tables.forEach((table: any, tableIndex: number) => {
        console.log(`🔍 Processing table ${tableIndex + 1}:`, table);
        TableProcessor.processBrazilianTableComprehensive(table, result);
      });

      // Calculate totals
      result.subtotal = result.items.reduce((sum, item) => sum + item.total, 0);
      result.total = result.subtotal;

      // Extract additional Brazilian information
      TextParsers.extractBrazilianPaymentTerms(allText, result);
      TextParsers.extractBrazilianDeliveryInfo(allText, result);
      TextParsers.extractBrazilianVendorInfo(allText, result);

      console.log(`✅ Enhanced parsing completed: ${result.items.length} items, total: R$ ${result.total.toFixed(2)}`);

      // Validate against expected total
      ItemValidator.validateTotalDiscrepancy(result);

    } catch (error) {
      console.error('❌ Error in enhanced parsing:', error);
    }

    return result;
  }
}
