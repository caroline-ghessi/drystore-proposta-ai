
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';

type DiscountRule = Tables<'discount_rules'>;
type DiscountRuleUpdate = TablesUpdate<'discount_rules'>;

export const useDiscountRules = () => {
  return useQuery({
    queryKey: ['discount_rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discount_rules')
        .select('*')
        .order('user_role', { ascending: true });

      if (error) throw error;
      return data as DiscountRule[];
    },
  });
};

export const useUserDiscountRule = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['discount_rules', user?.role],
    queryFn: async () => {
      if (!user?.role) return null;
      
      const { data, error } = await supabase
        .from('discount_rules')
        .select('*')
        .eq('user_role', user.role)
        .single();

      if (error) throw error;
      return data as DiscountRule;
    },
    enabled: !!user?.role,
  });
};

export const useUpdateDiscountRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: DiscountRuleUpdate }) => {
      const { data, error } = await supabase
        .from('discount_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount_rules'] });
    },
  });
};
