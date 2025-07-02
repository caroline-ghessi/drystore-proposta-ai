import React from 'react';
import { Calendar, Weight, Thermometer, Palette, Wrench, Star } from 'lucide-react';

export const ShingleAdvantagesSection: React.FC = () => {
  const advantages = [
    {
      icon: Calendar,
      title: 'Maior Durabilidade',
      description: 'Com mais de 30 anos de vida útil, as telhas shingle superam significativamente outras opções do mercado.',
      highlight: '30+ anos'
    },
    {
      icon: Weight,
      title: 'Peso Reduzido',
      description: '8x mais leves que as telhas cerâmicas, permitindo estruturas mais econômicas e seguras.',
      highlight: '8x mais leves'
    },
    {
      icon: Thermometer,
      title: 'Isolamento Superior',
      description: 'Excelente isolamento térmico e acústico, proporcionando maior conforto interno.',
      highlight: 'Térmo + Acústico'
    },
    {
      icon: Palette,
      title: 'Estética Diferenciada',
      description: 'Visual sofisticado e moderno que valoriza qualquer tipo de arquitetura.',
      highlight: 'Design Premium'
    },
    {
      icon: Wrench,
      title: 'Instalação Simplificada',
      description: 'Processo de instalação mais rápido e menos complexo que as telhas convencionais.',
      highlight: 'Rápida e Fácil'
    },
    {
      icon: Star,
      title: 'Manutenção Mínima',
      description: 'Praticamente livre de manutenção, gerando economia a longo prazo.',
      highlight: 'Sem Manutenção'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Principais Vantagens das Telhas Shingle
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubra os benefícios únicos que fazem das telhas shingle a escolha superior para sua cobertura.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advantages.map((advantage, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 group"
            >
              {/* Ícone e Badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <advantage.icon className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                  {advantage.highlight}
                </div>
              </div>

              {/* Conteúdo */}
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {advantage.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {advantage.description}
              </p>
            </div>
          ))}
        </div>

        {/* Seção de Investimento que Compensa */}
        <div className="mt-16">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Investimento que compensa
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-lg font-bold text-orange-800 mb-2">Economia na estrutura</div>
                <div className="text-sm text-orange-700">Por serem mais leves, custos reduzidos com madeiramento e fundação.</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-lg font-bold text-orange-800 mb-2">Menor custo de mão de obra</div>
                <div className="text-sm text-orange-700">Instalação mais rápida significa economia em mão de obra.</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-lg font-bold text-orange-800 mb-2">Economia energética</div>
                <div className="text-sm text-orange-700">Melhor isolamento térmico reduz custos com climatização.</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-lg font-bold text-orange-800 mb-2">Valorização do imóvel</div>
                <div className="text-sm text-orange-700">Estética diferenciada aumenta o valor de revenda.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};