
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

export const CompanyChangeSection: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-drystore-gray-dark mb-4">
            O Que Muda na Sua Empresa? 
          </h2>
          <p className="text-xl text-drystore-gray-medium">
            Veja a transformação que a energia solar trará para o seu negócio
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Current Situation - Red Card */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingDown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-red-700 mb-2">HOJE</h3>
                <div className="text-4xl font-bold text-red-600 mb-2">
                  R$ 15.200
                </div>
                <p className="text-red-600 font-medium">Gasto mensal com energia</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-red-700">
                  <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>Aumentos constantes na tarifa</span>
                </div>
                <div className="flex items-center text-red-700">
                  <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>Sem previsibilidade de custos</span>
                </div>
                <div className="flex items-center text-red-700">
                  <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>Dinheiro perdido todo mês</span>
                </div>
                <div className="flex items-center text-red-700">
                  <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>Dependência total da concessionária</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* With Solar - Green Card */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-green-700 mb-2">COM SOLAR</h3>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  R$ 800
                </div>
                <p className="text-green-600 font-medium">Apenas taxa mínima</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>Preço fixo por 25 anos</span>
                </div>
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>Economia imediata e crescente</span>
                </div>
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>Investimento no seu negócio</span>
                </div>
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>Independência energética</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Highlight */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-6 px-8 rounded-2xl max-w-2xl mx-auto">
            <div className="text-2xl font-bold mb-2">
              💰 Economia de R$ 14.400 todo mês!
            </div>
            <p className="text-lg opacity-90">
              Em 5 anos: R$ 864.000 economizados com energia solar
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
