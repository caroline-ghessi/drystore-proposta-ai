
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import { useToast } from '@/hooks/use-toast';
import { useResetPasswordVerification } from '@/hooks/useResetPasswordVerification';
import { ResetPasswordHeader } from '@/components/auth/ResetPasswordHeader';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { ResetPasswordLoadingState } from '@/components/auth/ResetPasswordLoadingState';

const ResetPassword = () => {
  const [error, setError] = useState('');
  
  const { updatePassword, loading } = useAuthFlow();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sessionVerified, verifying } = useResetPasswordVerification();

  const handleSubmit = async (password: string, confirmPassword: string) => {
    setError('');

    if (!sessionVerified) {
      setError('Sessão não verificada. Tente acessar o link novamente.');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    const calculatePasswordStrength = (password: string): number => {
      let strength = 0;
      if (password.length >= 8) strength += 25;
      if (/[a-z]/.test(password)) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/\d/.test(password)) strength += 25;
      return strength;
    };

    const passwordStrength = calculatePasswordStrength(password);
    if (passwordStrength < 100) {
      setError('A senha não atende a todos os critérios de segurança');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    console.log('🔄 Atualizando senha...');
    const result = await updatePassword(password);
    
    if (result.success) {
      console.log('✅ Senha atualizada com sucesso');
      toast({
        title: "Senha atualizada!",
        description: "Redirecionando para o dashboard...",
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  };

  if (verifying) {
    return <ResetPasswordLoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <ResetPasswordHeader 
          title="DryStore"
          subtitle="Redefinir senha"
        />

        <Card className="shadow-2xl border-0 animate-fade-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Nova Senha</CardTitle>
            <CardDescription className="text-center">
              Crie uma senha segura para sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResetPasswordForm
              onSubmit={handleSubmit}
              loading={loading}
              sessionVerified={sessionVerified}
              error={error}
            />

            <div className="mt-6 text-center">
              <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                Senha criptografada com segurança máxima
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
