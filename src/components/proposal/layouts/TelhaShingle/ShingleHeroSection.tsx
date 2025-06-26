
import React from 'react';
import { Shield, Droplets, Palette, Award } from 'lucide-react';

interface ShingleHeroSectionProps {
  benefits: string[];
}

export const ShingleHeroSection: React.FC<ShingleHeroSectionProps> = ({ benefits }) => {
  const specificBenefits = [
    { icon: Shield, text: 'Resistência superior a ventos de até 180 km/h', color: 'text-green-600' },
    { icon: Droplets, text: 'Impermeabilização total com dupla proteção', color: 'text-blue-600' },
    { icon: Palette, text: 'Variedade de cores e texturas exclusivas', color: 'text-purple-600' },
    { icon: Award, text: 'Garantia de 30 anos contra defeitos', color: 'text-orange-600' }
  ];

  return (
    <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20l10-10v20l-10-10zM10 20l10-10v20l-10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center px-4 py-2 bg-green-600/30 rounded-full text-green-200 text-sm font-medium mb-6">
              🏠 Telhas Shingle Premium
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Proteção Máxima com
              <span className="block text-green-300">Beleza Incomparável</span>
            </h1>
            
            <p className="text-xl text-green-100 mb-8 leading-relaxed">
              As telhas asfálticas mais avançadas do mercado. Tecnologia americana que combina 
              alta performance, durabilidade excepcional e design sofisticado.
            </p>

            {/* Specific Benefits Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {specificBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <benefit.icon className={`w-6 h-6 ${benefit.color} flex-shrink-0 mt-0.5`} />
                  <span className="text-green-50 text-sm leading-relaxed">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-tr from-green-600/20 to-transparent rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80" 
                alt="Casa com Telha Shingle"
                className="w-full h-full object-cover mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 to-transparent" />
              
              {/* Stats Overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white/90 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">30</div>
                    <div className="text-xs text-green-700">Anos Garantia</div>
                  </div>
                  <div className="text-center p-3 bg-white/90 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">180</div>
                    <div className="text-xs text-blue-700">km/h Vento</div>
                  </div>
                  <div className="text-center p-3 bg-white/90 rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">20+</div>
                    <div className="text-xs text-purple-700">Cores</div>
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
