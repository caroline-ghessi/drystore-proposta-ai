
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
    console.log('🧪 Teste de cadastro com nova função iniciado:', { email, nome, role });
    
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
          <h1 className="text-3xl font-bold text-gray-900">🧪 Teste do Sistema Corrigido</h1>
          <p className="text-gray-600 mt-2">
            Sistema com nova função handle_new_user e validação robusta
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário de Teste */}
          <Card>
            <CardHeader>
              <CardTitle>📝 Teste de Cadastro</CardTitle>
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
                    {loading ? 'Criando usuário...' : '🚀 Testar Nova Função'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Diagnóstico Avançado */}
          <SignUpDiagnostic />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>🔧 Status da Correção</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <h4 className="font-medium text-green-900">✅ Função Recriada</h4>
              <p className="text-sm text-green-700">
                A função handle_new_user foi completamente recriada com validação robusta do enum user_role.
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-medium text-blue-900">🔍 Validação Melhorada</h4>
              <p className="text-sm text-blue-700">
                Agora usa CASE statement para validar roles e inclui fallback automático para 'cliente'.
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 border border-purple-200 rounded">
              <h4 className="font-medium text-purple-900">🛡️ Tratamento de Erros</h4>
              <p className="text-sm text-purple-700">
                Sistema com logs detalhados e fallback manual no frontend caso a função falhe.
              </p>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-medium text-yellow-900">📊 Como Testar</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>1. Execute o diagnóstico para verificar se tudo está funcionando</li>
                <li>2. Gere dados de teste e faça um cadastro</li>
                <li>3. Monitore o console para logs detalhados</li>
                <li>4. Verifique se o perfil foi criado corretamente</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUpTest;
