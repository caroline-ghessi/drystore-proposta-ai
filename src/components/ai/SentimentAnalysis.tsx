
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const SentimentAnalysis = () => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzeSentiment = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-sentiment-analysis', {
        body: {
          text: text.trim(),
          context: 'Interação comercial - construção civil'
        }
      });

      if (error) throw error;
      setAnalysis(data);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      setAnalysis({
        sentiment: 'neutro',
        score: 0.5,
        emotions: ['erro'],
        summary: 'Erro na análise',
        recommendations: ['Tente novamente']
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positivo': return 'bg-green-100 text-green-800';
      case 'negativo': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Análise de Sentimento em Tempo Real
        </CardTitle>
        <p className="text-sm text-gray-600">
          Analise o sentimento de mensagens de clientes usando IA
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Texto para análise:</label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Digite ou cole o texto do cliente aqui..."
            rows={3}
          />
        </div>

        <Button 
          onClick={analyzeSentiment}
          disabled={!text.trim() || isAnalyzing}
          className="w-full"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          {isAnalyzing ? 'Analisando...' : 'Analisar Sentimento'}
        </Button>

        {analysis && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Resultado da Análise</h4>
              <Badge className={getSentimentColor(analysis.sentiment)}>
                {analysis.sentiment}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Confiança</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${analysis.score * 100}%` }}
                    />
                  </div>
                  <span className="text-sm">{Math.round(analysis.score * 100)}%</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Emoções</p>
                <div className="flex gap-1">
                  {analysis.emotions?.map((emotion: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Resumo:</p>
              <p className="text-sm">{analysis.summary}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Recomendações:</p>
              <ul className="text-sm space-y-1">
                {analysis.recommendations?.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <TrendingUp className="w-3 h-3 text-green-600 mt-0.5" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
