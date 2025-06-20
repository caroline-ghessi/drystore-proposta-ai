
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Database, Settings, FileText, Users } from 'lucide-react';
import ERPIntegrationCard from '@/components/erp/ERPIntegrationCard';
import IntegrationConfigPanel from '@/components/erp/IntegrationConfigPanel';
import { useERPIntegration } from '@/hooks/useERPIntegration';
import { useCRMIntegration } from '@/hooks/useCRMIntegration';

const Proposals = () => {
  const [mockProposals] = useState([
    {
      id: 'PROP-001',
      clientName: 'João Silva Construções',
      clientEmail: 'joao@email.com',
      clientPhone: '11999887766',
      finalPrice: 15000.00,
      status: 'accepted',
      items: [
        { id: '1', name: 'Placas Drywall 12,5mm', quantity: 50, price: 25.00 },
        { id: '2', name: 'Perfis de Aço', quantity: 100, price: 8.50 },
        { id: '3', name: 'Massa para Junta', quantity: 10, price: 45.00 }
      ],
      createdAt: '2024-01-15'
    },
    {
      id: 'PROP-002',
      clientName: 'Maria Santos Arquitetura',
      clientEmail: 'maria@email.com',
      clientPhone: '11988776655',
      finalPrice: 23500.00,
      status: 'accepted',
      items: [
        { id: '1', name: 'Sistema Drywall Completo', quantity: 1, price: 23500.00 }
      ],
      createdAt: '2024-01-16'
    }
  ]);

  const { getERPOrders } = useERPIntegration();
  const { getCRMDeals } = useCRMIntegration();
  const [erpOrders, setErpOrders] = useState([]);
  const [crmDeals, setCrmDeals] = useState([]);

  useEffect(() => {
    setErpOrders(getERPOrders());
    setCrmDeals(getCRMDeals());
  }, []);

  const acceptedProposals = mockProposals.filter(p => p.status === 'accepted');

  const refreshIntegrationData = () => {
    setErpOrders(getERPOrders());
    setCrmDeals(getCRMDeals());
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Propostas & Integrações</h1>
            <p className="text-gray-600 mt-1">Gerencie propostas e automatize integrações ERP/CRM</p>
          </div>
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nova Proposta
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <Card className="p-4 sm:p-6">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold">{acceptedProposals.length}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Propostas Aceitas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="p-4 sm:p-6">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold">{crmDeals.length}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Negócios CRM</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="p-4 sm:p-6">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Database className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold">{erpOrders.length}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Pedidos ERP</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="p-4 sm:p-6">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold">2</p>
                  <p className="text-xs sm:text-sm text-gray-600">Integrações Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="accepted" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 min-w-max lg:min-w-0">
              <TabsTrigger value="accepted" className="text-xs sm:text-sm whitespace-nowrap">
                Propostas Aceitas
                {acceptedProposals.length > 0 && (
                  <Badge className="ml-1 sm:ml-2 text-xs">{acceptedProposals.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="integration" className="text-xs sm:text-sm whitespace-nowrap">Automação ERP/CRM</TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm whitespace-nowrap">Histórico</TabsTrigger>
              <TabsTrigger value="config" className="text-xs sm:text-sm whitespace-nowrap">Configurações</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="accepted" className="space-y-6">
            {acceptedProposals.length > 0 ? (
              acceptedProposals.map((proposal) => (
                <Card key={proposal.id} className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="flex items-start sm:items-center gap-2 text-base sm:text-lg">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                          <span className="break-words">{proposal.id} - {proposal.clientName}</span>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Valor: R$ {proposal.finalPrice.toFixed(2)} • {proposal.items.length} itens
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-100 text-green-800 self-start sm:self-center">Aceita</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ERPIntegrationCard 
                      proposalData={proposal}
                      onIntegrationComplete={refreshIntegrationData}
                    />
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 sm:p-12 text-center">
                  <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    Nenhuma proposta aceita
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Quando houver propostas aceitas, elas aparecerão aqui para integração automática
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <div className="grid gap-6">
              <IntegrationConfigPanel />
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="grid gap-6">
              {/* Histórico ERP */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Histórico de Pedidos ERP</CardTitle>
                </CardHeader>
                <CardContent>
                  {erpOrders.length > 0 ? (
                    <div className="space-y-3">
                      {erpOrders.map((order: any) => (
                        <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50 rounded">
                          <div className="min-w-0">
                            <p className="font-medium break-words">{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">R$ {order.totalValue.toFixed(2)}</p>
                          </div>
                          <Badge className="self-start sm:self-center">{order.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm sm:text-base">Nenhum pedido ERP gerado ainda</p>
                  )}
                </CardContent>
              </Card>

              {/* Histórico CRM */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Histórico de Negócios CRM</CardTitle>
                </CardHeader>
                <CardContent>
                  {crmDeals.length > 0 ? (
                    <div className="space-y-3">
                      {crmDeals.map((deal: any) => (
                        <div key={deal.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50 rounded">
                          <div className="min-w-0">
                            <p className="font-medium break-words">{deal.clientName}</p>
                            <p className="text-sm text-gray-600">R$ {deal.dealValue.toFixed(2)} • {deal.stage}</p>
                          </div>
                          <Badge className="self-start sm:self-center">{deal.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm sm:text-base">Nenhum negócio CRM criado ainda</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="config">
            <IntegrationConfigPanel />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Proposals;
