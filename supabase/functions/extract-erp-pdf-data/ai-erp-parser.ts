// AI-powered ERP parser using Grok API

import type { ExtractedERPData } from './types.ts';

export class AIERPParser {
  private grokApiKey: string;
  private apiUrl = 'https://api.x.ai/v1/chat/completions';

  constructor(grokApiKey: string) {
    this.grokApiKey = grokApiKey;
  }

  async parseERPWithAI(fullText: string, fileName: string): Promise<ExtractedERPData> {
    console.log('🧠 Starting AI-powered ERP parsing with Grok...');
    console.log('📄 Text length:', fullText.length, 'characters');

    try {
      const aiResponse = await this.callGrokAPI(fullText);
      const parsedData = this.validateAndNormalizeAIResponse(aiResponse);
      
      console.log('✅ AI ERP parsing completed:', {
        client: parsedData.client,
        vendor: parsedData.vendor,
        itemsCount: parsedData.items.length,
        total: parsedData.total,
        paymentTerms: parsedData.paymentTerms
      });

      return parsedData;
    } catch (error) {
      console.error('❌ AI ERP parsing failed:', error.message);
      throw new Error(`AI ERP parsing failed: ${error.message}`);
    }
  }

  private async callGrokAPI(fullText: string): Promise<any> {
    const prompt = this.buildERPExtractionPrompt(fullText);
    
    const requestBody = {
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em análise de propostas comerciais e orçamentos de ERP brasileiros. Sua tarefa é extrair dados estruturados de documentos comerciais.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'grok-2-1212',
      temperature: 0.1,
      max_tokens: 2000
    };

    console.log('🚀 Calling Grok API for ERP parsing...');
    
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.grokApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Grok API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      throw new Error('Invalid Grok API response structure');
    }

