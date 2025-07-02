import React from 'react';
import { Shield, Thermometer, Award, Clock } from 'lucide-react';

export const OwensCorningSection: React.FC = () => {
  const benefits = [
    {
      icon: Shield,
      title: 'Alta Durabilidade',
      description: 'Resistência comprovada de 50 anos ou mais, suportando condições climáticas extremas.',
      color: 'text-orange-600'
    },
    {
      icon: Thermometer,
      title: 'Desempenho Térmico',
      description: 'Isolamento térmico superior que ajuda a manter sua casa confortável e reduzir custos de energia.',
      color: 'text-orange-600'
    },
    {
      icon: Award,
      title: 'Garantia Estendida',
      description: 'Garantia de fábrica de 25 a 30 anos dependendo da linha escolhida.',
      color: 'text-orange-600'
    },
    {
      icon: Clock,
      title: 'Instalação Rápida',
      description: 'Sistema de instalação eficiente que reduz o tempo de trabalho e minimiza transtornos.',
      color: 'text-orange-600'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full text-orange-800 text-sm font-medium mb-4">
            🇺🇸 Qualidade Americana
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Por que escolher telhas Owens Corning?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Importadas diretamente dos Estados Unidos, as telhas Owens Corning são reconhecidas pela 
            <span className="font-semibold text-orange-600"> Forbes Home</span> como a segunda melhor marca do mercado.
          </p>
          
          {/* Forbes Ranking Box */}
          <div className="max-w-2xl mx-auto bg-white border-2 border-orange-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-orange-600 p-2 rounded-full mr-3">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Ranking Forbes Home 2024</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                    1º
                  </div>
                  <span className="font-semibold text-orange-900">CertainTeed</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-100 rounded-lg border-2 border-orange-400">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                    2º
                  </div>
                  <span className="font-bold text-orange-900">Owens Corning</span>
                </div>
                <div className="text-orange-700 font-medium text-sm">⭐ Sua escolha</div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                    3º
                  </div>
                  <span className="font-medium text-gray-700">IKO</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                    4º
                  </div>
                  <span className="font-medium text-gray-700">GAF</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                    5º
                  </div>
                  <span className="font-medium text-gray-700">Atlas</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center text-sm text-gray-600">
              Ranking baseado em qualidade, durabilidade e satisfação do cliente
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="group p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-orange-200"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              
              <p className="text-sm text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};