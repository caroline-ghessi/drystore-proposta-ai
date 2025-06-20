import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ProposalHeader } from '@/components/proposal/ProposalHeader';
import { ProposalBenefits } from '@/components/proposal/ProposalBenefits';
import { TechnicalDetails } from '@/components/proposal/TechnicalDetails';
import { InvestmentCard } from '@/components/proposal/InvestmentCard';
import { StatusMessage } from '@/components/proposal/StatusMessage';
import InteractionLog from '@/components/proposal/InteractionLog';
import InternalNotes from '@/components/proposal/InternalNotes';
import AIAssistant from '@/components/proposal/AIAssistant';
import ProposalItemsTable from '@/components/proposal/ProposalItemsTable';
import UrgencyCard from '@/components/proposal/UrgencyCard';
import RecommendedProducts from '@/components/proposal/RecommendedProducts';
import ClientQuestionForm from '@/components/proposal/ClientQuestionForm';
import ProposalActions from '@/components/proposal/ProposalActions';
import VideoProposal from '@/components/proposal/VideoProposal';
import AIScoreCard from '@/components/ai/AIScoreCard';
import NextStepSuggestions from '@/components/ai/NextStepSuggestions';
import { Button } from '@/components/ui/button';
import { Package, MessageCircle } from 'lucide-react';
import { AIScore, NextStepSuggestion } from '@/types/aiScore';

interface Interaction {
  id: string;
  type: 'edit' | 'send' | 'view' | 'accept' | 'reject' | 'question' | 'note';
  description: string;
  user: string;
  timestamp: string;
  details?: string;
}

