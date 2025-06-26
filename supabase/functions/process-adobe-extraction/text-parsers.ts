
export class TextParsers {
  static parseBrazilianNumber(text: string): number {
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

  static parseBrazilianCurrency(text: string): number {
    // Remove símbolos de moeda (R$, reais, etc.)
    let cleaned = text.replace(/[R$\s]/g, '');
    cleaned = cleaned.replace(/reais?/gi, '');
    
    return this.parseBrazilianNumber(cleaned);
  }

  static extractBrazilianUnit(text: string): string | undefined {
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

  static extractBrazilianPaymentTerms(text: string, result: any): void {
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

  static extractBrazilianDeliveryInfo(text: string, result: any): void {
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

  static extractBrazilianVendorInfo(text: string, result: any): void {
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
