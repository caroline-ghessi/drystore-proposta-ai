
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SalesTarget {
  id: string;
  user_id: string;
  month: number;
  year: number;
  target_amount: number;
  created_at: string;
  updated_at: string;
}

interface CreateSalesTargetData {
  user_id: string;
  month: number;
  year: number;
  target_amount: number;
}

export const useSalesTargets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar todas as metas (para admins) ou apenas as próprias (para vendedores)
  const { data: targets, isLoading } = useQuery({
    queryKey: ['sales-targets', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('sales_targets')
        .select(`
          *,
          profiles!sales_targets_user_id_fkey (
            nome,
            role
          )
        `)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Criar nova meta
  const createTarget = useMutation({
    mutationFn: async (data: CreateSalesTargetData) => {
      const { data: result, error } = await supabase
        .from('sales_targets')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-targets'] });
      queryClient.invalidateQueries({ queryKey: ['personal-sales-data'] });
      toast({
        title: "Meta criada!",
        description: "A meta foi definida com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar meta",
        description: error.message || "Ocorreu um erro ao criar a meta.",
        variant: "destructive",
      });
    }
  });

  // Atualizar meta
  const updateTarget = useMutation({
    mutationFn: async ({ id, ...data }: Partial<SalesTarget> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('sales_targets')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-targets'] });
      queryClient.invalidateQueries({ queryKey: ['personal-sales-data'] });
      toast({
        title: "Meta atualizada!",
        description: "A meta foi atualizada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar meta",
        description: error.message || "Ocorreu um erro ao atualizar a meta.",
        variant: "destructive",
      });
    }
  });

  // Deletar meta
  const deleteTarget = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sales_targets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-targets'] });
      queryClient.invalidateQueries({ queryKey: ['personal-sales-data'] });
      toast({
        title: "Meta excluída!",
        description: "A meta foi excluída com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir meta",
        description: error.message || "Ocorreu um erro ao excluir a meta.",
        variant: "destructive",
      });
    }
  });

  return {
    targets,
    isLoading,
    createTarget: createTarget.mutate,
    updateTarget: updateTarget.mutate,
    deleteTarget: deleteTarget.mutate,
    isCreating: createTarget.isPending,
    isUpdating: updateTarget.isPending,
    isDeleting: deleteTarget.isPending
  };
};

// Hook específico para buscar vendedores (para admins)
export const useSalesUsers = () => {
  return useQuery({
    queryKey: ['sales-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, nome, role')
        .in('role', ['vendedor_interno', 'representante', 'admin'])
        .order('nome');

      if (error) throw error;
      return data;
    }
  });
};
