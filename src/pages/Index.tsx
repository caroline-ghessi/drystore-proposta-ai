
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
import { Mail, Lock, ArrowRight, Shield, Loader2, User, Building2, Users, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { isAuthenticated, login } = useAuth();
  const { loginWithEmail } = useClientAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Client login state
  const [clientEmail, setClientEmail] = useState('');
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState('');

  // Vendor login state
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPassword, setVendorPassword] = useState('');
  const [vendorLoading, setVendorLoading] = useState(false);
  const [vendorError, setVendorError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientEmail) {
      setClientError('Por favor, insira seu email');
      return;
    }

    setClientLoading(true);
    setClientError('');

    try {
      const result = await loginWithEmail(clientEmail);
      
      if (result.success) {
        toast({
          title: "Acesso autorizado!",
          description: `Bem-vindo, ${result.client?.nome || 'Cliente'}!`,
        });
        navigate('/client-portal');
      } else {
        setClientError('Email não encontrado. Verifique se digitou corretamente ou entre em contato com seu vendedor.');
      }
    } catch (error) {
      setClientError('Erro inesperado. Tente novamente.');
    } finally {
      setClientLoading(false);
    }
  };

  const handleVendorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorEmail || !vendorPassword) {
      setVendorError('Por favor, preencha todos os campos');
      return;
    }

    if (vendorPassword.length < 6) {
      setVendorError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setVendorLoading(true);
    setVendorError('');

    try {
      const result = await login(vendorEmail, vendorPassword);
      
      if (result.success) {
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        setVendorError(result.error || 'Email ou senha inválidos');
      }
    } catch (error) {
      setVendorError('Erro inesperado. Tente novamente.');
    } finally {
      setVendorLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-20">
            <div className="flex items-center space-x-4">
              <DrystoreCube size="lg" />
              <div className="text-center">
                <span className="text-3xl font-bold text-drystore-gray-dark">
                  Drystore
                </span>
                <div className="text-base text-drystore-gray-medium">
                  Soluções Inteligentes
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-4">
        <div className="w-full max-w-6xl">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bem-vindo à Plataforma Drystore
            </h1>
            <p className="text-xl text-gray-600">
              Escolha como você deseja acessar nossa plataforma
            </p>
          </div>

          {/* Login Cards Container */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Client Portal Card */}
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-blue-600/10"></div>
              <CardHeader className="relative z-10 text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white/20 rounded-full">
                    <User className="w-12 h-12 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                  Portal do Cliente
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Acesse suas propostas e acompanhe seus pedidos
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <form onSubmit={handleClientLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-email" className="text-white">
                      Email fornecido pelo vendedor
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="client-email"
                        type="email"
                        placeholder="cliente@empresa.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="pl-10 bg-white/90 border-white/20 focus:bg-white"
                        required
                        disabled={clientLoading}
                      />
                    </div>
                  </div>

                  {clientError && (
                    <Alert variant="destructive" className="bg-red-500/20 border-red-300 text-white">
                      <Shield className="h-4 w-4" />
                      <AlertDescription className="text-white">
                        {clientError}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-white text-blue-600 hover:bg-gray-50 font-semibold py-3"
                    disabled={clientLoading}
                  >
                    {clientLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        Acessar Propostas
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-white/10 rounded-lg">
                  <p className="text-sm text-blue-100 mb-2">Como funciona:</p>
                  <p className="text-xs text-blue-200">
                    • Use o email fornecido pelo seu vendedor<br/>
                    • Acesse suas propostas instantaneamente<br/>
                    • Acompanhe o status dos seus pedidos
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sales Area Card */}
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-green-500 to-green-600 text-white transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-green-600/10"></div>
              <CardHeader className="relative z-10 text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white/20 rounded-full">
                    <Briefcase className="w-12 h-12 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                  Área de Vendas
                </CardTitle>
                <CardDescription className="text-green-100">
                  Para vendedores, representantes e administradores
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <form onSubmit={handleVendorLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendor-email" className="text-white">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="vendor-email"
                        type="email"
                        placeholder="vendedor@drystore.com"
                        value={vendorEmail}
                        onChange={(e) => setVendorEmail(e.target.value)}
                        className="pl-10 bg-white/90 border-white/20 focus:bg-white"
                        required
                        disabled={vendorLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vendor-password" className="text-white">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="vendor-password"
                        type="password"
                        placeholder="Sua senha"
                        value={vendorPassword}
                        onChange={(e) => setVendorPassword(e.target.value)}
                        className="pl-10 bg-white/90 border-white/20 focus:bg-white"
                        required
                        disabled={vendorLoading}
                      />
                    </div>
                  </div>

                  {vendorError && (
                    <Alert variant="destructive" className="bg-red-500/20 border-red-300 text-white">
                      <Shield className="h-4 w-4" />
                      <AlertDescription className="text-white">
                        {vendorError}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-white text-green-600 hover:bg-gray-50 font-semibold py-3"
                    disabled={vendorLoading}
                  >
                    {vendorLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar no Sistema'
                    )}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/forgot-password')}
                    disabled={vendorLoading}
                    className="text-white hover:text-green-100"
                  >
                    Esqueceu a senha?
                  </Button>
                </div>

                <div className="mt-4 p-4 bg-white/10 rounded-lg">
                  <p className="text-sm text-green-100 mb-2">Acesso completo:</p>
                  <p className="text-xs text-green-200">
                    • Gerencie propostas e clientes<br/>
                    • Acompanhe vendas e metas<br/>
                    • Ferramentas avançadas de CRM
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer Info */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-white/60 px-4 py-2 rounded-full">
              <Shield className="w-4 h-4" />
              Conexão segura e protegida
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
