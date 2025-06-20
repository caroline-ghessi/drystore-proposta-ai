
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSignUp } from '@/hooks/useSignUp';
import { SignUpDiagnostic } from '@/components/auth/SignUpDiagnostic';

const SignUpTest = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [role, setRole] = useState<'vendedor_interno' | 'representante'>('vendedor_interno');
  
  const { signUp, loading } = useSignUp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🧪 Teste de cadastro iniciado:', { email, nome, role });
    
    const result = await signUp(email, password, nome, role);
    console.log('🧪 Resultado do teste:', result);
  };

  const generateTestData = () => {
    const timestamp = Date.now();
    setEmail(`teste${timestamp}@exemplo.com`);
    setPassword('TesteSenha123!');
    setNome(`Usuário Teste ${timestamp}`);
    setRole('vendedor_interno');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">🧪 Teste de Cadastro</h1>
          <p className="text-gray-600 mt-2">
            Página para testar e debugar o sistema de cadastro
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário de Teste */}
          <Card>
            <CardHeader>
              <CardTitle>📝 Formulário de Teste</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teste@exemplo.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome do usuário"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="role">Tipo de Usuário</Label>
                  <Select value={role} onValueChange={(value) => setRole(value as 'vendedor_interno' | 'representante')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendedor_interno">Vendedor Interno</SelectItem>
                      <SelectItem value="representante">Representante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generateTestData}
                    className="w-full"
                  >
                    🎲 Gerar Dados de Teste
                  </Button>
                  
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Criando usuário...' : '🚀 Criar Usuário'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Diagnóstico */}
          <SignUpDiagnostic />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>📋 Instruções</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-medium text-blue-900">1. Execute o Diagnóstico</h4>
              <p className="text-sm text-blue-700">
                Clique em "Executar Diagnóstico" para verificar se tudo está funcionando.
              </p>
            </div>
            
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <h4 className="font-medium text-green-900">2. Gere Dados de Teste</h4>
              <p className="text-sm text-green-700">
                Use "Gerar Dados de Teste" para preencher o formulário automaticamente.
              </p>
            </div>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-medium text-yellow-900">3. Monitore o Console</h4>
              <p className="text-sm text-yellow-700">
                Abra o console do navegador (F12) para ver logs detalhados do processo.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUpTest;
