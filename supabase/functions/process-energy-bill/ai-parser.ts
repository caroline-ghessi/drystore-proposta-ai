// AI-powered energy bill parser using Grok API

import type { ExtractedEnergyBillData } from './types.ts';

export class AIEnergyBillParser {
  private grokApiKey: string;
  private apiUrl = 'https://api.x.ai/v1/chat/completions';

  constructor(grokApiKey: string) {
    this.grokApiKey = grokApiKey;
  }

  async parseEnergyBillWithAI(fullText: string, fileName: string): Promise<ExtractedEnergyBillData> {
    console.log('🧠 Starting AI-powered energy bill parsing with Grok...');
    console.log('📄 Text length:', fullText.length, 'characters');

    try {
      const aiResponse = await this.callGrokAPI(fullText);
      const parsedData = this.validateAndNormalizeAIResponse(aiResponse);
      
      console.log('✅ AI parsing completed:', {
        concessionaria: parsedData.concessionaria,
        nome_cliente: parsedData.nome_cliente,
        endereco: parsedData.endereco?.substring(0, 50) + '...',
        uc: parsedData.uc,
        consumo_atual_kwh: parsedData.consumo_atual_kwh,
        historico_length: parsedData.consumo_historico.length
      });

      return parsedData;
    } catch (error) {
      console.error('❌ AI parsing failed:', error.message);
      throw new Error(`AI parsing failed: ${error.message}`);
    }
  }

  private async callGrokAPI(fullText: string): Promise<any> {
    const prompt = this.buildExtractionPrompt(fullText);
    
    const requestBody = {
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em análise de contas de energia elétrica brasileiras. Sua tarefa é extrair dados específicos do cliente (não da empresa distribuidora) de contas de energia.'
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

    console.log('🚀 Calling Grok API...');
    
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

  private buildExtractionPrompt(fullText: string): string {
    return `
IMPORTANTE: Analise este texto de uma conta de energia elétrica e extraia APENAS os dados DO CLIENTE, não da empresa distribuidora.

TEXTO DA CONTA:
${fullText}

INSTRUÇÕES CRÍTICAS:
1. IGNORE completamente dados da empresa CEEE/distribuidora (endereços empresariais, nomes de empresas)
2. Procure dados do CLIENTE RESIDENCIAL/COMERCIAL que recebe a conta
3. O UC (Unidade Consumidora) geralmente marca onde começam os dados do cliente
4. Endereços da empresa geralmente contêm: "CLOVIS PAIM GRIVOT", "CENTRO EMPRESARIAL", "SEDE"
5. Procure por nomes de PESSOAS (não empresas) e endereços RESIDENCIAIS

EXTRAIA e retorne APENAS um JSON válido com esta estrutura:
{
  "concessionaria": "CEEE" ou nome da distribuidora,
  "nome_cliente": "Nome completo da pessoa física ou jurídica cliente",
  "endereco": "Endereço residencial/comercial do cliente (não da distribuidora)",
  "cidade": "Cidade do cliente",
  "estado": "Estado (ex: RS)",
  "uc": "Número da Unidade Consumidora",
  "tarifa_kwh": valor numérico da tarifa por kWh,
  "consumo_atual_kwh": valor numérico do consumo atual,
  "periodo": "Período de referência da conta",
  "data_vencimento": "Data de vencimento",
  "consumo_historico": [
    {"mes": "janeiro", "consumo": 300},
    {"mes": "fevereiro", "consumo": 280}
  ]
}

Se não conseguir identificar algum campo, use:
- "N/A" para textos
- 0 para números
- [] para arrays

RETORNE APENAS O JSON, sem explicações adicionais.
`;
  }

  private validateAndNormalizeAIResponse(aiResponse: string): ExtractedEnergyBillData {
    console.log('🔍 Validating AI response...');
    
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
      
      // Validar estrutura básica
      const requiredFields = ['concessionaria', 'nome_cliente', 'endereco', 'uc'];
      for (const field of requiredFields) {
        if (!parsedData[field]) {
          console.warn(`⚠️ Missing field ${field}, using default`);
        }
      }

      // Normalizar e validar dados
      const normalized: ExtractedEnergyBillData = {
        concessionaria: parsedData.concessionaria || 'CEEE',
        nome_cliente: parsedData.nome_cliente || 'Cliente não identificado',
        endereco: parsedData.endereco || 'Endereço não identificado',
        cidade: parsedData.cidade || 'N/A',
        estado: parsedData.estado || 'N/A',
        uc: parsedData.uc || 'N/A',
        tarifa_kwh: this.parseNumber(parsedData.tarifa_kwh, 0.75),
        consumo_atual_kwh: this.parseNumber(parsedData.consumo_atual_kwh, 0),
        periodo: parsedData.periodo || 'N/A',
        data_vencimento: parsedData.data_vencimento || 'N/A',
        consumo_historico: this.parseConsumptionHistory(parsedData.consumo_historico)
      };

      // Validações de qualidade
      this.validateExtractedData(normalized);

      return normalized;
    } catch (error) {
      console.error('❌ Error parsing AI response:', error.message);
      console.log('Raw AI response:', aiResponse);
      throw new Error(`Invalid AI response format: ${error.message}`);
    }
  }

  private parseNumber(value: any, defaultValue: number): number {
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(',', '.'));
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    return defaultValue;
  }

  private parseConsumptionHistory(history: any): Array<{mes: string, consumo: number, ano?: string}> {
    if (!Array.isArray(history)) {
      return [];
    }

    return history
      .filter(item => item && typeof item === 'object' && item.mes && typeof item.consumo === 'number')
      .map(item => ({
        mes: item.mes,
        consumo: item.consumo,
        ano: item.ano || undefined
      }))
      .slice(0, 12); // Máximo 12 meses
  }

  private validateExtractedData(data: ExtractedEnergyBillData): void {
    const issues: string[] = [];

    // Validar se não confundiu dados da empresa com cliente
    const businessKeywords = ['ceee', 'energia', 'elétrica', 'distribuidora', 'clovis paim grivot'];
    const nameAndAddress = `${data.nome_cliente} ${data.endereco}`.toLowerCase();
    
    for (const keyword of businessKeywords) {
      if (nameAndAddress.includes(keyword)) {
        issues.push(`Possível confusão com dados da empresa: contém "${keyword}"`);
      }
    }

    // Validar UC
    if (data.uc !== 'N/A' && (data.uc.length < 8 || data.uc.length > 12)) {
      issues.push('UC com formato suspeito');
    }

    // Validar tarifa
    if (data.tarifa_kwh < 0.3 || data.tarifa_kwh > 3.0) {
      issues.push('Tarifa fora da faixa esperada (0.3-3.0)');
    }

    if (issues.length > 0) {
      console.warn('⚠️ Validation issues detected:', issues);
    }

    console.log('📊 Data quality metrics:', {
      hasClientName: data.nome_cliente !== 'Cliente não identificado',
      hasAddress: data.endereco !== 'Endereço não identificado',
      hasUC: data.uc !== 'N/A',
      hasConsumption: data.consumo_atual_kwh > 0,
      hasHistory: data.consumo_historico.length > 0,
      validationIssues: issues.length
    });
  }
}