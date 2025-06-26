
import type { ExtractedData } from './types.ts';
import { ClientExtractor } from './client-extractor.ts';
import { TextParsers } from './text-parsers.ts';
import { TableProcessor } from './table-processor.ts';

export class DataParser {
  static parseAdobeData(adobeData: any): ExtractedData {
    console.log('🔍 Starting ENHANCED PDF parsing with improved client extraction...');
    
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
      console.log('📄 Text preview for client extraction:', allText.substring(0, 300));

      // Extract proposal number first
      result.proposalNumber = TextParsers.extractProposalNumber(allText);

      // Enhanced client name extraction with improved Drystore-specific logic
      console.log('🎯 Starting enhanced client name extraction...');
      const clientName = ClientExtractor.extractDrystoreClientName(allText);
      if (clientName) {
        result.client = clientName;
        console.log('✅ Cliente Drystore identificado com sucesso:', clientName);
      } else {
        console.log('⚠️ Fallback para padrões genéricos...');
        // Fallback para padrões genéricos melhorados
        result.client = ClientExtractor.extractBrazilianClientImproved(allText);
        if (result.client) {
          console.log('✅ Cliente identificado via fallback:', result.client);
        } else {
          console.log('❌ Nenhum cliente identificado');
        }
      }

      // Extract tables
      const tables = adobeData.tables || [];
      
      tables.forEach((table: any, tableIndex: number) => {
        console.log(`🔍 Processing table ${tableIndex + 1}:`, table);
        TableProcessor.processTable(table, result);
      });

      // Calculate totals
      result.subtotal = result.items.reduce((sum, item) => sum + item.total, 0);
      result.total = result.subtotal;

      // Extract additional information
      TextParsers.extractPaymentTerms(allText, result);
      TextParsers.extractDeliveryInfo(allText, result);
      TextParsers.extractVendorInfo(allText, result);

      console.log(`✅ Enhanced parsing completed: ${result.items.length} items, total: R$ ${result.total.toFixed(2)}, proposal number: ${result.proposalNumber || 'not found'}, client: ${result.client || 'NOT FOUND'}`);

      // Log final result for debugging
      if (!result.client || result.client.includes('PROPOSTA') || result.client.includes('COMERCIAL')) {
        console.log('🚨 PROBLEMA DETECTADO: Cliente não foi extraído corretamente');
        console.log('🔍 Texto completo para análise manual:', allText);
      }

    } catch (error) {
      console.error('❌ Error in enhanced parsing:', error);
    }

    return result;
  }
}
