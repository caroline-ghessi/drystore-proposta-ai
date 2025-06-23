
import { useState, useEffect } from 'react';
import { useProposal } from '@/hooks/useProposals';
import { getMockProposal, getMockProposalItems } from '@/data/mockProposalData';

interface ExtractedData {
  id?: string;
  client?: string;
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  total: number;
  paymentTerms?: string;
  delivery?: string;
  vendor?: string;
  timestamp?: number;
  source?: string;
}

export const useProposalData = (id: string) => {
  const [realProposalData, setRealProposalData] = useState<ExtractedData | null>(null);
  const [isRealData, setIsRealData] = useState(false);
  
  // Buscar dados reais da proposta no Supabase
  const { data: proposalData, isLoading, error } = useProposal(id);
  
  // Carregar dados reais extraídos do PDF
  useEffect(() => {
    console.log('🔍 ProposalView: Carregando dados para proposta ID:', id);
    
    const savedData = sessionStorage.getItem('proposalExtractedData');
    
    if (savedData) {
      try {
        const extractedData: ExtractedData = JSON.parse(savedData);
        console.log('📋 ProposalView: Dados extraídos encontrados:', extractedData);
        
        if (extractedData.items && extractedData.items.length > 0) {
          setRealProposalData(extractedData);
          setIsRealData(true);
          console.log('✅ ProposalView: Usando dados reais extraídos do PDF');
        } else {
          console.log('⚠️ ProposalView: Dados extraídos inválidos, usando mock');
          setIsRealData(false);
        }
      } catch (error) {
        console.error('❌ ProposalView: Erro ao carregar dados extraídos:', error);
        setIsRealData(false);
      }
    } else {
      console.log('📝 ProposalView: Nenhum dado extraído encontrado, usando dados do Supabase');
      setIsRealData(false);
    }
  }, [id]);

  // Gerar dados da proposta baseados nos dados reais do Supabase ou extraídos
  const proposal = proposalData ? {
    id: proposalData.id,
    clientName: proposalData.clients?.nome || 'Cliente',
    originalPrice: proposalData.desconto_percentual > 0 ? 
      proposalData.valor_total / (1 - proposalData.desconto_percentual / 100) : 
      proposalData.valor_total,
    discount: proposalData.desconto_percentual || 0,
    finalPrice: proposalData.valor_total,
    installments: {
      times: 12,
      value: proposalData.valor_total / 12
    },
    roi: '15-25%',
    economy: '30%',
    validUntil: new Date(proposalData.validade).toLocaleDateString('pt-BR'),
    status: proposalData.status,
    // Manter outras propriedades do mock para compatibilidade
    ...getMockProposal(id)
  } : isRealData && realProposalData ? {
    ...getMockProposal(id),
    clientName: realProposalData.client || 'PROPOSTA COMERCIAL',
    finalPrice: realProposalData.total,
  } : getMockProposal(id);

  // Gerar itens da proposta baseados nos dados reais do Supabase ou extraídos
  const proposalItems = proposalData?.proposal_items ? 
    proposalData.proposal_items.map((item, index) => ({
      id: item.id,
      productName: item.produto_nome,
      quantity: Number(item.quantidade),
      unit: 'UN',
      unitPrice: Number(item.preco_unit),
      total: Number(item.preco_total),
      description: item.descricao_item || item.produto_nome,
      category: 'Material',
    })) : isRealData && realProposalData ? 
    realProposalData.items.map((item, index) => ({
      id: String(index + 1),
      productName: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      total: item.total,
      description: item.description,
      category: 'Material Extraído',
    })) : getMockProposalItems();

  // Explicitly type the dataSource to match the expected literal types
  const dataSource: 'supabase' | 'pdf' | 'mock' = proposalData ? 'supabase' : isRealData ? 'pdf' : 'mock';
  
  console.log('🎯 ProposalView: Renderizando com dados:', {
    dataSource,
    clientName: proposal.clientName,
    itemsCount: proposalItems.length,
    total: proposal.finalPrice,
    discount: proposal.discount
  });

  return {
    proposal,
    proposalItems,
    dataSource,
    isLoading,
    error
  };
};
