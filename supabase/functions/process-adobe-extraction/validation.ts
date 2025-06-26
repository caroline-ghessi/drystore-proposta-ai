
import type { ParsedItem, ExtractedData } from './types.ts';

export class ItemValidator {
  static isValidBrazilianItem(item: ParsedItem): boolean {
    const hasDescription = item.description && item.description.length > 2;
    const hasQuantity = item.quantity > 0;
    const hasValue = item.unitPrice > 0 || item.total > 0;
    
    // Item é válido se tem descrição E (quantidade OU valor)
    const isValid = hasDescription && (hasQuantity || hasValue);
    
    console.log(`✅ Item validation: desc=${hasDescription}, qty=${hasQuantity}, value=${hasValue} → valid=${isValid}`);
    
    // Rejeitar apenas se for claramente um cabeçalho ou linha vazia
    const isHeader = /^(descrição|código|item|produto|quantidade|qtd|valor|preço|total|subtotal)$/i.test(item.description);
    
    return isValid && !isHeader;
  }

  static validateTotalDiscrepancy(result: ExtractedData): void {
    const expectedTotals = [17188.80, 14047.20]; // Valores conhecidos do PDF
    const calculatedTotal = result.total;
    
    console.log(`💰 Total validation: calculated=${calculatedTotal.toFixed(2)}`);
    
    for (const expected of expectedTotals) {
      const discrepancy = Math.abs(calculatedTotal - expected);
      const percentDiff = (discrepancy / expected) * 100;
      
      console.log(`📊 Against expected ${expected}: diff=${discrepancy.toFixed(2)} (${percentDiff.toFixed(1)}%)`);
      
      if (discrepancy > 1000) {
        console.log(`⚠️ LARGE DISCREPANCY DETECTED: Missing items worth R$ ${discrepancy.toFixed(2)}`);
      }
    }
  }
}
