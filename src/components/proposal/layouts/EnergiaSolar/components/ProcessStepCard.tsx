
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ProcessStepCardProps {
  numero: number;
  titulo: string;
  icon: LucideIcon;
  fazemos: string;
  objetivo: string;
  prazo: string;
  seuPapel: string;
  color: string;
}

export const ProcessStepCard: React.FC<ProcessStepCardProps> = ({
  numero,
  titulo,
  icon: Icon,
  fazemos,
  objetivo,
  prazo,
  seuPapel,
  color
}) => {
  return (
    <div 
      className={`relative p-6 bg-white rounded-xl shadow-lg border-2 border-${color}-100 hover:shadow-xl transition-all duration-300`}
    >
      {/* Número da Etapa */}
      <div className={`absolute -top-3 -left-3 w-8 h-8 bg-${color}-500 text-white rounded-full flex items-center justify-center font-bold text-sm`}>
        {numero}
      </div>

      {/* Ícone */}
      <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center mb-4`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>

      {/* Título */}
      <h3 className={`font-bold text-${color}-900 mb-3 text-sm`}>
        🔍 {titulo}
      </h3>

      {/* Detalhes */}
      <div className="space-y-2 text-xs">
        <div>
          <span className="font-semibold text-gray-700">O que fazemos:</span>
          <p className="text-gray-600">{fazemos}</p>
        </div>
        
        <div>
          <span className="font-semibold text-gray-700">Objetivo:</span>
          <p className="text-gray-600">{objetivo}</p>
        </div>
        
        <div>
          <span className="font-semibold text-gray-700">Prazo:</span>
          <p className={`text-${color}-600 font-medium`}>{prazo}</p>
        </div>
        
        <div>
          <span className="font-semibold text-gray-700">Seu papel:</span>
          <p className="text-green-600 font-medium">{seuPapel}</p>
        </div>
      </div>
    </div>
  );
};
