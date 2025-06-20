
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ClientQuestionFormProps {
  onQuestionSubmit: (question: string) => void;
}

const ClientQuestionForm = ({ onQuestionSubmit }: ClientQuestionFormProps) => {
  const [question, setQuestion] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  // Só mostra para clientes
  if (!user || user.role !== 'cliente') {
    return null;
  }

  const handleSubmit = () => {
    if (!question.trim()) {
      toast({
        title: "Digite sua dúvida",
        description: "Por favor, escreva sua pergunta antes de enviar.",
        variant: "destructive"
      });
      return;
    }
    
    onQuestionSubmit(question);
    setQuestion('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Tem alguma dúvida?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Digite sua pergunta ou dúvida sobre a proposta..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
        />
        <Button onClick={handleSubmit} variant="outline" className="w-full">
          <MessageCircle className="w-4 h-4 mr-2" />
          Enviar Dúvida
        </Button>
      </CardContent>
    </Card>
  );
};

export default ClientQuestionForm;
