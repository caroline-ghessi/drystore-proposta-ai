
export class ClientExtractor {
  static extractDrystoreClientName(text: string): string | undefined {
    console.log('🔍 Extracting Drystore client name - ENHANCED VERSION...');
    console.log('📄 Full extracted text:', text);
    
    // Estratégia 1: Padrão específico para layout Drystore em linha única
    // "PROPOSTA COMERCIAL N131719 PEDRO BARTELLE Data: 20/02/2025"
    const drystorePatternSingleLine = /PROPOSTA\s+COMERCIAL\s+N?\d+\s+([A-ZÁÊÔÇÃÕ\s]{3,40}?)\s+Data:/i;
    const singleLineMatch = text.match(drystorePatternSingleLine);
    
    if (singleLineMatch && singleLineMatch[1]) {
      const candidateName = singleLineMatch[1].trim();
      if (this.isValidDrystoreClientName(candidateName)) {
        console.log(`✅ Cliente encontrado via padrão linha única: "${candidateName}"`);
        return candidateName;
      }
    }

    // Estratégia 2: Busca por nome entre número da proposta e palavras-chave
    const proposalNumberPattern = /N\d{5,8}/i;
    const proposalMatch = text.match(proposalNumberPattern);
    
    if (proposalMatch) {
      const proposalIndex = proposalMatch.index!;
      const afterProposalText = text.substring(proposalIndex + proposalMatch[0].length);
      
      // Procurar por nome antes de "Data:", "DESCRIÇÃO", etc.
      const nameAfterProposal = /^\s+([A-ZÁÊÔÇÃÕ\s]{6,40}?)\s+(?:Data:|DESCRIÇÃO|QUANTIDADE)/i.exec(afterProposalText);
      
      if (nameAfterProposal && nameAfterProposal[1]) {
        const candidateName = nameAfterProposal[1].trim();
        if (this.isValidDrystoreClientName(candidateName)) {
          console.log(`✅ Cliente encontrado após número da proposta: "${candidateName}"`);
          return candidateName;
        }
      }
    }

    // Estratégia 3: Análise de linhas (para casos com quebras de linha)
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    console.log('📄 Primeiras 10 linhas do texto:', lines.slice(0, 10));
    
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
    
    // Estratégia 4: Busca por nomes próprios brasileiros (genérico)
    const genericNamePattern = /\b([A-ZÁÊÔÇÃÕ]{3,}\s+[A-ZÁÊÔÇÃÕ]{3,}(?:\s+[A-ZÁÊÔÇÃÕ]{2,})?)\b/g;
    const nameMatches = [...text.matchAll(genericNamePattern)];
    
    for (const match of nameMatches) {
      const candidateName = match[1].trim();
      if (this.isValidDrystoreClientName(candidateName) && !this.isExcludedPhrase(candidateName) && !this.isTestData(candidateName)) {
        console.log(`✅ Nome encontrado por padrão genérico: "${candidateName}"`);
        return candidateName;
      }
    }
    
    console.log('⚠️ Nome do cliente Drystore não encontrado com os novos padrões');
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

  private static isValidDrystoreClientName(name: string): boolean {
    // VALIDAÇÃO RIGOROSA ANTI-TESTE - Primeiro bloquear dados conhecidos de teste
    const upperName = name.toUpperCase().trim();
    
    // BLOQUEIO CRÍTICO: Nunca aceitar essas strings como nomes de cliente
    const criticalBlocks = [
      'PROPOSTA COMERCIAL', 'PROPOSTA', 'COMERCIAL',
      'PEDRO BARTELLE', // Dados de teste específicos
      'DESCRIÇÃO', 'QUANTIDADE', 'VALOR', 'TOTAL',
      'DRYSTORE', 'SOLUÇÕES INTELIGENTES',
      'DATA:', 'TELEFONE:', 'EMAIL:', 'ENDEREÇO:',
      'CNPJ:', 'CPF:', 'RG:'
    ];
    
    for (const block of criticalBlocks) {
      if (upperName.includes(block)) {
        console.log(`❌ Nome rejeitado por conter termo bloqueado: "${block}" em "${name}"`);
        return false;
      }
    }
    
    // Deve ter entre 6 e 40 caracteres
    if (name.length < 6 || name.length > 40) {
      console.log(`❌ Nome rejeitado por tamanho: ${name.length} caracteres`);
      return false;
    }
    
    // Deve conter apenas letras, espaços e caracteres especiais brasileiros
    if (!/^[A-ZÁÊÔÇÃÕ\s&\-\.]+$/i.test(name)) {
      console.log(`❌ Nome rejeitado por caracteres inválidos: "${name}"`);
      return false;
    }
    
    // Deve ter pelo menos 2 palavras
    const words = name.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 2) {
      console.log(`❌ Nome rejeitado por ter menos de 2 palavras: "${name}"`);
      return false;
    }
    
    // Palavras devem ter pelo menos 2 caracteres cada
    if (words.some(word => word.length < 2)) {
      console.log(`❌ Nome rejeitado por ter palavras muito curtas: "${name}"`);
      return false;
    }
    
    // Não deve ser uma frase excluída
    if (this.isExcludedPhrase(name)) {
      console.log(`❌ Nome rejeitado por frase excluída: "${name}"`);
      return false;
    }
    
    // Não deve ser dados de teste
    if (this.isTestData(name)) {
      console.log(`❌ Nome rejeitado por ser dados de teste: "${name}"`);
      return false;
    }
    
    console.log(`✅ Nome validado com sucesso: "${name}"`);
    return true;
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

  private static isTestData(name: string): boolean {
    const testNames = [
      'TEST CLIENT', 'CLIENT TEST',
      'CLIENTE TESTE', 'TESTE CLIENTE',
      'EXEMPLO CLIENTE', 'CLIENTE EXEMPLO',
      'DEMO CLIENT', 'CLIENT DEMO'
    ];
    
    const upperName = name.toUpperCase();
    return testNames.some(testName => upperName.includes(testName));
  }

  private static isExcludedPhrase(line: string): boolean {
    const excludedPhrases = [
      // Frases do sistema Drystore
      'PROPOSTA COMERCIAL',
      'ORÇAMENTO COMERCIAL', 
      'SOLUÇÕES INTELIGENTES',
      'DESCRIÇÃO PRODUTO',
      'VALOR UNITÁRIO',
      'CONDIÇÕES PAGAMENTO',
      'PRAZO ENTREGA',
      // Dados de teste conhecidos
      'PEDRO BARTELLE',
      'CLIENTE TESTE',
      'TEST CLIENT',
      // Termos de sistema/layout
      'DRYSTORE SOLUÇÕES',
      'PROPOSTA N',
      'DATA:',
      'TELEFONE:',
      'EMAIL:',
      'ENDEREÇO:'
    ];
    
    const upperLine = line.toUpperCase();
    return excludedPhrases.some(phrase => 
      upperLine.includes(phrase.toUpperCase())
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
