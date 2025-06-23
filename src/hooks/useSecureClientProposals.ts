
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSecurityValidation } from './useSecurityValidation';

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
  const { validateToken } = useSecurityValidation();
  
  return useQuery({
    queryKey: ['secure-client-proposals', token],
    queryFn: async () => {
      if (!token) throw new Error('Token is required');

      // Enhanced token validation
      const tokenValidation = validateToken(token);
      if (!tokenValidation.isValid) {
        throw new Error(tokenValidation.error || 'Invalid token format');
      }

      // First validate the token
      const { data: tokenValidation, error: tokenError } = await supabase.rpc('validate_client_access_token', {
        token: token
      });

      if (tokenError) {
        console.error('Token validation error:', tokenError);
        throw new Error('Failed to validate token');
      }

      const validationResponse = tokenValidation as unknown as TokenValidationResponse;

      if (!validationResponse.valid) {
        throw new Error('Invalid or expired token');
      }

      const client = validationResponse.client;

      // Use the new secure function to get proposals
      const { data: proposals, error: proposalsError } = await supabase.rpc('get_client_proposals_by_token', {
        access_token: token
      });

      if (proposalsError) {
        console.error('Error fetching proposals:', proposalsError);
        throw new Error('Failed to fetch proposals');
      }

      // Get detailed proposal information for each proposal
      const detailedProposals = await Promise.all(
        (proposals as any[]).map(async (proposal) => {
          const { data: items, error: itemsError } = await supabase
            .from('proposal_items')
            .select('*')
            .eq('proposal_id', proposal.proposal_id);

          const { data: features, error: featuresError } = await supabase
            .from('proposal_features')
            .select('*')
            .eq('proposal_id', proposal.proposal_id);

          if (itemsError) {
            console.error('Error fetching proposal items:', itemsError);
          }

          if (featuresError) {
            console.error('Error fetching proposal features:', featuresError);
          }

          return {
            id: proposal.proposal_id,
            valor_total: proposal.valor_total,
            status: proposal.status,
            validade: proposal.validade,
            created_at: proposal.created_at,
            proposal_items: items || [],
            proposal_features: features || []
          };
        })
      );

      // Log successful access
      await supabase.rpc('log_security_event', {
        event_type: 'client_proposals_accessed',
        client_id: client!.id,
        severity: 'low'
      });

      return {
        client,
        proposals: detailedProposals
      };
    },
    enabled: !!token,
    retry: false, // Don't retry on auth failures
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSecureClientProposal = (linkAccess: string) => {
  const { sanitizeInput } = useSecurityValidation();
  
  return useQuery({
    queryKey: ['secure-client-proposal', linkAccess],
    queryFn: async () => {
      if (!linkAccess) throw new Error('Link de acesso é obrigatório');

      // Enhanced security: sanitize and validate link format
      const sanitizedLink = sanitizeInput(linkAccess, { maxLength: 100, allowSpecialChars: false });
      
      if (!sanitizedLink || sanitizedLink.length < 10) {
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
        .eq('link_acesso', sanitizedLink)
        .neq('status', 'draft')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Log security event for invalid proposal access attempt
          await supabase.rpc('log_security_event', {
            event_type: 'invalid_proposal_access_attempt',
            details: { link_access: sanitizedLink },
            severity: 'medium'
          });
          throw new Error('Proposta não encontrada');
        }
        throw new Error('Erro ao carregar proposta');
      }

      if (!proposal) {
        throw new Error('Proposta não encontrada');
      }

      // Log successful proposal access
      await supabase.rpc('log_security_event', {
        event_type: 'proposal_accessed_via_link',
        client_id: proposal.clients?.id,
        details: { proposal_id: proposal.id },
        severity: 'low'
      });

      return proposal;
    },
    enabled: !!linkAccess,
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
