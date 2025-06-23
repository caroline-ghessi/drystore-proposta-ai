import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientAuth } from '@/hooks/useClientAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowRight, Shield, Loader2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
const ClientLoginCard = () => {
  const {
    loginWithEmail
  } = useClientAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [clientEmail, setClientEmail] = useState('');
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState('');
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
          description: `Bem-vindo, ${result.client?.nome || 'Cliente'}!`
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
  return <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-drystore-orange to-drystore-orange-light text-white transform hover:scale-105 transition-all duration-300">
      <div className="absolute inset-0 bg-drystore-orange/10"></div>
      <CardHeader className="relative z-10 text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-white/20 rounded-full">
            <User className="w-12 h-12 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-white">
          Portal do Cliente
        </CardTitle>
        <CardDescription className="text-orange-100">
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
              <Mail className="absolute left-3 top-3 h-4 w-4 text-drystore-gray-medium" />
              <Input id="client-email" type="email" placeholder="cliente@empresa.com" value={clientEmail} onChange={e => setClientEmail(e.target.value)} className="pl-10 bg-white/90 border-white/20 focus:bg-white text-drystore-gray-dark" required disabled={clientLoading} />
            </div>
          </div>

          {clientError && <Alert variant="destructive" className="bg-red-500/20 border-red-300 text-white">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-white">
                {clientError}
              </AlertDescription>
            </Alert>}

          <Button type="submit" className="w-full bg-white text-drystore-orange hover:bg-drystore-gray-light hover:text-drystore-orange font-semibold py-3" disabled={clientLoading}>
            {clientLoading ? <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verificando...
              </> : <>
                Acessar Propostas
                <ArrowRight className="w-4 h-4 ml-2" />
              </>}
          </Button>
        </form>

        <div className="mt-6 p-4 rounded-lg bg-amber-600">
          <p className="text-sm text-orange-100 mb-2">Como funciona:</p>
          <p className="text-xs text-orange-200">
            • Use o email fornecido pelo seu vendedor<br />
            • Acesse suas propostas instantaneamente<br />
            • Acompanhe o status dos seus pedidos
          </p>
        </div>
      </CardContent>
    </Card>;
};
export default ClientLoginCard;