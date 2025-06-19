
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, User, Lightbulb, MessageCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

interface AIAssistantProps {
  proposalId: string;
  clientQuestions: string[];
  proposalData: any;
}

const AIAssistant = ({ proposalId, clientQuestions, proposalData }: AIAssistantProps) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Simular respostas da IA baseadas no contexto
  const getAIResponse = (userMessage: string): string => {
    const responses = {
      'preco': 'Entendo a preocupação com o preço. Destaque o valor agregado: materiais premium, garantia estendida e instalação profissional. Compare com concorrentes enfatizando a qualidade superior.',
      'prazo': 'Para objeções sobre prazo, explique que nosso cronograma é realista e garante qualidade. Ofereça marcos intermediários para tranquilizar o cliente sobre o progresso.',
      'garantia': 'Nossa garantia é diferenciada: 5 anos para estrutura e 2 anos para telhas. Explique que isso demonstra confiança na qualidade e reduz riscos para o cliente.',
      'qualidade': 'Destaque nossos 22 anos de experiência e 50.000+ clientes atendidos. Mencione certificações dos materiais e case studies de projetos similares.',
      'pagamento': 'Oferecemos flexibilidade: parcelamento em até 12x, desconto à vista ou financiamento próprio. Adapte às necessidades financeiras do cliente.',
      'default': 'Com base na proposta e no perfil do cliente, sugiro focar nos benefícios únicos: economia a longo prazo, durabilidade superior e suporte técnico especializado.'
    };

    const lowerMessage = userMessage.toLowerCase();
    
    for (const [key, response] of Object.entries(responses)) {
      if (key !== 'default' && lowerMessage.includes(key)) {
        return response;
      }
    }
    
    return responses.default;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toLocaleString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simular delay da IA
    setTimeout(() => {
      const aiResponse: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: getAIResponse(userMessage.content),
        timestamp: new Date().toLocaleString()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const loadClientQuestions = () => {
    if (clientQuestions.length === 0) {
      toast({
        title: "Nenhuma dúvida encontrada",
        description: "O cliente ainda não enviou dúvidas sobre esta proposta.",
        variant: "destructive"
      });
      return;
    }

    const contextMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: `Dúvidas do cliente: ${clientQuestions.join(', ')}. Como devo responder?`,
      timestamp: new Date().toLocaleString()
    };

    setMessages(prev => [...prev, contextMessage]);
    
    setTimeout(() => {
      const aiResponse: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Analisei as dúvidas do cliente. Recomendo abordar cada ponto com transparência: ${getAIResponse(clientQuestions.join(' '))} Prepare respostas técnicas detalhadas e ofereça uma reunião para esclarecimentos adicionais.`,
        timestamp: new Date().toLocaleString()
      };

      setMessages(prev => [...prev, aiResponse]);
    }, 2000);
  };

  const suggestedPrompts = [
    "Como quebrar objeção de preço alto?",
    "Cliente questiona a qualidade dos materiais",
    "Como negociar prazos de entrega?",
    "Cliente quer desconto, como proceder?",
    "Como destacar nossos diferenciais?"
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Bot className="w-5 h-5 mr-2 text-blue-600" />
            Assistente de IA
            <Badge className="ml-2 bg-blue-100 text-blue-800">
              <Sparkles className="w-3 h-3 mr-1" />
              Beta
            </Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadClientQuestions}
            disabled={clientQuestions.length === 0}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Dúvidas do Cliente
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center mb-2">
            <Lightbulb className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-800">Treinado para vendas</span>
          </div>
          <p className="text-xs text-blue-700">
            IA especializada em quebrar objeções e aumentar conversões para o setor de construção
          </p>
        </div>

        <ScrollArea className="h-64 border rounded-lg p-3">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bot className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Como posso ajudar com esta proposta?</p>
                <p className="text-xs text-gray-400 mt-1">
                  Faça perguntas sobre objeções ou estratégias de venda
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      {message.type === 'ai' ? (
                        <Bot className="w-3 h-3 mr-1" />
                      ) : (
                        <User className="w-3 h-3 mr-1" />
                      )}
                      <span className="text-xs opacity-75">
                        {message.type === 'ai' ? 'IA' : 'Você'}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-50 mt-1">{message.timestamp}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                  <div className="flex items-center">
                    <Bot className="w-3 h-3 mr-1" />
                    <span className="text-xs">IA está pensando...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {messages.length === 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Perguntas sugeridas:</p>
            <div className="space-y-1">
              {suggestedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => setInputMessage(prompt)}
                  className="w-full justify-start text-xs h-auto py-1"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Pergunte como quebrar objeções..."
            rows={2}
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
