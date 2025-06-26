
import type { ExtractedData, ColumnMapping, TableRow, ParsedItem } from './types.ts';
import { TextParsers } from './text-parsers.ts';
import { ItemValidator } from './validation.ts';

export class TableProcessor {
  static processBrazilianTableComprehensive(table: any, result: ExtractedData): void {
    const rows = table.rows || [];
    
    if (rows.length < 2) {
      console.log('⚠️ Table too small, skipping...');
      return;
    }

    console.log(`📋 Table has ${rows.length} total rows to analyze`);

    // Detectar cabeçalho da tabela
    let headerRowIndex = this.findBrazilianTableHeader(rows);
    console.log(`📋 Header detected at row: ${headerRowIndex}`);

    // Mapear colunas baseado no cabeçalho
    const columnMapping = this.mapBrazilianTableColumns(rows[headerRowIndex]);
    console.log('🗂️ Column mapping:', columnMapping);

    // Processar todas as linhas
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      const cells = row.cells || [];
      
      console.log(`🔍 Analyzing row ${i}:`, cells.map(c => c.content || '').join(' | '));
      
      if (cells.length < 2) {
        console.log(`⏭️ Row ${i} skipped - insufficient cells (${cells.length})`);
        continue;
      }

      const item = this.extractBrazilianItemFromRowRobust(cells, columnMapping, i);
      
      if (item && ItemValidator.isValidBrazilianItem(item)) {
        result.items.push(item);
        console.log(`✅ Added item ${result.items.length}: ${item.description} - Qty: ${item.quantity} - Price: R$ ${item.unitPrice} - Total: R$ ${item.total}`);
      } else {
        console.log(`❌ Row ${i} rejected - invalid item:`, item);
      }
    }

    console.log(`📊 Final table processing result: ${result.items.length} items extracted`);
  }

  private static findBrazilianTableHeader(rows: any[]): number {
    const headerKeywords = [
      'descrição', 'description', 'produto', 'item',
      'quantidade', 'qtd', 'qty', 'quant',
      'valor', 'preço', 'price', 'unitário', 'unit',
      'total', 'subtotal'
    ];

    for (let i = 0; i < Math.min(3, rows.length); i++) {
      const row = rows[i];
      const cells = row.cells || [];
      const headerText = cells.map((cell: any) => (cell.content || '').toLowerCase()).join(' ');
      
      const keywordCount = headerKeywords.filter(keyword => 
        headerText.includes(keyword)
      ).length;
      
      if (keywordCount >= 2) {
        return i;
      }
    }

    return 0; // Default to first row
  }

  private static mapBrazilianTableColumns(headerRow: any): ColumnMapping {
    const cells = headerRow.cells || [];
    const mapping: ColumnMapping = {
      description: -1,
      quantity: -1,
      unitPrice: -1,
      total: -1,
      unit: -1
    };

    cells.forEach((cell: any, index: number) => {
      const content = (cell.content || '').toLowerCase();
      
      if (content.includes('descrição') || content.includes('produto') || content.includes('item')) {
        mapping.description = index;
      }
      else if (content.includes('quantidade') || content.includes('qtd') || content.includes('qty')) {
        mapping.quantity = index;
      }
      else if (content.includes('unitário') || content.includes('unit') || content.includes('preço')) {
        mapping.unitPrice = index;
      }
      else if (content.includes('total') && !content.includes('subtotal')) {
        mapping.total = index;
      }
    });

    // Fallback inteligente baseado na posição
    if (mapping.description === -1 && cells.length >= 1) mapping.description = 0;
    if (mapping.quantity === -1 && cells.length >= 2) mapping.quantity = 1;
    if (mapping.unitPrice === -1 && cells.length >= 3) mapping.unitPrice = 2;
    if (mapping.total === -1 && cells.length >= 4) mapping.total = 3;

    return mapping;
  }

  private static extractBrazilianItemFromRowRobust(cells: any[], mapping: ColumnMapping, rowIndex: number): ParsedItem | null {
    const description = mapping.description >= 0 ? 
      (cells[mapping.description]?.content || '').trim() : 
      (cells[0]?.content || '').trim();
    
    const quantityText = mapping.quantity >= 0 ? 
      (cells[mapping.quantity]?.content || '0').trim() : 
      (cells[1]?.content || '0').trim();
    
    const unitPriceText = mapping.unitPrice >= 0 ? 
      (cells[mapping.unitPrice]?.content || '0').trim() : 
      (cells[2]?.content || '0').trim();
    
    const totalText = mapping.total >= 0 ? 
      (cells[mapping.total]?.content || '0').trim() : 
      (cells[3]?.content || '0').trim();

    console.log(`🧮 Row ${rowIndex} extraction: desc="${description}", qty="${quantityText}", price="${unitPriceText}", total="${totalText}"`);

    const quantity = TextParsers.parseBrazilianNumber(quantityText);
    const unitPrice = TextParsers.parseBrazilianCurrency(unitPriceText);
    let total = totalText ? TextParsers.parseBrazilianCurrency(totalText) : 0;
    
    if (total === 0 && quantity > 0 && unitPrice > 0) {
      total = quantity * unitPrice;
      console.log(`🧮 Calculated total for row ${rowIndex}: ${quantity} × ${unitPrice} = ${total}`);
    }

    const unit = TextParsers.extractBrazilianUnit(quantityText) || 'UN';

    const item: ParsedItem = {
      description: description,
      quantity,
      unit,
      unitPrice,
      total
    };

    console.log(`📦 Processed item from row ${rowIndex}:`, item);
    return item;
  }
}
