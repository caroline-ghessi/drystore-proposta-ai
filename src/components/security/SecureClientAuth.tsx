
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Loader2, Shield, AlertTriangle } from 'lucide-react';
import { useInputValidation, commonValidationRules } from '@/hooks/useInputValidation';

interface SecureClientAuthProps {
  clientName: string;
  onEmailSubmit: (email: string) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
  error?: string | null;
}

const SecureClientAuth = ({ clientName, onEmailSubmit, loading, error }: SecureClientAuthProps) => {
  const [email, setEmail] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);

  const { errors, validateField, validateAll, clearFieldError } = useInputValidation({
    email: commonValidationRules.email
  });

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    if (attempts >= 5) {
      setBlocked(true);
      return;
    }

    // Validate input
    if (!validateAll({ email })) {
      return;
    }

    setAttempts(prev => prev + 1);
    
    const result = await onEmailSubmit(email);
    
    if (!result.success) {
      // Reset attempts on successful validation to prevent lockout on legitimate retries
      if (result.error?.includes('Cliente não encontrado')) {
        setAttempts(0);
      }
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    clearFieldError('email');
    
    // Real-time validation
    validateField('email', value);
    
    // Reset blocked state if user is typing
    if (blocked && value !== email) {
      setBlocked(false);
      setAttempts(0);
    }
  };

  if (blocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Acesso Temporariamente Bloqueado
              </h1>
              <p className="text-gray-600">
                Muitas tentativas de acesso foram detectadas. Tente novamente em alguns minutos.
              </p>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="w-full"
            >
              Recarregar Página
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-600 mr-2" />
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Portal Seguro do Cliente
            </h1>
            <p className="text-gray-600">
              Olá <strong>{clientName}</strong>, confirme seu email para acessar suas propostas com segurança
            </p>
          </div>

          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={handleEmailChange}
                required
                disabled={loading}
                className={errors.email ? 'border-red-300' : ''}
                autoComplete="email"
                maxLength={254}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading || !!errors.email}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Acessar Propostas
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center text-xs text-gray-500 space-x-2">
              <Shield className="w-3 h-3" />
              <span>Conexão segura e criptografada</span>
            </div>
            {attempts > 0 && (
              <p className="text-xs text-orange-600 mt-2">
                Tentativas restantes: {5 - attempts}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureClientAuth;
