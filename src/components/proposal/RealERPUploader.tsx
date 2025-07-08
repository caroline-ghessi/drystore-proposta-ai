import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Check, AlertCircle, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ExtractedData {
  id?: string;
  client?: string;
  vendor?: string;
  proposalNumber?: string;
  date?: string;
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
    setProcessingStage('Iniciando extração de dados...');

    try {
      // Validação prévia do tamanho do arquivo
      if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new Error('Arquivo muito grande. O tamanho máximo é 10MB.');
      }

      // Obter token de autenticação do Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      setProcessingStage('Preparando arquivo para extração...');
      
      console.log('📤 Iniciando processamento de PDF');
      console.log('📄 Arquivo:', file.name, 'Tamanho:', file.size, 'Tipo:', file.type);

      setProcessingStage('Processando PDF - Tentando Adobe PDF Services...');

      // Criar FormData para envio do arquivo
      const formData = new FormData();
      formData.append('file', file);

      console.log('🚀 Iniciando processamento modular...');
      
      // Converter arquivo para base64
      const arrayBuffer = await file.arrayBuffer();
      const fileBase64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      const response = await fetch(
        `https://mlzgeceiinjwpffgsxuy.supabase.co/functions/v1/pdf-processing-orchestrator`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            file_data: fileBase64,
            file_name: file.name,
            user_id: session.user.id,
            processing_options: {
              extraction_method: 'adobe'
            }
          }),
        }
      );

      console.log('📨 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro de conexão' }));
        console.error('❌ Adobe extraction error:', errorData);
        
        // Determinar tipo de erro
        const errorMessage = errorData.error || errorData.technical_details || 'Falha na extração de dados';
        console.log('🔍 Analisando tipo de erro:', errorMessage);
        
        // Se for erro de configuração Adobe, informar adequadamente
        if (errorMessage.includes('Adobe') || errorMessage.includes('credentials') || 
            errorMessage.includes('authentication') || errorMessage.includes('401')) {
          console.log('⚠️ Erro de configuração Adobe detectado');
          setProcessingStage('Adobe indisponível - Tentando processamento local...');
          
          // Dar um tempo para o usuário ver a mensagem
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('📊 Resultado completo:', result);

      if (!result.success) {
        throw new Error(result.data?.error || result.error || 'Falha na extração de dados');
      }

      // Extrair dados da resposta modular
      const proposalData = result.data.formatted_data;
      const confidenceScore = result.final_confidence_score;
      const processingLog = result.processing_log;
      
      console.log('✅ Processamento modular bem-sucedido:', {
        confidence_score: confidenceScore,
        items_count: result.data.items_count,
        proposal_id: result.data.proposal_id,
        stages: processingLog.stages.map(s => `${s.stage}: ${s.success ? '✅' : '❌'}`)
      });

      // Converter para formato esperado pelo componente
      const extractedData = {
        client: proposalData.client_name || 'Cliente não identificado',
        proposalNumber: proposalData.proposal_number || 'N/A',
        vendor: proposalData.vendor_name || 'N/A',
        items: proposalData.items || [],
        subtotal: proposalData.subtotal || 0,
        total: proposalData.valor_total || 0,
        paymentTerms: proposalData.observacoes || 'N/A',
        delivery: 'N/A'
      };

      setExtractedData(extractedData);
      setIsAnalyzed(true);
      setIsProcessing(false);

      // Feedback baseado no processamento modular
      let processingIcon = '✅';
      let processingTitle = '';
      let processingMessage = '';
      
      const totalStages = processingLog.stages.length;
      const successfulStages = processingLog.stages.filter(s => s.success).length;
      
      if (confidenceScore >= 90) {
        processingIcon = '🚀';
        processingTitle = 'PDF processado com alta precisão!';
        processingMessage = `${result.data.items_count} itens extraídos com confiança de ${confidenceScore}%.`;
      } else if (confidenceScore >= 70) {
        processingIcon = '⚙️';
        processingTitle = 'PDF processado com boa precisão!';
        processingMessage = `${result.data.items_count} itens extraídos com confiança de ${confidenceScore}%.`;
      } else if (confidenceScore >= 50) {
        processingIcon = '🔍';
        processingTitle = 'PDF processado com precisão moderada!';
        processingMessage = `${result.data.items_count} itens extraídos. Revise os dados antes de prosseguir.`;
      } else {
        processingIcon = '⚠️';
        processingTitle = 'PDF processado com baixa precisão!';
        processingMessage = `${result.data.items_count} itens extraídos. Recomenda-se revisão manual.`;
      }

      toast({
        title: `${processingIcon} ${processingTitle}`,
        description: processingMessage,
      });

    } catch (error) {
      console.error('❌ Error processing PDF:', error);
      setIsProcessing(false);
      
      // Determinar tipo de erro para feedback adequado
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao processar PDF";
      
      // Se o erro contém "fallback local também falhou", isso significa que ambos os métodos falharam
      if (errorMessage.includes('fallback local também falhou') || 
          errorMessage.includes('Tanto Adobe quanto processamento local falharam')) {
        
        toast({
          title: "Falha na extração",
          description: "Não foi possível extrair dados do PDF. Verifique se o arquivo está correto.",
          variant: "destructive"
        });
        
      } else if (errorMessage.includes('Adobe indisponível') || 
                 errorMessage.includes('Adobe PDF Services não configurado')) {
        
        // Neste caso, o processamento local pode ter funcionado
        // Não mostrar erro ainda, vamos aguardar o resultado
        console.log('⚠️ Adobe indisponível, aguardando fallback local...');
        return; // Não mostrar erro ainda
        
      } else {
        // Outros tipos de erro
        let errorTitle = "Erro no processamento";
        let errorDescription = errorMessage;
        
        if (errorMessage.includes('very large') || errorMessage.includes('muito grande')) {
          errorTitle = "Arquivo muito grande";
          errorDescription = "Reduza o tamanho do arquivo para menos de 10MB.";
        } else if (errorMessage.includes('formato')) {
          errorTitle = "Formato inválido";
          errorDescription = "Certifique-se que o PDF não está corrompido.";
        }
        
        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "destructive"
        });
      }
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
          Sistema inteligente de extração de dados com Adobe PDF Services e processamento local
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
                  {extractedData.client && extractedData.client !== 'Cliente não identificado' && (
                    <p>✓ Cliente: {extractedData.client}</p>
                  )}
                  {extractedData.proposalNumber && extractedData.proposalNumber !== 'N/A' && (
                    <p>✓ Proposta: {extractedData.proposalNumber}</p>
                  )}
                  <p>✓ {extractedData.items.length} itens identificados</p>
                  <p>✓ Valor total: R$ {extractedData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  {extractedData.paymentTerms && extractedData.paymentTerms !== 'N/A' && (
                    <p>✓ Condições: {extractedData.paymentTerms}</p>
                  )}
                  {extractedData.vendor && extractedData.vendor !== 'N/A' && (
                    <p>✓ Vendedor: {extractedData.vendor}</p>
                  )}
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
