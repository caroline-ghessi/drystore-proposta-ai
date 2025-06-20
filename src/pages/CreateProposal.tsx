
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building, Mail, Phone, User, Database, FileText } from 'lucide-react';
import ERPBudgetImporter from '@/components/proposal/ERPBudgetImporter';

const CreateProposal = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'choose' | 'manual' | 'erp'>('choose');
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    projectName: '',
    projectDescription: '',
    address: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleManualNext = () => {
    console.log('Dados do cliente:', formData);
    navigate('/upload-document');
  };

  const handleERPImport = (budgetData: any) => {
    console.log('Dados importados do ERP:', budgetData);
    // Preenche o formulário com os dados do ERP
    setFormData({
      clientName: budgetData.clientName,
      clientEmail: budgetData.clientEmail,
      clientPhone: budgetData.clientPhone,
      projectName: budgetData.projectName,
      projectDescription: budgetData.observations || '',
      address: budgetData.address || ''
    });
    
    // Armazena os dados completos do orçamento para usar na próxima etapa
    sessionStorage.setItem('erpBudgetData', JSON.stringify(budgetData));
    navigate('/edit-proposal');
  };

  const isFormValid = formData.clientName && formData.clientEmail && formData.projectName;

  // Tela de escolha do tipo de criação
  if (currentStep === 'choose') {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto animate-fade-in">
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
          <div className="grid gap-6">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-200"
              onClick={() => setCurrentStep('manual')}
            >
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Criar Proposta Manual</h3>
                    <p className="text-gray-600 text-sm">
                      Preencha manualmente os dados do cliente e projeto para criar uma nova proposta
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-200"
              onClick={() => setCurrentStep('erp')}
            >
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <Database className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Importar do ERP</h3>
                    <p className="text-gray-600 text-sm">
                      Importe um orçamento existente do ERP informando apenas o número do orçamento
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // Tela de importação do ERP
  if (currentStep === 'erp') {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto animate-fade-in">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setCurrentStep('choose')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Importar do ERP</h1>
              <p className="text-gray-600 mt-1">Busque e importe um orçamento existente</p>
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

          <ERPBudgetImporter 
            onImportComplete={handleERPImport}
            onCancel={() => setCurrentStep('choose')}
          />
        </div>
      </Layout>
    );
  }

  // Tela de criação manual (original)
  return (
    <Layout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentStep('choose')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nova Proposta</h1>
            <p className="text-gray-600 mt-1">Vamos começar coletando informações do cliente</p>
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

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="w-5 h-5 mr-2 text-drystore-blue" />
              Informações do Cliente e Projeto
            </CardTitle>
            <CardDescription>
              Preencha os dados básicos para iniciar a proposta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nome do Cliente *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="clientName"
                    placeholder="Ex: João Silva"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email do Cliente *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="joao@email.com"
                    value={formData.clientEmail}
                    onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="clientPhone"
                    placeholder="(11) 99999-9999"
                    value={formData.clientPhone}
                    onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="projectName">Nome do Projeto *</Label>
                <Input
                  id="projectName"
                  placeholder="Ex: Residência Moderna"
                  value={formData.projectName}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço da Obra</Label>
              <Input
                id="address"
                placeholder="Rua, número, bairro, cidade"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectDescription">Descrição do Projeto</Label>
              <Textarea
                id="projectDescription"
                placeholder="Descreva brevemente o projeto (opcional)"
                value={formData.projectDescription}
                onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex justify-end pt-6">
              <Button 
                onClick={handleManualNext}
                disabled={!isFormValid}
                className="gradient-bg hover:opacity-90"
                size="lg"
              >
                Próximo: Upload de Documento
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateProposal;
