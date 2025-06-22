
export interface ExtractedData {
  client?: string;
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  total: number;
  paymentTerms?: string;
  delivery?: string;
  vendor?: string;
}

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

      // Improve client identification
      const clientPatterns = [
        /(?:cliente|client|para):\s*([A-Z\s&\-\.]+)/i,
        /(?:razão social|empresa):\s*([A-Z\s&\-\.]+)/i,
        /(?:cnpj)[\s:]*\d+[\s\/\-]*\d+[\s\/\-]*\d+[\s\/\-]*\d+[\s\-]*\d+\s*([A-Z\s&\-\.]+)/i
      ];

      for (const pattern of clientPatterns) {
        const match = allText.match(pattern);
        if (match && match[1].trim().length > 3) {
          result.client = match[1].trim();
          break;
        }
      }

      // Extract tables
      const tables = adobeData.tables || [];
      
      tables.forEach((table: any, tableIndex: number) => {
        console.log(`Processing table ${tableIndex + 1}:`, table);
        
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
      });

      // Calculate totals
      result.subtotal = result.items.reduce((sum, item) => sum + item.total, 0);
      result.total = result.subtotal;

      // Extract additional information
      this.extractPaymentTerms(allText, result);
      this.extractDeliveryInfo(allText, result);
      this.extractVendorInfo(allText, result);

      console.log(`Parsing completed: ${result.items.length} items, total: R$ ${result.total.toFixed(2)}`);

    } catch (error) {
      console.error('Error parsing Adobe data:', error);
    }

    return result;
  }

  private static extractPaymentTerms(text: string, result: ExtractedData): void {
    const paymentPatterns = [
      /(?:pagamento|payment|condições):\s*([^.\n\r]+)/i,
      /(?:prazo|forma de pagamento):\s*([^.\n\r]+)/i
    ];

    for (const pattern of paymentPatterns) {
      const match = text.match(pattern);
      if (match) {
        result.paymentTerms = match[1].trim();
        break;
      }
    }
  }

  private static extractDeliveryInfo(text: string, result: ExtractedData): void {
    const deliveryPatterns = [
      /(?:entrega|delivery|prazo de entrega):\s*([^.\n\r]+)/i,
      /(?:data de entrega|entregar em):\s*([^.\n\r]+)/i
    ];

    for (const pattern of deliveryPatterns) {
      const match = text.match(pattern);
      if (match) {
        result.delivery = match[1].trim();
        break;
      }
    }
  }

  private static extractVendorInfo(text: string, result: ExtractedData): void {
    const vendorPatterns = [
      /(?:vendedor|representante|atendente):\s*([A-Z\s]+)/i,
      /(?:responsável|consultor):\s*([A-Z\s]+)/i
    ];

    for (const pattern of vendorPatterns) {
      const match = text.match(pattern);
      if (match && match[1].trim().length > 3) {
        result.vendor = match[1].trim();
        break;
      }
    }
  }
}
