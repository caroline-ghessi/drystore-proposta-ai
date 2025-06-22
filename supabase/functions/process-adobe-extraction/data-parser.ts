
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

      // MELHORADA: Identificação de cliente brasileiro
      result.client = this.extractBrazilianClient(allText);

      // Extract tables with enhanced Brazilian logic
      const tables = adobeData.tables || [];
      
      tables.forEach((table: any, tableIndex: number) => {
        console.log(`🔍 Processing table ${tableIndex + 1}:`, table);
        this.processBrazilianTable(table, result);
      });

      // Calculate totals
      result.subtotal = result.items.reduce((sum, item) => sum + item.total, 0);
      result.total = result.subtotal;

      // Extract additional Brazilian information
      this.extractBrazilianPaymentTerms(allText, result);
      this.extractBrazilianDeliveryInfo(allText, result);
      this.extractBrazilianVendorInfo(allText, result);

      console.log(`✅ Enhanced parsing completed: ${result.items.length} items, total: R$ ${result.total.toFixed(2)}`);

    } catch (error) {
      console.error('❌ Error in enhanced parsing:', error);
    }

    return result;
  }

  // NOVA: Identificação específica de clientes brasileiros
  private static extractBrazilianClient(text: string): string | undefined {
    console.log('🔍 Extracting Brazilian client...');
    
    const clientPatterns = [
      // Padrões específicos para propostas brasileiras
      /(?:cliente|razão social|empresa):\s*([A-ZÁÊÔÇÃÕ\s&\-\.]{3,50})/i,
      /(?:para|destinatário):\s*([A-ZÁÊÔÇÃÕ\s&\-\.]{3,50})/i,
      /(?:cnpj)[\s:]*[\d\.\-\/]+\s*([A-ZÁÊÔÇÃÕ\s&\-\.]{3,50})/i,
      // Padrão específico para o PDF Pedro Bartelle
      /(?:pedro\s+bartelle|bartelle)/i,
      // Nomes próprios brasileiros comuns
      /(?:^|\s)([A-ZÁÊÔÇÃÕ]{3,}\s+[A-ZÁÊÔÇÃÕ\s&\-\.]{3,30})(?:\s|$)/,
    ];

    for (const pattern of clientPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const clientName = match[1].trim();
        if (clientName.length > 3 && clientName.length < 50) {
          console.log('✅ Client identified:', clientName);
          return clientName;
        }
      }
    }

    // Fallback: procurar por nomes em maiúscula
    const uppercasePattern = /\b([A-ZÁÊÔÇÃÕ]{3,}\s+[A-ZÁÊÔÇÃÕ\s&]{3,30})\b/g;
    const matches = [...text.matchAll(uppercasePattern)];
    
    for (const match of matches) {
      const candidate = match[1].trim();
      if (this.isValidBrazilianName(candidate)) {
        console.log('✅ Client identified (uppercase):', candidate);
        return candidate;
      }
    }

    console.log('⚠️ No client identified');
    return undefined;
  }

  // NOVA: Validação de nomes brasileiros
  private static isValidBrazilianName(name: string): boolean {
    // Excluir palavras comuns que não são nomes
    const excludeWords = [
      'DESCRIÇÃO', 'QUANTIDADE', 'VALOR', 'TOTAL', 'UNITÁRIO',
      'PRODUTO', 'SERVIÇO', 'ITEM', 'CÓDIGO', 'PREÇO',
      'PROPOSTA', 'ORÇAMENTO', 'PEDIDO', 'NOTA', 'FISCAL'
    ];
    
    return !excludeWords.some(word => name.includes(word)) && 
           name.length >= 6 && 
           name.length <= 40 &&
           /^[A-ZÁÊÔÇÃÕ\s&\-\.]+$/.test(name);
  }

  // MELHORADA: Processamento de tabelas brasileiras
  private static processBrazilianTable(table: any, result: ExtractedData): void {
    const rows = table.rows || [];
    
    if (rows.length < 2) {
      console.log('⚠️ Table too small, skipping...');
      return;
    }

    // INTELIGENTE: Detectar cabeçalho da tabela
    let headerRowIndex = this.findBrazilianTableHeader(rows);
    console.log(`📋 Header detected at row: ${headerRowIndex}`);

    // INTELIGENTE: Mapear colunas baseado no cabeçalho
    const columnMapping = this.mapBrazilianTableColumns(rows[headerRowIndex]);
    console.log('🗂️ Column mapping:', columnMapping);

    // Processar linhas de dados
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      const cells = row.cells || [];
      
      if (cells.length < 3) continue;

      const item = this.extractBrazilianItemFromRow(cells, columnMapping);
      
      if (item && item.description && item.description.length > 3 && item.quantity > 0) {
        result.items.push(item);
        console.log(`✅ Added item: ${item.description} - Qty: ${item.quantity} - Price: R$ ${item.unitPrice}`);
      }
    }
  }

  // NOVA: Detectar cabeçalho de tabela brasileira
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

  // NOVA: Mapear colunas da tabela brasileira
  private static mapBrazilianTableColumns(headerRow: any): any {
    const cells = headerRow.cells || [];
    const mapping: any = {
      description: -1,
      quantity: -1,
      unitPrice: -1,
      total: -1,
      unit: -1
    };

    cells.forEach((cell: any, index: number) => {
      const content = (cell.content || '').toLowerCase();
      
      // Mapear descrição
      if (content.includes('descrição') || content.includes('produto') || content.includes('item')) {
        mapping.description = index;
      }
      // Mapear quantidade
      else if (content.includes('quantidade') || content.includes('qtd') || content.includes('qty')) {
        mapping.quantity = index;
      }
      // Mapear preço unitário
      else if (content.includes('unitário') || content.includes('unit') || content.includes('preço')) {
        mapping.unitPrice = index;
      }
      // Mapear total
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

  // MELHORADA: Extrair item de linha brasileira
  private static extractBrazilianItemFromRow(cells: any[], mapping: any): any {
    const description = mapping.description >= 0 ? 
      (cells[mapping.description]?.content || '').trim() : '';
    
    const quantityText = mapping.quantity >= 0 ? 
      (cells[mapping.quantity]?.content || '0').trim() : '0';
    
    const unitPriceText = mapping.unitPrice >= 0 ? 
      (cells[mapping.unitPrice]?.content || '0').trim() : '0';
    
    const totalText = mapping.total >= 0 ? 
      (cells[mapping.total]?.content || '0').trim() : '';

    // MELHORADA: Limpeza de valores monetários brasileiros
    const quantity = this.parseBrazilianNumber(quantityText);
    const unitPrice = this.parseBrazilianCurrency(unitPriceText);
    const total = totalText ? this.parseBrazilianCurrency(totalText) : (quantity * unitPrice);

    // NOVA: Extrair unidade se possível
    const unit = this.extractBrazilianUnit(quantityText) || 'UN';

    return {
      description: description,
      quantity,
      unit,
      unitPrice,
      total
    };
  }

  // NOVA: Parse de números brasileiros (vírgula como decimal)
  private static parseBrazilianNumber(text: string): number {
    // Remove tudo exceto dígitos, vírgulas e pontos
    let cleaned = text.replace(/[^\d.,]/g, '');
    
    // Se tem vírgula e ponto, vírgula é decimal
    if (cleaned.includes(',') && cleaned.includes('.')) {
      // Ex: 1.234,56 -> 1234.56
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else if (cleaned.includes(',')) {
      // Ex: 1234,56 -> 1234.56
      cleaned = cleaned.replace(',', '.');
    }
    
    return parseFloat(cleaned) || 0;
  }

  // NOVA: Parse de moeda brasileira
  private static parseBrazilianCurrency(text: string): number {
    // Remove símbolos de moeda (R$, reais, etc.)
    let cleaned = text.replace(/[R$\s]/g, '');
    cleaned = cleaned.replace(/reais?/gi, '');
    
    return this.parseBrazilianNumber(cleaned);
  }

  // NOVA: Extrair unidade brasileira
  private static extractBrazilianUnit(text: string): string | undefined {
    const unitPatterns = [
      /(\b(?:PC|PÇ|UN|M|CM|MM|KG|G|L|ML)\b)/i,
      /(\b(?:PEÇA|UNIDADE|METRO|CENTÍMETRO|QUILOGRAMA|GRAMA|LITRO)\b)/i
    ];

    for (const pattern of unitPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].toUpperCase();
      }
    }

    return undefined;
  }

  // MELHORADA: Termos de pagamento brasileiros
  private static extractBrazilianPaymentTerms(text: string, result: ExtractedData): void {
    const paymentPatterns = [
      /(?:pagamento|forma de pagamento|condições):\s*([^.\n\r]{5,50})/i,
      /(?:prazo|vencimento):\s*([^.\n\r]{5,50})/i,
      /(?:boleto|cartão|pix|transferência|à vista)[\s\w\/]*([^.\n\r]{5,50})/i
    ];

    for (const pattern of paymentPatterns) {
      const match = text.match(pattern);
      if (match) {
        result.paymentTerms = match[1].trim();
        break;
      }
    }
  }

  // MELHORADA: Informações de entrega brasileiras
  private static extractBrazilianDeliveryInfo(text: string, result: ExtractedData): void {
    const deliveryPatterns = [
      /(?:entrega|prazo de entrega|delivery):\s*([^.\n\r]{5,50})/i,
      /(?:data de entrega|entregar em):\s*([^.\n\r]{5,50})/i,
      /(?:\d{1,2}\/\d{1,2}\/\d{2,4})/g
    ];

    for (const pattern of deliveryPatterns) {
      const match = text.match(pattern);
      if (match) {
        result.delivery = match[1] ? match[1].trim() : match[0];
        break;
      }
    }
  }

  // MELHORADA: Informações de vendedor brasileiras
  private static extractBrazilianVendorInfo(text: string, result: ExtractedData): void {
    const vendorPatterns = [
      /(?:vendedor|representante|atendente|consultor):\s*([A-ZÁÊÔÇÃÕ\s]{3,30})/i,
      /(?:responsável|contato):\s*([A-ZÁÊÔÇÃÕ\s]{3,30})/i
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
