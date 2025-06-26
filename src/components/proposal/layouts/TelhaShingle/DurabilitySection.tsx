
import React from 'react';
import { Shield, Sun, Snowflake, Wind } from 'lucide-react';

export const DurabilitySection: React.FC = () => {
  const protectionFeatures = [
    {
      icon: Wind,
      title: 'Resistência a Ventos',
      description: 'Suporta ventos de até 180 km/h sem deslocamento',
      detail: 'Teste classe F (ASTM D3161)',
      color: 'blue'
    },
    {
      icon: Sun,
      title: 'Proteção UV',
      description: 'Grânulos cerâmicos protegem contra raios solares',
      detail: 'Refletância solar melhorada',
      color: 'yellow'
    },
    {
      icon: Snowflake,
      title: 'Resistência Térmica',
      description: 'Desempenho superior em temperaturas extremas',
      detail: '-40°C a +80°C',
      color: 'cyan'
    },
    {
      icon: Shield,
      title: 'Proteção Total',
      description: 'Barreira dupla contra infiltrações',
      detail: 'Manta asfáltica + selante',
      color: 'green'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-800 text-sm font-medium mb-4">
            🛡️ Máxima Proteção
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Tecnologia Avançada de Proteção
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Telhas Shingle desenvolvidas para enfrentar as condições climáticas mais severas 
            do Brasil com tecnologia americana comprovada.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {protectionFeatures.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-200"
            >
              <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                {feature.description}
              </p>

              <div className={`text-xs font-medium text-${feature.color}-700 bg-${feature.color}-50 px-2 py-1 rounded`}>
                {feature.detail}
              </div>
            </div>
          ))}
        </div>

        {/* Technical Comparison */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Comparativo de Durabilidade
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
              <div className="text-3xl font-bold text-red-600 mb-2">5-10 anos</div>
              <div className="font-medium text-red-900 mb-1">Telha Cerâmica</div>
              <div className="text-sm text-red-700">Necessita manutenção frequente</div>
            </div>
            
            <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-3xl font-bold text-yellow-600 mb-2">10-15 anos</div>
              <div className="font-medium text-yellow-900 mb-1">Telha Metálica</div>
              <div className="text-sm text-yellow-700">Oxidação e corrosão</div>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200 ring-2 ring-green-300">
              <div className="text-3xl font-bold text-green-600 mb-2">30+ anos</div>
              <div className="font-medium text-green-900 mb-1">Telha Shingle</div>
              <div className="text-sm text-green-700">Manutenção mínima</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
