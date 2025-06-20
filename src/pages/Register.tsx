
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Mail, Lock, User, ArrowLeft, Shield, Check, X } from 'lucide-react';
import { useAuthFlow } from '@/hooks/useAuthFlow';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nome, setNome] = useState('');
  const [role, setRole] = useState<'vendedor_interno' | 'representante'>('vendedor_interno');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { signUp, loading } = useAuthFlow();
  const navigate = useNavigate();

  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 50) return 'bg-red-500';
    if (strength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordCriteria = (password: string) => {
    return [
      { text: 'Pelo menos 8 caracteres', met: password.length >= 8 },
      { text: 'Uma letra minúscula', met: /[a-z]/.test(password) },
      { text: 'Uma letra maiúscula', met: /[A-Z]/.test(password) },
      { text: 'Um número', met: /\d/.test(password) }
    ];
  };

  const passwordStrength = calculatePasswordStrength(password);
  const passwordCriteria = getPasswordCriteria(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Sanitize inputs
    const sanitizedNome = sanitizeInput(nome);
    const sanitizedEmail = sanitizeInput(email);

    // Validações básicas
    if (!sanitizedNome.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    if (sanitizedNome.length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres');
      return;
    }

    if (!sanitizedEmail) {
      setError('Email é obrigatório');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    if (passwordStrength < 100) {
      setError('A senha não atende a todos os critérios de segurança');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    const result = await signUp(sanitizedEmail, password, sanitizedNome, role);
    
    if (result.success) {
      // Redirecionar para dashboard após registro bem-sucedido
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  };

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
          <p className="text-gray-600">Crie sua conta</p>
        </div>

        <Card className="shadow-2xl border-0 animate-fade-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Cadastro</CardTitle>
            <CardDescription className="text-center">
              Preencha os dados para criar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Seu nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="pl-10"
                    required
                    maxLength={100}
                    autoComplete="name"
                  />
                </div>
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="role">Tipo de Usuário</Label>
                <Select value={role} onValueChange={(value: 'vendedor_interno' | 'representante') => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendedor_interno">Vendedor Interno</SelectItem>
                    <SelectItem value="representante">Representante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Crie uma senha segura"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    maxLength={128}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Força da senha:</span>
                      <span className={passwordStrength >= 75 ? 'text-green-600' : passwordStrength >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                        {passwordStrength >= 75 ? 'Forte' : passwordStrength >= 50 ? 'Média' : 'Fraca'}
                      </span>
                    </div>
                    <Progress value={passwordStrength} className="h-2">
                      <div className={`h-full transition-all ${getPasswordStrengthColor(passwordStrength)}`} style={{ width: `${passwordStrength}%` }} />
                    </Progress>
                    <div className="space-y-1">
                      {passwordCriteria.map((criterion, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          {criterion.met ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <X className="w-3 h-3 text-gray-400" />
                          )}
                          <span className={criterion.met ? 'text-green-600' : 'text-gray-500'}>
                            {criterion.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirme sua senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                    maxLength={128}
                    autoComplete="new-password"
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500">As senhas não coincidem</p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full gradient-bg hover:opacity-90"
                disabled={loading || passwordStrength < 100 || password !== confirmPassword}
              >
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Faça login
                </Link>
              </p>

              <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                Seus dados estão protegidos e criptografados
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
