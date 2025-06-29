
import React from 'react';
import { ProcessStepCard } from './components/ProcessStepCard';
import { ProcessTimeline } from './components/ProcessTimeline';
import { ProcessGuarantee } from './components/ProcessGuarantee';

export const ZeroBurocraciaSection: React.FC = () => {
  const processSteps = [
    {
      numero: 1,
      titulo: 'Vistoria Técnica Detalhada',
      fazemos: 'Verificação completa das condições de instalação',
      objetivo: 'Confirmar se o projeto pode ser executado com a infraestrutura existente'
    },
    {
      numero: 2,
      titulo: 'Documentação e Burocracia',
      fazemos: 'Elaboração de contrato e procuração',
      objetivo: 'Resolver tudo na concessionária sem você se preocupar'
    },
    {
      numero: 3,
      titulo: 'Projeto de Instalação',
      fazemos: 'Projeto elétrico detalhado + cronograma de instalação',
      objetivo: 'Garantir instalação perfeita e dentro do prazo'
    },
    {
      numero: 4,
      titulo: 'Instalação Profissional',
      fazemos: 'Instalação completa + testes do sistema',
      objetivo: 'Sistema funcionando perfeitamente'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-drystore-orange rounded-full text-white text-sm font-medium mb-4">
            🚀 Processo Completo Pós-Aprovação
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-drystore-gray-dark mb-4">
            Zero Burocracia Para Você
          </h2>
          <p className="text-xl text-drystore-gray-medium mb-8">
            Você Aprova, Nós Cuidamos de Tudo!
          </p>
        </div>

        {/* Etapas */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {processSteps.map((etapa) => (
            <ProcessStepCard key={etapa.numero} {...etapa} />
          ))}
        </div>

        {/* Timeline Resumida e Garantias */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <ProcessTimeline />
          <ProcessGuarantee />
        </div>
      </div>
    </section>
  );
};
