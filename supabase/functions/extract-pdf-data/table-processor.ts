
import type { ExtractedData } from './types.ts';

export class TableProcessor {
  static processTable(table: any, result: ExtractedData): void {
    console.log('Processing table:', table);
    
    const rows = table.rows || [];
    
    // Identify header automatically
    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(3, rows.length); i++) {
      const row = rows[i];
      const cells = row.cells || [];
      const headerText = cells.map((cell: any) => cell.content || '').join(' ').toLowerCase();
      
      if (headerText.includes('descrição') || headerText.includes('item') || 
          headerText.includes('produto') || headerText.includes('quantidade')) {
        headerRowIndex = i;
        break;
      }
    }

    // Process data rows
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      const cells = row.cells || [];
      
      if (cells.length >= 3) {
        // Extract data from cells
        const description = (cells[0]?.content || '').trim();
        const quantityText = (cells[1]?.content || '0').trim();
        const unitPriceText = (cells[2]?.content || '0').trim();
        const totalText = cells[3] ? (cells[3].content || '0').trim() : '';
        
        // Clean and convert numbers
        const quantity = parseFloat(quantityText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        const unitPrice = parseFloat(unitPriceText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        const total = totalText ? 
          parseFloat(totalText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0 : 
          (quantity * unitPrice);
        
        // Extract unit if possible
        const unitMatch = quantityText.match(/([A-Z]{1,4})\s*$/i);
        const unit = unitMatch ? unitMatch[1] : 'UN';
        
        if (description && description.length > 3 && quantity > 0) {
          result.items.push({
            description: description,
            quantity,
            unit,
            unitPrice,
            total
          });
          console.log(`Added item: ${description} - Qty: ${quantity} - Price: ${unitPrice} - Total: ${total}`);
        }
      }
    }
  }
}
