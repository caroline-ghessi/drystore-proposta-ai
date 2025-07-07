import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface WhapiInstance {
  id: string;
  vendor_id: string;
  vendor_name: string;
  instance_id: string;
  token: string;
  webhook_url: string;
  phone_number?: string;
  is_active: boolean;
  last_heartbeat?: string;
  created_at: string;
}

export interface WhatsAppMessage {
  id: string;
  whapi_instance_id: string;
  proposal_id?: string;
  client_id: string;
  message_content: string;
  client_phone: string;
  vendor_phone: string;
  whapi_message_id?: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  error_message?: string;
  sent_at: string;
  delivered_at?: string;
}

export const useWhapiAPI = () => {
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const getWhapiInstances = async (): Promise<WhapiInstance[]> => {
    try {
      const { data, error } = await supabase
        .from('whapi_instances')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar instâncias Whapi:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as instâncias Whapi",
        variant: "destructive"
      });
      return [];
    }
  };

  const createWhapiInstance = async (
    vendorId: string,
    vendorName: string,
    instanceId: string,
    token: string,
    phoneNumber?: string
  ): Promise<WhapiInstance | null> => {
    try {
      setIsLoading(true);

      // Gerar URL de webhook única
      const { data: webhookUrl, error: webhookError } = await supabase
        .rpc('generate_whapi_webhook_url', { instance_id: instanceId });

      if (webhookError) throw webhookError;

      const { data, error } = await supabase
        .from('whapi_instances')
        .insert({
          vendor_id: vendorId,
          vendor_name: vendorName,
          instance_id: instanceId,
          token: token,
          webhook_url: webhookUrl,
          phone_number: phoneNumber,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `Instância Whapi criada: ${instanceId}`,
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar instância Whapi:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível criar a instância",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateWhapiInstance = async (
    id: string,
    updates: Partial<Pick<WhapiInstance, 'token' | 'phone_number' | 'is_active' | 'vendor_name'>>
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('whapi_instances')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Instância Whapi atualizada",
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar instância Whapi:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível atualizar a instância",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWhapiInstance = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('whapi_instances')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Instância Whapi removida",
      });

      return true;
    } catch (error) {
      console.error('Erro ao remover instância Whapi:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível remover a instância",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendWhatsAppMessage = async (
    instanceId: string,
    clientPhone: string,
    message: string,
    clientId: string,
    proposalId?: string
  ): Promise<WhatsAppMessage | null> => {
    setIsSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('whapi-send-message', {
        body: {
          instanceId,
          clientPhone,
          message,
          clientId,
          proposalId
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido');
      }

      toast({
        title: "Mensagem Enviada!",
        description: `WhatsApp enviado para ${clientPhone}`,
      });

      // Buscar o registro criado no banco
      const { data: messageRecord, error: fetchError } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('id', data.recordId)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar registro da mensagem:', fetchError);
      }

      return messageRecord as WhatsAppMessage || null;
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      toast({
        title: "Erro no Envio",
        description: error instanceof Error ? error.message : "Não foi possível enviar a mensagem.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsSending(false);
    }
  };

  const getMessageHistory = async (instanceId?: string): Promise<WhatsAppMessage[]> => {
    try {
      let query = supabase
        .from('whatsapp_messages')
        .select('*')
        .order('sent_at', { ascending: false });

      if (instanceId) {
        query = query.eq('whapi_instance_id', instanceId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data as WhatsAppMessage[]) || [];
    } catch (error) {
      console.error('Erro ao buscar histórico de mensagens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de mensagens",
        variant: "destructive"
      });
      return [];
    }
  };

  const testWhapiInstance = async (instanceId: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Buscar a instância
      const { data: instance, error } = await supabase
        .from('whapi_instances')
        .select('*')
        .eq('instance_id', instanceId)
        .single();

      if (error || !instance) {
        throw new Error('Instância não encontrada');
      }

      // Testar conectividade com Whapi
      const response = await fetch('https://gate.whapi.cloud/health', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${instance.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na conectividade: ${response.status}`);
      }

      const result = await response.json();

      toast({
        title: "Teste Realizado!",
        description: `Instância ${instanceId}: ${result.status || 'Conectada'}`,
      });

      return true;
    } catch (error) {
      console.error('Erro no teste de conectividade:', error);
      toast({
        title: "Erro no Teste",
        description: error instanceof Error ? error.message : "Falha na conectividade",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Estados
    isSending,
    isLoading,
    
    // Gerenciamento de instâncias
    getWhapiInstances,
    createWhapiInstance,
    updateWhapiInstance,
    deleteWhapiInstance,
    testWhapiInstance,
    
    // Envio de mensagens
    sendWhatsAppMessage,
    getMessageHistory
  };
};