
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone } from 'lucide-react';

interface NewSolarHeroSectionProps {
  clientName: string;
  monthlyEconomy?: number;
}

export const NewSolarHeroSection: React.FC<NewSolarHeroSectionProps> = ({
  clientName,
  monthlyEconomy = 14400
}) => {
  const firstName = clientName.split(' ')[0];

  const handleViewValues = () => {
    const investmentSection = document.getElementById('investment-section');
    if (investmentSection) {
      investmentSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
            Reduza <span className="text-yellow-300">95%</span> da Sua<br />
            Conta de Energia em <span className="text-yellow-300">45 dias</span>
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-white text-drystore-orange hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              onClick={handleViewValues}
            >
              Ver Valores e Condições
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-drystore-orange px-8 py-4 text-lg font-semibold"
            >
              <Phone className="w-5 h-5 mr-2" />
              Falar com Especialista Agora
            </Button>
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
              ✅ Financiamento aprovado
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
