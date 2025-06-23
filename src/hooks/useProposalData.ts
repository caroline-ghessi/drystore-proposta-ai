
import { useMemo } from 'react';
import { useProposal } from '@/hooks/useProposals';
import { useSolutionImages } from '@/hooks/useSolutions';

export const useProposalData = (proposalId: string) => {
  const { data: proposalData, isLoading, error } = useProposal(proposalId);

  // Extrair IDs das soluções para buscar imagens - com verificação de segurança
  const solutionIds = useMemo(() => {
    if (!proposalData?.proposal_solutions || !Array.isArray(proposalData.proposal_solutions)) return [];
    return proposalData.proposal_solutions
      .map((ps: any) => ps.solutions?.id)
      .filter(Boolean) as string[];
  }, [proposalData]);

  // Buscar imagens das soluções
  const { data: solutionImages = [] } = useSolutionImages(solutionIds);

  const { proposal, proposalItems, dataSource } = useMemo(() => {
    if (!proposalData) {
      return {
        proposal: getDefaultProposal(),
        proposalItems: [],
        dataSource: 'mock' as const
      };
    }

    // Mapear dados reais da proposta - com verificações de segurança
    const proposal = {
      id: proposalData.id,
      clientName: proposalData.clients?.nome || 'Cliente',
      clientEmail: proposalData.clients?.email || '',
      clientCompany: proposalData.clients?.empresa || '',
      projectName: 'Projeto de Construção',
      totalPrice: proposalData.valor_total || 0,
      finalPrice: proposalData.valor_total - (proposalData.valor_total * (proposalData.desconto_percentual || 0) / 100),
      discount: proposalData.desconto_percentual || 0,
      validUntil: proposalData.validade ? new Date(proposalData.validade).toLocaleDateString('pt-BR') : '',
      status: proposalData.status || 'draft',
      createdBy: 'Vendedor Drystore',
      observations: proposalData.observacoes || '',
      
      // Novos campos - com fallbacks seguros
      includeVideo: (proposalData as any).include_video || false,
      videoUrl: (proposalData as any).video_url || '',
      includeTechnicalDetails: (proposalData as any).include_technical_details || false,
      
      // Mapear soluções com valores - com verificação de array
      solutions: Array.isArray((proposalData as any).proposal_solutions) 
        ? (proposalData as any).proposal_solutions.map((ps: any) => ({
            id: ps.solutions?.id || '',
            name: ps.solutions?.nome || '',
            description: ps.solutions?.descricao || '',
            category: ps.solutions?.categoria || '',
            value: ps.valor_solucao || 0,
            images: solutionImages.filter(img => img.solution_id === ps.solutions?.id)
          })) || []
        : [],
      
      // Mapear produtos recomendados - com verificação de array
      recommendedProducts: Array.isArray((proposalData as any).proposal_recommended_products)
        ? (proposalData as any).proposal_recommended_products.map((prp: any) => ({
            id: prp.recommended_products?.id || '',
            name: prp.recommended_products?.nome || '',
            description: prp.recommended_products?.descricao || '',
            price: prp.recommended_products?.preco || 0,
            category: prp.recommended_products?.categoria || ''
          })) || []
        : [],

      // Manter campos existentes para compatibilidade
      benefits: [
        'Garantia de 5 anos para estruturas metálicas',
        'Instalação profissional inclusa',
        'Suporte técnico especializado',
        'Materiais certificados e de alta qualidade'
      ],
      technicalDetails: Array.isArray((proposalData as any).proposal_solutions) && (proposalData as any).proposal_solutions.length > 0 
        ? (proposalData as any).proposal_solutions.map((ps: any) => ps.solutions?.descricao || '').filter(Boolean)
        : [],
      technicalImages: solutionImages.map(img => ({
        url: img.image_url,
        title: img.image_title || '',
        description: img.image_description || ''
      }))
    };

    const proposalItems = Array.isArray(proposalData.proposal_items) 
      ? proposalData.proposal_items.map(item => ({
          id: item.id,
          category: item.descricao_item?.split(' - ')[0] || 'Item',
          description: item.produto_nome,
          quantity: Number(item.quantidade),
          unit: item.descricao_item?.split(' - ')[1] || 'un',
          unitPrice: Number(item.preco_unit),
          totalPrice: Number(item.preco_total)
        }))
      : [];

    return {
      proposal,
      proposalItems,
      dataSource: 'database' as const
    };
  }, [proposalData, solutionImages]);

  return {
    proposal,
    proposalItems,
    dataSource,
    isLoading,
    error
  };
};

// Função auxiliar para proposta padrão (mock)
function getDefaultProposal() {
  return {
    id: 'mock-1',
    clientName: 'João Silva',
    clientEmail: 'joao@exemplo.com',
    clientCompany: 'Construtora Silva Ltda',
    projectName: 'Residência Moderna',
    totalPrice: 45825.00,
    finalPrice: 45825.00,
    discount: 0,
    validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
    status: 'pending' as const,
    createdBy: 'Carlos Vendedor',
    observations: 'Prazo de entrega: 30 dias após confirmação do pedido.',
    
    // Novos campos
    includeVideo: false,
    videoUrl: '',
    includeTechnicalDetails: false,
    solutions: [],
    recommendedProducts: [],
    
    // Campos existentes
    benefits: [
      'Garantia de 5 anos para estruturas metálicas',
      'Instalação profissional inclusa',
      'Suporte técnico especializado',
      'Materiais certificados e de alta qualidade'
    ],
    technicalDetails: [],
    technicalImages: []
  };
}
