
import type { ExtractedData } from './types.ts';

export class TextParsers {
  static extractProposalNumber(text: string): string | undefined {
    console.log('Extracting proposal number from text...');
    console.log('📄 Text for proposal extraction:', text.substring(0, 200));
    
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
        console.log(`✅ Found proposal number: ${proposalNumber}`);
        return proposalNumber;
      }
    }

    // Se não encontrou nas primeiras linhas, buscar no texto completo
    for (const pattern of proposalPatterns) {
      const match = text.match(pattern);
      if (match) {
        const proposalNumber = match[1].toUpperCase().trim();
        console.log(`✅ Found proposal number in full text: ${proposalNumber}`);
        return proposalNumber;
      }
    }

    console.log('⚠️ No proposal number found');
    return undefined;
  }

  static extractPaymentTerms(text: string, result: ExtractedData): void {
    const paymentPatterns = [
      /(?:pagamento|payment|condições):\s*([^.\n\r]+)/i,
      /(?:prazo|forma de pagamento):\s*([^.\n\r]+)/i
    ];

    for (const pattern of paymentPatterns) {
      const match = text.match(pattern);
      if (match) {
        result.paymentTerms = match[1].trim();
        console.log(`✅ Payment terms found: ${result.paymentTerms}`);
        break;
      }
    }
  }

  static extractDeliveryInfo(text: string, result: ExtractedData): void {
    const deliveryPatterns = [
      /(?:entrega|delivery|prazo de entrega):\s*([^.\n\r]+)/i,
      /(?:data de entrega|entregar em):\s*([^.\n\r]+)/i
    ];

    for (const pattern of deliveryPatterns) {
      const match = text.match(pattern);
      if (match) {
        result.delivery = match[1].trim();
        console.log(`✅ Delivery info found: ${result.delivery}`);
        break;
      }
    }
  }

  static extractVendorInfo(text: string, result: ExtractedData): void {
    const vendorPatterns = [
      /(?:vendedor|representante|atendente):\s*([A-Z\s]+)/i,
      /(?:responsável|consultor):\s*([A-Z\s]+)/i
    ];

    for (const pattern of vendorPatterns) {
      const match = text.match(pattern);
      if (match && match[1].trim().length > 3) {
        result.vendor = match[1].trim();
        console.log(`✅ Vendor info found: ${result.vendor}`);
        break;
      }
    }
  }
}
