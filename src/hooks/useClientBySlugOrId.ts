
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Função utilitária para verificar se é um UUID válido
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Função para converter slug em nome (fallback)
const getClientNameFromSlug = (slug: string): string => {
  if (isValidUUID(slug)) {
    // Se for um UUID, retornar uma string genérica
    return 'Cliente';
  }
  
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const useClientBySlugOrId = (slugOrId: string) => {
  return useQuery({
    queryKey: ['client-by-slug-or-id', slugOrId],
    queryFn: async () => {
      console.log('🔍 [DEBUG] Buscando cliente por slug/ID:', slugOrId);

      if (!slugOrId) {
        throw new Error('Slug ou ID é obrigatório');
      }

      let client = null;

      // Primeiro, tentar buscar por ID (se for um UUID válido)
      if (isValidUUID(slugOrId)) {
        console.log('🔍 [DEBUG] Buscando por ID (UUID):', slugOrId);
        
        const { data: clientById, error: errorById } = await supabase
          .from('clients')
          .select('id, nome, email, empresa, telefone')
          .eq('id', slugOrId)
          .single();

        if (!errorById && clientById) {
          console.log('✅ [DEBUG] Cliente encontrado por ID:', clientById);
          client = clientById;
        } else {
          console.log('❌ [DEBUG] Cliente não encontrado por ID:', errorById);
        }
      }

      // Se não encontrou por ID, tentar buscar por nome (slug convertido)
      if (!client) {
        const clientName = getClientNameFromSlug(slugOrId);
        console.log('🔍 [DEBUG] Buscando por nome:', clientName);
        
        const { data: clientByName, error: errorByName } = await supabase
          .from('clients')
          .select('id, nome, email, empresa, telefone')
          .ilike('nome', `%${clientName}%`)
          .single();

        if (!errorByName && clientByName) {
          console.log('✅ [DEBUG] Cliente encontrado por nome:', clientByName);
          client = clientByName;
        } else {
          console.log('❌ [DEBUG] Cliente não encontrado por nome:', errorByName);
        }
      }

      if (!client) {
        throw new Error('Cliente não encontrado');
      }

      return {
        client,
        clientName: client.nome
      };
    },
    enabled: !!slugOrId
  });
};
