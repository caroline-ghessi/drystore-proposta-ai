
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useClientAuth } from '@/hooks/useClientAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DrystoreCube from '@/components/DrystoreCube';
import { Mail, Lock, ArrowRight, Shield, Loader2, User, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { isAuthenticated, login } = useAuth();
  const { loginWithEmail } = useClientAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'auto' | 'client' | 'vendor'>('auto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginStep, setLoginStep] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const detectUserType = async (emailValue: string) => {
    if (!emailValue || userType !== 'auto') return;

    try {
      // Verificar se é cliente primeiro
      const { loginWithEmail: checkClient } = useClientAuth();
      const clientResult = await checkClient(emailValue);
      
      if (clientResult.success) {
        setUserType('client');
        return 'client';
      } else {
        setUserType('vendor');
        return 'vendor';
      }
    } catch (error) {
      // Se der erro, assumir que é vendedor
      setUserType('vendor');
      return 'vendor';
    }
  };

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    setError('');

    // Auto-detectar tipo de usuário quando email estiver completo
    if (emailValue.includes('@') && emailValue.includes('.')) {
      await detectUserType(emailValue);
    }
  };

  const handleClientLogin = async () => {
    if (!email) {
      setError('Por favor, insira seu email');
      return;
    }

    setLoading(true);
    setLoginStep('Verificando acesso...');

    try {
      const result = await loginWithEmail(email);
      
      if (result.success) {
        toast({
          title: "Acesso autorizado!",
          description: `Bem-vindo, ${result.client?.nome || 'Cliente'}!`,
        });
        navigate('/client-portal');
      } else {
        setError('Email não encontrado. Verifique se digitou corretamente ou entre em contato com seu vendedor.');
      }
    } catch (error) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
      setLoginStep('');
    }
  };

  const handleVendorLogin = async () => {
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    setLoginStep('Conectando...');

    try {
      const result = await login(email, password);
      
      if (result.success) {
        setLoginStep('Carregando perfil...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        setError(result.error || 'Email ou senha inválidos');
      }
    } catch (error) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
      setLoginStep('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (userType === 'client') {
      await handleClientLogin();
    } else {
      await handleVendorLogin();
    }
  };

  const resetForm = () => {
    setUserType('auto');
    setEmail('');
    setPassword('');
    setError('');
    setLoginStep('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-drystore-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <DrystoreCube size="md" />
              <div>
                <span className="text-2xl font-bold text-drystore-gray-dark">
                  Drystore
                </span>
                <div className="text-sm text-drystore-gray-medium">
                  Soluções Inteligentes
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 animate-fade-in">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">
                {userType === 'auto' ? 'Acesse sua conta' : 
                 userType === 'client' ? 'Portal do Cliente' : 'Área do Vendedor'}
              </CardTitle>
              <CardDescription>
                {userType === 'auto' ? 'Digite seu email para começar' :
                 userType === 'client' ? 'Acesse suas propostas' : 'Digite suas credenciais para continuar'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={handleEmailChange}
                      className="pl-10"
                      required
                      disabled={loading}
                    />
                    {userType !== 'auto' && (
                      <div className="absolute right-3 top-3">
                        {userType === 'client' ? (
                          <User className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Building2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Password Field (apenas para vendedores) */}
                {userType === 'vendor' && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}

                {/* User Type Indicator */}
                {userType !== 'auto' && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      {userType === 'client' ? (
                        <>
                          <User className="h-4 w-4 text-blue-500" />
                          <span className="text-blue-600">Acesso como Cliente</span>
                        </>
                      ) : (
                        <>
                          <Building2 className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">Acesso como Vendedor</span>
                        </>
                      )}
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={resetForm}
                      disabled={loading}
                    >
                      Alterar
                    </Button>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <Alert variant="destructive">
                    <Shield className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Loading State */}
                {loading && loginStep && (
                  <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertDescription>{loginStep}</AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full gradient-bg hover:opacity-90"
                  disabled={loading || userType === 'auto'}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : userType === 'client' ? (
                    <>
                      Acessar Propostas
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : userType === 'vendor' ? (
                    'Entrar no Sistema'
                  ) : (
                    'Digite seu email para continuar'
                  )}
                </Button>
              </form>

              {/* Additional Options */}
              <div className="mt-6 space-y-4">
                {userType === 'vendor' && (
                  <div className="text-center">
                    <Button 
                      variant="link" 
                      onClick={() => navigate('/forgot-password')}
                      disabled={loading}
                    >
                      Esqueceu a senha?
                    </Button>
                  </div>
                )}

                {/* Info Cards */}
                <div className="space-y-2">
                  {userType === 'auto' && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Como funciona:</p>
                      <p className="text-xs text-gray-500">
                        • <strong>Clientes:</strong> Use o email fornecido pelo vendedor<br/>
                        • <strong>Vendedores:</strong> Faça login com email e senha<br/>
                        • Sistema detecta automaticamente seu tipo de acesso
                      </p>
                    </div>
                  )}

                  {userType === 'client' && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Portal do Cliente:</p>
                      <p className="text-xs text-gray-500">
                        Use o mesmo email fornecido pelo seu vendedor para acessar suas propostas e acompanhar o status dos pedidos.
                      </p>
                    </div>
                  )}

                  {userType === 'vendor' && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Área do Vendedor:</p>
                      <p className="text-xs text-gray-500">
                        Acesse o sistema completo para gerenciar propostas, clientes e acompanhar suas vendas.
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" />
                  Conexão segura e protegida
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
