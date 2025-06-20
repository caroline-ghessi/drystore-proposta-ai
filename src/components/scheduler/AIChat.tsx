
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  action?: 'create' | 'update' | 'delete' | 'query';
  actionResult?: 'success' | 'error';
}

interface AIChatProps {
  onCommand: (command: string) => void;
  appointments: any[];
  onUpdateAppointments: (appointments: any[]) => void;
}

export const AIChat = ({ onCommand, appointments, onUpdateAppointments }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Olá! Sou sua assistente de agenda. Posso ajudá-lo a agendar, reagendar ou cancelar compromissos. Experimente comandos como: 'Agende uma reunião com João amanhã às 14h' ou 'O que tenho marcado na sexta?'",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const processAICommand = async (command: string): Promise<Message> => {
    // Simulação de processamento de comandos da IA
    const lowerCommand = command.toLowerCase();
    
    // Comandos de agendamento
    if (lowerCommand.includes('agende') || lowerCommand.includes('marque')) {
      return {
        id: Date.now(),
        text: "Compromisso agendado com sucesso! Verifique o calendário para confirmar os detalhes.",
        sender: 'ai',
        timestamp: new Date(),
        action: 'create',
        actionResult: 'success'
      };
    }
    
    // Comandos de reagendamento
    if (lowerCommand.includes('remarque') || lowerCommand.includes('reagende')) {
      return {
        id: Date.now(),
        text: "Compromisso reagendado com sucesso! As alterações foram aplicadas ao calendário.",
        sender: 'ai',
        timestamp: new Date(),
        action: 'update',
        actionResult: 'success'
      };
    }
    
    // Comandos de cancelamento
    if (lowerCommand.includes('cancele') || lowerCommand.includes('delete')) {
      return {
        id: Date.now(),
        text: "Compromisso(s) cancelado(s) com sucesso! O calendário foi atualizado.",
        sender: 'ai',
        timestamp: new Date(),
        action: 'delete',
        actionResult: 'success'
      };
    }
    
    // Comandos de consulta
    if (lowerCommand.includes('que tenho') || lowerCommand.includes('agenda') || lowerCommand.includes('compromissos')) {
      const appointmentsList = appointments.length > 0 
        ? `Você tem ${appointments.length} compromisso(s) agendado(s). Verifique o calendário para mais detalhes.`
        : "Você não tem compromissos agendados no momento.";
      
      return {
        id: Date.now(),
        text: appointmentsList,
        sender: 'ai',
        timestamp: new Date(),
        action: 'query',
        actionResult: 'success'
      };
    }
    
    // Resposta padrão
    return {
      id: Date.now(),
      text: "Desculpe, não entendi completamente seu comando. Tente usar frases como: 'Agende reunião com [cliente] em [data] às [hora]', 'Remarque [compromisso] para [nova data/hora]', 'Cancele compromissos de [data]' ou 'O que tenho marcado em [data]?'",
      sender: 'ai',
      timestamp: new Date()
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    // Simular delay de processamento
    setTimeout(async () => {
      const aiResponse = await processAICommand(inputValue);
      setMessages(prev => [...prev, aiResponse]);
      setIsProcessing(false);
      onCommand(inputValue);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getActionIcon = (action?: string, result?: string) => {
    if (result === 'success') {
      switch (action) {
        case 'create': return <Calendar className="w-4 h-4 text-green-600" />;
        case 'update': return <Clock className="w-4 h-4 text-blue-600" />;
        case 'delete': return <XCircle className="w-4 h-4 text-red-600" />;
        case 'query': return <CheckCircle className="w-4 h-4 text-purple-600" />;
        default: return null;
      }
    }
    return null;
  };

  const getActionBadge = (action?: string) => {
    switch (action) {
      case 'create': return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Criado</Badge>;
      case 'update': return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Atualizado</Badge>;
      case 'delete': return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Cancelado</Badge>;
      case 'query': return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Consulta</Badge>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-2 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'ai' && (
                <div className="w-8 h-8 bg-drystore-orange rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-drystore-orange text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {message.action && getActionIcon(message.action, message.actionResult)}
                  <p className="text-sm">{message.text}</p>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {message.action && getActionBadge(message.action)}
                </div>
              </div>
              
              {message.sender === 'user' && (
                <div className="w-8 h-8 bg-gray-600 dark:bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white dark:text-gray-900" />
                </div>
              )}
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-drystore-orange rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite seu comando... Ex: 'Agende reunião com João amanhã às 14h'"
            className="flex-1"
            disabled={isProcessing}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing}
            className="bg-drystore-orange hover:bg-drystore-orange-light text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          <p>💡 Comandos suportados: agendar, reagendar, cancelar, consultar agenda</p>
        </div>
      </div>
    </div>
  );
};
