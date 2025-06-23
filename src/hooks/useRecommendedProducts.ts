
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type RecommendedProduct = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export const useRecommendedProducts = () => {
  return useQuery({
    queryKey: ['recommended-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recommended_products')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      return data as RecommendedProduct[];
    },
  });
};

export const useCreateRecommendedProduct = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (productData: {
      nome: string;
      descricao: string;
      preco: number;
      categoria: string;
    }) => {
      const { data, error } = await supabase
        .from('recommended_products')
        .insert({
          ...productData,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommended-products'] });
    },
  });
};

export const useUpdateRecommendedProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<RecommendedProduct> }) => {
      const { data, error } = await supabase
        .from('recommended_products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommended-products'] });
    },
  });
};
