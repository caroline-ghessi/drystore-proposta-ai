
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowRight, Star } from 'lucide-react';

interface ModernHeroSectionProps {
  clientName: string;
  onGetStarted?: () => void;
}

export const ModernHeroSection = ({ clientName, onGetStarted }: ModernHeroSectionProps) => {
  const firstName = clientName.split(' ')[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 shadow-lg">
        <CardContent className="p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row items-center space-y-8 lg:space-y-0 lg:space-x-12">
            {/* Icon Section */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Lightbulb className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
                <span className="ml-2 text-sm text-gray-600">Avaliação 5 estrelas dos nossos clientes</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                🎯 Sua Solução Personalizada Está Aqui, {firstName}!
              </h2>
              
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Desenvolvemos uma proposta exclusiva pensando em cada detalhe do seu projeto. 
                Nossa equipe de especialistas analisou suas necessidades e criou a solução perfeita 
                para transformar sua casa em um verdadeiro lar inteligente.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8"
                  onClick={onGetStarted}
                >
                  Ver Minha Proposta
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  Falar com Especialista
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
