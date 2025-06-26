
import React from 'react';
import { Sun, TrendingDown, Leaf, Zap } from 'lucide-react';

interface SolarHeroSectionProps {
  benefits: string[];
}

export const SolarHeroSection: React.FC<SolarHeroSectionProps> = ({ benefits }) => {
  const specificBenefits = [
    { icon: TrendingDown, text: 'Redução de até 95% na conta de luz', color: 'text-yellow-600' },
    { icon: Leaf, text: 'Energia 100% limpa e renovável', color: 'text-green-600' },
    { icon: Zap, text: 'Geração média de 25 anos garantida', color: 'text-blue-600' },
    { icon: Sun, text: 'Retorno do investimento em 4-6 anos', color: 'text-orange-600' }
  ];

  return (
    <section className="relative bg-gradient-to-br from-yellow-900 via-yellow-800 to-orange-700 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Cpath d='M30 20v20M20 30h20M25.86 25.86l8.28 8.28M25.86 34.14l8.28-8.28'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center px-4 py-2 bg-yellow-600/30 rounded-full text-yellow-200 text-sm font-medium mb-6">
              ☀️ Energia Solar Fotovoltaica
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Liberdade Energética com
              <span className="block text-yellow-300">Energia do Sol</span>
            </h1>
            
            <p className="text-xl text-yellow-100 mb-8 leading-relaxed">
              Transforme sua residência em uma usina de energia limpa. Economize milhares 
              de reais por ano e contribua para um planeta mais sustentável.
            </p>

            {/* Specific Benefits Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {specificBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <benefit.icon className={`w-6 h-6 ${benefit.color} flex-shrink-0 mt-0.5`} />
                  <span className="text-yellow-50 text-sm leading-relaxed">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-tr from-yellow-600/20 to-transparent rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80" 
                alt="Sistema de Energia Solar"
                className="w-full h-full object-cover mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/60 to-transparent" />
              
              {/* Stats Overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white/90 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-900">95%</div>
                    <div className="text-xs text-yellow-700">Economia</div>
                  </div>
                  <div className="text-center p-3 bg-white/90 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">25</div>
                    <div className="text-xs text-green-700">Anos Garantia</div>
                  </div>
                  <div className="text-center p-3 bg-white/90 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">4-6</div>
                    <div className="text-xs text-blue-700">Anos Payback</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
