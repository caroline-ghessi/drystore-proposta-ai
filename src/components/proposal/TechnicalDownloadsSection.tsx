
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Image, Calculator, Shield } from 'lucide-react';

interface TechnicalDoc {
  id: string;
  title: string;
  type: 'manual' | 'specification' | 'diagram' | 'certificate';
  size: string;
  icon: any;
}

export const TechnicalDownloadsSection = () => {
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

  const handleDownload = (doc: TechnicalDoc) => {
    // Mock download - in real implementation would download actual PDF
    console.log(`Downloading ${doc.title}`);
  };

  return (
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
  );
};
