
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, Download } from 'lucide-react';
import { DeliveryItem } from '@/types/delivery';

interface DeliveryHistoryProps {
  deliveries: DeliveryItem[];
}

const DeliveryHistory = ({ deliveries }: DeliveryHistoryProps) => {
  const handleDownloadInvoice = (invoiceNumber: string) => {
    // Simular download da NF
    console.log(`Downloading invoice: ${invoiceNumber}`);
  };

  const handleViewSignature = (deliveryId: string) => {
    // Simular visualização da assinatura
    console.log(`Viewing signature for delivery: ${deliveryId}`);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Histórico de Entregas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {deliveries.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>NF</TableHead>
                <TableHead>Recebedor</TableHead>
                <TableHead>Comprovante</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery) => (
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
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Confirmado
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadInvoice(delivery.invoiceNumber)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewSignature(delivery.id)}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma entrega registrada ainda</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveryHistory;
