
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sanitizeInput, validatePassword } from '@/utils/authValidation';

export const useSignUp = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const signUp = async (email: string, password: string, nome: string, role: 'vendedor_interno' | 'representante' = 'vendedor_interno') => {
    setLoading(true);
    
    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedNome = sanitizeInput(nome);
      
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

      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        toast({
          title: "Senha fraca",
          description: passwordValidation.message,
          variant: "destructive"
        });
        return { success: false, error: passwordValidation.message };
      }

      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome: sanitizedNome,
            role: role
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: "Usuário já cadastrado",
            description: "Este email já está registrado. Tente fazer login ou recuperar a senha.",
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
            title: "Erro no cadastro",
            description: "Tente novamente mais tarde.",
            variant: "destructive"
          });
        }
        return { success: false, error };
      }

      if (data.user && !data.session) {
        toast({
          title: "Verifique seu email",
          description: "Um link de confirmação foi enviado para seu email.",
        });
      } else if (data.session) {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Bem-vindo ao DryStore.",
        });
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Signup error:', error);
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

  return { signUp, loading };
};
