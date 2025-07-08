import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('✅ data-validator: Iniciando validação de dados');
    
    const { formatted_data, validation_rules = 'standard' } = await req.json();
    
    if (!formatted_data) {
      throw new Error('Dados formatados não fornecidos');
    }

    const validationResult = await validateData(formatted_data, validation_rules);
    
    console.log(`✅ Validação concluída - Score: ${validationResult.confidence_score}%`);

    return new Response(
      JSON.stringify({
        success: true,
        validation_result: validationResult,
        processing_time: Date.now()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Erro na validação de dados:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stage: 'data_validation'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

async function validateData(data: any, rules: string) {
  const validation = {
    is_valid: true,
    confidence_score: 0,
    errors: [] as string[],
    warnings: [] as string[],
    suggestions: [] as string[],
    field_scores: {} as Record<string, number>
  };

  // Validação de campos obrigatórios
  const requiredFields = ['items', 'valor_total'];
  requiredFields.forEach(field => {
    if (!data[field]) {
      validation.errors.push(`Campo obrigatório ausente: ${field}`);
      validation.is_valid = false;
    }
  });

  // Validação de itens
  if (data.items && Array.isArray(data.items)) {
    validation.field_scores.items = validateItems(data.items, validation);
  }

  // Validação de valores
  if (data.valor_total !== undefined) {
    validation.field_scores.valor_total = validateTotalValue(data.valor_total, data.items, validation);
  }

  // Validação de dados do cliente
  validation.field_scores.client = validateClientData(data, validation);

  // Validação de datas
  if (data.extraction_date) {
    validation.field_scores.date = validateDate(data.extraction_date, validation);
  }

  // Cálculo do score de confiança
  validation.confidence_score = calculateOverallScore(validation.field_scores, validation.errors);

  // Sugestões baseadas na análise
  generateSuggestions(data, validation);

  return validation;
}

function validateItems(items: any[], validation: any): number {
  let score = 0;
  let maxScore = 0;

  if (!items || items.length === 0) {
    validation.errors.push('Nenhum item encontrado na proposta');
    return 0;
  }

  items.forEach((item, index) => {
    maxScore += 100;
    let itemScore = 0;

    // Validação de descrição
    if (item.produto_nome && item.produto_nome.trim() !== '') {
      itemScore += 25;
    } else {
      validation.warnings.push(`Item ${index + 1}: Descrição em branco`);
    }

    // Validação de quantidade
    if (item.quantidade && item.quantidade > 0) {
      itemScore += 25;
    } else {
      validation.warnings.push(`Item ${index + 1}: Quantidade inválida`);
    }

    // Validação de preço unitário
    if (item.preco_unit && item.preco_unit > 0) {
      itemScore += 25;
    } else {
      validation.warnings.push(`Item ${index + 1}: Preço unitário inválido`);
    }

    // Validação de total
    const expectedTotal = (item.quantidade || 0) * (item.preco_unit || 0);
    if (Math.abs((item.preco_total || 0) - expectedTotal) < 0.01) {
      itemScore += 25;
    } else {
      validation.warnings.push(`Item ${index + 1}: Total calculado não confere`);
    }

    score += itemScore;
  });

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

function validateTotalValue(total: number, items: any[], validation: any): number {
  if (!total || total <= 0) {
    validation.errors.push('Valor total inválido');
    return 0;
  }

  // Verifica se o total bate com a soma dos itens
  if (items && Array.isArray(items)) {
    const calculatedTotal = items.reduce((sum, item) => sum + (item.preco_total || 0), 0);
    const difference = Math.abs(total - calculatedTotal);
    
    if (difference > 0.01) {
      validation.warnings.push(`Divergência entre valor total informado (${total}) e calculado (${calculatedTotal})`);
      return 70; // Score menor por divergência
    }
  }

  return 100;
}

function validateClientData(data: any, validation: any): number {
  let score = 0;
  
  if (data.client_name && data.client_name !== 'N/A' && data.client_name.trim() !== '') {
    score += 50;
  } else {
    validation.suggestions.push('Nome do cliente não identificado - será necessário inserir manualmente');
  }

  if (data.client_email && data.client_email.includes('@')) {
    score += 50;
  } else {
    validation.suggestions.push('Email do cliente não identificado - será necessário inserir manualmente');
  }

  return score;
}

function validateDate(dateStr: string, validation: any): number {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.abs((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 365) {
      validation.warnings.push('Data do documento parece muito antiga');
      return 70;
    }
    
    return 100;
  } catch (error) {
    validation.warnings.push('Formato de data inválido');
    return 50;
  }
}

function calculateOverallScore(fieldScores: Record<string, number>, errors: string[]): number {
  if (errors.length > 0) {
    return Math.max(0, 50 - (errors.length * 10)); // Penaliza erros críticos
  }

  const scores = Object.values(fieldScores);
  if (scores.length === 0) return 0;

  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return Math.round(average);
}

function generateSuggestions(data: any, validation: any): void {
  // Sugestões específicas baseadas nos dados
  if (!data.client_email) {
    validation.suggestions.push('Considere solicitar o email do cliente para envio da proposta');
  }

  if (validation.confidence_score < 80) {
    validation.suggestions.push('Score de confiança baixo - revise os dados antes de prosseguir');
  }

  if (data.items && data.items.length > 20) {
    validation.suggestions.push('Muitos itens detectados - considere agrupar itens similares');
  }
}