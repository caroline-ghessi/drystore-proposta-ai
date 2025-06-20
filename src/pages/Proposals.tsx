
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Propostas & Integrações</h1>
            <p className="text-gray-600 mt-2">Gerencie propostas e automatize integrações ERP/CRM</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Proposta
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{acceptedProposals.length}</p>
                  <p className="text-gray-600">Propostas Aceitas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{crmDeals.length}</p>
                  <p className="text-gray-600">Negócios CRM</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{erpOrders.length}</p>
                  <p className="text-gray-600">Pedidos ERP</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-gray-600">Integrações Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="accepted" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="accepted">
              Propostas Aceitas
              {acceptedProposals.length > 0 && (
                <Badge className="ml-2">{acceptedProposals.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="integration">Automação ERP/CRM</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="config">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="accepted" className="space-y-6">
            {acceptedProposals.length > 0 ? (
              acceptedProposals.map((proposal) => (
                <Card key={proposal.id} className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-blue-600" />
                          {proposal.id} - {proposal.clientName}
                        </CardTitle>
                        <CardDescription>
                          Valor: R$ {proposal.finalPrice.toFixed(2)} • {proposal.items.length} itens
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Aceita</Badge>
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
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma proposta aceita
                  </h3>
                  <p className="text-gray-600">
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
                  <CardTitle>Histórico de Pedidos ERP</CardTitle>
                </CardHeader>
                <CardContent>
                  {erpOrders.length > 0 ? (
                    <div className="space-y-3">
                      {erpOrders.map((order: any) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">R$ {order.totalValue.toFixed(2)}</p>
                          </div>
                          <Badge>{order.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Nenhum pedido ERP gerado ainda</p>
                  )}
                </CardContent>
              </Card>

              {/* Histórico CRM */}
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Negócios CRM</CardTitle>
                </CardHeader>
                <CardContent>
                  {crmDeals.length > 0 ? (
                    <div className="space-y-3">
                      {crmDeals.map((deal: any) => (
                        <div key={deal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{deal.clientName}</p>
                            <p className="text-sm text-gray-600">R$ {deal.dealValue.toFixed(2)} • {deal.stage}</p>
                          </div>
                          <Badge>{deal.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Nenhum negócio CRM criado ainda</p>
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
