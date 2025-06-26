
import React from 'react';
import { ProcessStepCard } from './components/ProcessStepCard';
import { ProcessTimeline } from './components/ProcessTimeline';
import { ProcessGuarantee } from './components/ProcessGuarantee';
import { processStepsData } from './data/processStepsData';

export const ZeroBurocraciaSection: React.FC = () => {
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
            "Você Aprova, Nós Cuidamos de Tudo!"
          </p>
        </div>

        {/* Etapas */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {processStepsData.map((etapa) => (
            <ProcessStepCard key={etapa.numero} {...etapa} />
          ))}
        </div>

        {/* Destaque Especial */}
        <div className="bg-gradient-to-r from-drystore-orange to-drystore-orange-light text-white rounded-2xl p-8 mb-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">
              💡 Destaque Especial: "Zero Burocracia Para Você!"
            </h3>
            <p className="text-lg leading-relaxed">
              Com nossa procuração, resolvemos todos os trâmites na concessionária. 
              Você só precisa assinar o contrato e aguardar o sistema funcionar!
            </p>
          </div>
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
