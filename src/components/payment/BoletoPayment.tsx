
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileText, ExternalLink, Calendar } from 'lucide-react';
import { BoletoData } from '@/types/payment';

interface BoletoPaymentProps {
  boletoData: BoletoData;
  onBack: () => void;
}

const BoletoPayment = ({ boletoData, onBack }: BoletoPaymentProps) => {
  const handleViewBoleto = () => {
    // Simular abertura do PDF do boleto
    window.open(boletoData.pdfUrl, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const copyBarcode = async () => {
    try {
      await navigator.clipboard.writeText(boletoData.barcodeNumber);
      // Toast seria mostrado aqui
    } catch (error) {
      console.error('Erro ao copiar código de barras');
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Boleto Bancário
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Valor */}
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 mb-1">Valor a pagar</p>
          <p className="text-2xl font-bold text-blue-800">
            R$ {boletoData.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Data de Vencimento */}
        <div className="flex items-center justify-center p-3 bg-orange-50 rounded-lg">
          <Calendar className="w-5 h-5 mr-2 text-orange-600" />
          <span className="text-orange-600 font-medium">
            Vencimento: {formatDate(boletoData.dueDate)}
          </span>
        </div>

        {/* Código de Barras */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Código de Barras:</Label>
          <div className="p-3 bg-gray-50 rounded border font-mono text-sm break-all">
            {boletoData.barcodeNumber}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyBarcode}
            className="w-full"
          >
            Copiar Código de Barras
          </Button>
        </div>

        {/* Botão para visualizar boleto */}
        <Button 
          onClick={handleViewBoleto}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <ExternalLink className="w-5 h-5 mr-2" />
          Visualizar Boleto (PDF)
        </Button>

        {/* Instruções */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Instruções de Pagamento:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Pagamento pode ser feito em qualquer banco</li>
            <li>• Também via internet banking ou app do banco</li>
            <li>• Confirmação em até 2 dias úteis</li>
            <li>• Guarde o comprovante de pagamento</li>
          </ul>
        </div>

        {/* Botão voltar */}
        <Button variant="outline" onClick={onBack} className="w-full">
          Escolher Outro Método
        </Button>
      </CardContent>
    </Card>
  );
};

export default BoletoPayment;
