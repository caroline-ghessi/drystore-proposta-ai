
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, Clock, DollarSign, MessageSquare, Users } from 'lucide-react';
import { AIScore } from '@/types/aiScore';

interface AIScoreCardProps {
  aiScore: AIScore;
}

const AIScoreCard = ({ aiScore }: AIScoreCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-600" />
          AI Score de Conversão
          <Badge className={`ml-2 ${getConfidenceColor(aiScore.confidence)}`}>
            {aiScore.confidence === 'high' ? 'Alta' : aiScore.confidence === 'medium' ? 'Média' : 'Baixa'} Confiança
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getScoreColor(aiScore.score)} text-2xl font-bold`}>
            {aiScore.score}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Probabilidade de fechamento
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm">Perfil do Cliente</span>
            </div>
            <div className="flex items-center space-x-2">
              <Progress value={aiScore.factors.clientProfile} className="w-16 h-2" />
              <span className="text-xs text-gray-500">{aiScore.factors.clientProfile}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm">Tempo de Resposta</span>
            </div>
            <div className="flex items-center space-x-2">
              <Progress value={aiScore.factors.responseTime} className="w-16 h-2" />
              <span className="text-xs text-gray-500">{aiScore.factors.responseTime}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="text-sm">Ticket Médio</span>
            </div>
            <div className="flex items-center space-x-2">
              <Progress value={aiScore.factors.ticketSize} className="w-16 h-2" />
              <span className="text-xs text-gray-500">{aiScore.factors.ticketSize}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm">Sentimento</span>
            </div>
            <div className="flex items-center space-x-2">
              <Progress value={aiScore.factors.textSentiment} className="w-16 h-2" />
              <span className="text-xs text-gray-500">{aiScore.factors.textSentiment}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-orange-600 mr-2" />
              <span className="text-sm">Histórico</span>
            </div>
            <div className="flex items-center space-x-2">
              <Progress value={aiScore.factors.pastInteractions} className="w-16 h-2" />
              <span className="text-xs text-gray-500">{aiScore.factors.pastInteractions}%</span>
            </div>
          </div>
        </div>

        {aiScore.recommendations.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recomendações da IA:</h4>
            <ul className="space-y-1">
              {aiScore.recommendations.map((rec, index) => (
                <li key={index} className="text-xs text-gray-600 flex items-start">
                  <span className="text-blue-600 mr-1">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center">
          Última atualização: {new Date(aiScore.lastCalculated).toLocaleString('pt-BR')}
        </p>
      </CardContent>
    </Card>
  );
};

export default AIScoreCard;
