
import React from 'react';
import { Clock } from 'lucide-react';

export const ProcessTimeline: React.FC = () => {
  const timelineSteps = [
    { week: 'Semana 1', description: 'Vistoria + Documentação + Projeto', color: 'drystore-orange' },
    { week: 'Semana 2-3', description: 'Instalação + Testes', color: 'drystore-orange' },
    { week: 'Semana 4-6', description: 'Tramitação na concessionária', color: 'drystore-gray-dark' },
    { week: 'A partir da Semana 7', description: 'Você economizando!', color: 'drystore-orange' }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <h4 className="font-bold text-drystore-gray-dark mb-4 flex items-center">
        <Clock className="w-5 h-5 text-drystore-orange mr-2" />
        ⏱️ Timeline Resumida
      </h4>
      <div className="space-y-3 text-sm">
        {timelineSteps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-3 h-3 bg-${step.color} rounded-full mr-3`}></div>
            <span className="text-drystore-gray-medium">
              <strong className="text-drystore-gray-dark">{step.week}:</strong> {step.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
