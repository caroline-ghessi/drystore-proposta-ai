import React from 'react';
import { Package, Shield, Home } from 'lucide-react';

export const ShingleSystemSection: React.FC = () => {
  const systemSteps = [
    {
      number: '1',
      icon: Package,
      title: 'Placas OSB',
      description: 'As placas OSB são instaladas diretamente na estrutura do telhado. O OSB recebe o tratamento necessário para prevenir a propagação de chamas e prevenir a formação de bolor ou mofo.',
      detail: 'Na Drystore você encontra OSB com o selo de certificação APA PLUS, que comprova que o material é adequado para aplicação.'
    },
    {
      number: '2',
      icon: Shield,
      title: 'Membrana Impermeável',
      description: 'A manta de subcobertura também é uma barreira de vapor do sistema. Este material é projetado para permitir que o telhado "respire", permitindo que o vapor interno escape para o exterior.',
      detail: 'Uma proteção adicional contra infiltrações e umidade, garantindo maior durabilidade para toda a estrutura.'
    },
    {
      number: '3',
      icon: Home,
      title: 'Telhas Shingle',
      description: 'Finalmente, temos as telhas shingle, nossa última camada de proteção. Na Drystore você encontra telhas da Owens Corning, marca renomada norte-americana conhecida pela qualidade.',
      detail: 'Escolha entre as linhas Oakridge ou Supreme, com um total de 5 cores para escolher.'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Mais que telhas, um sistema completo de cobertura
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Entenda por que investir em um sistema de cobertura Shingle é a melhor escolha para sua casa ou empresa.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {systemSteps.map((step, index) => (
            <div 
              key={index}
              className="relative bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Número destacado */}
              <div className="absolute -top-4 left-8">
                <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {step.number}
                </div>
              </div>

              {/* Ícone */}
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6 mt-4">
                <step.icon className="w-6 h-6 text-orange-600" />
              </div>

              {/* Conteúdo */}
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {step.title}
              </h3>
              
              <p className="text-gray-600 mb-4 leading-relaxed">
                {step.description}
              </p>

              <div className="text-sm text-orange-700 bg-orange-50 p-3 rounded-lg">
                {step.detail}
              </div>

              {/* Linha conectora (não no último item) */}
              {index < systemSteps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-orange-200"></div>
              )}
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="mt-12 text-center">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Investimento que vale a pena
            </h3>
            <p className="text-gray-600 mb-6 max-w-4xl mx-auto">
              O sistema de cobertura Shingle pode ter um custo inicial mais elevado em comparação com outras telhas, 
              mas sua qualidade e desempenho são incomparáveis. Com durabilidade excepcional, resistência a intempéries 
              e uma estética sofisticada, este sistema representa um excelente investimento a longo prazo.
            </p>
            <a 
              href="https://blog.drystore.com.br/telhas-shingle-beleza-e-protecao-para-sua-casa/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
            >
              Entenda o custo-benefício
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};