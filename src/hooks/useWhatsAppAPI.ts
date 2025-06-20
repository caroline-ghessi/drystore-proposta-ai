
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { WhatsAppMessageHistory } from '@/types/followup';

export const useWhatsAppAPI = () => {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const sendWhatsAppMessage = async (
    toPhone: string,
    fromPhone: string,
    message: string,
    zapiToken: string
  ): Promise<WhatsAppMessageHistory> => {
    setIsSending(true);
    
    try {
      // Para demonstração, vamos simular o envio
      // Em produção, você faria a chamada real para Z-API
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
        description: "Não foi possível enviar a mensagem. Verifique o token Z-API.",
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
    isSending
  };
};
