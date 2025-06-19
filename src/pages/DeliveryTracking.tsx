
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, FileText, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DeliveryProgress from '@/components/delivery/DeliveryProgress';
import { DeliveryItem } from '@/types/delivery';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const DeliveryTracking = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);

  // Dados mockados da proposta
  const proposalData = {
    id: proposalId,
    number: 'PROP-2024-001',
    client: 'João Silva',
    project: 'Residência Moderna - Sistemas Integrados',
    totalQuantity: 100,
    unit: 'placas',
    contractDate: '2024-01-15'
  };

  useEffect(() => {
    // Carregar entregas do localStorage
    const savedDeliveries = JSON.parse(localStorage.getItem('proposal_deliveries') || '[]');
    const proposalDeliveries = savedDeliveries.filter((d: DeliveryItem) => d.proposalId === proposalId);
    setDeliveries(proposalDeliveries);
  }, [proposalId]);

  const totalDelivered = deliveries.reduce((sum, delivery) => sum + delivery.quantity, 0);
  const lastDelivery = deliveries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const handleDownloadInvoice = (invoiceNumber: string) => {
    console.log(`Downloading invoice: ${invoiceNumber}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate(`/proposal/${proposalId}`)}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Proposta
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Acompanhamento da Entrega</h1>
                <p className="text-gray-600 mt-1">
                  {proposalData.number} - {proposalData.project}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resumo Geral */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2 text-blue-600" />
                  Resumo do Contrato
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Você contratou</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {proposalData.totalQuantity} {proposalData.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Data do contrato</p>
                      <p className="font-semibold text-gray-700">
                        {new Date(proposalData.contractDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  {lastDelivery && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 mb-2">Última entrega registrada:</p>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 px-3 py-1">
                        {lastDelivery.quantity} {lastDelivery.unit} - {new Date(lastDelivery.date).toLocaleDateString('pt-BR')}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Entregas */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Linha do Tempo de Entregas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deliveries.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Qtd. Entregue</TableHead>
                        <TableHead>NF</TableHead>
                        <TableHead>Recebedor</TableHead>
                        <TableHead>Comprovante</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deliveries
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((delivery) => (
                        <TableRow key={delivery.id}>
                          <TableCell>
                            {new Date(delivery.date).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {delivery.quantity} {delivery.unit}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{delivery.invoiceNumber}</Badge>
                          </TableCell>
                          <TableCell>{delivery.receiverName}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              ✅ Confirmado
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadInvoice(delivery.invoiceNumber)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              NF
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma entrega registrada ainda</p>
                    <p className="text-sm text-gray-400 mt-2">
                      As entregas aparecerão aqui quando forem processadas
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Progresso */}
          <div className="space-y-6">
            <DeliveryProgress
              totalContracted={proposalData.totalQuantity}
              totalDelivered={totalDelivered}
              unit={proposalData.unit}
              lastDeliveryDate={lastDelivery?.date}
              lastDeliveryQuantity={lastDelivery?.quantity}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTracking;
