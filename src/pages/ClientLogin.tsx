
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClientAuth } from '@/hooks/useClientAuth';
import { Mail, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ClientLogin = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithEmail } = useClientAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🎯 [DEBUG] === FORM SUBMETIDO ===');
    console.log('🎯 [DEBUG] Email digitado:', email);
    
    if (!email) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, insira seu email para continuar.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log('🎯 [DEBUG] Chamando loginWithEmail...');
      const result = await loginWithEmail(email);
      console.log('🎯 [DEBUG] Resultado do login:', result);
      
      if (result.success) {
        console.log('🎯 [DEBUG] === LOGIN SUCESSO - REDIRECIONANDO ===');
        console.log('🎯 [DEBUG] Cliente logado:', result.client);
        
        toast({
          title: "Acesso autorizado!",
          description: `Bem-vindo, ${result.client?.nome || 'Cliente'}!`,
        });
        
        console.log('🎯 [DEBUG] Navegando para /client-portal');
        navigate('/client-portal');
      } else {
        console.log('🎯 [DEBUG] === LOGIN FALHOU ===');
        toast({
          title: "Email não encontrado",
          description: "Este email não está cadastrado em nosso sistema. Verifique se digitou corretamente ou entre em contato com seu vendedor.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('🎯 [DEBUG] Erro durante login:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Portal do Cliente</CardTitle>
          <CardDescription>
            Acesse suas propostas inserindo seu email cadastrado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                "Verificando..."
              ) : (
                <>
                  Acessar Minhas Propostas
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Seguro e simples:</strong> Use o mesmo email que você forneceu 
              ao seu vendedor no momento da criação da proposta.
            </p>
          </div>
          
          {/* DEBUG INFO */}
          <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            <strong>🔍 Debug:</strong> Para testar, use: fabioghessi@gmail.com
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientLogin;
