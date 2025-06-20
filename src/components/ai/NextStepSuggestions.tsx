
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, ArrowRight, Percent, CreditCard, Phone } from 'lucide-react';
import { NextStepSuggestion } from '@/types/aiScore';
import { useToast } from '@/hooks/use-toast';

interface NextStepSuggestionsProps {
  suggestions: NextStepSuggestion;
}

const NextStepSuggestions = ({ suggestions }: NextStepSuggestionsProps) => {
  const { toast } = useToast();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('desconto')) return <Percent className="w-4 h-4" />;
    if (action.includes('parcelamento')) return <CreditCard className="w-4 h-4" />;
    if (action.includes('contato')) return <Phone className="w-4 h-4" />;
    return <ArrowRight className="w-4 h-4" />;
  };

  const handleExecuteAction = (actionDescription: string) => {
    toast({
      title: "Ação iniciada",
      description: `Executando: ${actionDescription}`,
    });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
          Próximos Passos Sugeridos
        </CardTitle>
        <p className="text-sm text-gray-600">
          Motivo da rejeição: <span className="font-medium">{suggestions.rejectionReason}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.suggestedActions.map((action, index) => (
          <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getActionIcon(action.action)}
                <h4 className="font-medium text-gray-900">{action.action}</h4>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getPriorityColor(action.priority)}>
                  {action.priority === 'high' ? 'Alta' : action.priority === 'medium' ? 'Média' : 'Baixa'}
                </Badge>
                <Badge variant="outline">
                  {action.estimatedSuccess}% sucesso
                </Badge>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{action.description}</p>
            
            <Button
              size="sm"
              onClick={() => handleExecuteAction(action.description)}
              className="w-full"
              variant={action.priority === 'high' ? 'default' : 'outline'}
            >
              Executar Ação
            </Button>
          </div>
        ))}

        <div className="border-t pt-4 text-center">
          <Button variant="ghost" size="sm">
            Ver Todas as Estratégias de Recuperação
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NextStepSuggestions;
