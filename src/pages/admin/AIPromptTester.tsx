
import Layout from '@/components/Layout';
import PermissionGuard from '@/components/PermissionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Bot, Play, Save, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AIPromptTester = () => {
  const [selectedPromptType, setSelectedPromptType] = useState('persuasive_text');
  const [promptContent, setPromptContent] = useState('');
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const promptTemplates = {
    persuasive_text: {
      name: 'Texto Persuasivo',
      default: 'Gere um texto persuasivo para uma proposta de {produto} no valor de {valor} para o cliente {cliente}. Destaque os benefícios e crie senso de urgência.'
    },
    technical_analysis: {
      name: 'Análise Técnica',
      default: 'Analise tecnicamente os requisitos do projeto: {requisitos}. Sugira as melhores soluções considerando eficiência e custo-benefício.'
    },
    price_optimization: {
      name: 'Otimização de Preços',
      default: 'Com base nos dados do mercado e margens, otimize o preço para {produto} considerando competitividade e rentabilidade.'
    }
  };

  const testPrompt = async () => {
    setIsTesting(true);
    
    try {
      // Simular resposta da IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let simulatedResponse = '';
      
      if (selectedPromptType === 'persuasive_text') {
        simulatedResponse = `🏗️ **Transforme sua construção com nossa solução premium!**

Esta proposta representa muito mais que materiais - é o investimento na realização do seu projeto dos sonhos.

✅ **Qualidade Premium Garantida**
✅ **Entrega no prazo acordado**  
✅ **Suporte técnico especializado**

⏰ **Oferta válida apenas até o final do mês!**

Não perca esta oportunidade única de ter os melhores materiais com condições especiais.`;
      } else if (selectedPromptType === 'technical_analysis') {
        simulatedResponse = `📋 **Análise Técnica Detalhada**

Com base nos requisitos apresentados, recomendamos:

1. **Estrutura**: Perfis metálicos galvanizados para maior durabilidade
2. **Cobertura**: Telhas termoacústicas para conforto térmico
3. **Vedação**: Sistema drywall para flexibilidade e rapidez

💡 **Benefícios técnicos:**
- Redução de 30% no tempo de execução
- Maior resistência estrutural
- Facilidade de manutenção`;
      }
      
      setTestOutput(simulatedResponse);
      
      toast({
        title: "Teste executado!",
        description: "Prompt processado com sucesso pela IA simulada.",
      });
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Falha ao processar o prompt.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const savePrompt = () => {
    // Simular salvamento
    toast({
      title: "Prompt salvo!",
      description: "As alterações foram aplicadas ao sistema.",
    });
  };

  return (
    <Layout>
      <PermissionGuard 
        requiredRole={['admin']}
        fallback={
          <div className="text-center py-12">
            <p className="text-gray-500">Acesso negado. Apenas administradores podem acessar esta área.</p>
          </div>
        }
      >
        <div className="animate-fade-in">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Teste de Prompts IA</h1>
            <p className="text-gray-600">Configure e teste os prompts utilizados pelo sistema de inteligência artificial</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bot className="w-5 h-5 mr-2 text-blue-600" />
                    Editor de Prompts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Prompt
                    </label>
                    <Select 
                      value={selectedPromptType} 
                      onValueChange={(value) => {
                        setSelectedPromptType(value);
                        setPromptContent(promptTemplates[value as keyof typeof promptTemplates].default);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(promptTemplates).map(([key, template]) => (
                          <SelectItem key={key} value={key}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conteúdo do Prompt
                    </label>
                    <Textarea
                      value={promptContent}
                      onChange={(e) => setPromptContent(e.target.value)}
                      placeholder="Digite o prompt aqui..."
                      className="min-h-[200px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dados de Teste (JSON)
                    </label>
                    <Textarea
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      placeholder='{"produto": "Drywall", "valor": "R$ 15.000", "cliente": "João Silva"}'
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      onClick={testPrompt}
                      disabled={isTesting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isTesting ? 'Testando...' : 'Testar Prompt'}
                    </Button>
                    
                    <Button 
                      onClick={savePrompt}
                      variant="outline"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <History className="w-5 h-5 mr-2 text-green-600" />
                    Resultado do Teste
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {testOutput ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">{testOutput}</pre>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      Execute um teste para ver o resultado aqui
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PermissionGuard>
    </Layout>
  );
};

export default AIPromptTester;
