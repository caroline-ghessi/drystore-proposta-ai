
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type PaymentCondition = Tables<'payment_conditions'>;
type PaymentConditionInsert = TablesInsert<'payment_conditions'>;
type PaymentConditionUpdate = TablesUpdate<'payment_conditions'>;

export const usePaymentConditions = () => {
  return useQuery({
    queryKey: ['payment_conditions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_conditions')
        .select('*')
        .eq('active', true)
        .order('installments', { ascending: true });

      if (error) throw error;
      return data as PaymentCondition[];
    },
  });
};

export const useCreatePaymentCondition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (condition: PaymentConditionInsert) => {
      const { data, error } = await supabase
        .from('payment_conditions')
        .insert(condition)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment_conditions'] });
    },
  });
};

export const useUpdatePaymentCondition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PaymentConditionUpdate }) => {
      const { data, error } = await supabase
        .from('payment_conditions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment_conditions'] });
    },
  });
};
