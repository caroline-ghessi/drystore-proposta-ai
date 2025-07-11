// ============================================================================
// FASE 02: Parser Avançado de Dados - Versão Definitiva
// Reconhece tipos de elementos, extrai styling/bounding boxes e processa tabelas
// ============================================================================

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ElementStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: string;
}

export interface ParsedElement {
  id: string;
  type: 'text' | 'table' | 'figure' | 'header' | 'paragraph' | 'list_item' | 'number' | 'currency';
  content: string;
  bounds?: BoundingBox;
  style?: ElementStyle;
  confidence: number;
  page: number;
  hierarchy: number; // 0 = título, 1 = subtítulo, 2 = corpo, etc.
}

export interface ParsedTable {
  id: string;
  bounds?: BoundingBox;
  headers: string[];
  rows: string[][];
  page: number;
  confidence: number;
}

export interface ParsedItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  confidence: number;
  source: 'table' | 'text' | 'pattern';
}

export interface ParsedDocument {
  client?: string;
  vendor?: string;
  proposalNumber?: string;
  date?: string;
  items: ParsedItem[];
  tables: ParsedTable[];
  elements: ParsedElement[];
  subtotal: number;
  taxes?: number;
  total: number;
  paymentTerms?: string;
  delivery?: string;
  extractionQuality: 'high' | 'medium' | 'low';
  processingMethod: string;
}

export class EnhancedDataParser {
  private correlationId?: string;

  constructor(correlationId?: string) {
    this.correlationId = correlationId;
  }

  private log(message: string, data?: any): void {
    const prefix = this.correlationId ? `[${this.correlationId}]` : '[Parser]';
    console.log(`${prefix} ${message}`, data || '');
  }

  // ========================================
  // CLASSIFICAÇÃO INTELIGENTE DE ELEMENTOS
  // ========================================
  private classifyElement(element: any): ParsedElement {
    const content = element.Text || element.content || '';
    const bounds = this.extractBounds(element);
    const style = this.extractStyle(element);
    
    // Determinar tipo baseado no conteúdo e estilo
    let type: ParsedElement['type'] = 'text';
    let confidence = 0.5;
    let hierarchy = 2; // padrão: corpo do texto

    // Detectar números e moedas
    if (this.isCurrency(content)) {
      type = 'currency';
      confidence = 0.9;
    } else if (this.isNumber(content)) {
      type = 'number';
      confidence = 0.8;
    }
    // Detectar títulos/cabeçalhos baseado no estilo
    else if (style?.fontSize && style.fontSize > 14) {
      type = 'header';
      hierarchy = style.fontSize > 18 ? 0 : 1;
      confidence = 0.8;
    }
    // Detectar parágrafos
    else if (content.length > 50) {
      type = 'paragraph';
      confidence = 0.7;
    }
    // Detectar itens de lista
    else if (/^[\-\*\•]\s/.test(content) || /^\d+[\.\)]\s/.test(content)) {
      type = 'list_item';
      confidence = 0.8;
    }

