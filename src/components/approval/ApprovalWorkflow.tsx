
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, AlertTriangle, Eye, Percent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApprovalRequests, useUpdateApprovalRequest } from '@/hooks/useApprovalRequests';

const ApprovalWorkflow = () => {
  const [selectedApproval, setSelectedApproval] = useState<string | null>(null);
  const [comments, setComments] = useState('');
  const { toast } = useToast();
  
  const { data: approvalRequests = [], isLoading } = useApprovalRequests();
  const updateApprovalRequest = useUpdateApprovalRequest();

  const handleApprove = async (approvalId: string) => {
    try {
      await updateApprovalRequest.mutateAsync({
        id: approvalId,
        updates: {
          status: 'approved',
          comments,
          approved_at: new Date().toISOString(),
        }
      });

      setComments('');
      setSelectedApproval(null);
      toast({
        title: "Solicitação Aprovada",
        description: "A solicitação foi aprovada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível aprovar a solicitação.",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (approvalId: string) => {
    try {
      await updateApprovalRequest.mutateAsync({
        id: approvalId,
        updates: {
          status: 'rejected',
          comments,
          approved_at: new Date().toISOString(),
        }
      });

      setComments('');
      setSelectedApproval(null);
      toast({
        title: "Solicitação Rejeitada",
        description: "A solicitação foi rejeitada.",
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar a solicitação.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovada';
      case 'rejected':
        return 'Rejeitada';
      default:
        return 'Pendente';
    }
  };

  const getApprovalTypeIcon = (type: string) => {
    switch (type) {
      case 'discount':
        return <Percent className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    }
  };

  const getApprovalTypeLabel = (type: string) => {
    switch (type) {
      case 'discount':
        return 'Desconto Especial';
      case 'value':
        return 'Valor Alto';
      default:
        return 'Aprovação Customizada';
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Carregando aprovações...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = approvalRequests.filter(req => req.status === 'pending');

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
          Aprovações Pendentes
          {pendingRequests.length > 0 && (
            <Badge className="ml-2 bg-red-100 text-red-800">
              {pendingRequests.length} pendentes
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {approvalRequests.length > 0 ? (
          <div className="space-y-4">
            {approvalRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getApprovalTypeIcon(request.approval_type)}
                    <div>
                      <h4 className="font-medium">
                        {getApprovalTypeLabel(request.approval_type)}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Cliente: {request.proposals?.clients?.nome || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{getStatusLabel(request.status)}</span>
                    </Badge>
                    {request.approval_type === 'discount' && (
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        {request.requested_value}% (limite: {request.current_limit}%)
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  <p><strong>Solicitado por:</strong> {request.requested_by_profile?.nome || 'N/A'}</p>
                  <p><strong>Data:</strong> {new Date(request.created_at).toLocaleString('pt-BR')}</p>
                  {request.reason && (
                    <p><strong>Justificativa:</strong> {request.reason}</p>
                  )}
                  <p><strong>Proposta:</strong> R$ {request.proposals?.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || 'N/A'}</p>
                </div>

                {request.status === 'pending' && (
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Proposta
                      </Button>
                    </div>

                    {selectedApproval === request.id ? (
                      <div className="space-y-3 border-t pt-3">
                        <Textarea
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          placeholder="Comentários da aprovação/rejeição..."
                          rows={3}
                        />
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={updateApprovalRequest.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReject(request.id)}
                            variant="destructive"
                            disabled={updateApprovalRequest.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rejeitar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedApproval(null);
                              setComments('');
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setSelectedApproval(request.id)}
                        className="w-full"
                      >
                        Analisar Solicitação
                      </Button>
                    )}
                  </div>
                )}

                {request.comments && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>Comentários:</strong> {request.comments}
                    </p>
                    {request.approved_by_profile && (
                      <p className="text-xs text-gray-500 mt-1">
                        Por: {request.approved_by_profile.nome} em {new Date(request.approved_at || '').toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-gray-500">Não há solicitações de aprovação</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApprovalWorkflow;
