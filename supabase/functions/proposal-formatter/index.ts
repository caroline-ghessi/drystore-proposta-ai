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
    console.log('📝 proposal-formatter: Iniciando formatação da proposta');
    
    const { organized_data, format_type = 'drystore_proposal' } = await req.json();
    
    if (!organized_data) {
      throw new Error('Dados organizados não fornecidos');
    }

    let formattedData;

    switch (format_type) {
      case 'drystore_proposal':
        formattedData = formatToDrystoreProposal(organized_data);
        break;
      case 'simple_quote':
        formattedData = formatToSimpleQuote(organized_data);
        break;
      default:
        throw new Error(`Formato não suportado: ${format_type}`);
    }

    console.log('✅ Dados formatados com sucesso');

    return new Response(
      JSON.stringify({
        success: true,
        formatted_data: formattedData,
        format_type: format_type,
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
    console.error('❌ Erro na formatação da proposta:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stage: 'proposal_formatting'
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

function formatToDrystoreProposal(organizedData: any) {
  // Calcula totais se não estiverem presentes
  let calculatedSubtotal = 0;
  const formattedItems = organizedData.items.map((item: any) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const total = quantity * unitPrice;
    
    calculatedSubtotal += total;
    
    return {
      produto_nome: item.description || 'Produto não identificado',
      descricao_item: item.description || 'Descrição não disponível',
      quantidade: quantity,
      preco_unit: unitPrice,
      preco_total: total,
      unidade: item.unit || 'UN'
    };
  });

  const subtotal = organizedData.subtotal > 0 ? organizedData.subtotal : calculatedSubtotal;
  const total = organizedData.total > 0 ? organizedData.total : subtotal;

  return {
    // Dados do cliente
    client_name: organizedData.client !== 'N/A' ? organizedData.client : '',
    client_email: '', // Será preenchido pelo usuário
    
    // Dados da proposta
    proposal_number: organizedData.proposalNumber !== 'N/A' ? organizedData.proposalNumber : '',
    vendor_name: organizedData.vendor !== 'N/A' ? organizedData.vendor : '',
    
    // Itens formatados para o padrão Drystore
    items: formattedItems,
    
    // Valores
    subtotal: subtotal,
    valor_total: total,
    discount_percentage: 0,
    
    // Informações adicionais
    observacoes: [
      organizedData.paymentTerms !== 'N/A' ? `Condições: ${organizedData.paymentTerms}` : '',
      organizedData.delivery !== 'N/A' ? `Entrega: ${organizedData.delivery}` : ''
    ].filter(obs => obs !== '').join('\n'),
    
    // Metadados
    source: 'pdf_extraction',
    extraction_date: organizedData.date !== 'N/A' ? organizedData.date : new Date().toISOString().split('T')[0],
    
    // Status inicial
    status: 'draft',
    validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 dias
  };
}

function formatToSimpleQuote(organizedData: any) {
  return {
    quote_number: organizedData.proposalNumber || generateQuoteNumber(),
    client: organizedData.client,
    items: organizedData.items,
    subtotal: organizedData.subtotal,
    total: organizedData.total,
    terms: organizedData.paymentTerms,
    delivery: organizedData.delivery,
    date: organizedData.date || new Date().toISOString().split('T')[0]
  };
}

function generateQuoteNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `ORÇ-${year}${month}${day}-${random}`;
}