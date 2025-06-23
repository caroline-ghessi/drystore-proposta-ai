
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type Solution = {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type SolutionImage = {
  id: string;
  solution_id: string;
  image_url: string;
  image_title: string;
  image_description: string;
  ordem: number;
  created_at: string;
};

export const useSolutions = () => {
  return useQuery({
    queryKey: ['solutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      return data as Solution[];
    },
  });
};

export const useSolutionImages = (solutionIds: string[]) => {
  return useQuery({
    queryKey: ['solution-images', solutionIds],
    queryFn: async () => {
      if (solutionIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('solution_images')
        .select('*')
        .in('solution_id', solutionIds)
        .order('ordem');

      if (error) throw error;
      return data as SolutionImage[];
    },
    enabled: solutionIds.length > 0,
  });
};

export const useCreateSolution = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (solutionData: {
      nome: string;
      descricao: string;
      categoria: string;
    }) => {
      const { data, error } = await supabase
        .from('solutions')
        .insert({
          ...solutionData,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions'] });
    },
  });
};

export const useUpdateSolution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Solution> }) => {
      const { data, error } = await supabase
        .from('solutions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions'] });
    },
  });
};
