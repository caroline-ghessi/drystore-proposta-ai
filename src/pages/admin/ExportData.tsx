
import Layout from '@/components/Layout';
import PermissionGuard from '@/components/PermissionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Download, FileText, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ExportData = () => {
  const [exportType, setExportType] = useState('proposals');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToCSV = async () => {
    setIsExporting(true);
    
    try {
      // Simular dados de exportação
      let csvContent = '';
      
      if (exportType === 'proposals') {
        csvContent = `Número,Cliente,Projeto,Valor,Status,Data,Válida Até\n`;
        csvContent += `PROP-2024-001,João Silva,Residência Moderna,48283.75,aguardando_planta,2024-01-15,2024-01-30\n`;
        csvContent += `PROP-2024-002,Maria Santos,Cobertura Premium,78000.00,negociacao,2024-01-14,2024-01-29\n`;
      } else if (exportType === 'sessions') {
        csvContent = `Email,Login,IP,Navegador,Última Atividade\n`;
        csvContent += `admin@example.com,2024-01-20T10:00:00Z,192.168.1.1,Chrome,2024-01-20T15:30:00Z\n`;
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${exportType}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Exportação concluída!",
        description: `Arquivo CSV de ${exportType} foi baixado com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o arquivo CSV.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Layout>
      <PermissionGuard 
        requiredRole={['admin']}
        fallback={
          <div className="text-center py-12">
            <p className="text-gray-500">Acesso negado. Apenas administradores podem acessar esta área.</p>
          </div>
        }
      >
        <div className="animate-fade-in">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Exportar Dados</h1>
            <p className="text-gray-600">Gere relatórios em CSV para análise externa</p>
          </div>

          <div className="grid gap-6 max-w-2xl">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="w-5 h-5 mr-2 text-blue-600" />
                  Exportação de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Exportação
                  </label>
                  <Select value={exportType} onValueChange={setExportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proposals">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Propostas e Status
                        </div>
                      </SelectItem>
                      <SelectItem value="sessions">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Logs de Sessão
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={exportToCSV}
                  disabled={isExporting}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exportando...' : 'Baixar CSV'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </PermissionGuard>
    </Layout>
  );
};

export default ExportData;
