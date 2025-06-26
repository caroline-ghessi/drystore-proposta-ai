
import React from 'react';
import { Leaf, Recycle, Zap, Droplets } from 'lucide-react';

export const SustainabilitySection: React.FC = () => {
  const sustainabilityFeatures = [
    {
      icon: Recycle,
      title: '95% Reciclável',
      description: 'Todo material pode ser reutilizado ao final da vida útil',
      stat: '95%',
      color: 'green'
    },
    {
      icon: Zap,
      title: 'Menos Energia',
      description: 'Redução de 60% no consumo energético da construção',
      stat: '-60%',
      color: 'yellow'
    },
    {
      icon: Droplets,
      title: 'Economia de Água',
      description: 'Processo construtivo utiliza 80% menos água',
      stat: '-80%',
      color: 'blue'
    },
    {
      icon: Leaf,
      title: 'Menor Impacto',
      description: 'Redução de 40% nas emissões de CO2',
      stat: '-40%',
      color: 'emerald'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-800 text-sm font-medium mb-4">
            🌱 Construção Sustentável
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Compromisso com o Meio Ambiente
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Light Steel Frame é a escolha mais sustentável para construção. 
            Tecnologia limpa que preserva o futuro do planeta.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sustainabilityFeatures.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
              </div>
              
              <div className={`text-3xl font-bold text-${feature.color}-600 mb-2`}>
                {feature.stat}
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              
              <p className="text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 text-green-700 bg-green-50 px-6 py-3 rounded-full">
            <Leaf className="w-5 h-5" />
            <span className="font-medium">
              Certificação LEED e Selo Casa Azul CAIXA disponíveis
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
