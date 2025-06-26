
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, DollarSign, Target } from 'lucide-react';

interface PersonalizedROISectionProps {
  clientName: string;
  proposalValue: number;
}

export const PersonalizedROISection: React.FC<PersonalizedROISectionProps> = ({
  clientName,
  proposalValue
}) => {
  // Cálculos personalizados baseados no valor da proposta
  const monthlyEconomyPercentage = 0.12; // 12% de economia mensal
  const monthlyEconomy = proposalValue * monthlyEconomyPercentage;
  const annualEconomy = monthlyEconomy * 12;
  const paybackYears = Math.ceil(proposalValue / annualEconomy);
  const totalSavings25Years = (annualEconomy * 25) - proposalValue;

  // Dados para o gráfico de economia acumulada
  const economyData = Array.from({ length: 10 }, (_, index) => {
    const year = index + 1;
    const cumulativeEconomy = (annualEconomy * year) - proposalValue;
    return {
      year: `Ano ${year}`,
      economia: Math.max(0, cumulativeEconomy),
      investimento: proposalValue
    };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-800 text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4 mr-2" />
            Retorno Personalizado do Investimento
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Seu Retorno Garantido, {clientName.split(' ')[0]}
          </h2>
          <p className="text-xl text-gray-600">
            Veja como seu investimento se transforma em economia real
          </p>
        </div>

        {/* Métricas Principais */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <DollarSign className="w-8 h-8 text-green-600" />
              <span className="ml-2 text-sm font-medium text-gray-600">Economia Mensal</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(monthlyEconomy)}
            </div>
            <p className="text-sm text-gray-500 mt-1">A partir do {paybackYears + 1}º ano</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <Calendar className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-sm font-medium text-gray-600">Payback</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {paybackYears} anos
            </div>
            <p className="text-sm text-gray-500 mt-1">Tempo para recuperar investimento</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="ml-2 text-sm font-medium text-gray-600">Economia Anual</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(annualEconomy)}
            </div>
            <p className="text-sm text-gray-500 mt-1">Economia garantida por ano</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <Target className="w-8 h-8 text-orange-600" />
              <span className="ml-2 text-sm font-medium text-gray-600">Total 25 Anos</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalSavings25Years)}
            </div>
            <p className="text-sm text-gray-500 mt-1">Economia líquida total</p>
          </div>
        </div>

        {/* Gráfico Interativo */}
        <div className="bg-white rounded-xl p-8 shadow-lg mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Evolução da Sua Economia ao Longo dos Anos
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={economyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Economia Acumulada']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar 
                  dataKey="economia" 
                  fill="#10B981" 
                  radius={[4, 4, 0, 0]}
                  className="hover:opacity-80 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-gray-600 mt-4">
            * Valores baseados no seu investimento de {formatCurrency(proposalValue)} e economia média de 12% ao mês
          </p>
        </div>

        {/* Timeline Visual */}
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Timeline do Seu Retorno
          </h3>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-blue-500 to-green-500"></div>
            
            <div className="space-y-8">
              {/* Marco 1: Instalação */}
              <div className="relative flex items-center">
                <div className="flex-1 text-right pr-8">
                  <h4 className="font-bold text-gray-900">Instalação Completa</h4>
                  <p className="text-gray-600">Sistema funcionando 100%</p>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-lg"></div>
                <div className="flex-1 pl-8">
                  <span className="text-blue-600 font-medium">Mês 1-2</span>
                </div>
              </div>

              {/* Marco 2: Primeiras Economias */}
              <div className="relative flex items-center">
                <div className="flex-1 text-right pr-8">
                  <span className="text-green-600 font-medium">Mês 3+</span>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
                <div className="flex-1 pl-8">
                  <h4 className="font-bold text-gray-900">Primeiras Economias</h4>
                  <p className="text-gray-600">{formatCurrency(monthlyEconomy)}/mês na conta de luz</p>
                </div>
              </div>

              {/* Marco 3: Payback */}
              <div className="relative flex items-center">
                <div className="flex-1 text-right pr-8">
                  <h4 className="font-bold text-gray-900">Investimento Recuperado</h4>
                  <p className="text-gray-600">A partir daqui, só economia!</p>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div>
                <div className="flex-1 pl-8">
                  <span className="text-purple-600 font-medium">Ano {paybackYears}</span>
                </div>
              </div>

              {/* Marco 4: Economia Total */}
              <div className="relative flex items-center">
                <div className="flex-1 text-right pr-8">
                  <span className="text-orange-600 font-medium">25 Anos</span>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-500 rounded-full border-4 border-white shadow-lg"></div>
                <div className="flex-1 pl-8">
                  <h4 className="font-bold text-gray-900">Economia Total</h4>
                  <p className="text-gray-600">{formatCurrency(totalSavings25Years)} economizados</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
