
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Bot, User, Clock } from 'lucide-react';

export const ChatBot = () => {
  const conversations = [
    { id: 1, client: 'João Silva', status: 'ativo', messages: 12, lastMessage: '5 min atrás' },
    { id: 2, client: 'Maria Santos', status: 'resolvido', messages: 8, lastMessage: '2h atrás' },
    { id: 3, client: 'Carlos Lima', status: 'ativo', messages: 4, lastMessage: '15 min atrás' },
  ];

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
            <h4 className="font-medium mb-3">Configurações do Bot</h4>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm mb-2">Respostas Automáticas</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>✅ Horário de funcionamento</li>
                  <li>✅ Informações sobre produtos</li>
                  <li>✅ Status de pedidos</li>
                  <li>✅ Agendamento de reuniões</li>
                </ul>
              </div>
              <Button className="w-full">
                Configurar Respostas
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
