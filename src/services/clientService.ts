
import { supabase } from '@/integrations/supabase/client';

interface ClientData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
}

export const clientService = {
  async findOrCreateClient(clientData: ClientData) {
    // Buscar cliente existente
    const { data: existingClient } = await supabase
      .from('clients')
      .select('*')
      .eq('email', clientData.email)
      .single();

    if (existingClient) {
      console.log('📋 Cliente existente encontrado:', existingClient.id);
      
      // Atualizar dados do cliente existente
      const { data: updatedClient, error: updateError } = await supabase
        .from('clients')
        .update({
          nome: clientData.name,
          telefone: clientData.phone || null,
          empresa: clientData.company || null,
        })
        .eq('id', existingClient.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedClient;
    } else {
      console.log('👤 Criando novo cliente');
      
      // Criar novo cliente
      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert({
          nome: clientData.name,
          email: clientData.email,
          telefone: clientData.phone || null,
          empresa: clientData.company || null,
        })
        .select()
        .single();

      if (createError) throw createError;
      return newClient;
    }
  }
};
