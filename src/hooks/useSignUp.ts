
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
      
      console.log('🔧 Iniciando cadastro com dados sanitizados:', { 
        email: sanitizedEmail, 
        nome: sanitizedNome, 
        role 
      });

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
      
      console.log('🚀 Enviando dados para Supabase com nova função:', {
        email: sanitizedEmail,
        metadata: {
          nome: sanitizedNome,
          role: role
        },
        redirectUrl
      });

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

      console.log('📋 Resposta do Supabase:', { data, error });

      if (error) {
        console.error('❌ Erro no signup:', error);
        
        // Tratamento de erros mais específico
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
        } else if (error.message.includes('Database error') || error.message.includes('500')) {
          console.error('🔴 Erro de banco detectado - nova função pode ter falhado');
          toast({
            title: "Erro no servidor",
            description: "Problema na criação do perfil. A nova função de cadastro pode estar falhando. Verifique os logs do Supabase.",
            variant: "destructive"
          });
        } else if (error.message.includes('invalid input syntax')) {
          console.error('🔴 Erro de sintaxe - possível problema com enum');
          toast({
            title: "Erro de configuração",
            description: "Problema com o tipo de usuário. Entre em contato com o suporte.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro no cadastro",
            description: `Detalhes: ${error.message}`,
            variant: "destructive"
          });
        }
        return { success: false, error };
      }

      if (data.user && !data.session) {
        console.log('✅ Usuário criado, aguardando verificação de email');
        toast({
          title: "Verifique seu email",
          description: "Um link de confirmação foi enviado para seu email.",
        });
      } else if (data.session) {
        console.log('✅ Usuário criado e logado automaticamente');
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Bem-vindo ao DryStore.",
        });
      }

      // Verificação robusta do perfil criado
      if (data.user) {
        console.log('🔍 Verificando criação do perfil com nova função...');
        
        // Aguardar um pouco para dar tempo da função processar
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();
          
          if (profileError) {
            console.error('⚠️ Erro ao verificar perfil:', profileError);
            
            // Tentar criar perfil manualmente como fallback
            console.log('🔄 Tentando criar perfil manualmente...');
            const { error: manualCreateError } = await supabase
              .from('profiles')
              .insert({
                user_id: data.user.id,
                nome: sanitizedNome,
                role: role
              });
            
            if (manualCreateError) {
              console.error('❌ Falha no fallback manual:', manualCreateError);
            } else {
              console.log('✅ Perfil criado manualmente como fallback');
            }
          } else {
            console.log('✅ Perfil criado com sucesso pela nova função:', profile);
          }
        } catch (verifyError) {
          console.error('⚠️ Erro na verificação do perfil:', verifyError);
        }
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('💥 Erro inesperado no signup:', error);
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
