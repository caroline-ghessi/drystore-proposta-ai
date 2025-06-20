
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
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Follow-ups WhatsApp com IA</h1>
            <p className="text-gray-600 mt-1">
              Automatize o acompanhamento e sugestão de produtos via WhatsApp
            </p>
          </div>
          <Button onClick={generateNewFollowUp} disabled={isGenerating}>
            <Plus className="w-4 h-4 mr-2" />
            {isGenerating ? 'Gerando...' : 'Gerar Follow-up'}
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageCircle className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{pendingMessages.length}</p>
                  <p className="text-gray-600">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Zap className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{sentMessages.length}</p>
                  <p className="text-gray-600">Enviados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{triggers.filter(t => t.isActive).length}</p>
                  <p className="text-gray-600">Gatilhos Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <History className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{followUpMessages.length}</p>
                  <p className="text-gray-600">Total Histórico</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending" className="relative">
              Pendentes
              {pendingMessages.length > 0 && (
                <Badge className="ml-2 bg-red-500">{pendingMessages.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent">Enviados</TabsTrigger>
            <TabsTrigger value="triggers">Configurações</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
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
                <CardContent className="p-12 text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum follow-up pendente
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Clique em "Gerar Follow-up" para criar uma nova mensagem personalizada
                  </p>
                  <Button onClick={generateNewFollowUp} disabled={isGenerating}>
                    <Plus className="w-4 h-4 mr-2" />
                    {isGenerating ? 'Gerando...' : 'Gerar Primeiro Follow-up'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-6">
            {sentMessages.map((message) => (
              <Card key={message.id} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{message.clientName}</h3>
                      <p className="text-sm text-gray-600">{message.clientPhone}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Enviado em {new Date(message.sentAt!).toLocaleString('pt-BR')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
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
