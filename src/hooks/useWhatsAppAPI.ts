
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { WhatsAppMessageHistory } from '@/types/followup';

export const useWhatsAppAPI = () => {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const getVendorZAPIConfig = (vendorId: string) => {
    // Em produção, isso viria da API
    // Por enquanto, simula busca no localStorage
    const configs = JSON.parse(localStorage.getItem('zapi_configs') || '[]');
    return configs.find((config: any) => config.vendorId === vendorId && config.isActive);
  };

  const sendWhatsAppMessage = async (
    toPhone: string,
    fromPhone: string,
    message: string,
    vendorId: string
  ): Promise<WhatsAppMessageHistory> => {
    setIsSending(true);
    
    try {
      // Buscar configuração do vendedor
      const vendorConfig = getVendorZAPIConfig(vendorId);
      
      if (!vendorConfig || !vendorConfig.token) {
        throw new Error('Configuração Z-API não encontrada para este vendedor');
      }

      // Para demonstração, vamos simular o envio
      // Em produção, você faria a chamada real para Z-API usando vendorConfig.token e vendorConfig.instanceId
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular resposta da Z-API
      const messageHistory: WhatsAppMessageHistory = {
        id: Date.now().toString(),
        messageId: `msg_${Date.now()}`,
        clientPhone: toPhone,
        vendorPhone: fromPhone,
        message: message,
        status: 'sent',
        sentAt: new Date().toISOString()
      };

      // Salvar no localStorage para histórico
      const existingHistory = JSON.parse(localStorage.getItem('whatsapp_history') || '[]');
      existingHistory.push(messageHistory);
      localStorage.setItem('whatsapp_history', JSON.stringify(existingHistory));

      toast({
        title: "Mensagem Enviada!",
        description: `WhatsApp enviado para ${toPhone}`,
      });

      return messageHistory;
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      toast({
        title: "Erro no Envio",
        description: error instanceof Error ? error.message : "Não foi possível enviar a mensagem.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  const getMessageHistory = (): WhatsAppMessageHistory[] => {
    return JSON.parse(localStorage.getItem('whatsapp_history') || '[]');
  };

  return {
    sendWhatsAppMessage,
    getMessageHistory,
    isSending,
    getVendorZAPIConfig
  };
};
