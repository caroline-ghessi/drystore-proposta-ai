
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Bot, User, Clock, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
}

export const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Olá! Sou o assistente virtual da DryStore. Como posso ajudar você hoje?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const conversations = [
    { id: 1, client: 'João Silva', status: 'ativo', messages: 12, lastMessage: '5 min atrás' },
    { id: 2, client: 'Maria Santos', status: 'resolvido', messages: 8, lastMessage: '2h atrás' },
    { id: 3, client: 'Carlos Lima', status: 'ativo', messages: 4, lastMessage: '15 min atrás' },
  ];

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chatbot', {
        body: {
          message: userMessage.content,
          conversationHistory: messages.slice(-5), // Últimas 5 mensagens para contexto
          clientContext: {
            company: 'DryStore',
            sector: 'construção civil',
            products: ['drywall', 'telhas', 'estruturas']
          }
        }
      });

      if (error) throw error;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.response,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Desculpe, estou com dificuldades técnicas no momento. Tente novamente em alguns instantes.',
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          Chatbot 24/7
        </CardTitle>
        <p className="text-sm text-gray-600">
          Atendimento automatizado inteligente para seus clientes
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Conversas Ativas</h4>
            <div className="space-y-3">
              {conversations.map((conv) => (
                <div key={conv.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">{conv.client}</p>
                      <p className="text-xs text-gray-500">{conv.messages} mensagens</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={conv.status === 'ativo' ? 'default' : 'secondary'}>
                      {conv.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{conv.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Teste do Chatbot</h4>
            <div className="space-y-4">
              <div className="border rounded-lg h-64 flex flex-col">
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-2">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-2 rounded-lg text-sm ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className="text-xs opacity-75 mt-1">{message.timestamp}</p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          <p className="text-sm text-gray-600">Digitando...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="flex gap-2 p-3 border-t">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    disabled={isTyping}
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm mb-2">Respostas Automáticas</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>✅ Horário de funcionamento</li>
                  <li>✅ Informações sobre produtos</li>
                  <li>✅ Status de pedidos</li>
                  <li>✅ Agendamento de reuniões</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
