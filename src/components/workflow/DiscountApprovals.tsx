
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, Percent, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DiscountRequest {
  id: string;
  proposalNumber: string;
  clientName: string;
  originalValue: number;
  requestedDiscount: number;
  finalValue: number;
  requestedBy: string;
  requestedAt: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approverComments?: string;
}

export const DiscountApprovals = () => {
  console.log('DiscountApprovals component rendering');
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [comments, setComments] = useState('');

  const [discountRequests] = useState<DiscountRequest[]>([
    {
      id: '1',
      proposalNumber: 'PROP-2024-001',
      clientName: 'João Silva',
      originalValue: 50000,
      requestedDiscount: 15,
      finalValue: 42500,
      requestedBy: 'Carlos Vendedor',
      requestedAt: '2024-01-16T10:30:00',
      reason: 'Cliente fiel há 5 anos, volume alto de compras',
      status: 'pending'
    },
    {
      id: '2',
      proposalNumber: 'PROP-2024-003',
      clientName: 'Empresa ABC Ltda',
      originalValue: 125000,
      requestedDiscount: 20,
      finalValue: 100000,
      requestedBy: 'Maria Representante',
      requestedAt: '2024-01-16T09:15:00',
      reason: 'Concorrência oferecendo preço menor',
      status: 'pending'
    }
  ]);

  const handleApprove = (requestId: string) => {
    console.log('Approving request:', requestId);
    toast({
      title: "Desconto Aprovado",
      description: "O desconto foi aprovado com sucesso.",
    });
  };

  const handleReject = (requestId: string) => {
    console.log('Rejecting request:', requestId);
    toast({
      title: "Desconto Rejeitado",
      description: "O desconto foi rejeitado.",
      variant: "destructive"
    });
  };

  const pendingCount = discountRequests.filter(req => req.status === 'pending').length;

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Percent className="w-5 h-5 mr-2 text-blue-600" />
            Aprovações de Desconto
            {pendingCount > 0 && (
              <Badge className="ml-2 bg-red-100 text-red-800">
                {pendingCount} pendentes
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {discountRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{request.proposalNumber}</h4>
                    <p className="text-sm text-gray-600">{request.clientName}</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Clock className="w-4 h-4 mr-1" />
                    Pendente
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Valor Original</p>
                    <p className="font-semibold">R$ {request.originalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Desconto Solicitado</p>
                    <p className="font-semibold text-red-600">{request.requestedDiscount}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Valor Final</p>
                    <p className="font-semibold text-green-600">R$ {request.finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Economia</p>
                    <p className="font-semibold">R$ {(request.originalValue - request.finalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  <p><strong>Solicitado por:</strong> {request.requestedBy}</p>
                  <p><strong>Data:</strong> {new Date(request.requestedAt).toLocaleString('pt-BR')}</p>
                  <p><strong>Justificativa:</strong> {request.reason}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Proposta
                    </Button>
                  </div>

                  {selectedRequest === request.id ? (
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
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReject(request.id)}
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rejeitar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedRequest(null);
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
                      onClick={() => setSelectedRequest(request.id)}
                      className="w-full"
                    >
                      Analisar Solicitação
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
