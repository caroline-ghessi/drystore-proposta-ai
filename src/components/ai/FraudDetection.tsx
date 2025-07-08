
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const FraudDetection = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const mockTransactionData = {
    value: 15000,
    paymentMethod: 'credit_card',
    installments: 12,
    clientId: 'client-123',
    timestamp: new Date().toISOString()
  };

  const mockClientData = {
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '11999999999',
    registrationDate: '2024-01-15',
    previousOrders: 2
  };

  const analyzeFraud = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-fraud-detection', {
        body: {
          transactionData: mockTransactionData,
          clientData: mockClientData,
          behaviorPatterns: {
            averageOrderValue: 8000,
            usualPaymentMethod: 'credit_card',
            orderFrequency: 'monthly'
          }
        }
      });

      if (error) throw error;
      setAnalysis(data);
    } catch (error) {
      console.error('Error analyzing fraud:', error);
      setAnalysis({
        riskLevel: 'baixo',
        riskScore: 0.2,
        detectedPatterns: [],
        recommendations: ['Monitorar transação'],
        summary: 'Erro na análise de risco',
        requiresReview: false
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'alto': return 'bg-red-100 text-red-800';
      case 'médio': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'alto': return <XCircle className="w-4 h-4" />;
      case 'médio': return <AlertTriangle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-600" />
          Detecção de Riscos e Fraudes
        </CardTitle>
        <p className="text-sm text-gray-600">
          Sistema de análise de risco para transações usando IA
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Dados da Transação</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Valor:</strong> R$ {mockTransactionData.value.toLocaleString()}</p>
              <p><strong>Método:</strong> {mockTransactionData.paymentMethod}</p>
              <p><strong>Parcelas:</strong> {mockTransactionData.installments}x</p>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Dados do Cliente</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Nome:</strong> {mockClientData.name}</p>
              <p><strong>Email:</strong> {mockClientData.email}</p>
              <p><strong>Pedidos anteriores:</strong> {mockClientData.previousOrders}</p>
            </div>
          </div>
        </div>

        <Button 
          onClick={analyzeFraud}
          disabled={isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Eye className="w-4 h-4 mr-2" />
          )}
          {isAnalyzing ? 'Analisando Risco...' : 'Analisar Risco de Fraude'}
        </Button>

        {analysis && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Resultado da Análise</h4>
              <Badge className={`${getRiskColor(analysis.riskLevel)} flex items-center gap-1`}>
                {getRiskIcon(analysis.riskLevel)}
                Risco {analysis.riskLevel}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Score de Risco</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        analysis.riskScore > 0.7 ? 'bg-red-600' : 
                        analysis.riskScore > 0.4 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${analysis.riskScore * 100}%` }}
                    />
                  </div>
                  <span className="text-sm">{Math.round(analysis.riskScore * 100)}%</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Requer Revisão</p>
                <p className="font-medium">
                  {analysis.requiresReview ? 'Sim' : 'Não'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Padrões Detectados:</p>
              <div className="flex flex-wrap gap-1">
                {analysis.detectedPatterns?.length > 0 ? (
                  analysis.detectedPatterns.map((pattern: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {pattern}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Nenhum padrão suspeito
                  </Badge>
                )}
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
                    <Shield className="w-3 h-3 text-blue-600 mt-0.5" />
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
