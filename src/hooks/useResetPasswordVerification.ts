
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useResetPasswordVerification = () => {
  const [sessionVerified, setSessionVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const verifyResetToken = async () => {
      console.log('🔍 Verificando parâmetros da URL para reset de senha...');
      
      // Verificar parâmetros específicos do Custom SMTP
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      
      console.log('📋 Parâmetros encontrados:', {
        token_hash: tokenHash ? tokenHash.substring(0, 10) + '...' : 'null',
        type,
        allParams: Object.fromEntries(searchParams.entries())
      });

      if (!tokenHash || type !== 'recovery') {
        console.log('❌ Parâmetros de reset inválidos');
        toast({
          title: "Link inválido",
          description: "Este link de recuperação é inválido ou expirou.",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      try {
        console.log('🔐 Verificando token de recuperação via OTP...');
        
        // Usar verifyOtp para estabelecer a sessão
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery'
        });

        console.log('📥 Resposta da verificação OTP:', { data: !!data, error });

        if (error) {
          console.error('❌ Erro na verificação do token:', error);
          toast({
            title: "Token inválido",
            description: "Este link de recuperação é inválido ou expirou.",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }

        if (data.session) {
          console.log('✅ Sessão estabelecida com sucesso');
          setSessionVerified(true);
          toast({
            title: "Link verificado!",
            description: "Agora você pode definir sua nova senha.",
          });
        } else {
          console.log('❌ Sessão não estabelecida');
          toast({
            title: "Erro na verificação",
            description: "Não foi possível verificar o link. Tente novamente.",
            variant: "destructive"
          });
          navigate('/login');
        }
      } catch (err: any) {
        console.error('💥 Erro inesperado na verificação:', err);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro ao verificar o link. Tente novamente.",
          variant: "destructive"
        });
        navigate('/login');
      } finally {
        setVerifying(false);
      }
    };

    verifyResetToken();
  }, [searchParams, navigate, toast]);

  return {
    sessionVerified,
    verifying
  };
};
