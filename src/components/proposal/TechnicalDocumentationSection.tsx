
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Image, CheckCircle, Calculator, Shield } from 'lucide-react';

interface TechnicalDoc {
  id: string;
  title: string;
  type: 'manual' | 'specification' | 'diagram' | 'certificate';
  size: string;
  icon: any;
}

export const TechnicalDocumentationSection = () => {
  const technicalDocs: TechnicalDoc[] = [
    {
      id: '1',
      title: 'Manual de Instalação Completo',
      type: 'manual',
      size: '2.4 MB',
      icon: FileText
    },
    {
      id: '2',
      title: 'Especificações Técnicas dos Materiais',
      type: 'specification',
      size: '1.8 MB',
      icon: Calculator
    },
    {
      id: '3',
      title: 'Diagramas de Montagem 3D',
      type: 'diagram',
      size: '3.2 MB',
      icon: Image
    },
    {
      id: '4',
      title: 'Certificados de Qualidade ABNT',
      type: 'certificate',
      size: '1.1 MB',
      icon: Shield
    }
  ];

  const technicalFeatures = [
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

  const handleDownload = (doc: TechnicalDoc) => {
    // Mock download - in real implementation would download actual PDF
    console.log(`Downloading ${doc.title}`);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full mr-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              🔧 Documentação Técnica Completa
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Desenvolvemos uma solução técnica personalizada para você. Confira toda a documentação 
            detalhada que comprova o cuidado e precisão na elaboração do seu projeto.
          </p>
        </div>

        {/* Technical Features Grid */}
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

        {/* Technical Images Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            📐 Imagens Técnicas Explicativas
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop" 
                alt="Diagrama técnico estrutural"
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="font-semibold">Estrutura de Apoio</h4>
                <p className="text-sm opacity-90">Detalhamento das vigas e suportes</p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1560472355-536de3962603?w=600&h=400&fit=crop" 
                alt="Sistema de fixação"
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="font-semibold">Sistema de Fixação</h4>
                <p className="text-sm opacity-90">Pontos de ancoragem e estabilidade</p>
              </div>
            </div>
          </div>
        </div>

        {/* Downloads Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              📋 Downloads Disponíveis
            </h3>
            <p className="text-gray-600">
              Acesse toda a documentação técnica do seu projeto
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {technicalDocs.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    <doc.icon className="w-8 h-8 text-blue-600 mr-3" />
                    <div className="flex-1">
                      <Badge 
                        variant="outline" 
                        className="text-xs mb-1"
                      >
                        {doc.type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2 text-sm">
                    {doc.title}
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">PDF • {doc.size}</p>
                  <Button 
                    size="sm" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quality Assurance */}
        <div className="mt-12 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex justify-center items-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <h4 className="text-xl font-semibold text-green-800">
                Projeto Aprovado por Engenheiro Responsável
              </h4>
            </div>
            <p className="text-green-700">
              Esta solução foi desenvolvida e validada por nossa equipe técnica especializada, 
              seguindo todas as normas ABNT aplicáveis e melhores práticas da engenharia.
            </p>
            <div className="flex justify-center mt-4 space-x-4 text-sm text-green-600">
              <span>✓ ABNT NBR 11370</span>
              <span>✓ NR-11 Compliance</span>
              <span>✓ ISO 9001:2015</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
