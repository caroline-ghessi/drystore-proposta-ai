
import type { ExtractedData } from './types.ts';

export class TableProcessor {
  static processTable(table: any, result: ExtractedData): void {
    console.log('🔍 Processing table with enhanced Brazilian ERP logic:', table);
    
    const rows = table.rows || [];
    console.log(`📊 Table has ${rows.length} rows`);
    
    // Identify header automatically with Brazilian terms
    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(3, rows.length); i++) {
      const row = rows[i];
      const cells = row.cells || [];
      const headerText = cells.map((cell: any) => cell.content || '').join(' ').toLowerCase();
      
      console.log(`Row ${i} header analysis:`, headerText);
      
      if (headerText.includes('descrição') || headerText.includes('item') || 
          headerText.includes('produto') || headerText.includes('quantidade') ||
          headerText.includes('qtd') || headerText.includes('valor') ||
          headerText.includes('unitário') || headerText.includes('total')) {
        headerRowIndex = i;
        console.log(`✅ Header found at row ${i}`);
        break;
      }
    }

    // Enhanced processing for all data rows
    let itemsFound = 0;
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      const cells = row.cells || [];
      
      console.log(`Processing row ${i} with ${cells.length} cells:`, 
        cells.map((cell: any) => cell.content || '').join(' | '));
      
      if (cells.length >= 3) {
        // Try different column arrangements for Brazilian ERP formats
        const item = this.extractItemFromRow(cells, i);
        
        if (item && item.description && item.description.length > 3) {
          result.items.push(item);
          itemsFound++;
          console.log(`✅ Item ${itemsFound} added: ${item.description} - Qty: ${item.quantity} - Price: R$ ${item.unitPrice} - Total: R$ ${item.total}`);
        } else {
          console.log(`⚠️ Row ${i} skipped - insufficient data or invalid format`);
        }
      }
    }
    
    console.log(`🎯 Table processing completed: ${itemsFound} items extracted from ${rows.length - headerRowIndex - 1} data rows`);
  }

  private static extractItemFromRow(cells: any[], rowIndex: number): any {
    // Try multiple column arrangements for Brazilian ERP systems
    const arrangements = [
      // Arrangement 1: [Description, Quantity, Unit, UnitPrice, Total]
      { desc: 0, qty: 1, unit: 2, price: 3, total: 4 },
      // Arrangement 2: [Code, Description, Quantity, UnitPrice, Total]
      { desc: 1, qty: 2, unit: 3, price: 3, total: 4 },
      // Arrangement 3: [Description, Quantity, UnitPrice, Total]
      { desc: 0, qty: 1, unit: 2, price: 2, total: 3 },
      // Arrangement 4: Simple format
      { desc: 0, qty: 1, price: 2, total: 3 }
    ];

    for (const arrangement of arrangements) {
      try {
        const description = this.cleanText(cells[arrangement.desc]?.content || '');
        const quantityText = cells[arrangement.qty]?.content || '0';
        const unitPriceText = cells[arrangement.price]?.content || '0';
        const totalText = cells[arrangement.total]?.content || '';

        // Enhanced number parsing for Brazilian format
        const quantity = this.parseBrazilianNumber(quantityText);
        const unitPrice = this.parseBrazilianNumber(unitPriceText);
        const total = totalText ? this.parseBrazilianNumber(totalText) : (quantity * unitPrice);

        // Extract unit (PC, M, KG, etc.)
        const unit = this.extractUnit(quantityText) || 'PC';

        // Validate if this looks like a valid item
        if (description && description.length > 3 && quantity > 0 && 
            (unitPrice > 0 || total > 0) && !this.isHeaderText(description)) {
          
          return {
            description: description,
            quantity,
            unit,
            unitPrice: unitPrice || (total / quantity),
            total: total || (quantity * unitPrice)
          };
        }
      } catch (error) {
        console.log(`⚠️ Arrangement failed for row ${rowIndex}:`, error.message);
        continue;
      }
    }

    return null;
  }

  private static cleanText(text: string): string {
    return text.trim()
      .replace(/^\d+\s+/, '') // Remove leading numbers (item codes)
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  private static parseBrazilianNumber(text: string): number {
    if (!text) return 0;
    
    // Remove currency symbols and spaces
    let cleanText = text.replace(/[R$\s]/g, '');
    
    // Handle Brazilian number format (1.234,56)
    if (cleanText.includes(',') && cleanText.includes('.')) {
      // Format: 1.234,56 -> 1234.56
      cleanText = cleanText.replace(/\./g, '').replace(',', '.');
    } else if (cleanText.includes(',')) {
      // Format: 1234,56 -> 1234.56
      cleanText = cleanText.replace(',', '.');
    }
    
    // Extract only numbers and decimal point
    cleanText = cleanText.replace(/[^\d.]/g, '');
    
    const parsed = parseFloat(cleanText);
    return isNaN(parsed) ? 0 : parsed;
  }

  private static extractUnit(text: string): string | null {
    const unitMatch = text.match(/\b(PC|UN|M|KG|MT|CM|MM|L|ML|CX|SC|RL|GL)\b/i);
    return unitMatch ? unitMatch[1].toUpperCase() : null;
  }

  private static isHeaderText(text: string): boolean {
    const headerKeywords = [
      'descrição', 'item', 'produto', 'quantidade', 'qtd', 
      'valor', 'unitário', 'total', 'unidade', 'preço'
    ];
    
    const lowerText = text.toLowerCase();
    return headerKeywords.some(keyword => lowerText.includes(keyword));
  }
}
