
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, Shield, Loader2, Briefcase } from 'lucide-react';

const VendorLoginCard = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPassword, setVendorPassword] = useState('');
  const [vendorLoading, setVendorLoading] = useState(false);
  const [vendorError, setVendorError] = useState('');

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
  );
};

export default VendorLoginCard;
