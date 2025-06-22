
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
      console.log('📝 ProposalView: Nenhum dado extraído encontrado, usando mock');
      setIsRealData(false);
    }
  }, [id]);

  // Gerar dados da proposta baseados nos dados reais ou mock
  const proposal = isRealData && realProposalData ? {
    ...getMockProposal(id || '1'),
    clientName: realProposalData.client || 'PROPOSTA COMERCIAL',
    total: realProposalData.total,
    // Manter outras propriedades do mock para compatibilidade
  } : getMockProposal(id || '1');

  // Gerar itens da proposta baseados nos dados reais ou mock
  const proposalItems = isRealData && realProposalData ? 
    realProposalData.items.map((item, index) => ({
      id: String(index + 1),
      productName: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      total: item.total,
      description: item.description,
      category: 'Material Extraído', // Categoria padrão para itens extraídos
    })) : getMockProposalItems();

  // Dados adicionais (usar mock para compatibilidade)
  const recommendedProducts = getMockRecommendedProducts();
  const clientQuestions = getMockClientQuestions();
  const mockAIScore = getMockAIScore(proposal.id);
  const mockNextSteps = getMockNextSteps(proposal.id);

  // Custom hooks
  const { interactions, addInteraction } = useProposalInteractions();
  const { status, handleAccept, handleReject, handleQuestion } = useProposalStatus(
    proposal.clientName, 
    addInteraction
  );
  const { features, toggleContractGeneration, toggleDeliveryControl } = useProposalFeatures(id || '1');

  // Check if current user is a vendor (not client)
  const isVendor = user?.role !== 'cliente';

  console.log('🎯 ProposalView: Renderizando com dados:', {
    isRealData,
    clientName: proposal.clientName,
    itemsCount: proposalItems.length,
    total: proposal.total
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ProposalHeader proposal={proposal} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Indicador de dados reais vs mock */}
        {isRealData && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium">
              ✅ Proposta baseada em dados extraídos do PDF
            </p>
            <p className="text-xs text-green-600">
              Cliente: {realProposalData?.client} | {realProposalData?.items.length} itens | Total: R$ {realProposalData?.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
