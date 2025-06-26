export interface ExtractedData {
  client?: string;
  proposalNumber?: string; // Novo campo para número do orçamento
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

      // Extract proposal number (priority patterns for Brazilian formats)
      result.proposalNumber = this.extractProposalNumber(allText);

      // MELHORADO: Extração específica para layout Drystore
      const clientName = this.extractDrystoreClientName(allText);
      if (clientName) {
        result.client = clientName;
        console.log('✅ Cliente Drystore identificado:', clientName);
      } else {
        // Fallback para padrões genéricos melhorados
        result.client = this.extractBrazilianClientImproved(allText);
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

      console.log(`Parsing completed: ${result.items.length} items, total: R$ ${result.total.toFixed(2)}, proposal number: ${result.proposalNumber || 'not found'}, client: ${result.client || 'not found'}`);

    } catch (error) {
      console.error('Error parsing Adobe data:', error);
    }

    return result;
  }

  // NOVA: Extração específica para o layout da Drystore
  private static extractDrystoreClientName(text: string): string | undefined {
    console.log('🔍 Extracting Drystore client name...');
    
    // Dividir texto em linhas para análise posicional
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    
    console.log('📄 Primeiras 10 linhas do texto:', lines.slice(0, 10));
    
    // Estratégia 1: Procurar por linha que contém apenas um nome (após dados da empresa)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Pular linhas com informações da empresa
      if (this.isCompanyInfoLine(line)) {
        continue;
      }
      
      // Verificar se é uma linha com potencial nome de cliente
      if (this.isPotentialClientName(line)) {
        console.log(`✅ Possível cliente encontrado na linha ${i}: "${line}"`);
        return line.trim();
      }
    }
    
    // Estratégia 2: Procurar por padrão específico após número da proposta
    const proposalLineIndex = lines.findIndex(line => 
      /PROPOSTA\s+COMERCIAL\s+N?\d+/i.test(line)
    );
    
    if (proposalLineIndex !== -1 && proposalLineIndex + 1 < lines.length) {
      const nextLine = lines[proposalLineIndex + 1];
      if (this.isPotentialClientName(nextLine)) {
        console.log(`✅ Cliente encontrado após linha da proposta: "${nextLine}"`);
        return nextLine.trim();
      }
    }
    
    // Estratégia 3: Procurar especificamente por "PEDRO BARTELLE" ou padrões similares
    for (const line of lines) {
      if (/^[A-ZÁÊÔÇÃÕ]{2,}\s+[A-ZÁÊÔÇÃÕ]{2,}$/i.test(line) && 
          !this.isExcludedPhrase(line)) {
        console.log(`✅ Nome encontrado por padrão: "${line}"`);
        return line.trim();
      }
    }
    
    console.log('⚠️ Nome do cliente Drystore não encontrado');
    return undefined;
  }

  // NOVA: Verificar se linha contém informações da empresa
  private static isCompanyInfoLine(line: string): boolean {
    const companyKeywords = [
      'DRYSTORE', 'CNPJ', 'FONE', 'EMAIL', 'RUA', 'AVENIDA', 'CEP',
      'PROPOSTA', 'COMERCIAL', 'DATA', 'DESCRIÇÃO', 'QUANTIDADE', 'VALOR'
    ];
    
    return companyKeywords.some(keyword => 
      line.toUpperCase().includes(keyword)
    );
  }

  // NOVA: Verificar se linha pode ser nome de cliente
  private static isPotentialClientName(line: string): boolean {
    // Deve ter entre 6 e 50 caracteres
    if (line.length < 6 || line.length > 50) {
      return false;
    }
    
    // Deve conter apenas letras, espaços e caracteres especiais brasileiros
    if (!/^[A-ZÁÊÔÇÃÕ\s&\-\.]+$/i.test(line)) {
      return false;
    }
    
    // Deve ter pelo menos 2 palavras
    const words = line.split(/\s+/);
    if (words.length < 2) {
      return false;
    }
    
    // Não deve ser uma frase excluída
    if (this.isExcludedPhrase(line)) {
      return false;
    }
    
    return true;
  }

  // NOVA: Verificar se é uma frase que deve ser excluída
  private static isExcludedPhrase(line: string): boolean {
    const excludedPhrases = [
      'PROPOSTA COMERCIAL',
      'ORÇAMENTO COMERCIAL', 
      'SOLUÇÕES INTELIGENTES',
      'DESCRIÇÃO PRODUTO',
      'VALOR UNITÁRIO',
      'CONDIÇÕES PAGAMENTO',
      'PRAZO ENTREGA'
    ];
    
    return excludedPhrases.some(phrase => 
      line.toUpperCase().includes(phrase.toUpperCase())
    );
  }

  // MELHORADA: Extração genérica de clientes brasileiros
  private static extractBrazilianClientImproved(text: string): string | undefined {
    console.log('🔍 Extracting Brazilian client (fallback)...');
    
    const clientPatterns = [
      // Padrão para nomes após "para:" ou "cliente:"
      /(?:para|cliente):\s*([A-ZÁÊÔÇÃÕ\s&\-\.]{6,40})/i,
      // Padrão para nomes após CNPJ
      /cnpj[\s:]*[\d\.\-\/]+\s*([A-ZÁÊÔÇÃÕ\s&\-\.]{6,40})/i,
      // Padrão para nomes próprios brasileiros (2-3 palavras em maiúsculo)
      /\b([A-ZÁÊÔÇÃÕ]{3,}\s+[A-ZÁÊÔÇÃÕ]{3,}(?:\s+[A-ZÁÊÔÇÃÕ]{2,})?)\b/g
    ];

    for (const pattern of clientPatterns) {
      if (pattern.global) {
        const matches = [...text.matchAll(pattern)];
        for (const match of matches) {
          const candidate = match[1].trim();
          if (this.isValidBrazilianClientName(candidate)) {
            console.log('✅ Cliente identificado (fallback):', candidate);
            return candidate;
          }
        }
      } else {
        const match = text.match(pattern);
        if (match && match[1]) {
          const candidate = match[1].trim();
          if (this.isValidBrazilianClientName(candidate)) {
            console.log('✅ Cliente identificado (fallback):', candidate);
            return candidate;
          }
        }
      }
    }

    console.log('⚠️ No client identified (fallback)');
    return undefined;
  }

  // NOVA: Validação melhorada de nomes de clientes brasileiros
  private static isValidBrazilianClientName(name: string): boolean {
    // Excluir palavras comuns que não são nomes
    const excludeWords = [
      'DESCRIÇÃO', 'QUANTIDADE', 'VALOR', 'TOTAL', 'UNITÁRIO',
      'PRODUTO', 'SERVIÇO', 'ITEM', 'CÓDIGO', 'PREÇO',
      'PROPOSTA', 'ORÇAMENTO', 'PEDIDO', 'NOTA', 'FISCAL',
      'COMERCIAL', 'SOLUÇÕES', 'INTELIGENTES', 'DRYSTORE'
    ];
    
    const hasExcludedWords = excludeWords.some(word => name.toUpperCase().includes(word));
    
    return !hasExcludedWords && 
           name.length >= 6 && 
           name.length <= 40 &&
           /^[A-ZÁÊÔÇÃÕ\s&\-\.]+$/i.test(name) &&
           name.split(/\s+/).length >= 2;
  }

  private static extractProposalNumber(text: string): string | undefined {
    console.log('Extracting proposal number from text...');
    
    // Padrões específicos para números de orçamento brasileiros
    const proposalPatterns = [
      // Padrão N seguido de números (como N131719)
      /\b(N\d{5,8})\b/i,
      // Padrão PROP- seguido de números
      /\b(PROP-?\d{3,8})\b/i,
      // Padrão ORC- seguido de números
      /\b(ORC-?\d{3,8})\b/i,
      // Padrão número de orçamento explícito
      /(?:orçamento|orcamento|proposta|número|numero|n[°º]?)[\s:\-]*([A-Z]?\d{4,8})/i,
      // Padrão genérico para códigos alfanuméricos
      /\b([A-Z]\d{4,8})\b/,
    ];

    // Tentar extrair com base na posição (início do texto - canto superior direito)
    const firstLines = text.split(/\r?\n/).slice(0, 10).join(' ');
    
    for (const pattern of proposalPatterns) {
      const match = firstLines.match(pattern);
      if (match) {
        const proposalNumber = match[1].toUpperCase().trim();
        console.log(`Found proposal number: ${proposalNumber}`);
        return proposalNumber;
      }
    }

    // Se não encontrou nas primeiras linhas, buscar no texto completo
    for (const pattern of proposalPatterns) {
      const match = text.match(pattern);
      if (match) {
        const proposalNumber = match[1].toUpperCase().trim();
        console.log(`Found proposal number in full text: ${proposalNumber}`);
        return proposalNumber;
      }
    }

    console.log('No proposal number found');
    return undefined;
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
