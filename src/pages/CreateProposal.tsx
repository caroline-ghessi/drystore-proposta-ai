
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, Database, FileText, PenTool } from 'lucide-react';

const CreateProposal = () => {
  const navigate = useNavigate();

  const handleOptionSelect = (option: 'architectural' | 'erp' | 'pdf' | 'manual') => {
    switch (option) {
      case 'architectural':
        // Funcionalidade ainda não disponível
        alert('Funcionalidade de projeto arquitetônico em desenvolvimento');
        break;
      case 'erp':
        // Funcionalidade ainda não disponível
        alert('Funcionalidade de importação do ERP em desenvolvimento');
        break;
      case 'pdf':
        navigate('/proposal-upload-choice');
        break;
      case 'manual':
        navigate('/proposal-builder');
        break;
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nova Proposta</h1>
            <p className="text-gray-600 mt-1">Escolha como deseja criar a proposta</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Passo 1 de 4</span>
            <span>25% concluído</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-drystore-blue h-2 rounded-full transition-all duration-300" style={{ width: '25%' }}></div>
          </div>
        </div>

        {/* Opções de Criação */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-200 opacity-50"
            onClick={() => handleOptionSelect('architectural')}
          >
            <CardContent className="p-6">
              <div className="text-center">
                <div className="bg-blue-100 p-4 rounded-lg mx-auto mb-4 w-fit">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Projeto Arquitetônico</h3>
                <p className="text-gray-600 text-sm mb-4">
                  IA analisa plantas e projetos técnicos para quantificação automática
                </p>
                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <p>• Análise de plantas baixas</p>
                  <p>• Quantificação automática</p>
                  <p>• Ideal para projetos complexos</p>
                </div>
                <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                  Em desenvolvimento
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-200 opacity-50"
            onClick={() => handleOptionSelect('erp')}
          >
            <CardContent className="p-6">
              <div className="text-center">
                <div className="bg-green-100 p-4 rounded-lg mx-auto mb-4 w-fit">
                  <Database className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Importar do ERP</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Conecta diretamente com seu ERP para buscar orçamentos existentes
                </p>
                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <p>• Conexão direta com ERP</p>
                  <p>• Busca por número do orçamento</p>
                  <p>• Sincronização automática</p>
                </div>
                <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                  Em desenvolvimento
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-drystore-blue border-drystore-blue"
            onClick={() => handleOptionSelect('pdf')}
          >
            <CardContent className="p-6">
              <div className="text-center">
                <div className="bg-blue-100 p-4 rounded-lg mx-auto mb-4 w-fit">
                  <FileText className="w-8 h-8 text-drystore-blue" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Upload de PDF</h3>
                <p className="text-gray-600 text-sm mb-4">
                  IA extrai dados automaticamente de PDFs com quantitativos
                </p>
                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <p>• Extração automática de dados</p>
                  <p>• Processamento inteligente</p>
                  <p>• Geração rápida de proposta</p>
                </div>
                <Button 
                  className="w-full gradient-bg hover:opacity-90 mt-4"
                  size="sm"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Começar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-200 border-purple-300"
            onClick={() => handleOptionSelect('manual')}
          >
            <CardContent className="p-6">
              <div className="text-center">
                <div className="bg-purple-100 p-4 rounded-lg mx-auto mb-4 w-fit">
                  <PenTool className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Criar Manualmente</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Crie uma proposta do zero preenchendo todos os dados manualmente
                </p>
                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <p>• Controle total dos dados</p>
                  <p>• Preenchimento manual</p>
                  <p>• Ideal para casos específicos</p>
                </div>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-4"
                  size="sm"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Criar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>💡 Recomendamos <span className="font-medium text-drystore-blue">Upload de PDF</span> para importação automática ou <span className="font-medium text-purple-600">Criar Manualmente</span> para controle total</p>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProposal;
