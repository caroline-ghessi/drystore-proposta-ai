
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Lock, Shield, Check, X } from 'lucide-react';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sessionVerified, setSessionVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);
  
  const { updatePassword, loading } = useAuthFlow();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 50) return 'bg-red-500';
    if (strength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordCriteria = (password: string) => {
    return [
      { text: 'Pelo menos 8 caracteres', met: password.length >= 8 },
      { text: 'Uma letra minúscula', met: /[a-z]/.test(password) },
      { text: 'Uma letra maiúscula', met: /[A-Z]/.test(password) },
      { text: 'Um número', met: /\d/.test(password) }
    ];
  };

  const passwordStrength = calculatePasswordStrength(password);
  const passwordCriteria = getPasswordCriteria(password);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!sessionVerified) {
      setError('Sessão não verificada. Tente acessar o link novamente.');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">Verificando link de recuperação...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              className="h-16 w-auto" 
              src="/lovable-uploads/54b2f5dc-8781-4f2f-9f68-d966142e985d.png" 
              alt="DryStore" 
            />
          </div>
          <p className="text-gray-600">Redefinir senha</p>
        </div>

        <Card className="shadow-2xl border-0 animate-fade-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Nova Senha</CardTitle>
            <CardDescription className="text-center">
              Crie uma senha segura para sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Crie uma senha segura"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    maxLength={128}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Força da senha:</span>
                      <span className={passwordStrength >= 75 ? 'text-green-600' : passwordStrength >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                        {passwordStrength >= 75 ? 'Forte' : passwordStrength >= 50 ? 'Média' : 'Fraca'}
                      </span>
                    </div>
                    <Progress value={passwordStrength} className="h-2">
                      <div className={`h-full transition-all ${getPasswordStrengthColor(passwordStrength)}`} style={{ width: `${passwordStrength}%` }} />
                    </Progress>
                    <div className="space-y-1">
                      {passwordCriteria.map((criterion, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          {criterion.met ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <X className="w-3 h-3 text-gray-400" />
                          )}
                          <span className={criterion.met ? 'text-green-600' : 'text-gray-500'}>
                            {criterion.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirme sua nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                    maxLength={128}
                    autoComplete="new-password"
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500">As senhas não coincidem</p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full gradient-bg hover:opacity-90"
                disabled={loading || passwordStrength < 100 || password !== confirmPassword || !sessionVerified}
              >
                {loading ? 'Atualizando...' : 'Atualizar Senha'}
              </Button>
            </form>

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
