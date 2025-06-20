
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validatePassword } from '@/utils/authValidation';

export const useUpdatePassword = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updatePassword = async (newPassword: string) => {
    setLoading(true);
    
    try {
      console.log('🔐 Iniciando atualização de senha...');
      
      // Validate password strength
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        toast({
          title: "Senha fraca",
          description: passwordValidation.message,
          variant: "destructive"
        });
        return { success: false, error: passwordValidation.message };
      }

      // Verificar se há uma sessão ativa
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ Nenhuma sessão ativa encontrada');
        toast({
          title: "Sessão expirada",
          description: "Por favor, solicite um novo link de recuperação.",
          variant: "destructive"
        });
        return { success: false, error: 'Sessão não encontrada' };
      }

      console.log('✅ Sessão ativa encontrada, atualizando senha...');

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('❌ Erro ao atualizar senha:', error);
        
        // Tratar erros específicos
        if (error.message.includes('New password should be different')) {
          toast({
            title: "Senha muito similar",
            description: "A nova senha deve ser diferente da atual.",
            variant: "destructive"
          });
        } else if (error.message.includes('Password should be at least')) {
          toast({
            title: "Senha muito simples",
            description: "Use uma senha mais forte com pelo menos 8 caracteres.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro ao atualizar senha",
            description: "Tente novamente mais tarde.",
            variant: "destructive"
          });
        }
        return { success: false, error };
      }

      console.log('✅ Senha atualizada com sucesso');
      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi alterada com sucesso.",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Update password error:', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { updatePassword, loading };
};
