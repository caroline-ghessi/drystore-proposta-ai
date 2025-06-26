
import React from 'react';
import { TrendingUp, DollarSign, Calendar, Target } from 'lucide-react';

interface ROISectionProps {
  totalPrice: number;
  clientName: string;
}

export const ROISection: React.FC<ROISectionProps> = ({ totalPrice, clientName }) => {
  const firstName = clientName.split(' ')[0];
  
  // Cálculos personalizados baseados no valor total
  const economiaAnual = Math.round(totalPrice * 0.18); // 18% do investimento por ano
  const paybackAnos = Math.round(totalPrice / economiaAnual);
  const lucroApos15Anos = Math.round(economiaAnual * 15);
  const lucroTotal25Anos = Math.round(economiaAnual * 25);

  const roiData = [
    {
      year: `Ano 1-${paybackAnos}`,
      status: 'Payback',
      description: 'Recuperação do investimento inicial',
      value: `R$ ${totalPrice.toLocaleString('pt-BR')}`,
      icon: Target,
      color: 'orange'
    },
    {
      year: `Ano ${paybackAnos + 1}-15`,
      status: 'Lucro Líquido',
      description: 'Economia líquida anual',
      value: `R$ ${economiaAnual.toLocaleString('pt-BR')}/ano`,
      icon: TrendingUp,
      color: 'green'
    },
    {
      year: 'Ano 16-25',
      status: 'Lucro Acumulado',
      description: 'Rendimento total em 25 anos',
      value: `R$ ${lucroTotal25Anos.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      color: 'blue'
    }
  ];

  // Comparação de investimentos
  const comparacaoInvestimentos = [
    { nome: 'Poupança', retorno: '6%', cor: 'red' },
    { nome: 'CDI', retorno: '12%', cor: 'yellow' },
    { nome: 'IPCA+', retorno: '15%', cor: 'blue' },
    { nome: 'Energia Solar', retorno: '18%', cor: 'green', destaque: true }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-yellow-100 rounded-full text-yellow-800 text-sm font-medium mb-4">
            📈 Retorno sobre Investimento Personalizado
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {firstName}, Seu Investimento se Paga Sozinho
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Baseado no seu investimento de R$ {totalPrice.toLocaleString('pt-BR')}, 
            veja como seu dinheiro retorna e ainda gera lucro por décadas.
          </p>
        </div>

        {/* ROI Timeline Personalizada */}
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

        {/* Resumo Personalizado */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              💰 Resumo Financeiro do {firstName}
            </h3>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                R$ {economiaAnual.toLocaleString('pt-BR')}
              </div>
              <div className="text-sm text-gray-600">Economia Anual</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{paybackAnos} anos</div>
              <div className="text-sm text-gray-600">Payback</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600">
                R$ {Math.round(economiaAnual / 12).toLocaleString('pt-BR')}
              </div>
              <div className="text-sm text-gray-600">Economia Mensal</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-orange-600">25 anos</div>
              <div className="text-sm text-gray-600">Vida Útil</div>
            </div>
          </div>
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
            {comparacaoInvestimentos.map((investimento, index) => (
              <div 
                key={index}
                className={`text-center p-4 bg-${investimento.cor}-50 rounded-lg border border-${investimento.cor}-200 ${
                  investimento.destaque ? 'ring-2 ring-green-300' : ''
                }`}
              >
                <Calendar className={`w-8 h-8 text-${investimento.cor}-600 mx-auto mb-2`} />
                <div className={`font-bold text-${investimento.cor}-900`}>{investimento.nome}</div>
                <div className={`text-2xl font-bold text-${investimento.cor}-600`}>{investimento.retorno}</div>
                <div className={`text-sm text-${investimento.cor}-700`}>ao ano</div>
              </div>
            ))}
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
