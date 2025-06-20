
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface CreditRequest {
  id: string;
  clientName: string;
  company: string;
  requestedLimit: number;
  currentLimit: number;
  creditScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const CreditApprovals = () => {
  const [creditRequests] = useState<CreditRequest[]>([
    {
      id: '1',
      clientName: 'João Silva',
      company: 'Silva & Cia Ltda',
      requestedLimit: 100000,
      currentLimit: 50000,
      creditScore: 720,
      riskLevel: 'low',
      requestedBy: 'Carlos Vendedor',
      requestedAt: '2024-01-16T11:00:00',
      status: 'pending'
    },
    {
      id: '2',
      clientName: 'Maria Santos',
      company: 'Construções MS',
      requestedLimit: 250000,
      currentLimit: 150000,
      creditScore: 650,
      riskLevel: 'medium',
      requestedBy: 'Ana Representante',
      requestedAt: '2024-01-16T10:30:00',
      status: 'pending'
    },
    {
      id: '3',
      clientName: 'Pedro Costa',
      company: 'Costa Empreiteira',
      requestedLimit: 75000,
      currentLimit: 0,
      creditScore: 580,
      riskLevel: 'high',
      requestedBy: 'Roberto Vendedor',
      requestedAt: '2024-01-16T09:45:00',
      status: 'pending'
    }
  ]);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 700) return 'text-green-600';
    if (score >= 600) return 'text-yellow-600';
    return 'text-red-600';
  };

  const pendingCount = creditRequests.filter(req => req.status === 'pending').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-green-600" />
          Aprovação de Crédito
          {pendingCount > 0 && (
            <Badge className="ml-2 bg-red-100 text-red-800">
              {pendingCount} pendentes
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {creditRequests.length > 0 ? (
          <div className="space-y-4">
            {creditRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{request.clientName}</h4>
                    <p className="text-sm text-gray-600">{request.company}</p>
                  </div>
                  <Badge className={getRiskColor(request.riskLevel)}>
                    {getRiskIcon(request.riskLevel)}
                    <span className="ml-1 capitalize">
                      {request.riskLevel === 'low' ? 'Baixo Risco' : 
                       request.riskLevel === 'medium' ? 'Médio Risco' : 'Alto Risco'}
                    </span>
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Limite Atual</p>
                    <p className="font-semibold">R$ {request.currentLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Limite Solicitado</p>
                    <p className="font-semibold text-blue-600">R$ {request.requestedLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Score de Crédito</p>
                    <p className={`font-semibold ${getScoreColor(request.creditScore)}`}>{request.creditScore} pontos</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Aumento</p>
                    <p className="font-semibold">R$ {(request.requestedLimit - request.currentLimit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  <p><strong>Solicitado por:</strong> {request.requestedBy}</p>
                  <p><strong>Data:</strong> {new Date(request.requestedAt).toLocaleString('pt-BR')}</p>
                </div>

                {request.status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      Ver Histórico
                    </Button>
                    <Button size="sm" variant="outline">
                      Consultar Serasa
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button size="sm" variant="destructive">
                      <XCircle className="w-4 h-4 mr-1" />
                      Rejeitar
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Não há solicitações de crédito pendentes</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
