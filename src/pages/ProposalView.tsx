
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ProposalHeader } from '@/components/proposal/ProposalHeader';
import { ProposalBenefits } from '@/components/proposal/ProposalBenefits';
import { TechnicalDetails } from '@/components/proposal/TechnicalDetails';
import { InvestmentCard } from '@/components/proposal/InvestmentCard';
import { StatusMessage } from '@/components/proposal/StatusMessage';

const ProposalView = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');

  // Dados mockados da proposta
  const proposal = {
    id: id,
    number: 'PROP-2024-001',
    title: 'Telhas Shingle',
    subtitle: 'Proposta Exclusiva para Maria Santos',
    clientName: 'Maria Santos',
    clientEmail: 'maria.santos@email.com',
    clientPhone: '(11) 99999-9999',
    projectName: 'Cobertura residencial com telhas shingle premium cor cinza escuro',
    address: 'Rua das Flores, 123 - São Paulo/SP',
    date: '17/06/2025',
    validUntil: '19/07/2024',
    vendorName: 'Carlos Vendedor',
    vendorEmail: 'carlos@drystore.com',
    area: '180m²',
    originalPrice: 21000,
    discount: 10,
    finalPrice: 18900,
    installments: {
      times: 10,
      value: 1890
    },
    roi: '10 anos',
    economy: '+20%',
    isExpired: true,
    expirationDate: '19/07/2024',
    benefits: [
      'Resistência superior a granizo',
      'Isolamento térmico e acústico',
      'Design moderno e elegante',
      '30 anos de garantia',
      'Facilidade de manutenção'
    ],
    technicalDetails: 'Cobertura residencial com telhas shingle premium cor cinza escuro. Área total de 180m² incluindo estrutura de madeira, manta térmica e sistema de captação pluvial.',
    technicalImages: [
      {
        url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=300&fit=crop',
        description: 'Vista detalhada da instalação das telhas shingle'
      },
      {
        url: 'https://images.unsplash.com/photo-1439337153520-7082a56a81f4?w=500&h=300&fit=crop',
        description: 'Sistema de ventilação e estrutura'
      }
    ],
    solutions: [
      {
        name: 'Cobertura',
        products: [
          {
            name: 'Telhas Shingle Premium',
            description: 'Telhas asfálticas de alta qualidade cor cinza escuro',
            area: '180m²',
            unitPrice: 45,
            totalPrice: 8100
          },
          {
            name: 'Estrutura de Madeira',
            description: 'Caibros e ripas em madeira tratada',
            area: '180m²',
            unitPrice: 25,
            totalPrice: 4500
          }
        ]
      },
      {
        name: 'Impermeabilização',
        products: [
          {
            name: 'Manta Asfáltica',
            description: 'Manta térmica e impermeabilizante',
            area: '180m²',
            unitPrice: 18,
            totalPrice: 3240
          }
        ]
      },
      {
        name: 'Acabamentos',
        products: [
          {
            name: 'Calhas e Rufos',
            description: 'Sistema completo de captação pluvial',
            area: '45m',
            unitPrice: 35,
            totalPrice: 1575
          },
          {
            name: 'Ventilação',
            description: 'Sistema de ventilação da cobertura',
            area: '12 unidades',
            unitPrice: 65,
            totalPrice: 780
          }
        ]
      }
    ]
  };

  const handleAccept = () => {
    setStatus('accepted');
    toast({
      title: "Proposta Aceita!",
      description: "O vendedor será notificado sobre sua decisão.",
    });
  };

  const handleQuestion = () => {
    toast({
      title: "Dúvida Enviada",
      description: "Sua mensagem foi enviada ao vendedor.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProposalHeader proposal={proposal} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            <ProposalBenefits benefits={proposal.benefits} />
            
            <TechnicalDetails 
              technicalDetails={proposal.technicalDetails}
              technicalImages={proposal.technicalImages}
              solutions={proposal.solutions}
            />

            <StatusMessage status={status} />
          </div>

          {/* Sidebar - Investimento e Ações */}
          <div className="space-y-6">
            <InvestmentCard 
              proposal={proposal}
              status={status}
              onAccept={handleAccept}
              onQuestion={handleQuestion}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalView;
