
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type ApprovalRequest = Tables<'approval_requests'>;
type ApprovalRequestInsert = TablesInsert<'approval_requests'>;
type ApprovalRequestUpdate = TablesUpdate<'approval_requests'>;

export const useApprovalRequests = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['approval_requests'],
    queryFn: async () => {
      let query = supabase
        .from('approval_requests')
        .select(`
          *,
          proposals!inner(
            id,
            valor_total,
            clients!inner(nome)
          ),
          requested_by_profile:profiles!approval_requests_requested_by_fkey(nome),
          approved_by_profile:profiles!approval_requests_approved_by_fkey(nome)
        `)
        .order('created_at', { ascending: false });

      // Se não for admin, mostrar apenas as próprias solicitações
      if (user?.role !== 'admin') {
        query = query.eq('requested_by', user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateApprovalRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ApprovalRequestInsert) => {
      const { data, error } = await supabase
        .from('approval_requests')
        .insert(request)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval_requests'] });
    },
  });
};

export const useUpdateApprovalRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ApprovalRequestUpdate }) => {
      const { data, error } = await supabase
        .from('approval_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval_requests'] });
    },
  });
};
