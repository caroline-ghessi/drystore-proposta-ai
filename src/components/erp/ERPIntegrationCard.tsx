
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Database, FileText, Truck, Settings, Lock } from 'lucide-react';
import { useERPIntegration } from '@/hooks/useERPIntegration';
import { useCRMIntegration } from '@/hooks/useCRMIntegration';
import PermissionGuard from '@/components/PermissionGuard';

interface ERPIntegrationCardProps {
  proposalData: any;
  onIntegrationComplete?: () => void;
}

const ERPIntegrationCard = ({ proposalData, onIntegrationComplete }: ERPIntegrationCardProps) => {
  const [currentStep, setCurrentStep] = useState<'idle' | 'crm' | 'erp' | 'xml' | 'complete'>('idle');
  
  const { createERPOrder, generateOrderXML, isCreatingOrder, isGeneratingXML } = useERPIntegration();
  const { createCRMDeal, isCreatingDeal } = useCRMIntegration();

  const executeFullIntegration = async () => {
    try {
      // Etapa 1: Criar negócio no CRM
      setCurrentStep('crm');
      await createCRMDeal(proposalData);
      
      // Etapa 2: Criar pedido no ERP
      setCurrentStep('erp');
      const erpOrder = await createERPOrder(proposalData);
      
      // Etapa 3: Gerar XML
      setCurrentStep('xml');
      const xmlData = {
        order: erpOrder,
        client: {
          name: proposalData.clientName,
          document: proposalData.clientDocument || '000.000.000-00',
          email: proposalData.clientEmail || 'cliente@email.com',
          phone: proposalData.clientPhone || '11999999999',
          address: {
            street: 'Rua Exemplo',
            number: '123',
            district: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01000-000'
          }
        },
        vendor: {
          name: 'Drystore',
          document: '00.000.000/0001-00',
          email: 'vendas@drystore.com'
        }
      };
      
      await generateOrderXML(xmlData);
      
      setCurrentStep('complete');
      onIntegrationComplete?.();
    } catch (error) {
      console.error('Erro na integração completa:', error);
      setCurrentStep('idle');
    }
  };

  const getStepStatus = (step: string) => {
    if (currentStep === step) return 'processing';
    if (currentStep === 'complete') return 'completed';
    return 'pending';
  };

  const getStepBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge className="bg-blue-500">Processando...</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Concluído</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const AdminOnlyFallback = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="w-5 h-5 mr-2 text-blue-600" />
          Automação ERP/CRM
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-8">
        <Lock className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <h4 className="font-medium text-gray-900 mb-2">Funcionalidade Restrita</h4>
        <p className="text-sm text-gray-600">
          Apenas administradores podem executar integrações ERP/CRM.
        </p>
      </CardContent>
    </Card>
  );

  return (
    <PermissionGuard 
      requiredRole={['admin']} 
      fallback={<AdminOnlyFallback />}
    >
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2 text-blue-600" />
            Automação ERP/CRM
            <Badge variant="outline" className="ml-2 text-xs">Admin Only</Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status das Integrações */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Settings className="w-4 h-4 mr-2 text-purple-600" />
                <span className="text-sm font-medium">Criar Negócio CRM</span>
              </div>
              {getStepBadge(getStepStatus('crm'))}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Truck className="w-4 h-4 mr-2 text-orange-600" />
                <span className="text-sm font-medium">Gerar Pedido ERP</span>
              </div>
              {getStepBadge(getStepStatus('erp'))}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2 text-green-600" />
                <span className="text-sm font-medium">Gerar XML</span>
              </div>
              {getStepBadge(getStepStatus('xml'))}
            </div>
          </div>

          <Separator />

          {/* Informações da Proposta */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Dados da Proposta</h4>
            <div className="text-sm space-y-1">
              <p><strong>Cliente:</strong> {proposalData.clientName}</p>
              <p><strong>Valor:</strong> R$ {proposalData.finalPrice?.toFixed(2)}</p>
              <p><strong>Itens:</strong> {proposalData.items?.length || 0} produtos</p>
            </div>
          </div>

          {/* Botão de Ação */}
          <Button
            onClick={executeFullIntegration}
            disabled={
              currentStep !== 'idle' && currentStep !== 'complete' ||
              isCreatingDeal || isCreatingOrder || isGeneratingXML
            }
            className="w-full"
            size="lg"
          >
            {currentStep === 'idle' ? 'Executar Integração Completa' :
             currentStep === 'complete' ? 'Integração Concluída ✓' :
             'Processando Integração...'}
          </Button>

          {currentStep === 'complete' && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-green-800 text-sm">
                ✅ Todas as integrações foram executadas com sucesso!
                <br />
                • Negócio criado no CRM
                <br />
                • Pedido gerado no ERP
                <br />
                • XML formatado e pronto
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PermissionGuard>
  );
};

export default ERPIntegrationCard;
