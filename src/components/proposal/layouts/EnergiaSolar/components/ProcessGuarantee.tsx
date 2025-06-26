
import React from 'react';
import { CheckCircle } from 'lucide-react';

export const ProcessGuarantee: React.FC = () => {
  const guarantees = [
    'Cronograma cumprido rigorosamente',
    'Comunicação constante sobre cada etapa',
    'Suporte técnico durante todo o processo'
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h4 className="font-bold text-gray-900 mb-4 flex items-center">
        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
        🛡️ Nossa Garantia de Processo
      </h4>
      <div className="space-y-2 text-sm">
        {guarantees.map((guarantee, index) => (
          <div key={index} className="flex items-center text-green-600">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span>{guarantee}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
