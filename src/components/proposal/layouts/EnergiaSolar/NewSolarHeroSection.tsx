
import React from 'react';

interface NewSolarHeroSectionProps {
  clientName: string;
  monthlyEconomy?: number;
}

export const NewSolarHeroSection: React.FC<NewSolarHeroSectionProps> = ({
  clientName,
  monthlyEconomy = 14400
}) => {
  const firstName = clientName.split(' ')[0];


  return (
    <div className="bg-gradient-to-br from-drystore-orange to-orange-600 text-white py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6">
            ⚡ Proposta Exclusiva para {firstName}
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Redução de até <span className="text-yellow-300">85%</span> na Sua Conta de Energia
          </h1>

          {/* Value Highlight */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 max-w-2xl mx-auto">
            <div className="text-6xl sm:text-7xl font-bold mb-2">
              R$ {monthlyEconomy.toLocaleString('pt-BR')}
            </div>
            <div className="text-xl sm:text-2xl opacity-90">
              de economia todo mês com energia solar premium
            </div>
          </div>


          {/* Trust Elements */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm opacity-80">
            <div className="flex items-center">
              ✅ Instalação em 45 dias
            </div>
            <div className="flex items-center">
              ✅ 25 anos de garantia
            </div>
            <div className="flex items-center">
              ✅ Zero burocracia
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
