
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClientAuth } from '@/hooks/useClientAuth';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ClientLogin = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const { generateMagicLink } = useClientAuth();
  const { toast } = useToast();

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const success = await generateMagicLink(email);
      
      if (success) {
        setLinkSent(true);
        toast({
          title: "Link enviado!",
          description: "Verifique seu email para acessar suas propostas.",
        });
      } else {
        toast({
          title: "Erro ao enviar link",
          description: "Tente novamente em alguns instantes.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (linkSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Link Enviado!</CardTitle>
            <CardDescription>
              Enviamos um link de acesso seguro para <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Próximos passos:</strong>
              </p>
              <ol className="text-sm text-blue-600 mt-2 space-y-1">
                <li>1. Verifique sua caixa de entrada</li>
                <li>2. Clique no link de acesso</li>
                <li>3. Visualize todas suas propostas</li>
              </ol>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setLinkSent(false);
                setEmail('');
              }}
            >
              Enviar para outro email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Minhas Propostas</CardTitle>
          <CardDescription>
            Acesse seu histórico de propostas com segurança
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendMagicLink} className="space-y-4">
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
                "Enviando..."
              ) : (
                <>
                  Enviar Link de Acesso
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Seguro e privado:</strong> Enviaremos um link único e temporário 
              para seu email. O link expira em 24 horas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientLogin;
