
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClientEmailAuthProps {
  clientName: string;
  onEmailSubmit: (email: string) => Promise<void>;
  loading: boolean;
}

const ClientEmailAuth = ({ clientName, onEmailSubmit, loading }: ClientEmailAuthProps) => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, insira seu email para continuar.",
        variant: "destructive"
      });
      return;
    }
    await onEmailSubmit(email);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Portal do Cliente
            </h1>
            <p className="text-gray-600">
              Olá <strong>{clientName}</strong>, confirme seu email para acessar suas propostas
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Acessar Propostas'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientEmailAuth;
