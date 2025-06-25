
import { Card, CardContent } from '@/components/ui/card';
import { Check, Home } from 'lucide-react';

interface DreamHomeSectionProps {
  benefits: string[];
  specifications?: Array<{
    category: string;
    items: Array<{
      name: string;
      value: string;
    }>;
  }>;
}

export const DreamHomeSection = ({ benefits, specifications }: DreamHomeSectionProps) => {
  // Especificações padrão baseadas na imagem
  const defaultSpecifications = [
    { name: "Área Total", value: "120m²" },
    { name: "Padrão", value: "Premium" },
    { name: "Prazo", value: "6 meses" },
    { name: "Garantia", value: "5 anos" }
  ];

  // Benefícios padrão baseados na imagem
  const defaultBenefits = [
    "Projeto arquitetônico personalizado",
    "3 suítes com closet integrado", 
    "Cozinha gourmet com ilha central",
    "Área de lazer com piscina",
    "Sistema de automação residencial",
    "Materiais de primeira qualidade",
    "Acompanhamento técnico completo",
    "Garantia estendida de 5 anos"
  ];

  const displayBenefits = benefits.length > 0 ? benefits : defaultBenefits;

  return (
    <div className="bg-gradient-to-b from-orange-50 to-cream-100 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-6">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Sua Casa dos Sonhos Planejada
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Uma solução completa e personalizada que vai transformar seu projeto em realidade, 
            com qualidade premium e acabamento impecável
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="p-8">
            {/* Benefits Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-2xl mr-3">✨</span>
                Incluso na sua solução:
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {displayBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-gray-700 leading-relaxed">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Specifications Section */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-2xl mr-3">📋</span>
                Especificações Técnicas:
              </h3>
              <div className="space-y-4">
                {defaultSpecifications.map((spec, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                    <span className="text-gray-700 font-medium">{spec.name}:</span>
                    <span className="font-bold text-gray-900 text-lg">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
