
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProposalDetails = (id: string) => {
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

      // Buscar soluções associadas separadamente
      const { data: proposalSolutions } = await supabase
        .from('proposal_solutions')
        .select(`
          id,
          valor_solucao,
          observacoes,
          solutions (
            id,
            nome,
            descricao,
            categoria
          )
        `)
        .eq('proposal_id', id);

      // Buscar produtos recomendados associados separadamente
      const { data: proposalRecommendedProducts } = await supabase
        .from('proposal_recommended_products')
        .select(`
          id,
          recommended_products (
            id,
            nome,
            descricao,
            preco,
            categoria
          )
        `)
        .eq('proposal_id', id);

      // Adicionar os dados relacionados ao resultado principal
      return {
        ...data,
        proposal_solutions: proposalSolutions || [],
        proposal_recommended_products: proposalRecommendedProducts || []
      };
    },
    enabled: !!id,
  });
};
