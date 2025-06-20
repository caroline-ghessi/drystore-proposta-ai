
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Check, AlertCircle, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ERPUploaderProps {
  onUploadComplete: (extractedData: any) => void;
}

const ERPUploader = ({ onUploadComplete }: ERPUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas arquivos PDF do ERP.",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
    simulateERPExtraction();
  };

  const simulateERPExtraction = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsAnalyzed(true);
      
      // Mock dos dados extraídos do ERP (baseado na imagem)
      const mockExtractedData = {
        proposalNumber: "N131719",
        client: "PEDRO BARTELLE",
        items: [
          {
            code: "13993",
            description: "RU PLACA GESSO G,K,P 12,5 1200X1800MM",
            quantity: 100,
            unit: "PC",
            unitPrice: 62.01,
            total: 6201.00
          },
          {
            code: "4259",
            description: "MONTANTE 48 S/ST - 3M",
            quantity: 300,
            unit: "PC",
            unitPrice: 19.71,
            total: 5913.00
          },
          {
            code: "4252",
            description: "GUIA 48 S/ST - 3M",
            quantity: 120,
            unit: "PC",
            unitPrice: 16.11,
            total: 1933.20
          },
          {
            code: "413",
            description: "RODAPE DE IMPERMEABILIZACAO W200 - 3M",
            quantity: 24,
            unit: "PC",
            unitPrice: 130.90,
            total: 3141.60
          }
        ],
        freight: 0.00,
        subtotal: 17188.80,
        total: 17188.80,
        paymentTerms: "BOLETO / 28 Dias (BOLETO 1X)",
        delivery: "20/02/2025",
        weight: "2845,014",
        vendor: "RONALDO SOUZA"
      };
      
      setExtractedData(mockExtractedData);
      
      toast({
        title: "Dados extraídos com sucesso!",
        description: "Os quantitativos e valores foram processados do PDF do ERP.",
      });
    }, 2500);
  };

  const handlePreview = () => {
    if (extractedData) {
      onUploadComplete(extractedData);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2 text-drystore-blue" />
          Upload do PDF do ERP
        </CardTitle>
        <CardDescription>
          Faça upload do PDF com quantitativos e valores gerado pelo seu sistema ERP
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!uploadedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-drystore-blue bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Arraste o PDF do ERP aqui ou clique para selecionar
            </h3>
            <p className="text-gray-500 mb-4">
              PDF com lista de quantitativos e valores do seu sistema ERP
            </p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              className="hidden"
              id="erp-file-upload"
            />
            <label htmlFor="erp-file-upload">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>Selecionar PDF do ERP</span>
              </Button>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <FileText className="w-8 h-8 text-drystore-blue mr-3" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              {isProcessing && (
                <div className="flex items-center text-yellow-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                  Extraindo dados...
                </div>
              )}
              {isAnalyzed && (
                <div className="flex items-center text-green-600">
                  <Check className="w-4 h-4 mr-2" />
                  Processado
                </div>
              )}
            </div>

            {isProcessing && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <p className="text-yellow-800">
                    Extraindo quantitativos e valores do PDF do ERP...
                  </p>
                </div>
              </div>
            )}

            {isAnalyzed && extractedData && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                  <p className="font-medium text-green-800">Dados Extraídos com Sucesso!</p>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <p>✓ Cliente: {extractedData.client}</p>
                  <p>✓ {extractedData.items.length} itens identificados</p>
                  <p>✓ Valor total: R$ {extractedData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p>✓ Condições de pagamento extraídas</p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setUploadedFile(null);
                  setIsAnalyzed(false);
                  setExtractedData(null);
                }}
              >
                Enviar Outro Arquivo
              </Button>
              
              <Button 
                onClick={handlePreview}
                disabled={!isAnalyzed}
                className="gradient-bg hover:opacity-90"
                size="lg"
              >
                <Eye className="w-4 h-4 mr-2" />
                Gerar Proposta
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ERPUploader;
