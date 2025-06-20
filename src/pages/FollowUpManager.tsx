
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { FollowUpMessage, FollowUpTrigger } from '@/types/followup';
import { useFollowUpAI } from '@/hooks/useFollowUpAI';
import FollowUpStats from '@/components/followup/FollowUpStats';
import FollowUpTabs from '@/components/followup/FollowUpTabs';

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

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-center sm:text-left min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                Follow-ups WhatsApp
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm lg:text-base mt-1">
                Automatize mensagens via WhatsApp
              </p>
            </div>
            <Button 
              onClick={generateNewFollowUp} 
              disabled={isGenerating}
              className="w-full sm:w-auto shrink-0 text-xs sm:text-sm"
              size="sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {isGenerating ? 'Gerando...' : 'Gerar Follow-up'}
            </Button>
          </div>

          <FollowUpStats 
            followUpMessages={followUpMessages}
            triggers={triggers}
          />

          <FollowUpTabs
            followUpMessages={followUpMessages}
            triggers={triggers}
            onMessageSent={handleMessageSent}
            onTriggersChange={handleTriggersChange}
            onGenerateFollowUp={generateNewFollowUp}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </Layout>
  );
};

export default FollowUpManager;
