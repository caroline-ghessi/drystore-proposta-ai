
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

interface Exception {
  id: string;
  type: 'prazo_vencido' | 'valor_alto' | 'desconto_maximo' | 'cliente_bloqueado';
  proposalNumber: string;
  clientName: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  status: 'pending' | 'resolved' | 'escalated';
  assignedTo?: string;
}

export const ExceptionWorkflow = () => {
  const [exceptions] = useState<Exception[]>([
    {
      id: '1',
      type: 'prazo_vencido',
      proposalNumber: 'PROP-2024-001',
      clientName: 'João Silva',
      description: 'Proposta vencida há 3 dias sem resposta do cliente',
      severity: 'medium',
      createdAt: '2024-01-16T08:00:00',
      status: 'pending'
    },
    {
      id: '2',
      type: 'valor_alto',
      proposalNumber: 'PROP-2024-005',
      clientName: 'Construtora ABC',
      description: 'Proposta acima de R$ 500.000 requer aprovação adicional',
      severity: 'high',
      createdAt: '2024-01-16T09:30:00',
      status: 'pending'
    },
    {
      id: '3',
      type: 'desconto_maximo',
      proposalNumber: 'PROP-2024-003',
      clientName: 'Maria Santos',
      description: 'Desconto de 25% excede o limite padrão de 20%',
      severity: 'high',
      createdAt: '2024-01-16T10:15:00',
      status: 'pending'
    },
    {
      id: '4',
      type: 'cliente_bloqueado',
      proposalNumber: 'PROP-2024-007',
      clientName: 'Pedro Costa',
      description: 'Cliente com restrições de crédito no sistema',
      severity: 'critical',
      createdAt: '2024-01-16T11:00:00',
      status: 'pending'
    }
  ]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'prazo_vencido':
        return 'Prazo Vencido';
      case 'valor_alto':
        return 'Valor Alto';
      case 'desconto_maximo':
        return 'Desconto Máximo';
      case 'cliente_bloqueado':
        return 'Cliente Bloqueado';
      default:
        return 'Exceção';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const pendingCount = exceptions.filter(ex => ex.status === 'pending').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
          Workflow de Exceções
          {pendingCount > 0 && (
            <Badge className="ml-2 bg-red-100 text-red-800">
              {pendingCount} pendentes
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {exceptions.length > 0 ? (
          <div className="space-y-4">
            {exceptions.map((exception) => (
              <div key={exception.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{exception.proposalNumber}</h4>
                      <Badge variant="outline">{getTypeLabel(exception.type)}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{exception.clientName}</p>
                  </div>
                  <Badge className={getSeverityColor(exception.severity)}>
                    {getSeverityIcon(exception.severity)}
                    <span className="ml-1 capitalize">
                      {exception.severity === 'low' ? 'Baixa' :
                       exception.severity === 'medium' ? 'Média' :
                       exception.severity === 'high' ? 'Alta' : 'Crítica'}
                    </span>
                  </Badge>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-700">{exception.description}</p>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  <p><strong>Criado em:</strong> {new Date(exception.createdAt).toLocaleString('pt-BR')}</p>
                  {exception.assignedTo && (
                    <p><strong>Atribuído a:</strong> {exception.assignedTo}</p>
                  )}
                </div>

                {exception.status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Detalhes
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Resolver
                    </Button>
                    <Button size="sm" variant="outline">
                      Escalar
                    </Button>
                    {exception.severity === 'critical' && (
                      <Button size="sm" variant="destructive">
                        <XCircle className="w-4 h-4 mr-1" />
                        Bloquear
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-gray-500">Não há exceções pendentes</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
