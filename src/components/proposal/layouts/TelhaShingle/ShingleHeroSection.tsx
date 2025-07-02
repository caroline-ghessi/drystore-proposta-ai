
import React from 'react';
import { Shield, Droplets, Palette, Award } from 'lucide-react';

interface ShingleHeroSectionProps {
  benefits: string[];
}

export const ShingleHeroSection: React.FC<ShingleHeroSectionProps> = ({ benefits }) => {
  const specificBenefits = [
    { icon: Shield, text: 'Resistência superior a ventos de até 180 km/h', color: 'text-white' },
    { icon: Droplets, text: 'Impermeabilização total com dupla proteção', color: 'text-white' },
    { icon: Palette, text: 'Variedade de cores e texturas exclusivas', color: 'text-white' },
    { icon: Award, text: 'Garantia de 30 anos contra defeitos', color: 'text-white' }
  ];

  return (
    <section className="relative bg-gray-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ff6b35' fill-opacity='0.1'%3E%3Cpath d='M20 20l10-10v20l-10-10zM10 20l10-10v20l-10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center px-4 py-2 bg-orange-600 rounded-full text-white text-sm font-medium mb-6">
              🏠 Telhas Shingle Premium
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Proteção Máxima com
              <span className="block text-orange-400">Beleza Incomparável</span>
            </h1>
            
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              As telhas asfálticas mais avançadas do mercado. Tecnologia americana que combina 
              alta performance, durabilidade excepcional e design sofisticado.
            </p>

            {/* Specific Benefits Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {specificBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-orange-600/20 rounded-lg backdrop-blur-sm border border-orange-500/30">
                  <benefit.icon className={`w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5`} />
                  <span className="text-white text-sm leading-relaxed">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-[4/3] bg-orange-600/20 rounded-2xl overflow-hidden border border-orange-500/30">
              <img 
                src="https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80" 
                alt="Casa com Telha Shingle"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
              
              {/* Stats Overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white/95 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">30</div>
                    <div className="text-xs text-gray-700">Anos Garantia</div>
                  </div>
                  <div className="text-center p-3 bg-white/95 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">180</div>
                    <div className="text-xs text-gray-700">km/h Vento</div>
                  </div>
                  <div className="text-center p-3 bg-white/95 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">20+</div>
                    <div className="text-xs text-gray-700">Cores</div>
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
