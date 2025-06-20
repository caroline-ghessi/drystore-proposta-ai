
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Percent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const DiscountApprovals = () => {
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  // Mock data simplificado
  const discountRequests = [
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
      status: 'pending' as const
    }
  ];

  const handleApprove = (requestId: string) => {
    toast({
      title: "Desconto Aprovado",
      description: "O desconto foi aprovado com sucesso.",
    });
  };

  const handleReject = (requestId: string) => {
    toast({
      title: "Desconto Rejeitado",
      description: "O desconto foi rejeitado.",
      variant: "destructive"
    });
  };

  return (
    <div className="w-full space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Percent className="w-5 h-5 mr-2 text-blue-600" />
            Aprovações de Desconto
            <Badge className="ml-2 bg-red-100 text-red-800">
              {discountRequests.length} pendentes
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {discountRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-lg">{request.proposalNumber}</h4>
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
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  <p><strong>Justificativa:</strong> {request.reason}</p>
                </div>

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
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
