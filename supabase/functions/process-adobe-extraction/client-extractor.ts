
export class ClientExtractor {
  static extractBrazilianClient(text: string): string | undefined {
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
