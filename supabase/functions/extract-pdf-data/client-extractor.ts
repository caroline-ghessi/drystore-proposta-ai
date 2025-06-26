
export class ClientExtractor {
  static extractDrystoreClientName(text: string): string | undefined {
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

  static extractBrazilianClientImproved(text: string): string | undefined {
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

  private static isCompanyInfoLine(line: string): boolean {
    const companyKeywords = [
      'DRYSTORE', 'CNPJ', 'FONE', 'EMAIL', 'RUA', 'AVENIDA', 'CEP',
      'PROPOSTA', 'COMERCIAL', 'DATA', 'DESCRIÇÃO', 'QUANTIDADE', 'VALOR'
    ];
    
    return companyKeywords.some(keyword => 
      line.toUpperCase().includes(keyword)
    );
  }

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
}
