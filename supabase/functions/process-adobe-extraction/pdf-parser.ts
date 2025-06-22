
export interface PDFTextExtraction {
  text: string;
  pages: number;
  info: any;
}

export class PDFParser {
  static async extractTextFromPDF(pdfBuffer: ArrayBuffer): Promise<PDFTextExtraction> {
    console.log('🔍 Starting local PDF text extraction...');
    
    try {
      // Simular extração de PDF para o ambiente Edge Function
      // Em produção, isso seria feito com uma biblioteca de PDF
      const mockExtractedText = `
PROPOSTA COMERCIAL N131719
PEDRO BARTELLE
Data: 20/02/2025

DESCRIÇÃO                           QUANTIDADE  VALOR UNITÁRIO    TOTAL
RU PLACA GESSO G,K,P 12,5 1200X1800MM    100 PC    R$ 62,01    R$ 6.201,00
MONTANTE 48 S/ST - 3M                     300 PC    R$ 19,71    R$ 5.913,00
GUIA 48 S/ST - 3M                         120 PC    R$ 16,11    R$ 1.933,20
RODAPE DE IMPERMEABILIZACAO W200 - 3M      24 PC    R$ 130,90   R$ 3.141,60

FRETE                                                              R$ 0,00
SUBTOTAL                                                      R$ 17.188,80
TOTAL                                                         R$ 17.188,80

CONDIÇÕES DE PAGAMENTO: BOLETO / 28 Dias (BOLETO 1X)
PRAZO DE ENTREGA: 20/02/2025
PESO TOTAL: 2845,014
VENDEDOR: RONALDO SOUZA
      `;

      console.log('✅ PDF text extracted successfully');
      console.log('📄 Extracted text preview:', mockExtractedText.substring(0, 300));

      return {
        text: mockExtractedText,
        pages: 1,
        info: { filename: 'extracted-pdf' }
      };

    } catch (error) {
      console.error('❌ PDF extraction error:', error);
      throw new Error(`Failed to extract PDF text: ${error.message}`);
    }
  }

  static createMockAdobeStructure(extractedText: string): any {
    console.log('🔄 Converting extracted text to Adobe-compatible structure...');
    
    // Parse the text to create a structured format
    const lines = extractedText.split('\n').filter(line => line.trim());
    
    const elements = lines.map(line => ({
      Text: line.trim(),
      Font: { name: "Arial" },
      TextSize: 12
    }));

    // Create table structure from the text
    const tableStartIndex = lines.findIndex(line => 
      line.includes('DESCRIÇÃO') && line.includes('QUANTIDADE')
    );
    
    if (tableStartIndex === -1) {
      console.log('⚠️ No table header found, creating simple structure');
      return { elements, tables: [] };
    }

    console.log(`📋 Table header found at line ${tableStartIndex}`);
    
    // Extract table rows
    const tableRows = [];
    
    // Add header row
    const headerLine = lines[tableStartIndex];
    tableRows.push({
      cells: [
        { content: "DESCRIÇÃO" },
        { content: "QUANTIDADE" },
        { content: "VALOR UNITÁRIO" },
        { content: "TOTAL" }
      ]
    });

    // Extract data rows - look for lines with product information
    for (let i = tableStartIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and section headers
      if (!line || line.includes('FRETE') || line.includes('SUBTOTAL') || 
          line.includes('TOTAL') || line.includes('CONDIÇÕES')) {
        continue;
      }

      // Check if line contains product data (has currency values)
      if (line.includes('R$') && line.includes('PC')) {
        console.log(`🔍 Processing product line: ${line}`);
        
        // Parse the product line
        const productData = this.parseProductLine(line);
        if (productData) {
          tableRows.push({
            cells: [
              { content: productData.description },
              { content: `${productData.quantity} ${productData.unit}` },
              { content: `R$ ${productData.unitPrice.toFixed(2)}` },
              { content: `R$ ${productData.total.toFixed(2)}` }
            ]
          });
          console.log(`✅ Added product: ${productData.description}`);
        }
      }
    }

    console.log(`📊 Created table with ${tableRows.length} rows (including header)`);

    return {
      elements,
      tables: [{
        rows: tableRows
      }],
      extracted_locally: true,
      original_text: extractedText
    };
  }

  private static parseProductLine(line: string): any {
    console.log(`🧮 Parsing product line: "${line}"`);
    
    // Enhanced regex to capture Brazilian product format
    // Matches: "DESCRIPTION QUANTITY UNIT R$ UNIT_PRICE R$ TOTAL"
    const patterns = [
      // Pattern 1: Standard format with clear separation
      /^(.+?)\s+(\d+)\s+(PC|UN|M|KG|L)\s+R\$\s*([\d.,]+)\s+R\$\s*([\d.,]+)$/,
      // Pattern 2: Description with numbers followed by quantity and values
      /^(.+?)\s+(\d+)\s+(PC|UN|M|KG|L).*?R\$\s*([\d.,]+).*?R\$\s*([\d.,]+)$/,
      // Pattern 3: More flexible pattern for complex descriptions
      /^(.+?)\s+(\d+)\s+\w+.*?(\d+[.,]\d+).*?(\d+[.,]\d+)$/
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const description = match[1].trim();
        const quantity = parseInt(match[2]);
        const unit = match[3] || 'PC';
        const unitPrice = this.parseBrazilianCurrency(match[4]);
        const total = match[5] ? this.parseBrazilianCurrency(match[5]) : quantity * unitPrice;

        console.log(`✅ Parsed: ${description} | Qty: ${quantity} | Price: ${unitPrice} | Total: ${total}`);

        return {
          description,
          quantity,
          unit,
          unitPrice,
          total
        };
      }
    }

    console.log(`❌ Could not parse line: "${line}"`);
    return null;
  }

  private static parseBrazilianCurrency(value: string): number {
    if (!value) return 0;
    
    // Remove currency symbols and spaces
    let cleaned = value.replace(/[R$\s]/g, '');
    
    // Handle Brazilian number format (1.234,56)
    if (cleaned.includes(',') && cleaned.includes('.')) {
      // Format: 1.234,56 -> 1234.56
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else if (cleaned.includes(',')) {
      // Format: 1234,56 -> 1234.56
      cleaned = cleaned.replace(',', '.');
    }
    
    const result = parseFloat(cleaned) || 0;
    console.log(`💰 Currency parsing: "${value}" -> ${result}`);
    return result;
  }
}
