
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Download, 
  RefreshCw
} from 'lucide-react';

const QuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span>Teste Completo</span>
            <span className="text-xs text-gray-500 text-center">
              Executar todos os testes de integração
            </span>
          </Button>

          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <Download className="w-6 h-6 text-blue-600" />
            <span>Export Configurações</span>
            <span className="text-xs text-gray-500 text-center">
              Backup de todas as configurações
            </span>
          </Button>

          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <RefreshCw className="w-6 h-6 text-purple-600" />
            <span>Reset Cache</span>
            <span className="text-xs text-gray-500 text-center">
              Limpar cache e reiniciar conexões
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
