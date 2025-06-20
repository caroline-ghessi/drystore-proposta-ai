
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, AlertTriangle, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PendingApproval {
  id: string;
  proposalId: string;
  proposalNumber: string;
  clientName: string;
  projectName: string;
  value: number;
  requestedBy: string;
  requestedAt: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approverComments?: string;
}

interface ApprovalWorkflowProps {
  pendingApprovals: PendingApproval[];
  onApprove: (approvalId: string, comments: string) => void;
  onReject: (approvalId: string, comments: string) => void;
}

const ApprovalWorkflow = ({ pendingApprovals, onApprove, onReject }: ApprovalWorkflowProps) => {
  const [selectedApproval, setSelectedApproval] = useState<string | null>(null);
  const [comments, setComments] = useState('');
  const { toast } = useToast();

  const handleApprove = (approvalId: string) => {
    onApprove(approvalId, comments);
    setComments('');
    setSelectedApproval(null);
    toast({
      title: "Proposta Aprovada",
      description: "A proposta foi aprovada e pode ser enviada ao cliente.",
    });
  };

  const handleReject = (approvalId: string) => {
    onReject(approvalId, comments);
    setComments('');
    setSelectedApproval(null);
    toast({
      title: "Proposta Rejeitada",
      description: "A proposta foi rejeitada e retornará para o vendedor.",
      variant: "destructive"
    });
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

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
          Aprovações Pendentes
          {pendingApprovals.filter(a => a.status === 'pending').length > 0 && (
            <Badge className="ml-2 bg-red-100 text-red-800">
              {pendingApprovals.filter(a => a.status === 'pending').length} pendentes
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingApprovals.length > 0 ? (
          <div className="space-y-4">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{approval.proposalNumber}</h4>
                    <p className="text-sm text-gray-600">{approval.clientName} - {approval.projectName}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(approval.status)}>
                      {getStatusIcon(approval.status)}
                      <span className="ml-1">{getStatusLabel(approval.status)}</span>
                    </Badge>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      R$ {approval.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  <p><strong>Solicitado por:</strong> {approval.requestedBy}</p>
                  <p><strong>Data:</strong> {new Date(approval.requestedAt).toLocaleString('pt-BR')}</p>
                  <p><strong>Motivo:</strong> {approval.reason}</p>
                </div>

                {approval.status === 'pending' && (
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Proposta
                      </Button>
                    </div>

                    {selectedApproval === approval.id ? (
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
                            onClick={() => handleApprove(approval.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReject(approval.id)}
                            variant="destructive"
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
                        onClick={() => setSelectedApproval(approval.id)}
                        className="w-full"
                      >
                        Analisar Proposta
                      </Button>
                    )}
                  </div>
                )}

                {approval.approverComments && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>Comentários:</strong> {approval.approverComments}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-gray-500">Não há aprovações pendentes</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApprovalWorkflow;
