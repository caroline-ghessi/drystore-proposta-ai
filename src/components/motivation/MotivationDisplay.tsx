
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, Play, X, MessageSquare } from 'lucide-react';

interface MotivationMessage {
  id: string;
  type: 'text' | 'audio' | 'video';
  content?: string;
  fileUrl?: string;
  timestamp: string;
  isRead: boolean;
}

export const MotivationDisplay = () => {
  const [messages, setMessages] = useState<MotivationMessage[]>([
    {
      id: '1',
      type: 'text',
      content: 'Pessoal, faltam apenas 30% para batermos a meta do mês! Vamos acelerar essas vendas! 💪 Quem conseguir 3 vendas até sexta ganha um bônus especial!',
      timestamp: '2024-01-20T10:30:00Z',
      isRead: false
    },
    {
      id: '2',
      type: 'video',
      fileUrl: '/motivation-video.mp4',
      timestamp: '2024-01-19T14:00:00Z',
      isRead: true
    }
  ]);

  const markAsRead = (id: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, isRead: true } : msg
      )
    );
  };

  const dismissMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const unreadCount = messages.filter(msg => !msg.isRead).length;

  if (messages.length === 0) {
    return null;
  }

  return (
    <Card className="w-full border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5 text-orange-600" />
            Mensagens da Gestão
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} nova{unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`p-4 rounded-lg border ${
              message.isRead 
                ? 'bg-white border-gray-200' 
                : 'bg-orange-50 border-orange-300 shadow-md'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                {message.type === 'text' && (
                  <p className="text-gray-800 font-medium">
                    {message.content}
                  </p>
                )}
                
                {message.type === 'audio' && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-blue-100 px-3 py-2 rounded-lg">
                      <Volume2 className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Mensagem de Áudio
                      </span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Play className="w-3 h-3 mr-1" />
                      Reproduzir
                    </Button>
                  </div>
                )}
                
                {message.type === 'video' && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-purple-100 px-3 py-2 rounded-lg">
                      <Play className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">
                        Vídeo Motivacional
                      </span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Play className="w-3 h-3 mr-1" />
                      Assistir
                    </Button>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(message.timestamp).toLocaleString('pt-BR')}
                </p>
              </div>
              
              <div className="flex gap-1">
                {!message.isRead && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => markAsRead(message.id)}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    Marcar como lida
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => dismissMessage(message.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
