import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageCircle, Settings, History, Zap } from 'lucide-react';
import FollowUpMessageCard from '@/components/followup/FollowUpMessageCard';
import FollowUpTriggerConfig from '@/components/followup/FollowUpTriggerConfig';
import WhatsAppHistory from '@/components/followup/WhatsAppHistory';
import { FollowUpMessage, FollowUpTrigger } from '@/types/followup';
import { useFollowUpAI } from '@/hooks/useFollowUpAI';

const FollowUpManager = () => {
  const [followUpMessages, setFollowUpMessages] = useState<FollowUpMessage[]>([]);
  const [triggers, setTriggers] = useState<FollowUpTrigger[]>([]);
  const { generateFollowUpMessage, isGenerating } = useFollowUpAI();

  useEffect(() => {
    // Carregar dados salvos
    const savedMessages = JSON.parse(localStorage.getItem('followup_messages') || '[]');
    const savedTriggers = JSON.parse(localStorage.getItem('followup_triggers') || '[]');
    
    setFollowUpMessages(savedMessages);
    setTriggers(savedTriggers.length > 0 ? savedTriggers : getDefaultTriggers());
  }, []);

  const getDefaultTriggers = (): FollowUpTrigger[] => [
    {
      id: '1',
      type: 'delivery_completed',
      name: 'Pós-entrega - Produtos Complementares',
      description: 'Sugere produtos após finalização da entrega',
      daysAfter: 3,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      type: 'product_purchase',
      name: 'Compra de Drywall - Sugerir Massa',
      description: 'Após compra de placas, sugere massa para junta',
      daysAfter: 1,
      productCategories: ['drywall', 'placas'],
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      type: 'no_activity',
      name: 'Cliente Inativo - Reativação',
      description: 'Clientes sem pedidos há 30 dias',
      daysAfter: 30,
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

  const generateNewFollowUp = async () => {
    try {
      const mockClient = {
        id: '1',
        name: 'João Silva',
        phone: '11999887766'
      };

      const mockVendor = {
        id: '1',
        name: 'Carlos Vendedor',
        phone: '11988776655'
      };

      const lastPurchase = {
        proposalId: 'PROP-2024-001',
        productName: 'Placas Drywall 12,5mm',
        date: new Date().toISOString()
      };

      const { message, suggestedProducts } = await generateFollowUpMessage(
        mockClient.name,
        mockVendor.name,
        lastPurchase,
        'delivery_completed'
      );

      const newFollowUp: FollowUpMessage = {
        id: Date.now().toString(),
        clientId: mockClient.id,
        clientName: mockClient.name,
        clientPhone: mockClient.phone,
        vendorId: mockVendor.id,
        vendorName: mockVendor.name,
        vendorPhone: mockVendor.phone,
        triggerId: '1',
        triggerType: 'delivery_completed',
        originalMessage: message,
        finalMessage: message,
        suggestedProducts,
        status: 'pending',
        createdAt: new Date().toISOString(),
        lastPurchase
      };

      const updatedMessages = [newFollowUp, ...followUpMessages];
      setFollowUpMessages(updatedMessages);
      localStorage.setItem('followup_messages', JSON.stringify(updatedMessages));
    } catch (error) {
      console.error('Erro ao gerar follow-up:', error);
    }
  };

  const handleMessageSent = (messageId: string) => {
    const updated = followUpMessages.map(msg =>
      msg.id === messageId ? { ...msg, status: 'sent' as const, sentAt: new Date().toISOString() } : msg
    );
    setFollowUpMessages(updated);
    localStorage.setItem('followup_messages', JSON.stringify(updated));
  };

  const handleTriggersChange = (newTriggers: FollowUpTrigger[]) => {
    setTriggers(newTriggers);
    localStorage.setItem('followup_triggers', JSON.stringify(newTriggers));
  };

  const pendingMessages = followUpMessages.filter(msg => msg.status === 'pending');
  const sentMessages = followUpMessages.filter(msg => msg.status === 'sent');

  return (
    <Layout>
      <div className="max-w-6xl mx-auto animate-fade-in px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Follow-ups WhatsApp com IA</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Automatize o acompanhamento e sugestão de produtos via WhatsApp
            </p>
          </div>
          <Button 
            onClick={generateNewFollowUp} 
            disabled={isGenerating}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isGenerating ? 'Gerando...' : 'Gerar Follow-up'}
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-lg sm:text-2xl font-bold">{pendingMessages.length}</p>
                  <p className="text-gray-600 text-xs sm:text-sm">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-lg sm:text-2xl font-bold">{sentMessages.length}</p>
                  <p className="text-gray-600 text-xs sm:text-sm">Enviados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-lg sm:text-2xl font-bold">{triggers.filter(t => t.isActive).length}</p>
                  <p className="text-gray-600 text-xs sm:text-sm">Gatilhos Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <History className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-lg sm:text-2xl font-bold">{followUpMessages.length}</p>
                  <p className="text-gray-600 text-xs sm:text-sm">Total Histórico</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-4 min-w-[400px]">
              <TabsTrigger value="pending" className="relative text-xs sm:text-sm">
                <span className="hidden sm:inline">Pendentes</span>
                <span className="sm:hidden">Pend.</span>
                {pendingMessages.length > 0 && (
                  <Badge className="ml-1 sm:ml-2 bg-red-500 text-xs">{pendingMessages.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Enviados</span>
                <span className="sm:hidden">Env.</span>
              </TabsTrigger>
              <TabsTrigger value="triggers" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Configurações</span>
                <span className="sm:hidden">Config</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Histórico</span>
                <span className="sm:hidden">Hist.</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="pending" className="space-y-4 sm:space-y-6">
            {pendingMessages.length > 0 ? (
              pendingMessages.map((message) => (
                <FollowUpMessageCard
                  key={message.id}
                  followUpMessage={message}
                  onMessageSent={handleMessageSent}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 sm:p-12 text-center">
                  <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    Nenhum follow-up pendente
                  </h3>
                  <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                    Clique em "Gerar Follow-up" para criar uma nova mensagem personalizada
                  </p>
                  <Button 
                    onClick={generateNewFollowUp} 
                    disabled={isGenerating}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isGenerating ? 'Gerando...' : 'Gerar Primeiro Follow-up'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4 sm:space-y-6">
            {sentMessages.map((message) => (
              <Card key={message.id} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-medium">{message.clientName}</h3>
                      <p className="text-sm text-gray-600">{message.clientPhone}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm self-start sm:self-auto">
                      Enviado em {new Date(message.sentAt!).toLocaleString('pt-BR')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{message.finalMessage}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="triggers">
            <FollowUpTriggerConfig
              triggers={triggers}
              onTriggersChange={handleTriggersChange}
            />
          </TabsContent>

          <TabsContent value="history">
            <WhatsAppHistory />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default FollowUpManager;
