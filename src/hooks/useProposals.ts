
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Proposal = Tables<'proposals'>;
type ProposalInsert = TablesInsert<'proposals'>;
type ProposalUpdate = TablesUpdate<'proposals'>;

interface CreateProposalData {
  clientData: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    address?: string;
  };
  items: Array<{
    category: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  observations?: string;
  validityDays: number;
  subtotal: number;
  discount?: number;
  selectedPaymentConditions?: string[];
}

export const useProposals = () => {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          clients:client_id (
            id,
            nome,
            email,
            empresa
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useProposal = (id: string) => {
  return useQuery({
    queryKey: ['proposals', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          clients:client_id (
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
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalData: CreateProposalData) => {
      const { 
        clientData, 
        items, 
        observations, 
        validityDays, 
        subtotal, 
        discount = 0,
        selectedPaymentConditions = []
      } = proposalData;

      // Validações obrigatórias
      if (!clientData.name || !clientData.email) {
        throw new Error('Nome e email do cliente são obrigatórios');
      }

      if (items.length === 0) {
        throw new Error('Pelo menos um item é obrigatório');
      }

      // 1. Buscar ou criar cliente
      let client;
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
        client = updatedClient;
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
        client = newClient;
      }

      // 2. Criar proposta
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + validityDays);

      // Gerar link de acesso único
      const linkAccess = `${client.id}-${Date.now()}`;

      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .insert({
          client_id: client.id,
          valor_total: subtotal,
          desconto_percentual: discount,
          validade: validUntil.toISOString(),
          status: 'draft',
          observacoes: observations,
          link_acesso: linkAccess,
        })
        .select()
        .single();

      if (proposalError) throw proposalError;

      // 3. Criar itens da proposta
      const proposalItems = items.map(item => ({
        proposal_id: proposal.id,
        produto_nome: item.description,
        quantidade: item.quantity,
        preco_unit: item.unitPrice,
        preco_total: item.total,
        descricao_item: `${item.category} - ${item.unit}`,
      }));

      const { error: itemsError } = await supabase
        .from('proposal_items')
        .insert(proposalItems);

      if (itemsError) throw itemsError;

      // 4. Associar condições de pagamento selecionadas
      if (selectedPaymentConditions.length > 0) {
        const paymentConditionsData = selectedPaymentConditions.map(conditionId => ({
          proposal_id: proposal.id,
          payment_condition_id: conditionId,
        }));

        const { error: paymentConditionsError } = await supabase
          .from('proposal_payment_conditions')
          .insert(paymentConditionsData);

        if (paymentConditionsError) throw paymentConditionsError;
      }

      return {
        proposal,
        client,
        items: proposalItems
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useUpdateProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ProposalUpdate }) => {
      const { data, error } = await supabase
        .from('proposals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposals', data.id] });
    },
  });
};
