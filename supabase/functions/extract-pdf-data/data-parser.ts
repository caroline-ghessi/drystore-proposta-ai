
import type { ExtractedData } from './types.ts';
import { ClientExtractor } from './client-extractor.ts';
import { TextParsers } from './text-parsers.ts';
import { TableProcessor } from './table-processor.ts';

export class DataParser {
  static parseAdobeData(adobeData: any): ExtractedData {
    console.log('Parsing Adobe data...');
    
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

      console.log('Extracted text length:', allText.length);

      // Extract proposal number
      result.proposalNumber = TextParsers.extractProposalNumber(allText);

      // Extract client name with improved Drystore-specific logic
      const clientName = ClientExtractor.extractDrystoreClientName(allText);
      if (clientName) {
        result.client = clientName;
        console.log('✅ Cliente Drystore identificado:', clientName);
      } else {
        // Fallback para padrões genéricos melhorados
        result.client = ClientExtractor.extractBrazilianClientImproved(allText);
      }

      // Extract tables
      const tables = adobeData.tables || [];
      
      tables.forEach((table: any, tableIndex: number) => {
        console.log(`Processing table ${tableIndex + 1}:`, table);
        TableProcessor.processTable(table, result);
      });

      // Calculate totals
      result.subtotal = result.items.reduce((sum, item) => sum + item.total, 0);
      result.total = result.subtotal;

      // Extract additional information
      TextParsers.extractPaymentTerms(allText, result);
      TextParsers.extractDeliveryInfo(allText, result);
      TextParsers.extractVendorInfo(allText, result);

      console.log(`Parsing completed: ${result.items.length} items, total: R$ ${result.total.toFixed(2)}, proposal number: ${result.proposalNumber || 'not found'}, client: ${result.client || 'not found'}`);

    } catch (error) {
      console.error('Error parsing Adobe data:', error);
    }

    return result;
  }
}
