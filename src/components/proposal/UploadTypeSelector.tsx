
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Building2, Upload, Zap } from 'lucide-react';

interface UploadTypeSelectorProps {
  onSelectType: (type: 'architectural' | 'erp') => void;
}

const UploadTypeSelector = ({ onSelectType }: UploadTypeSelectorProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="border-2 hover:border-drystore-blue transition-colors cursor-pointer group">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Building2 className="w-6 h-6 mr-3 text-drystore-blue" />
            Projeto Arquitetônico
          </CardTitle>
          <CardDescription>
            Para projetos maiores onde a IA fará a quantificação automática
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center text-sm text-gray-600">
              <Zap className="w-4 h-4 mr-2 text-yellow-500" />
              IA + Adobe PDF Service
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Plantas baixas e projetos técnicos</li>
              <li>• Quantificação automática de materiais</li>
              <li>• Análise de área e sistemas</li>
              <li>• Ideal para projetos complexos</li>
            </ul>
            <Button 
              onClick={() => onSelectType('architectural')}
              className="w-full gradient-bg hover:opacity-90 group-hover:shadow-lg transition-all"
            >
              <Upload className="w-4 h-4 mr-2" />
              Enviar Projeto Arquitetônico
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 hover:border-drystore-blue transition-colors cursor-pointer group">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <FileText className="w-6 h-6 mr-3 text-drystore-blue" />
            Lista de Quantitativos (ERP)
          </CardTitle>
          <CardDescription>
            Para quando você já tem os quantitativos e valores prontos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center text-sm text-gray-600">
              <Zap className="w-4 h-4 mr-2 text-green-500" />
              Processamento Rápido
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• PDF gerado pelo seu ERP</li>
              <li>• Quantitativos e valores prontos</li>
              <li>• Conversão direta para proposta</li>
              <li>• Ideal para vendas rápidas</li>
            </ul>
            <Button 
              onClick={() => onSelectType('erp')}
              variant="outline"
              className="w-full border-drystore-blue text-drystore-blue hover:bg-drystore-blue hover:text-white group-hover:shadow-lg transition-all"
            >
              <FileText className="w-4 h-4 mr-2" />
              Enviar Lista do ERP
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadTypeSelector;
