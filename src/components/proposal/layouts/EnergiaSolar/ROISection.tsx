
import React from 'react';
import { TrendingUp, DollarSign, Calendar, Target } from 'lucide-react';

export const ROISection: React.FC = () => {
  const roiData = [
    {
      year: 'Ano 1-6',
      status: 'Payback',
      description: 'Recuperação do investimento inicial',
      value: 'R$ 45.000',
      icon: Target,
      color: 'orange'
    },
    {
      year: 'Ano 7-15',
      status: 'Lucro',
      description: 'Economia líquida anual',
      value: 'R$ 8.500/ano',
      icon: TrendingUp,
      color: 'green'
    },
    {
      year: 'Ano 16-25',
      status: 'Lucro Total',
      description: 'Rendimento acumulado',
      value: 'R$ 85.000',
      icon: DollarSign,
      color: 'blue'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-yellow-100 rounded-full text-yellow-800 text-sm font-medium mb-4">
            📈 Retorno sobre Investimento
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Investimento que se Paga Sozinho
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Energia solar não é gasto, é investimento. Veja como seu dinheiro retorna 
            e ainda gera lucro por décadas.
          </p>
        </div>

        {/* ROI Timeline */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {roiData.map((item, index) => (
            <div 
              key={index}
              className={`group p-6 bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 rounded-xl border border-${item.color}-200 hover:shadow-lg transition-all duration-300`}
            >
              <div className={`w-12 h-12 bg-${item.color}-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon className={`w-6 h-6 text-${item.color}-600`} />
              </div>
              
              <div className={`text-2xl font-bold text-${item.color}-600 mb-2`}>
                {item.year}
              </div>
              
              <h3 className={`font-semibold text-${item.color}-900 mb-2`}>
                {item.status}
              </h3>
              
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                {item.description}
              </p>

              <div className={`text-lg font-bold text-${item.color}-700`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Investment Comparison */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Comparação de Investimentos
            </h3>
            <p className="text-gray-600">
              Veja como energia solar se compara a outros investimentos populares
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <Calendar className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="font-bold text-red-900">Poupança</div>
              <div className="text-2xl font-bold text-red-600">6%</div>
              <div className="text-sm text-red-700">ao ano</div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <TrendingUp className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="font-bold text-yellow-900">CDI</div>
              <div className="text-2xl font-bold text-yellow-600">12%</div>
              <div className="text-sm text-yellow-700">ao ano</div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="font-bold text-blue-900">IPCA+</div>
              <div className="text-2xl font-bold text-blue-600">15%</div>
              <div className="text-sm text-blue-700">ao ano</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200 ring-2 ring-green-300">
              <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="font-bold text-green-900">Energia Solar</div>
              <div className="text-2xl font-bold text-green-600">18%</div>
              <div className="text-sm text-green-700">ao ano</div>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              * Cálculo baseado em economia de energia por 25 anos com inflação energética de 5% a.a.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