    return {
      id: crypto.randomUUID(),
      type,
      content: content.trim(),
      bounds,
      style,
      confidence,
      page: element.Page || 1,
      hierarchy
    };
  }

  private extractBounds(element: any): BoundingBox | undefined {
    if (element.Bounds || element.bounds) {
      const bounds = element.Bounds || element.bounds;
      return {
        x: bounds[0] || bounds.x || 0,
        y: bounds[1] || bounds.y || 0,
        width: bounds[2] || bounds.width || 0,
        height: bounds[3] || bounds.height || 0
      };
    }
    return undefined;
  }

  private extractStyle(element: any): ElementStyle | undefined {
    const attributes = element.attributes || element.style || {};
    
    if (Object.keys(attributes).length === 0) return undefined;

    return {
      fontFamily: attributes.font_family || attributes.fontFamily,
      fontSize: attributes.font_size || attributes.fontSize,
      fontWeight: attributes.font_weight || attributes.fontWeight,
      color: attributes.color,
      backgroundColor: attributes.background_color || attributes.backgroundColor,
      textAlign: attributes.text_align || attributes.textAlign
    };
  }

  // ========================================
  // PROCESSAMENTO AVANÇADO DE TABELAS
  // ========================================
  private processTables(tableElements: any[]): ParsedTable[] {
    this.log(`📊 Processando ${tableElements.length} tabelas...`);
    
    return tableElements.map((table, index) => {
      const bounds = this.extractBounds(table);
      const tableData = this.extractTableData(table);
      
      return {
        id: `table_${index + 1}`,
        bounds,
        headers: tableData.headers,
        rows: tableData.rows,
        page: table.Page || 1,
        confidence: this.calculateTableConfidence(tableData)
      };
    });
  }

  private extractTableData(table: any): { headers: string[]; rows: string[][] } {
    // Diferentes estruturas possíveis de tabela
    if (table.rows) {
      // Estrutura: { rows: [{ cells: [{ content: "..." }] }] }
      const headers = table.rows[0]?.cells?.map((cell: any) => 
        cell.content || cell.text || ''
      ) || [];
      
      const rows = table.rows.slice(1).map((row: any) =>
        row.cells?.map((cell: any) => cell.content || cell.text || '') || []
      );
      
      return { headers, rows };
    }
    
    if (table.cells) {
      // Estrutura: { cells: [[{ content: "..." }]] }
      const headers = table.cells[0]?.map((cell: any) => 
        cell.content || cell.text || ''
      ) || [];
      
      const rows = table.cells.slice(1).map((row: any[]) =>
        row.map((cell: any) => cell.content || cell.text || '')
      );
      
      return { headers, rows };
    }

    // Fallback: tentar extrair de texto estruturado
    if (table.Text || table.content) {
      return this.parseTextTable(table.Text || table.content);
    }

    return { headers: [], rows: [] };
  }

  private parseTextTable(text: string): { headers: string[]; rows: string[][] } {
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return { headers: [], rows: [] };
    }

    // Detectar separadores comuns
    const separators = ['\t', '|', ';', ','];
    let bestSeparator = '\t';
    let maxColumns = 0;

    for (const sep of separators) {
      const columns = lines[0].split(sep).length;
      if (columns > maxColumns) {
        maxColumns = columns;
        bestSeparator = sep;
      }
    }

    const headers = lines[0].split(bestSeparator).map(h => h.trim());
    const rows = lines.slice(1).map(line => 
      line.split(bestSeparator).map(cell => cell.trim())
    );

    return { headers, rows };
  }

  private calculateTableConfidence(tableData: { headers: string[]; rows: string[][] }): number {
    if (tableData.headers.length === 0) return 0.1;
    if (tableData.rows.length === 0) return 0.3;
    
    // Verificar consistência de colunas
    const expectedColumns = tableData.headers.length;
    const consistentRows = tableData.rows.filter(row => row.length === expectedColumns);
    const consistency = consistentRows.length / tableData.rows.length;
    
    // Verificar se há valores numéricos (indicativo de tabela de preços)
    const numericCells = tableData.rows.flat().filter(cell => this.isNumber(cell) || this.isCurrency(cell));
    const numericRatio = numericCells.length / (tableData.rows.length * expectedColumns);
    
    return Math.min(0.9, consistency * 0.6 + numericRatio * 0.4 + 0.1);
  }

  // ========================================
  // EXTRAÇÃO INTELIGENTE DE ITENS
  // ========================================
  private extractItemsFromTables(tables: ParsedTable[]): ParsedItem[] {
    this.log(`🔍 Extraindo itens de ${tables.length} tabelas...`);
    
    const items: ParsedItem[] = [];
    
    for (const table of tables) {
      if (table.confidence < 0.5) continue;
      
      const tableItems = this.parseTableItems(table);
      items.push(...tableItems);
    }
    
    return items;
  }

  private parseTableItems(table: ParsedTable): ParsedItem[] {
    const items: ParsedItem[] = [];
    const headers = table.headers.map(h => h.toLowerCase());
    
    // Identificar colunas relevantes
    const columnMap = this.identifyColumns(headers);
    
    if (!columnMap.description) {
      this.log('⚠️ Coluna de descrição não encontrada na tabela');
      return items;
    }
    
    for (const row of table.rows) {
      try {
        const item = this.parseRowToItem(row, columnMap, table.confidence);
        if (item) {
          items.push(item);
        }
      } catch (error) {
        this.log(`⚠️ Erro ao processar linha da tabela: ${error.message}`);
      }
    }
    
    return items;
  }

  private identifyColumns(headers: string[]): { [key: string]: number } {
    const columnMap: { [key: string]: number } = {};
    
    headers.forEach((header, index) => {
      const normalized = header.toLowerCase().trim();
      
      // Descrição/Produto/Item
      if (/descri[çc][ãa]o|produto|item|servi[çc]o/.test(normalized)) {
        columnMap.description = index;
      }
      // Quantidade
      else if (/qtd|quantidade|qtde|unid/.test(normalized)) {
        columnMap.quantity = index;
      }
      // Unidade
      else if (/unidade|un|unit/.test(normalized)) {
        columnMap.unit = index;
      }
      // Preço unitário
      else if (/pre[çc]o.*unit|valor.*unit|unit.*pre[çc]o/.test(normalized)) {
        columnMap.unitPrice = index;
      }
      // Total
      else if (/total|valor.*total|pre[çc]o.*total/.test(normalized)) {
        columnMap.total = index;
      }
    });
    
    return columnMap;
  }

  private parseRowToItem(row: string[], columnMap: { [key: string]: number }, tableConfidence: number): ParsedItem | null {
    const description = row[columnMap.description]?.trim();
    
    if (!description || description.length < 2) {
      return null;
    }
    
    const quantity = this.parseNumber(row[columnMap.quantity]) || 1;
    const unit = row[columnMap.unit]?.trim() || 'un';
    const unitPrice = this.parseCurrency(row[columnMap.unitPrice]) || 0;
    const total = this.parseCurrency(row[columnMap.total]) || (quantity * unitPrice);
    
    return {
      description,
      quantity,
      unit,
      unitPrice,
      total,
      confidence: Math.min(0.9, tableConfidence + 0.1),
      source: 'table'
    };
  }

  // ========================================
  // EXTRAÇÃO DE TEXTO LIVRE
  // ========================================
  private extractItemsFromText(elements: ParsedElement[]): ParsedItem[] {
    this.log('📝 Extraindo itens de texto livre...');
    
    const items: ParsedItem[] = [];
    const textContent = elements
      .filter(e => e.type === 'text' || e.type === 'paragraph')
      .map(e => e.content)
      .join(' ');
    
    // Padrões para identificar itens em texto
    const itemPatterns = [
      // "1x Produto - R$ 100,00"
      /(\d+)\s*x?\s*([^-\n]+?)\s*[-–]\s*R?\$?\s*([\d.,]+)/gi,
      // "Produto: R$ 100,00"
      /([^:\n]+?):\s*R?\$?\s*([\d.,]+)/gi,
      // "Item 1 - Descrição - R$ 100,00"
      /item\s*\d+\s*[-–]\s*([^-]+?)\s*[-–]\s*R?\$?\s*([\d.,]+)/gi
    ];
    
    for (const pattern of itemPatterns) {
      let match;
      while ((match = pattern.exec(textContent)) !== null) {
        const item = this.createItemFromTextMatch(match);
        if (item) {
          items.push(item);
        }
      }
    }
    
    return items;
  }

  private createItemFromTextMatch(match: RegExpExecArray): ParsedItem | null {
    try {
      if (match.length === 4) {
        // Padrão com quantidade
        const quantity = parseInt(match[1]);
        const description = match[2].trim();
        const price = this.parseCurrency(match[3]);
        
        return {
          description,
          quantity,
          unit: 'un',
          unitPrice: price / quantity,
          total: price,
          confidence: 0.7,
          source: 'pattern'
        };
      } else if (match.length === 3) {
        // Padrão sem quantidade
        const description = match[1].trim();
        const price = this.parseCurrency(match[2]);
        
        return {
          description,
          quantity: 1,
          unit: 'un',
          unitPrice: price,
          total: price,
          confidence: 0.6,
          source: 'pattern'
        };
      }
    } catch (error) {
      this.log(`⚠️ Erro ao processar match de texto: ${error.message}`);
    }
    
    return null;
  }

  // ========================================
  // EXTRAÇÃO DE METADADOS
  // ========================================
  private extractMetadata(elements: ParsedElement[]): Partial<ParsedDocument> {
    const textContent = elements.map(e => e.content).join(' ');
    
    return {
      client: this.extractClient(textContent),
      vendor: this.extractVendor(textContent),
      proposalNumber: this.extractProposalNumber(textContent),
      date: this.extractDate(textContent),
      paymentTerms: this.extractPaymentTerms(textContent),
      delivery: this.extractDelivery(textContent)
    };
  }

  private extractClient(text: string): string | undefined {
    const patterns = [
      /cliente[\s:]+([^\n\r;,]+)/i,
      /razão\s+social[\s:]+([^\n\r;,]+)/i,
      /empresa[\s:]+([^\n\r;,]+)/i,
      /para[\s:]+([^\n\r;,]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim().substring(0, 100);
      }
    }
    
    return undefined;
  }

  private extractVendor(text: string): string | undefined {
    const patterns = [
      /fornecedor[\s:]+([^\n\r;,]+)/i,
      /vendedor[\s:]+([^\n\r;,]+)/i,
      /de[\s:]+([^\n\r;,]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim().substring(0, 100);
      }
    }
    
    return 'DryStore - Soluções Inteligentes';
  }

  private extractProposalNumber(text: string): string | undefined {
    const patterns = [
      /proposta[\s#:]*(\d+)/i,
      /orçamento[\s#:]*(\d+)/i,
      /número[\s#:]*(\d+)/i,
      /n[º°][\s]*(\d+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return undefined;
  }

  private extractDate(text: string): string | undefined {
    const patterns = [
      /data[\s:]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return undefined;
  }

  private extractPaymentTerms(text: string): string | undefined {
    const patterns = [
      /pagamento[\s:]+([^\n\r.;]+)/i,
      /condições[\s:]+([^\n\r.;]+)/i,
      /prazo[\s:]+([^\n\r.;]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim().substring(0, 200);
      }
    }
    
    return undefined;
  }

  private extractDelivery(text: string): string | undefined {
    const patterns = [
      /entrega[\s:]+([^\n\r.;]+)/i,
      /prazo.*entrega[\s:]+([^\n\r.;]+)/i,
      /delivery[\s:]+([^\n\r.;]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim().substring(0, 200);
      }
    }
    
    return undefined;
  }

  // ========================================
  // UTILITÁRIOS
  // ========================================
  private isCurrency(text: string): boolean {
    return /R?\$\s*[\d.,]+/.test(text) || /[\d.,]+\s*reais?/i.test(text);
  }

  private isNumber(text: string): boolean {
    return /^\d+([.,]\d+)?$/.test(text.trim());
  }

  private parseNumber(text: string): number {
    if (!text) return 0;
    const cleaned = text.replace(/[^\d.,]/g, '');
    return parseFloat(cleaned.replace(',', '.')) || 0;
  }

  private parseCurrency(text: string): number {
    if (!text) return 0;
    const cleaned = text.replace(/[^\d.,]/g, '');
    const normalized = cleaned.includes(',') && cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.') 
      ? cleaned.replace(/\./g, '').replace(',', '.')
      : cleaned.replace(/,/g, '');
    return parseFloat(normalized) || 0;
  }

  // ========================================
  // MÉTODO PRINCIPAL DE PARSING
  // ========================================
  parseDocument(adobeData: any): ParsedDocument {
    this.log('🔄 Iniciando parsing avançado do documento...');
    
    try {
      // 1. Processar elementos
      const rawElements = adobeData.elements || [];
      const elements = rawElements.map((elem: any) => this.classifyElement(elem));
      
      // 2. Processar tabelas
      const tableElements = rawElements.filter((elem: any) => 
        elem.type === 'table' || (elem.Table && elem.Table.length > 0)
      );
      const tables = this.processTables(tableElements);
      
      // 3. Extrair itens
      const tableItems = this.extractItemsFromTables(tables);
      const textItems = this.extractItemsFromText(elements);
      const allItems = [...tableItems, ...textItems];
      
      // 4. Extrair metadados
      const metadata = this.extractMetadata(elements);
      
      // 5. Calcular totais
      const subtotal = allItems.reduce((sum, item) => sum + item.total, 0);
      const total = subtotal; // Impostos podem ser extraídos separadamente
      
      // 6. Determinar qualidade da extração
      const extractionQuality = this.determineExtractionQuality(elements, tables, allItems);
      
      this.log('✅ Parsing concluído', {
        elementos: elements.length,
        tabelas: tables.length,
        itens: allItems.length,
        total: total,
        qualidade: extractionQuality
      });
      
      return {
        ...metadata,
        items: allItems,
        tables,
        elements,
        subtotal,
        total,
        extractionQuality,
        processingMethod: 'enhanced_parser_v2'
      };
      
    } catch (error) {
      this.log(`❌ Erro no parsing: ${error.message}`);
      
      // Fallback básico
      return {
        items: [],
        tables: [],
        elements: [],
        subtotal: 0,
        total: 0,
        extractionQuality: 'low',
        processingMethod: 'enhanced_parser_v2_fallback'
      };
    }
  }

  private determineExtractionQuality(elements: ParsedElement[], tables: ParsedTable[], items: ParsedItem[]): 'high' | 'medium' | 'low' {
    if (tables.length > 0 && items.length > 0) {
      const avgTableConfidence = tables.reduce((sum, t) => sum + t.confidence, 0) / tables.length;
      const avgItemConfidence = items.reduce((sum, i) => sum + i.confidence, 0) / items.length;
      
      if (avgTableConfidence > 0.7 && avgItemConfidence > 0.7) {
        return 'high';
      } else if (avgTableConfidence > 0.5 || avgItemConfidence > 0.5) {
        return 'medium';
      }
    }
    
    if (elements.length > 10 && items.length > 0) {
      return 'medium';
    }
    
    return 'low';
  }
}