const ProposalView = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const showAI = searchParams.get('ai') === 'true';
  const { toast } = useToast();
  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [internalNotes, setInternalNotes] = useState<string[]>([]);
  
  // Dados mockados da proposta
  const proposal = {
    id: id,
    number: 'PROP-2024-001',
    title: 'Proposta Personalizada',
    subtitle: 'Solução completa para sua obra',
    clientName: 'João Silva',
    clientEmail: 'joao.silva@email.com',
    clientPhone: '(11) 99999-9999',
    projectName: 'Residência Moderna - Sistemas Integrados',
    address: 'Rua das Construções, 456 - São Paulo/SP',
    date: '19/06/2025',
    validUntil: '26/06/2025',
    vendorName: 'Carlos Vendedor',
    vendorEmail: 'carlos@drystore.com',
    area: '180m²',
    originalPrice: 30975,
    discount: 0,
    finalPrice: 30975,
    installments: {
      times: 12,
      value: 2581
    },
    roi: '15 anos',
    economy: '+25%',
    isExpired: false,
    expirationDate: '26/06/2025',
    benefits: [
      'Materiais de alta qualidade',
      'Garantia estendida',
      'Instalação profissional',
      'Suporte técnico especializado',
      'Melhor custo-benefício'
    ],
    technicalDetails: 'Solução completa integrando sistemas de cobertura, revestimento e acabamento. Todos os materiais são de primeira linha com garantia estendida.',
    technicalImages: [
      {
        url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=300&fit=crop',
        description: 'Exemplo de aplicação de telhas shingle'
      },
      {
        url: 'https://images.unsplash.com/photo-1439337153520-7082a56a81f4?w=500&h=300&fit=crop',
        description: 'Sistema de drywall instalado'
      }
    ],
    solutions: [
      {
        name: 'Sistema de Cobertura',
        products: [
          {
            name: 'Telhas Shingle Premium',
            description: 'Telhas asfálticas cor cinza escuro',
            area: '180m²',
            unitPrice: 45,
            totalPrice: 8100
          },
          {
            name: 'Estrutura de Madeira',
            description: 'Caibros e ripas tratadas',
            area: '180m²',
            unitPrice: 25,
            totalPrice: 4500
          }
        ]
      },
      {
        name: 'Sistema Drywall',
        products: [
          {
            name: 'Placas Drywall 12,5mm',
            description: 'Placas standard para forro',
            area: '120 placas',
            unitPrice: 62.5,
            totalPrice: 7500
          },
          {
            name: 'Perfis Metálicos',
            description: 'Sistema completo de fixação',
            area: '1 vb',
            unitPrice: 2800,
            totalPrice: 2800
          }
        ]
      },
      {
        name: 'Revestimento Externo',
        products: [
          {
            name: 'Painéis de Fachada',
            description: 'Painéis metálicos cor branca',
            area: '95m²',
            unitPrice: 85,
            totalPrice: 8075
          }
        ]
      }
    ]
  };

  const clientQuestions = [
    'Qual a garantia dos materiais?',
    'É possível parcelar em mais vezes?',
    'Vocês fazem a instalação?'
  ];

  // Dados mockados dos itens da proposta
  const proposalItems = [
    { description: 'Telhas Shingle Premium - Cor Cinza Escuro', quantity: 180, unit: 'm²', unitPrice: 45.00, total: 8100.00 },
    { description: 'Estrutura de Madeira Tratada', quantity: 180, unit: 'm²', unitPrice: 25.00, total: 4500.00 },
    { description: 'Drywall 12,5mm - Placas Standard', quantity: 120, unit: 'placas', unitPrice: 62.50, total: 7500.00 },
    { description: 'Perfis Metálicos para Drywall', quantity: 1, unit: 'vb', unitPrice: 2800.00, total: 2800.00 },
    { description: 'Painéis Metálicos para Fachada', quantity: 95, unit: 'm²', unitPrice: 85.00, total: 8075.00 }
  ];

  // Dados mockados dos produtos recomendados
  const recommendedProducts = [
    {
      id: 1,
      name: 'Kit Isolamento Térmico',
      description: 'Melhore o conforto térmico da sua obra',
      price: 3500,
      originalPrice: 4200,
      image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=200&fit=crop'
    },
    {
      id: 2,
      name: 'Sistema de Iluminação LED',
      description: 'Economia de até 80% na conta de luz',
      price: 2800,
      originalPrice: 3500,
      image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=300&h=200&fit=crop'
    }
  ];

  // Mock AI Score data
  const mockAIScore: AIScore = {
    proposalId: id || '1',
    score: 78,
    factors: {
      clientProfile: 85,
      responseTime: 92,
      ticketSize: 65,
      textSentiment: 75,
      pastInteractions: 70
    },
    recommendations: [
      'Cliente responde rapidamente - aproveite o momento',
      'Destaque a garantia estendida no próximo contato',
      'Considere oferecer parcelamento em 12x'
    ],
    confidence: 'high',
    lastCalculated: new Date().toISOString()
  };

  // Mock Next Step Suggestions for rejected proposals
  const mockNextSteps: NextStepSuggestion = {
    id: '1',
    proposalId: id || '1',
    rejectionReason: 'Preço muito alto',
    suggestedActions: [
      {
        action: 'Oferecer desconto de 10%',
        description: 'Propor desconto progressivo baseado no volume de compra',
        priority: 'high',
        estimatedSuccess: 75
      },
      {
        action: 'Parcelamento em 18x',
        description: 'Estender o parcelamento para reduzir valor das parcelas',
        priority: 'medium',
        estimatedSuccess: 60
      },
      {
        action: 'Agendar reunião técnica',
        description: 'Demonstrar valor agregado com apresentação técnica',
        priority: 'medium',
        estimatedSuccess: 55
      }
    ],
    createdAt: new Date().toISOString()
  };

  const addInteraction = (interaction: Omit<Interaction, 'id' | 'timestamp'>) => {
    const newInteraction: Interaction = {
      ...interaction,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('pt-BR')
    };
    setInteractions(prev => [...prev, newInteraction]);
  };

  const handleAccept = () => {
    setStatus('accepted');
    addInteraction({
      type: 'accept',
      description: 'Proposta aceita pelo cliente',
      user: proposal.clientName
    });
    toast({
      title: "Proposta Aceita!",
      description: "O vendedor será notificado sobre sua decisão.",
    });
  };

  const handleReject = () => {
    setStatus('rejected');
    addInteraction({
      type: 'reject',
      description: 'Proposta rejeitada pelo cliente',
      user: proposal.clientName
    });
    toast({
      title: "Proposta Rejeitada",
      description: "O vendedor foi notificado sobre sua decisão.",
    });
  };

  const handleQuestion = (question: string) => {
    addInteraction({
      type: 'question',
      description: 'Cliente enviou dúvida',
      user: proposal.clientName,
      details: question
    });
    
    toast({
      title: "Dúvida Enviada",
      description: "Sua mensagem foi enviada ao vendedor.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProposalHeader proposal={proposal} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RecommendedProducts products={recommendedProducts} />

        {/* Video Proposal */}
        <div className="mb-6">
          <VideoProposal
            videoUrl="https://example.com/video.mp4"
            vendorName="Carlos Vendedor"
            vendorTitle="Especialista em Soluções Residenciais"
            duration="2:35"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            <ProposalItemsTable items={proposalItems} totalPrice={proposal.finalPrice} />

            <UrgencyCard validUntil={proposal.validUntil} />

            <ProposalBenefits benefits={proposal.benefits} />
            
            <TechnicalDetails 
              technicalDetails={proposal.technicalDetails}
              technicalImages={proposal.technicalImages}
              solutions={proposal.solutions}
            />

            {/* Chat com IA Técnica */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-blue-900">Dúvidas Técnicas?</h3>
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-blue-800 mb-3">
                Converse com nossa IA especializada para esclarecer detalhes técnicos sobre os produtos e soluções.
              </p>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Iniciar Chat Técnico
              </Button>
            </div>

            <InternalNotes
              proposalId={proposal.id!}
              notes={internalNotes}
              onNotesChange={setInternalNotes}
            />

            <InteractionLog
              proposalId={proposal.id!}
              interactions={interactions}
              onAddInteraction={addInteraction}
            />

            <ClientQuestionForm onQuestionSubmit={handleQuestion} />

            <StatusMessage status={status} />
          </div>

          {/* Sidebar - Investimento e Ações */}
          <div className="space-y-6">
            <InvestmentCard 
              proposal={proposal}
              status={status}
              onAccept={handleAccept}
              onQuestion={() => {}}
            />

            {showAI && (
              <>
                <AIScoreCard aiScore={mockAIScore} />
                {status === 'rejected' && (
                  <NextStepSuggestions suggestions={mockNextSteps} />
                )}
                <AIAssistant
                  proposalId={proposal.id!}
                  clientQuestions={clientQuestions}
                  proposalData={proposal}
                />
              </>
            )}

            <ProposalActions 
              status={status}
              onAccept={handleAccept}
              onReject={handleReject}
            />

            {status === 'accepted' && (
              <div className="space-y-4">
                <Button 
                  onClick={() => navigate(`/delivery-tracking/${proposal.id}`)}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Package className="w-5 h-5 mr-2" />
                  Acompanhar Entregas
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Assinar Contrato Digitalmente
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalView;
