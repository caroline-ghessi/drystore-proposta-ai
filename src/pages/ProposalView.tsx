
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ProposalHeader } from '@/components/proposal/ProposalHeader';
import VideoProposal from '@/components/proposal/VideoProposal';
import ProposalMainContent from '@/components/proposal/ProposalMainContent';
import ProposalSidebar from '@/components/proposal/ProposalSidebar';
import ProposalFeatureToggles from '@/components/proposal/ProposalFeatureToggles';
import UrgencyCard from '@/components/proposal/UrgencyCard';
import { useProposalInteractions } from '@/hooks/useProposalInteractions';
import { useProposalStatus } from '@/hooks/useProposalStatus';
import { useProposalFeatures } from '@/hooks/useProposalFeatures';
import { useProposal } from '@/hooks/useProposals';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getMockProposal, 
  getMockProposalItems, 
  getMockRecommendedProducts, 
  getMockClientQuestions 
} from '@/data/mockProposalData';
import { getMockAIScore, getMockNextSteps } from '@/data/mockAIData';

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

const ProposalView = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const showAI = searchParams.get('ai') === 'true';
  const [internalNotes, setInternalNotes] = useState<string>('');
  const [realProposalData, setRealProposalData] = useState<ExtractedData | null>(null);
  const [isRealData, setIsRealData] = useState(false);
  
  // Buscar dados reais da proposta no Supabase
  const { data: proposalData, isLoading, error } = useProposal(id || '');
  
  // Custom hooks - devem ser chamados SEMPRE, antes de qualquer return condicional
  const { interactions, addInteraction } = useProposalInteractions();
  const { features, toggleContractGeneration, toggleDeliveryControl } = useProposalFeatures(id || '1');
  
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
    ...getMockProposal(id || '1')
  } : isRealData && realProposalData ? {
    ...getMockProposal(id || '1'),
    clientName: realProposalData.client || 'PROPOSTA COMERCIAL',
    finalPrice: realProposalData.total,
  } : getMockProposal(id || '1');

  // Custom hooks que dependem de proposal - também devem ser chamados sempre
  const { status, handleAccept, handleReject, handleQuestion } = useProposalStatus(
    proposal.clientName, 
    addInteraction
  );

  // Loading state - agora depois de todos os hooks
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando proposta...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.error('❌ ProposalView: Erro ao carregar proposta:', error);
  }

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

  // Dados adicionais (usar mock para compatibilidade)
  const recommendedProducts = getMockRecommendedProducts();
  const clientQuestions = getMockClientQuestions();
  const mockAIScore = getMockAIScore(proposal.id);
  const mockNextSteps = getMockNextSteps(proposal.id);

  // Check if current user is a vendor (not client)
  const isVendor = user?.role !== 'cliente';

  const dataSource = proposalData ? 'supabase' : isRealData ? 'pdf' : 'mock';
  
  console.log('🎯 ProposalView: Renderizando com dados:', {
    dataSource,
    clientName: proposal.clientName,
    itemsCount: proposalItems.length,
    total: proposal.finalPrice,
    discount: proposal.discount
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ProposalHeader proposal={proposal} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Indicador de fonte dos dados */}
        {dataSource !== 'mock' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium">
              {dataSource === 'supabase' ? '✅ Proposta carregada do banco de dados' : '✅ Proposta baseada em dados extraídos do PDF'}
            </p>
            <p className="text-xs text-green-600">
              Cliente: {proposal.clientName} | {proposalItems.length} itens | Total: R$ {proposal.finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              {proposal.discount > 0 && ` | Desconto: ${proposal.discount}%`}
            </p>
          </div>
        )}

        {/* Urgency Card moved to top for better conversion */}
        <div className="mb-6">
          <UrgencyCard validUntil={proposal.validUntil} />
        </div>

        {/* Video Proposal */}
        <div className="mb-6">
          <VideoProposal
            videoUrl="https://example.com/video.mp4"
            vendorName="Carlos Vendedor"
            vendorTitle="Especialista em Soluções Residenciais"
            duration="2:35"
          />
        </div>

        {/* Feature Toggles - Only visible for vendors, representatives and admins */}
        {isVendor && ['admin', 'vendedor_interno', 'representante'].includes(user?.role || '') && (
          <div className="mb-6">
            <ProposalFeatureToggles
              proposalId={id || '1'}
              contractGeneration={features.contractGeneration}
              deliveryControl={features.deliveryControl}
              onToggleContractGeneration={toggleContractGeneration}
              onToggleDeliveryControl={toggleDeliveryControl}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <ProposalMainContent
            proposalItems={proposalItems}
            proposal={proposal}
            internalNotes={internalNotes}
            setInternalNotes={setInternalNotes}
            interactions={interactions}
            addInteraction={addInteraction}
            onQuestionSubmit={handleQuestion}
            status={status}
          />

          <ProposalSidebar
            proposal={proposal}
            status={status}
            onAccept={handleAccept}
            onReject={handleReject}
            showAI={showAI}
            mockAIScore={mockAIScore}
            mockNextSteps={mockNextSteps}
            clientQuestions={clientQuestions}
            contractGeneration={features.contractGeneration}
            deliveryControl={features.deliveryControl}
          />
        </div>
      </div>
    </div>
  );
};

export default ProposalView;
