
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Home, Shield, Settings, Award } from 'lucide-react';

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
  const defaultSpecs = [
    {
      category: "Automação Residencial",
      items: [
        { name: "Controle de Iluminação", value: "LED Inteligente" },
        { name: "Sistema de Segurança", value: "Alarme + Câmeras" },
        { name: "Climatização", value: "Ar Condicionado Smart" },
        { name: "Áudio e Vídeo", value: "Som Ambiente" }
      ]
    },
    {
      category: "Estrutura e Acabamento",
      items: [
        { name: "Materiais", value: "Premium" },
        { name: "Garantia", value: "5 anos" },
        { name: "Instalação", value: "Profissional" },
        { name: "Suporte", value: "24/7" }
      ]
    }
  ];

  const specs = specifications || defaultSpecs;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
          <Home className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Sua Casa dos Sonhos
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Conheça todos os benefícios e especificações técnicas da sua nova solução residencial
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Benefits Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Award className="w-6 h-6 mr-3 text-green-600" />
              Benefícios Exclusivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-gray-700 leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Specifications Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Settings className="w-6 h-6 mr-3 text-blue-600" />
              Especificações Técnicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {specs.map((spec, index) => (
                <div key={index}>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-blue-500" />
                    {spec.category}
                  </h4>
                  <div className="space-y-2">
                    {spec.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-gray-600">{item.name}</span>
                        <span className="font-medium text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
