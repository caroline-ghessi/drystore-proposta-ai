
import { supabase } from '@/integrations/supabase/client';
import type { ClientData } from '@/types/proposalCreation';

export class ClientService {
  static async createOrRetrieveClient(clientData: ClientData) {
    console.log('🎯 Creating or retrieving client:', clientData.email);

    const { data: existingClient, error: existingClientError } = await supabase
      .from('clients')
      .select('*')
      .eq('email', clientData.email)
      .single();

    if (existingClientError && existingClientError.code !== 'PGRST116') {
      console.error('❌ Error checking existing client:', existingClientError);
      throw new Error(`Erro ao verificar cliente existente: ${existingClientError.message}`);
    }

    if (existingClient) {
      console.log('✅ Client already exists:', existingClient);
      return existingClient;
    }

    const { data: newClient, error: newClientError } = await supabase
      .from('clients')
      .insert([{
        nome: clientData.name,
        email: clientData.email,
        telefone: clientData.phone,
        empresa: clientData.company,
        endereco: clientData.address
      }])
      .select()
      .single();

    if (newClientError) {
      console.error('❌ Error creating client:', newClientError);
      throw new Error(`Erro ao criar cliente: ${newClientError.message}`);
    }

    console.log('✅ Client created:', newClient);
    return newClient;
  }
}
