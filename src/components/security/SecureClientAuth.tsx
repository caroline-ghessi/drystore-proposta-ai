
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Loader2, Shield, AlertTriangle, Lock } from 'lucide-react';
import { useSecurityValidation } from '@/hooks/useSecurityValidation';

interface SecureClientAuthProps {
  clientName: string;
  onEmailSubmit: (email: string) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
  error?: string | null;
  attempts?: number;
  isBlocked?: boolean;
}

const SecureClientAuth = ({ 
  clientName, 
  onEmailSubmit, 
  loading, 
  error,
  attempts = 0,
  isBlocked = false
}: SecureClientAuthProps) => {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string>('');
  
  const { sanitizeInput, validateEmail } = useSecurityValidation();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous validation errors
    setValidationError('');
    
    // Enhanced client-side validation
    const sanitizedEmail = sanitizeInput(email.trim().toLowerCase(), { maxLength: 254 });
    const emailValidation = validateEmail(sanitizedEmail);
    
    if (!emailValidation.isValid) {
      setValidationError(emailValidation.error || 'Email inválido');
      return;
    }
    
    if (isBlocked) {
      setValidationError('Acesso temporariamente bloqueado. Tente novamente em alguns minutos.');
      return;
    }
    
    await onEmailSubmit(sanitizedEmail);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeInput(e.target.value, { maxLength: 254 });
    setEmail(value);
    setValidationError('');
  };

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200 bg-red-50">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-red-800 mb-2">
                Acesso Temporariamente Bloqueado
              </h1>
              <p className="text-red-600">
                Muitas tentativas de acesso foram detectadas. Por segurança, o acesso foi bloqueado por 15 minutos.
              </p>
            </div>
            <Alert className="mb-4 border-red-300 bg-red-100">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Se você é o proprietário legítimo desta conta, aguarde alguns minutos e tente novamente.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="w-full border-red-300 text-red-700 hover:bg-red-100"
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
      <Card className="w-full max-w-md shadow-lg">
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

          {(error || validationError) && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error || validationError}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={handleEmailChange}
                required
                disabled={loading || isBlocked}
                className={validationError ? 'border-red-300 focus:border-red-500' : ''}
                autoComplete="email"
                maxLength={254}
                spellCheck={false}
              />
              {validationError && (
                <p className="text-sm text-red-600 mt-1">{validationError}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || isBlocked || !email.trim()}
            >
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

          <div className="mt-6 text-center space-y-2">
            <div className="flex items-center justify-center text-xs text-gray-500 space-x-2">
              <Shield className="w-3 h-3" />
              <span>Conexão segura e criptografada</span>
            </div>
            
            {attempts > 0 && attempts < 5 && (
              <p className="text-xs text-orange-600">
                Tentativas restantes: {5 - attempts}
              </p>
            )}
            
            <p className="text-xs text-gray-400">
              Seus dados são protegidos com criptografia de ponta a ponta
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureClientAuth;
