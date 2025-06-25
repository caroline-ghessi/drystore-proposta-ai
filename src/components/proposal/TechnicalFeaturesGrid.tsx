
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Shield, FileText } from 'lucide-react';

interface TechnicalFeature {
  title: string;
  description: string;
  icon: any;
  highlight: string;
}

export const TechnicalFeaturesGrid = () => {
  const technicalFeatures: TechnicalFeature[] = [
    {
      title: 'Análise Estrutural Personalizada',
      description: 'Cálculos específicos para seu espaço e necessidades',
      icon: Calculator,
      highlight: 'Dimensionamento preciso'
    },
    {
      title: 'Materiais Certificados',
      description: 'Componentes com certificação ABNT e ISO 9001',
      icon: Shield,
      highlight: 'Garantia de qualidade'
    },
    {
      title: 'Projeto Executivo Detalhado',
      description: 'Desenhos técnicos com todas as especificações',
      icon: FileText,
      highlight: 'Documentação completa'
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-8 mb-12">
      {technicalFeatures.map((feature, index) => (
        <Card key={index} className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {feature.highlight}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">
              {feature.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
