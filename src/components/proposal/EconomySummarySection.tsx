
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, CheckCircle, Gift, Shield, Clock, ArrowRight } from 'lucide-react';

interface RecommendedSolution {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  features: string[];
  image?: string;
  rating: number;
  popular?: boolean;
}

interface EconomySummarySectionProps {
  selectedSolutions: Array<{ id: string; price: number }>;
  displaySolutions: RecommendedSolution[];
  onCloseDeal?: () => void;
}

export const EconomySummarySection = ({
  selectedSolutions,
  displaySolutions,
  onCloseDeal
}: EconomySummarySectionProps) => {
  // Cálculos para a seção de economia
  const selectedSolutionsData = displaySolutions.filter(solution => 
    selectedSolutions.some(s => s.id === solution.id)
  );
  
  const totalSelectedValue = selectedSolutionsData.reduce((sum, solution) => sum + solution.price, 0);
  const totalOriginalValue = selectedSolutionsData.reduce((sum, solution) => sum + solution.originalPrice, 0);
  const totalSavings = totalOriginalValue - totalSelectedValue;
  const savingsPercentage = totalOriginalValue > 0 ? Math.round((totalSavings / totalOriginalValue) * 100) : 0;

  // Desconto extra por quantidade (bônus)
  const bonusDiscount = selectedSolutions.length >= 2 ? selectedSolutions.length * 150 : 0;
  const finalValue = totalSelectedValue - bonusDiscount;
  const totalEconomy = totalSavings + bonusDiscount;

  if (selectedSolutions.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-2xl p-8 mb-8 border-2 border-green-200">
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Economy Calculation */}
        <div className="space-y-6">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              🎉 Sua Economia Total
            </h3>
            <p className="text-gray-600">
              Complementos selecionados com desconto especial
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Valor original dos complementos:</span>
              <span className="font-semibold text-gray-900 line-through">
                R$ {totalOriginalValue.toLocaleString('pt-BR')}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Desconto aplicado ({savingsPercentage}%):</span>
              <span className="font-semibold text-green-600">
                -R$ {totalSavings.toLocaleString('pt-BR')}
              </span>
            </div>

            {bonusDiscount > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700 flex items-center">
                  <Gift className="w-4 h-4 mr-1 text-purple-500" />
                  Bônus múltipla seleção:
                </span>
                <span className="font-semibold text-purple-600">
                  -R$ {bonusDiscount.toLocaleString('pt-BR')}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg px-4 border-2 border-green-300">
              <span className="font-bold text-gray-900">Valor final dos complementos:</span>
              <span className="text-2xl font-bold text-green-700">
                R$ {finalValue.toLocaleString('pt-BR')}
              </span>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-full">
                <Trophy className="w-5 h-5 mr-2" />
                <span className="font-bold">
                  Você economiza R$ {totalEconomy.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Benefits and CTA */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Benefícios Exclusivos
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
                Garantia estendida de 3 anos
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
                Instalação profissional inclusa
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
                Suporte técnico 24/7
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
                Parcelamento em até 12x sem juros
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <Clock className="w-4 h-4 mr-3 text-blue-500" />
                Instalação em até 15 dias
              </li>
            </ul>
          </div>

          {/* Close Deal Button */}
          <div className="text-center">
            <Button 
              onClick={onCloseDeal}
              size="lg" 
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Trophy className="w-6 h-6 mr-3" />
              Fechar Proposta com Complementos
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              ⏰ Oferta válida por tempo limitado
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
