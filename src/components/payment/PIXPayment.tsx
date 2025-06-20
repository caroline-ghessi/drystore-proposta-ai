
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Copy, Check, Clock } from 'lucide-react';
import { PIXData } from '@/types/payment';
import { useToast } from '@/hooks/use-toast';

interface PIXPaymentProps {
  pixData: PIXData;
  onBack: () => void;
  onPaymentConfirmed: () => void;
}

const PIXPayment = ({ pixData, onBack, onPaymentConfirmed }: PIXPaymentProps) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutos em segundos
  const { toast } = useToast();

  // Simular countdown timer
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pixData.copyPasteCode);
      setCopied(true);
      toast({
        title: "Código copiado!",
        description: "Código PIX copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <QrCode className="w-5 h-5 mr-2" />
          Pagamento via PIX
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer */}
        <div className="flex items-center justify-center p-3 bg-orange-50 rounded-lg">
          <Clock className="w-5 h-5 mr-2 text-orange-600" />
          <span className="text-orange-600 font-medium">
            Expira em: {formatTime(timeLeft)}
          </span>
        </div>

        {/* Valor */}
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 mb-1">Valor a pagar</p>
          <p className="text-2xl font-bold text-blue-800">
            R$ {pixData.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* QR Code simulado */}
        <div className="text-center">
          <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
            <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <QrCode className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">QR Code PIX</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Aponte a câmera do seu celular para o QR Code
          </p>
        </div>

        {/* Código Copia e Cola */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Ou copie e cole o código:</Label>
          <div className="flex space-x-2">
            <Input
              value={pixData.copyPasteCode}
              readOnly
              className="text-xs"
            />
            <Button 
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="flex-shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Instruções */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Como pagar:</h4>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. Abra o app do seu banco</li>
            <li>2. Escolha a opção PIX</li>
            <li>3. Escaneie o QR Code ou cole o código</li>
            <li>4. Confirme o pagamento</li>
          </ol>
        </div>

        {/* Botões */}
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Voltar
          </Button>
          <Button 
            onClick={onPaymentConfirmed}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Já Paguei
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PIXPayment;
