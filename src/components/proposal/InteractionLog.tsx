
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User, Edit, Send, Eye, MessageCircle, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Interaction {
  id: string;
  type: 'edit' | 'send' | 'view' | 'accept' | 'reject' | 'question' | 'note';
  description: string;
  user: string;
  timestamp: string;
  details?: string;
}

interface InteractionLogProps {
  proposalId: string;
  interactions: Interaction[];
  onAddInteraction: (interaction: Omit<Interaction, 'id' | 'timestamp'>) => void;
}

const InteractionLog = ({ proposalId, interactions, onAddInteraction }: InteractionLogProps) => {
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const { toast } = useToast();

  const getInteractionIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      edit: Edit,
      send: Send,
      view: Eye,
      accept: CheckCircle,
      reject: XCircle,
      question: MessageCircle,
      note: User
    };
    return iconMap[type] || Clock;
  };

  const getInteractionColor = (type: string) => {
    const colorMap: Record<string, string> = {
      edit: 'bg-blue-100 text-blue-800',
      send: 'bg-green-100 text-green-800',
      view: 'bg-gray-100 text-gray-800',
      accept: 'bg-green-100 text-green-800',
      reject: 'bg-red-100 text-red-800',
      question: 'bg-yellow-100 text-yellow-800',
      note: 'bg-purple-100 text-purple-800'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  const getInteractionLabel = (type: string) => {
    const labelMap: Record<string, string> = {
      edit: 'Editado',
      send: 'Enviado',
      view: 'Visualizado',
      accept: 'Aceito',
      reject: 'Rejeitado',
      question: 'Dúvida',
      note: 'Anotação'
    };
    return labelMap[type] || type;
  };

  const addNote = () => {
    if (!newNote.trim()) return;

    onAddInteraction({
      type: 'note',
      description: 'Anotação interna adicionada',
      user: 'Vendedor', // Em um sistema real, seria o usuário logado
      details: newNote.trim()
    });

    toast({
      title: "Anotação adicionada",
      description: "Sua anotação foi registrada no log.",
    });

    setNewNote('');
    setIsAddingNote(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Log de Interações
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingNote(!isAddingNote)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Anotação
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isAddingNote && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <Textarea
              placeholder="Adicione uma anotação interna..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
              className="mb-2"
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={addNote}>
                Adicionar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddingNote(false);
                  setNewNote('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        <ScrollArea className="h-64">
          <div className="space-y-3">
            {interactions.length > 0 ? (
              interactions.map((interaction) => {
                const Icon = getInteractionIcon(interaction.type);
                return (
                  <div key={interaction.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <Icon className="w-4 h-4 text-gray-500 mt-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={getInteractionColor(interaction.type)}>
                          {getInteractionLabel(interaction.type)}
                        </Badge>
                        <span className="text-sm text-gray-500">{interaction.user}</span>
                      </div>
                      <p className="text-sm text-gray-900 mb-1">{interaction.description}</p>
                      {interaction.details && (
                        <p className="text-xs text-gray-600 bg-white p-2 rounded border">
                          {interaction.details}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{interaction.timestamp}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma interação registrada ainda</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default InteractionLog;
