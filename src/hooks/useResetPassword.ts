
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sanitizeInput } from '@/utils/authValidation';

export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const resetPassword = async (email: string) => {
    setLoading(true);
    
    try {
      const sanitizedEmail = sanitizeInput(email);
      
      // Validate email format
      const { data: isValidEmail } = await supabase
        .rpc('validate_email_format', { email_input: sanitizedEmail });

      if (!isValidEmail) {
        toast({
          title: "Email inválido",
          description: "Por favor, insira um email válido.",
          variant: "destructive"
        });
        return { success: false, error: 'Email inválido' };
      }

      const redirectUrl = `${window.location.origin}/reset-password`;
      
      console.log('🔄 Solicitando reset de senha via Custom SMTP...');
      console.log('📧 Email:', sanitizedEmail);
      console.log('🔗 Redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: redirectUrl
      });

      if (error) {
        console.error('❌ Erro no reset de senha:', error);
        toast({
          title: "Erro ao enviar email",
          description: "Verifique o email e tente novamente.",
          variant: "destructive"
        });
        return { success: false, error };
      }

      console.log('✅ Solicitação de reset enviada com sucesso');
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Reset password error:', error);
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

  return { resetPassword, loading };
};
