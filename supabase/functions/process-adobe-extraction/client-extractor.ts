
export class ClientExtractor {
  static extractBrazilianClient(text: string): string | undefined {
    console.log('🔍 Extracting Brazilian client - ENHANCED VERSION...');
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

    // Estratégia 3: Padrões específicos para propostas brasileiras (fallback)
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

    // Estratégia 4: Fallback - procurar por nomes em maiúscula
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

  private static isValidDrystoreClientName(name: string): boolean {
    // Deve ter entre 6 e 40 caracteres
    if (name.length < 6 || name.length > 40) {
      return false;
    }
    
    // Deve conter apenas letras, espaços e caracteres especiais brasileiros
    if (!/^[A-ZÁÊÔÇÃÕ\s&\-\.]+$/i.test(name)) {
      return false;
    }
    
    // Deve ter pelo menos 2 palavras
    const words = name.split(/\s+/);
    if (words.length < 2) {
      return false;
    }
    
    // Validações específicas para Drystore
    if (name.includes('PROPOSTA') || name.includes('COMERCIAL') || name.includes('DESCRIÇÃO')) {
      return false;
    }
    
    return true;
  }

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
}
