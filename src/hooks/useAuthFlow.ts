
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'A senha deve ter pelo menos 8 caracteres' };
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { 
      isValid: false, 
      message: 'A senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número' 
    };
  }
  
  return { isValid: true };
};

export const useAuthFlow = () => {
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
      
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: redirectUrl
      });

      if (error) {
        toast({
          title: "Erro ao enviar email",
          description: "Verifique o email e tente novamente.",
          variant: "destructive"
        });
        return { success: false, error };
      }

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

  const updatePassword = async (newPassword: string) => {
    setLoading(true);
    
    try {
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

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast({
          title: "Erro ao atualizar senha",
          description: "Tente novamente mais tarde.",
          variant: "destructive"
        });
        return { success: false, error };
      }

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

  return {
    signUp,
    resetPassword,
    updatePassword,
    loading
  };
};
