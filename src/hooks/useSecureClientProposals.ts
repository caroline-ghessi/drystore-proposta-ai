
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TokenValidationResponse {
  valid: boolean;
  client?: {
    id: string;
    nome: string;
    email: string;
    empresa?: string;
    telefone?: string;
  };
  error?: string;
  token_expires_at?: string;
}

export const useSecureClientProposals = (token: string) => {
  return useQuery({
    queryKey: ['secure-client-proposals', token],
    queryFn: async () => {
      if (!token) throw new Error('Token is required');

      // First validate the token
      const { data: tokenValidation, error: tokenError } = await supabase.rpc('validate_client_access_token', {
        token: token
      });

      if (tokenError) {
        throw new Error('Failed to validate token');
      }

      const validationResponse = tokenValidation as TokenValidationResponse;

      if (!validationResponse.valid) {
        throw new Error('Invalid or expired token');
      }

      const client = validationResponse.client;

      // Fetch proposals for this client with enhanced security
      const { data: proposals, error: proposalsError } = await supabase
        .from('proposals')
        .select(`
          id,
          valor_total,
          desconto_percentual,
          validade,
          status,
          created_at,
          observacoes,
          link_acesso,
          proposal_items (
            id,
            produto_nome,
            quantidade,
            preco_unit,
            preco_total,
            descricao_item
          ),
          proposal_features (
            contract_generation,
            delivery_control
          )
        `)
        .eq('client_id', client!.id)
        .neq('status', 'draft')
        .order('created_at', { ascending: false });

      if (proposalsError) {
        console.error('Error fetching proposals:', proposalsError);
        throw new Error('Failed to fetch proposals');
      }

      return {
        client,
        proposals: proposals || []
      };
    },
    enabled: !!token,
    retry: false, // Don't retry on auth failures
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSecureClientProposal = (linkAccess: string) => {
  return useQuery({
    queryKey: ['secure-client-proposal', linkAccess],
    queryFn: async () => {
      if (!linkAccess) throw new Error('Link de acesso é obrigatório');

      // Enhanced security: validate link format
      if (typeof linkAccess !== 'string' || linkAccess.length < 10) {
        throw new Error('Link de acesso inválido');
      }

      const { data: proposal, error } = await supabase
        .from('proposals')
        .select(`
          id,
          valor_total,
          desconto_percentual,
          validade,
          status,
          created_at,
          observacoes,
          link_acesso,
          clients (
            id,
            nome,
            email,
            empresa,
            telefone
          ),
          proposal_items (
            id,
            produto_nome,
            quantidade,
            preco_unit,
            preco_total,
            descricao_item
          ),
          proposal_features (
            contract_generation,
            delivery_control
          )
        `)
        .eq('link_acesso', linkAccess)
        .neq('status', 'draft')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Proposta não encontrada');
        }
        throw new Error('Erro ao carregar proposta');
      }

      if (!proposal) {
        throw new Error('Proposta não encontrada');
      }

      return proposal;
    },
    enabled: !!linkAccess,
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
