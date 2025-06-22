
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Check, AlertCircle, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AdobeUploadClient, getAdobeCredentials } from '@/utils/adobeUpload';

interface ExtractedData {
  id?: string;
  client?: string;
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  total: number;
  paymentTerms?: string;
  delivery?: string;
  vendor?: string;
}

interface RealERPUploaderProps {
  onUploadComplete: (extractedData: ExtractedData) => void;
}

const RealERPUploader = ({ onUploadComplete }: RealERPUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [processingStage, setProcessingStage] = useState('');
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

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas arquivos PDF do ERP.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
    await processWithAdobeAPI(file);
  };

  const processWithAdobeAPI = async (file: File) => {
    setIsProcessing(true);
    setProcessingStage('Conectando com Adobe API...');

    try {
      // Obter token de autenticação do Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      // Upload do arquivo diretamente via Edge Function (sem precisar das credenciais no frontend)
      setProcessingStage('Enviando PDF para Adobe via backend...');
      
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch(
        `https://mlzgeceiinjwpffgsxuy.supabase.co/functions/v1/upload-to-adobe`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({ error: 'Erro de conexão' }));
        throw new Error(errorData.error || 'Falha no upload');
      }

      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Falha no upload');
      }

      const assetID = uploadResult.assetID;
      console.log('Asset ID recebido:', assetID);

      // Chamar Edge Function para processar o assetID
      setProcessingStage('Processando dados extraídos...');
      
      const response = await fetch(
        `https://mlzgeceiinjwpffgsxuy.supabase.co/functions/v1/process-adobe-extraction`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assetID: assetID,
            fileName: file.name,
            fileSize: file.size
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro de conexão' }));
        throw new Error(errorData.error || 'Falha no processamento');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Falha na extração de dados');
      }

      setExtractedData(result.data);
      setIsAnalyzed(true);
      setIsProcessing(false);

      toast({
        title: "PDF processado com sucesso!",
        description: `${result.data.items.length} itens extraídos automaticamente.`,
      });

    } catch (error) {
      console.error('Error processing PDF:', error);
      setIsProcessing(false);
      
      toast({
        title: "Erro no processamento",
        description: error instanceof Error ? error.message : "Erro desconhecido ao processar PDF",
        variant: "destructive"
      });
    }
  };

  const handlePreview = () => {
    if (extractedData) {
      onUploadComplete(extractedData);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setIsProcessing(false);
    setIsAnalyzed(false);
    setExtractedData(null);
    setProcessingStage('');
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2 text-drystore-blue" />
          Upload do PDF do ERP
        </CardTitle>
        <CardDescription>
          A IA extrairá automaticamente quantitativos e valores do PDF do seu sistema ERP
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
                <div className="flex items-center text-blue-600">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Processando...
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
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <Loader2 className="animate-spin w-5 h-5 text-blue-600 mr-2" />
                  <p className="text-blue-800 font-medium">Processamento em Andamento</p>
                </div>
                <p className="text-blue-700 text-sm">{processingStage}</p>
                <div className="mt-2 text-xs text-blue-600">
                  Este processo pode levar alguns minutos...
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
                  {extractedData.client && <p>✓ Cliente: {extractedData.client}</p>}
                  <p>✓ {extractedData.items.length} itens identificados</p>
                  <p>✓ Valor total: R$ {extractedData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  {extractedData.paymentTerms && <p>✓ Condições: {extractedData.paymentTerms}</p>}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={resetUpload}
                disabled={isProcessing}
              >
                Enviar Outro Arquivo
              </Button>
              
              <Button 
                onClick={handlePreview}
                disabled={!isAnalyzed || isProcessing}
                className="gradient-bg hover:opacity-90"
                size="lg"
              >
                <Eye className="w-4 h-4 mr-2" />
                Revisar e Gerar Proposta
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealERPUploader;
