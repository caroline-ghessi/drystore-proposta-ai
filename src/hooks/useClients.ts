
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Client = Tables<'clients'>;
type ClientInsert = TablesInsert<'clients'>;
type ClientUpdate = TablesUpdate<'clients'>;

export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Client[];
    },
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (client: ClientInsert) => {
      const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ClientUpdate }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

// Função utilitária para buscar ou criar cliente
export const useFindOrCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientData: { name: string; email: string; phone?: string; company?: string }) => {
      // Buscar cliente existente
      const { data: existingClient } = await supabase
        .from('clients')
        .select('*')
        .eq('email', clientData.email)
        .single();

      if (existingClient) {
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

// Função para atualizar cliente com email
export const useUpdateClientEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, email }: { clientId: string; email: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update({ email })
        .eq('id', clientId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};
