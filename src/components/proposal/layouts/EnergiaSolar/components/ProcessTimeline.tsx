
import React from 'react';
import { Clock } from 'lucide-react';

export const ProcessTimeline: React.FC = () => {
  const timelineSteps = [
    { week: 'Semana 1', description: 'Vistoria + Documentação + Projeto', color: 'blue' },
    { week: 'Semana 2-3', description: 'Instalação + Testes', color: 'green' },
    { week: 'Semana 4-6', description: 'Tramitação na concessionária', color: 'orange' },
    { week: 'A partir da Semana 7', description: 'Você economizando!', color: 'yellow' }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h4 className="font-bold text-gray-900 mb-4 flex items-center">
        <Clock className="w-5 h-5 text-blue-600 mr-2" />
        ⏱️ Timeline Resumida
      </h4>
      <div className="space-y-3 text-sm">
        {timelineSteps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-3 h-3 bg-${step.color}-500 rounded-full mr-3`}></div>
            <span><strong>{step.week}:</strong> {step.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