    return result.choices[0].message.content;
  }

  private buildERPExtractionPrompt(fullText: string): string {
    return `
IMPORTANTE: Analise este texto de uma proposta comercial/orçamento de ERP e extraia os dados estruturados.

TEXTO DO DOCUMENTO:
${fullText}

INSTRUÇÕES PARA EXTRAÇÃO:

1. IDENTIFICAÇÃO DO CLIENTE:
   - Procure por "Cliente:", "CLIENTE:", nomes próprios após números de proposta
   - Pode estar no cabeçalho ou início do documento
   - Ignore dados da empresa vendedora

2. IDENTIFICAÇÃO DO VENDEDOR/FORNECEDOR:
   - Procure por "Vendedor:", "Responsável:", "Atendente:"
   - Geralmente aparece no final ou rodapé

3. EXTRAÇÃO DE ITENS:
   - Procure por tabelas com colunas: Descrição, Quantidade, Valor Unitário, Total
   - Identifique produtos como: "PLACA GESSO", "MONTANTE", "GUIA", etc.
   - Extraia quantidades (números + unidades como PC, M, KG)
   - Extraia valores monetários (R$ ou formato brasileiro)

4. CÁLCULOS FINANCEIROS:
   - Subtotal: soma de todos os itens
   - Total: valor final (pode incluir impostos/descontos)
   - Procure por "TOTAL:", "SUBTOTAL:", "VALOR TOTAL:"

5. CONDIÇÕES COMERCIAIS:
   - Condições de pagamento: "BOLETO", "PIX", prazos
   - Prazo de entrega: datas ou períodos
   - Número da proposta/orçamento

ESTRUTURA DE SAÍDA - Retorne APENAS um JSON válido:
{
  "client": "Nome do cliente identificado",
  "vendor": "Nome do vendedor/responsável", 
  "proposalNumber": "Número da proposta se encontrado",
  "date": "Data do documento se encontrada",
  "items": [
    {
      "description": "Descrição completa do produto",
      "quantity": número_quantidade,
      "unit": "unidade (PC, M, KG, etc)",
      "unitPrice": valor_unitário_numérico,
      "total": valor_total_do_item
    }
  ],
  "subtotal": valor_subtotal_numérico,
  "total": valor_total_final_numérico,
  "paymentTerms": "Condições de pagamento encontradas",
  "delivery": "Prazo de entrega encontrado"
}

REGRAS DE VALIDAÇÃO:
- Todos os valores monetários devem ser números (sem R$, sem pontos/vírgulas como separadores de milhares)
- Quantidades devem ser números inteiros ou decimais
- Se não encontrar algum campo, use "N/A" para textos e 0 para números
- Certifique-se que a soma dos totais dos itens bate com o subtotal
- Items array deve conter todos os produtos encontrados na tabela

EXEMPLOS DE PRODUTOS COMUNS:
- "RU PLACA GESSO G,K,P 12,5 1200X1800MM"
- "MONTANTE 48 S/ST - 3M"
- "GUIA 48 S/ST - 3M" 
- "RODAPE DE IMPERMEABILIZACAO W200 - 3M"

RETORNE APENAS O JSON, sem explicações adicionais.
`;
  }

  private validateAndNormalizeAIResponse(aiResponse: string): ExtractedERPData {
    console.log('🔍 Validating AI ERP response...');
    
    try {
      // Limpar response e extrair JSON
      let cleanResponse = aiResponse.trim();
      
      // Se a resposta contém markdown, extrair o JSON
      if (cleanResponse.includes('```json')) {
        const jsonMatch = cleanResponse.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          cleanResponse = jsonMatch[1];
        }
      } else if (cleanResponse.includes('```')) {
        const jsonMatch = cleanResponse.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          cleanResponse = jsonMatch[1];
        }
      }

      const parsedData = JSON.parse(cleanResponse);
      
      // Normalizar e validar dados
      const normalized: ExtractedERPData = {
        client: parsedData.client || 'Cliente não identificado',
        vendor: parsedData.vendor || 'N/A',
        proposalNumber: parsedData.proposalNumber || 'N/A',
        date: parsedData.date || 'N/A',
        items: this.parseItems(parsedData.items),
        subtotal: this.parseNumber(parsedData.subtotal, 0),
        total: this.parseNumber(parsedData.total, 0),
        paymentTerms: parsedData.paymentTerms || 'N/A',
        delivery: parsedData.delivery || 'N/A'
      };

      // Validar consistência dos dados
      this.validateExtractedData(normalized);

      return normalized;
    } catch (error) {
      console.error('❌ Error parsing AI ERP response:', error.message);
      console.log('Raw AI response:', aiResponse);
      throw new Error(`Invalid AI ERP response format: ${error.message}`);
    }
  }

  private parseItems(items: any): Array<{description: string, quantity: number, unit: string, unitPrice: number, total: number}> {
    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .filter(item => item && typeof item === 'object' && item.description)
      .map(item => ({
        description: item.description || 'Produto não identificado',
        quantity: this.parseNumber(item.quantity, 1),
        unit: item.unit || 'UN',
        unitPrice: this.parseNumber(item.unitPrice, 0),
        total: this.parseNumber(item.total, 0)
      }));
  }

  private parseNumber(value: any, defaultValue: number): number {
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }
    if (typeof value === 'string') {
      // Remove R$, espaços, e trata vírgula como decimal
      const cleaned = value.replace(/[R$\s]/g, '').replace(',', '.');
      const parsed = parseFloat(cleaned);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    return defaultValue;
  }

  private validateExtractedData(data: ExtractedERPData): void {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Validar itens
    if (data.items.length === 0) {
      warnings.push('Nenhum item encontrado na proposta');
    } else {
      // Verificar se todos os itens têm preços
      const itemsWithoutPrice = data.items.filter(item => item.unitPrice <= 0).length;
      if (itemsWithoutPrice > 0) {
        warnings.push(`${itemsWithoutPrice} itens sem preço unitário`);
      }

      // Verificar consistência do total
      const calculatedSubtotal = data.items.reduce((sum, item) => sum + item.total, 0);
      if (data.subtotal > 0 && Math.abs(calculatedSubtotal - data.subtotal) > 1) {
        warnings.push(`Inconsistência no subtotal: calculado ${calculatedSubtotal}, informado ${data.subtotal}`);
      }
    }

    // Validar cliente
    if (data.client === 'Cliente não identificado') {
      warnings.push('Cliente não identificado no documento');
    }

    // Validar total
    if (data.total <= 0) {
      warnings.push('Valor total não identificado');
    }

    // Calcular score de qualidade
    const qualityScore = this.calculateDataQualityScore(data);

    if (issues.length > 0) {
      console.error('❌ Critical validation issues:', issues);
    }
    
    if (warnings.length > 0) {
      console.warn('⚠️ Validation warnings:', warnings);
    }

    console.log('📊 ERP data quality metrics:', {
      qualityScore: `${(qualityScore * 100).toFixed(1)}%`,
      hasClient: data.client !== 'Cliente não identificado',
      hasVendor: data.vendor !== 'N/A',
      itemsCount: data.items.length,
      hasTotal: data.total > 0,
      hasPaymentTerms: data.paymentTerms !== 'N/A',
      totalValue: data.total,
      criticalIssues: issues.length,
      warnings: warnings.length
    });
  }

  private calculateDataQualityScore(data: ExtractedERPData): number {
    let score = 0;
    const maxScore = 10;

    // Cliente (peso 2)
    if (data.client !== 'Cliente não identificado') {
      score += 2;
    }

    // Itens (peso 3)
    if (data.items.length > 0) {
      score += 1;
      // Bonus por qualidade dos itens
      const itemsWithPrices = data.items.filter(item => item.unitPrice > 0).length;
      if (itemsWithPrices >= data.items.length * 0.8) {
        score += 1;
      }
      // Bonus por quantidade de itens
      if (data.items.length >= 3) {
        score += 1;
      }
    }

    // Total (peso 2)
    if (data.total > 0) {
      score += 2;
    }

    // Vendedor (peso 1)
    if (data.vendor !== 'N/A') {
      score += 1;
    }

    // Condições comerciais (peso 1)
    if (data.paymentTerms !== 'N/A') {
      score += 1;
    }

    return score / maxScore;
  }
}