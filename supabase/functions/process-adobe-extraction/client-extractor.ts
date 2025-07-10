
export class ClientExtractor {
  static extractBrazilianClient(text: string): string | undefined {
    console.log('🔍 Extracting Brazilian client - PRODUCTION VERSION...');
    console.log('📄 Analyzing text for client names...');
    
    // VALIDAÇÃO ANTI-TESTE: Detectar e rejeitar dados de teste
    if (this.isTestData(text)) {
      console.log('🚫 Test data detected - rejecting extraction');
      return undefined;
    }
    
    // Estratégia 1: Buscar por padrões de identificação de cliente
    const clientPatterns = [
      // Padrão "Cliente:" ou "Razão Social:"
      /(?:cliente|razão\s+social|empresa):\s*([A-ZÁÊÔÇÃÕ\s&\-\.]{6,50})/i,
      // Padrão "Para:" ou "Destinatário:"
      /(?:para|destinatário):\s*([A-ZÁÊÔÇÃÕ\s&\-\.]{6,50})/i,
      // Nome após CNPJ
      /cnpj[\s:]*[\d\.\-\/]+\s*([A-ZÁÊÔÇÃÕ\s&\-\.]{6,50})/i,
      // Padrão em propostas comerciais - nome entre número e "Data"
      /(?:proposta|orçamento)\s+(?:comercial\s+)?n?\d+\s+([A-ZÁÊÔÇÃÕ\s&\-\.]{6,40})\s+(?:data|validade)/i
    ];

    for (const pattern of clientPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const candidateName = match[1].trim();
        if (this.isValidClientName(candidateName)) {
          console.log(`✅ Cliente encontrado via padrão: "${candidateName}"`);
          return candidateName;
        }
      }
    }

    // Estratégia 2: Análise de linhas para encontrar nomes de clientes
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 5);
    
    for (let i = 0; i < Math.min(lines.length, 20); i++) {
      const line = lines[i];
      
      // Pular linhas com informações da empresa ou sistema
      if (this.isSystemOrCompanyLine(line)) {
        continue;
      }
      
      // Verificar se a linha contém um nome de cliente válido
      if (this.isPotentialClientName(line)) {
        const cleanName = this.cleanClientName(line);
        if (this.isValidClientName(cleanName)) {
          console.log(`✅ Cliente encontrado na linha ${i}: "${cleanName}"`);
          return cleanName;
        }
      }
    }

    // Estratégia 3: Busca por nomes próprios brasileiros
    const namePattern = /\b([A-ZÁÊÔÇÃÕ]{3,}\s+[A-ZÁÊÔÇÃÕ\s&\-\.]{3,30})\b/g;
    const nameMatches = [...text.matchAll(namePattern)];
    
    for (const match of nameMatches) {
      const candidateName = match[1].trim();
      if (this.isValidClientName(candidateName) && !this.isSystemOrCompanyLine(candidateName)) {
        console.log(`✅ Cliente encontrado por padrão de nome: "${candidateName}"`);
        return candidateName;
      }
    }

    console.log('⚠️ No valid client name found');
    return undefined;
  }

  // VALIDAÇÃO ANTI-TESTE: Detectar dados de teste para evitar em produção
  private static isTestData(text: string): boolean {
    const testIndicators = [
      'PEDRO BARTELLE', 'BARTELLE',
      'RONALDO SOUZA', 'TEST CLIENT',
      'CLIENTE TESTE', 'TESTE CLIENTE',
      'MOCK DATA', 'DADOS TESTE'
    ];
    
    const upperText = text.toUpperCase();
    return testIndicators.some(indicator => upperText.includes(indicator));
  }

  // Validar se um nome é válido para um cliente real
  private static isValidClientName(name: string): boolean {
    if (!name || name.length < 6 || name.length > 50) {
      return false;
    }
    
    // Deve conter apenas letras, espaços e caracteres especiais brasileiros
    if (!/^[A-ZÁÊÔÇÃÕ\s&\-\.]{6,}$/i.test(name)) {
      return false;
    }
    
    // Deve ter pelo menos 2 palavras (nome e sobrenome)
    const words = name.split(/\s+/).filter(w => w.length > 1);
    if (words.length < 2) {
      return false;
    }
    
    // Não deve conter termos do sistema ou dados de teste
    if (this.isSystemOrCompanyLine(name) || this.isTestData(name)) {
      return false;
    }
    
    return true;
  }

  // Detectar linhas do sistema ou empresa
  private static isSystemOrCompanyLine(line: string): boolean {
    const systemTerms = [
      'DRYSTORE', 'SOLUÇÕES INTELIGENTES', 'PROPOSTA COMERCIAL',
      'DESCRIÇÃO', 'QUANTIDADE', 'VALOR', 'TOTAL', 'UNITÁRIO',
      'PRODUTO', 'CNPJ', 'FONE', 'EMAIL', 'CEP', 'RUA', 'AVENIDA',
      'BOLETO', 'PAGAMENTO', 'ENTREGA', 'PRAZO', 'CONDIÇÕES'
    ];
    
    const upperLine = line.toUpperCase();
    return systemTerms.some(term => upperLine.includes(term));
  }

  // Verificar se uma linha pode conter nome de cliente
  private static isPotentialClientName(line: string): boolean {
    // Linha muito curta ou muito longa
    if (line.length < 6 || line.length > 60) {
      return false;
    }
    
    // Deve ter formato de nome (letras e espaços)
    if (!/^[A-ZÁÊÔÇÃÕ\s&\-\.]+$/i.test(line)) {
      return false;
    }
    
    // Deve ter pelo menos 2 palavras
    const words = line.split(/\s+/).filter(w => w.length > 1);
    if (words.length < 2) {
      return false;
    }
    
    // Não deve ser linha do sistema
    if (this.isSystemOrCompanyLine(line)) {
      return false;
    }
    
    return true;
  }

  // Limpar nome do cliente removendo caracteres extras
  private static cleanClientName(line: string): string {
    return line
      .replace(/^[:\-\s]+|[:\-\s]+$/g, '') // Remove : - espaços no início/fim
      .replace(/\s+/g, ' ') // Normaliza espaços múltiplos
      .trim()
      .toUpperCase();
  }
}
