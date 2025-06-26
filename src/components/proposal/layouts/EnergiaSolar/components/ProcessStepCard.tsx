
import React from 'react';

interface ProcessStepCardProps {
  numero: number;
  titulo: string;
  fazemos: string;
  objetivo: string;
}

export const ProcessStepCard: React.FC<ProcessStepCardProps> = ({
  numero,
  titulo,
  fazemos,
  objetivo
}) => {
  return (
    <div className="group p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-drystore-orange rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          ⚡
        </div>
        <div className="ml-3 w-8 h-8 bg-drystore-gray-dark text-white rounded-full flex items-center justify-center text-sm font-bold">
          {numero}
        </div>
      </div>
      
      <h3 className="font-bold text-drystore-gray-dark mb-3 leading-tight">
        {titulo}
      </h3>
      
      <div className="space-y-2 text-sm">
        <p className="text-drystore-gray-medium leading-relaxed">
          <span className="font-semibold text-drystore-orange">Fazemos:</span> {fazemos}
        </p>
        <p className="text-drystore-gray-medium leading-relaxed">
          <span className="font-semibold text-drystore-orange">Objetivo:</span> {objetivo}
        </p>
      </div>
    </div>
  );
};
