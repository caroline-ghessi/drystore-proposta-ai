
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft, Shield } from 'lucide-react';
import { useAuthFlow } from '@/hooks/useAuthFlow';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  
  const { resetPassword, loading } = useAuthFlow();

  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sanitizedEmail = sanitizeInput(email);
    
    if (!sanitizedEmail) {
      return;
    }

    const result = await resetPassword(sanitizedEmail);
    
    if (result.success) {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-green-600">Email Enviado!</CardTitle>
              <CardDescription>
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700 mb-2">
                    📧 Email enviado para: <strong>{email}</strong>
                  </p>
                  <p className="text-xs text-green-600">
                    O link expira em 1 hora por segurança
                  </p>
                </div>
                
                <p className="text-sm text-gray-600">
                  Não recebeu o email? Verifique sua pasta de spam ou tente novamente.
                </p>
                
                <div className="space-y-2">
                  <Link to="/login">
                    <Button className="w-full">
                      Voltar ao Login
                    </Button>
                  </Link>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSent(false)}
                  >
                    Tentar outro email
                  </Button>
                </div>

                <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" />
                  Link seguro e temporário
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao login
          </Link>
          <div className="flex items-center justify-center mb-4">
            <img 
              className="h-16 w-auto" 
              src="/lovable-uploads/54b2f5dc-8781-4f2f-9f68-d966142e985d.png" 
              alt="DryStore" 
            />
          </div>
          <p className="text-gray-600">Recuperar senha</p>
        </div>

        <Card className="shadow-2xl border-0 animate-fade-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Esqueceu a senha?</CardTitle>
            <CardDescription className="text-center">
              Digite seu email para receber instruções de recuperação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    maxLength={254}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  🛡️ Por segurança, um email será enviado apenas se a conta existir
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full gradient-bg hover:opacity-90"
                disabled={loading || !email.trim()}
              >
                {loading ? 'Enviando...' : 'Enviar Instruções'}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <p className="text-sm text-gray-600">
                Lembrou da senha?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Faça login
                </Link>
              </p>

              <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                Processo seguro e verificado
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
