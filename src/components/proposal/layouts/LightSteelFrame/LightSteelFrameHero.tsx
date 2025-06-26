
import React from 'react';
import { CheckCircle, Zap, Leaf, Clock } from 'lucide-react';

interface LightSteelFrameHeroProps {
  benefits: string[];
}

export const LightSteelFrameHero: React.FC<LightSteelFrameHeroProps> = ({ benefits }) => {
  const specificBenefits = [
    { icon: Clock, text: 'Construção 70% mais rápida que métodos tradicionais', color: 'text-blue-600' },
    { icon: Leaf, text: 'Sistema sustentável com 95% de materiais recicláveis', color: 'text-green-600' },
    { icon: Zap, text: 'Estrutura super resistente e antisísmica', color: 'text-orange-600' },
    { icon: CheckCircle, text: 'Garantia de 25 anos para a estrutura metálica', color: 'text-purple-600' }
  ];

  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30l15-15v30l-15-15zM15 30l15-15v30l-15-15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center px-4 py-2 bg-blue-600/30 rounded-full text-blue-200 text-sm font-medium mb-6">
              🏗️ Tecnologia Light Steel Frame
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Construa o Futuro com
              <span className="block text-blue-300">Aço Leve Inteligente</span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Revolucione sua construção com o sistema mais moderno, sustentável e eficiente do mercado. 
              Qualidade internacional, velocidade excepcional.
            </p>

            {/* Specific Benefits Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {specificBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <benefit.icon className={`w-6 h-6 ${benefit.color} flex-shrink-0 mt-0.5`} />
                  <span className="text-blue-50 text-sm leading-relaxed">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-tr from-blue-600/20 to-transparent rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80" 
                alt="Construção em Light Steel Frame"
                className="w-full h-full object-cover mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent" />
              
              {/* Stats Overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white/90 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">70%</div>
                    <div className="text-xs text-blue-700">Mais Rápido</div>
                  </div>
                  <div className="text-center p-3 bg-white/90 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">95%</div>
                    <div className="text-xs text-green-700">Reciclável</div>
                  </div>
                  <div className="text-center p-3 bg-white/90 rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">25</div>
                    <div className="text-xs text-purple-700">Anos Garantia</div>
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
