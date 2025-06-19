
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Save, Edit, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InternalNotesProps {
  proposalId: string;
  notes: string;
  onNotesChange: (notes: string) => void;
}

const InternalNotes = ({ proposalId, notes, onNotesChange }: InternalNotesProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentNotes, setCurrentNotes] = useState(notes);
  const { toast } = useToast();

  const saveNotes = () => {
    onNotesChange(currentNotes);
    setIsEditing(false);
    toast({
      title: "Anotações salvas",
      description: "Suas anotações internas foram atualizadas.",
    });
  };

  const cancelEdit = () => {
    setCurrentNotes(notes);
    setIsEditing(false);
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-yellow-800">
            <Lock className="w-5 h-5 mr-2" />
            Anotações Internas
            <Badge variant="secondary" className="ml-2 bg-yellow-200 text-yellow-800">
              Privado
            </Badge>
          </CardTitle>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="border-yellow-300"
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <p className="text-xs text-yellow-700 flex items-center">
            <Lock className="w-3 h-3 mr-1" />
            Visível apenas para vendedores e representantes
          </p>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={currentNotes}
              onChange={(e) => setCurrentNotes(e.target.value)}
              placeholder="Adicione suas anotações internas aqui...&#10;&#10;Exemplos:&#10;- Objeções do cliente&#10;- Pontos de atenção&#10;- Histórico de negociação&#10;- Dúvidas técnicas"
              rows={6}
              className="bg-white border-yellow-300 focus:border-yellow-500"
            />
            <div className="flex space-x-2">
              <Button onClick={saveNotes} size="sm">
                <Save className="w-4 h-4 mr-1" />
                Salvar
              </Button>
              <Button variant="outline" onClick={cancelEdit} size="sm">
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="min-h-[100px]">
            {notes ? (
              <div className="bg-white p-3 rounded border border-yellow-200">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {notes}
                </pre>
              </div>
            ) : (
              <div className="text-center py-8 text-yellow-600">
                <FileText className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <p className="text-sm">Nenhuma anotação interna ainda</p>
                <p className="text-xs text-yellow-500 mt-1">
                  Clique em "Editar" para adicionar suas anotações
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InternalNotes;
