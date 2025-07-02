
import React from 'react';
import { Shield, Droplets, Palette, Award } from 'lucide-react';

interface ShingleHeroSectionProps {
  benefits: string[];
}

export const ShingleHeroSection: React.FC<ShingleHeroSectionProps> = ({ benefits }) => {
  const specificBenefits = [
    { icon: Shield, text: 'Resistência superior a ventos de até 180 km/h', color: 'text-gray-700' },
    { icon: Droplets, text: 'Impermeabilização total com dupla proteção', color: 'text-gray-700' },
    { icon: Palette, text: 'Variedade de cores e texturas exclusivas', color: 'text-gray-700' },
    { icon: Award, text: 'Garantia de 30 anos contra defeitos', color: 'text-gray-700' }
  ];

  return (
    <section className="relative bg-gray-50 text-gray-900 overflow-hidden">{" "}
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ff6b35' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
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
              Descubra o Telhado
              <span className="block text-orange-600">dos Seus Sonhos</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
              <span className="font-semibold">Telhas Shingle Owens Corning</span> de alto desempenho em até 12 vezes sem juros. 
              Qualidade americana com resistência de mais de 50 anos.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button className="px-8 py-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors">
                Solicitar Orçamento
              </button>
              <button className="px-8 py-4 border-2 border-orange-600 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors">
                Ver Catálogo
              </button>
            </div>

            {/* Benefits with icons */}
            <div className="flex flex-col sm:flex-row gap-6 text-sm">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-gray-700">Garantia de até 30 anos</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs">$</span>
                </div>
                <span className="text-gray-700">A partir de 12x R$15,70</span>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="/lovable-uploads/87413d16-a811-4d8d-b6f9-4e704ea00037.png" 
                alt="Casas com Telhas Shingle"
                className="w-full h-full object-cover"
              />
              
              {/* Badge no canto */}
              <div className="absolute top-6 right-6">
                <div className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                  Telhas Shingle
                  <div className="text-xs opacity-90">Qualidade americana</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
