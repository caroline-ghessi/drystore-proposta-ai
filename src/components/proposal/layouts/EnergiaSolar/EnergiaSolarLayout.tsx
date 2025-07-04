
import React from 'react';
import { ProposalLayoutProps } from '@/services/proposalLayoutService';
import { NewSolarHeroSection } from './NewSolarHeroSection';
import { CompanyChangeSection } from './CompanyChangeSection';
import { PersonalizedROISection } from './PersonalizedROISection';
import { ProcessoPostAprovacaoSection } from './ProcessoPostAprovacaoSection';
import ProposalItemsTable from '@/components/proposal/ProposalItemsTable';
import { ModernInvestmentSection } from '@/components/proposal/ModernInvestmentSection';

import { CompanyCredentialsSection } from '@/components/proposal/CompanyCredentialsSection';
import { ClientTestimonialsSection } from '@/components/proposal/ClientTestimonialsSection';
import { ProjectGallerySection } from '@/components/proposal/ProjectGallerySection';

const EnergiaSolarLayout: React.FC<ProposalLayoutProps> = ({
  proposal,
  proposalItems,
  selectedSolutions,
  canInteract,
  isExpired,
  onAcceptProposal,
  onRejectProposal,
  onSolutionSelect,
  onCloseDeal
}) => {
  console.log('🔥 EnergiaSolarLayout CARREGADO - Layout específico de energia solar atualizado');
  console.log('📊 Dados da proposta:', { clientName: proposal.clientName, totalPrice: proposal.totalPrice });

  // Calcular valores de economia baseados na proposta
  const calculateEconomyValues = () => {
    const proposalValue = proposal.totalPrice;
    // Assumindo payback de 6 anos e economia de 85%
    const annualEconomy = proposalValue / 6;
    const monthlyEconomy = Math.round(annualEconomy / 12);
    const currentMonthlyBill = Math.round(monthlyEconomy / 0.85); // 85% de economia
    
    return { monthlyEconomy, currentMonthlyBill };
  };

  const { monthlyEconomy, currentMonthlyBill } = calculateEconomyValues();

  return (
    <>
      {/* Nova Hero Section */}
      <NewSolarHeroSection 
        clientName={proposal.clientName}
        monthlyEconomy={monthlyEconomy}
      />

      {/* Nova Seção "O Que Muda na Sua Empresa" */}
      <CompanyChangeSection 
        clientType={'Empresa'}
        currentMonthlyBill={currentMonthlyBill}
        monthlyEconomy={monthlyEconomy}
      />

      {/* Seção de ROI Personalizada (mantida) */}
      <PersonalizedROISection 
        clientName={proposal.clientName}
        proposalValue={proposal.totalPrice}
      />

      {/* Nova Seção Processo Pós-Aprovação */}
      <ProcessoPostAprovacaoSection />

      {/* Detalhamento da Proposta */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Sistema Fotovoltaico Completo
          </h2>
          <p className="text-lg text-gray-600">
            Painéis solares e equipamentos especificados para máxima geração de energia
          </p>
        </div>
        
        <ProposalItemsTable items={proposalItems} />
      </div>

      {/* 🏆 Liderança e Confiança no Mercado */}
      <CompanyCredentialsSection />

      {/* 💬 O que nossos clientes dizem */}
      <ClientTestimonialsSection />

      {/* 🏗️ Galeria de Projetos Executados */}
      <ProjectGallerySection />

      {/* Investment Section - Sempre visível no final */}
      <div id="investment-section" className="bg-gray-50">
        <ModernInvestmentSection
          totalPrice={proposal.finalPrice}
          discount={proposal.discount}
          validUntil={proposal.validUntil}
          onAccept={canInteract && !isExpired ? onAcceptProposal : undefined}
          onReject={canInteract && !isExpired ? onRejectProposal : undefined}
        />
      </div>
    </>
  );
};

export default EnergiaSolarLayout;
