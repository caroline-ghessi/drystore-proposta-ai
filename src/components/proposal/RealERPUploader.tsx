import { useState, useEffect } from 'react';
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
  // Novos campos para revisão
  proposalId?: string;
  clientId?: string;
  needsClientEmail?: boolean;
  itemsCount?: number;
  confidenceScore?: number;
}

interface RealERPUploaderProps {
  onUploadComplete: (extractedData: ExtractedData) => void;
  productGroup?: string;
}

const RealERPUploader = ({ onUploadComplete, productGroup = 'geral' }: RealERPUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [processingStage, setProcessingStage] = useState('');
  const [processingStartTime, setProcessingStartTime] = useState(0);
  const [canCancel, setCanCancel] = useState(false);
  
  // CONTROLE GLOBAL ÚNICO - Impede QUALQUER nova tentativa
  const [isGloballyProcessing, setIsGloballyProcessing] = useState(false);
  const [currentProcessingId, setCurrentProcessingId] = useState('');
  const [maxAttempts] = useState(1); // APENAS 1 tentativa para eliminar recursão
  
  const { toast } = useToast();

  // RESET GLOBAL - Limpa TODOS os estados, mutex E cache local
  const forceReset = () => {
    console.log('🔄 RESET GLOBAL - Limpando estados, mutex E cache local');
    setUploadedFile(null);
    setIsProcessing(false);
    setIsAnalyzed(false);
    setExtractedData(null);
    setProcessingStage('');
    setProcessingStartTime(0);
    setCanCancel(false);
    
    // CRÍTICO: Limpar controle global
    setIsGloballyProcessing(false);
    setCurrentProcessingId('');
    
    toast({
      title: "Processamento cancelado",
      description: "Sistema pronto para processar novo PDF.",
    });
  };

  // CIRCUIT BREAKER INTELIGENTE - 120 segundos com avisos graduais
  useEffect(() => {
    const checkProcessingStatus = () => {
      if (isGloballyProcessing && processingStartTime > 0) {
        const elapsed = Date.now() - processingStartTime;
        
        // Aviso aos 60 segundos
        if (elapsed > 60000 && elapsed < 65000) {
          setProcessingStage('Processamento complexo detectado... Aguarde mais um momento');
        }
        
        // Aviso aos 90 segundos
        if (elapsed > 90000 && elapsed < 95000) {
          setProcessingStage('Quase finalizado... PDF complexo requer tempo adicional');
        }
        
        // Reset apenas após 120 segundos (2 minutos)
        if (elapsed > 120000) {
          console.log('🔄 CIRCUIT BREAKER: Timeout após 120 segundos - PDF muito complexo');
          setIsGloballyProcessing(false);
          setCurrentProcessingId('');
          setIsProcessing(false);
          setCanCancel(false);
          setProcessingStartTime(0);
          setProcessingStage('');
          
          toast({
            title: "Processamento interrompido",
            description: "PDF muito complexo. Tente dividir em páginas menores ou simplificar o documento.",
            variant: "destructive"
          });
        }
      }
    };
    
    const interval = setInterval(checkProcessingStatus, 5000); // Verificar a cada 5s
    return () => clearInterval(interval);
  }, [isGloballyProcessing, processingStartTime, toast]);

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

    // Validação do arquivo com limite aumentado
    if (file.size > 15 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 15MB para processamento.",
        variant: "destructive"
      });
      return;
    }

    // Verificar se o arquivo é realmente um PDF
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Apenas arquivos PDF são aceitos.",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
    await processFile(file); // NOVO: Função coordenadora única
  };


  // COORDENADOR ÚNICO - Elimina recursão completamente
  const processFile = async (file: File) => {
    // MUTEX GLOBAL - Impede qualquer nova tentativa
    if (isGloballyProcessing) {
      console.log('⚠️ MUTEX: Processamento já em andamento globalmente');
      toast({
        title: "Processamento em andamento",
        description: "Aguarde o processamento atual terminar.",
        variant: "destructive"
      });
      return;
    }

    // Validações básicas - Limite aumentado para suportar PDFs maiores
    if (file.size > 15 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 15MB para processamento.",
        variant: "destructive"
      });
      return;
    }

    // ATIVAR MUTEX GLOBAL
    const processingId = crypto.randomUUID();
    setIsGloballyProcessing(true);
    setCurrentProcessingId(processingId);
    setIsProcessing(true);
    setProcessingStartTime(Date.now());
    setCanCancel(true);

    console.log(`🚀 [${processingId}] PROCESSAMENTO ÚNICO INICIADO`);

    // TIMEOUT DE 120 SEGUNDOS - Alinhado com circuit breaker
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: Processamento excedeu 120 segundos')), 120 * 1000);
    });

    try {
      // Obter session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      // CONVERSÃO PARA BASE64 E JSON ESTRUTURADO
      setProcessingStage('Convertendo arquivo para processamento...');
      
      // Converter arquivo para base64
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove o prefixo data:application/pdf;base64,
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      // Payload JSON estruturado
      const payload = {
        fileData: fileBase64,
        fileName: file.name,
        fileSize: file.size,
        userId: session.user.id,
        productGroup: productGroup, // CORREÇÃO: Passar product group
        options: {
          extractionMethod: 'adobe_with_fallback',
          confidenceThreshold: 0.7
        }
      };
      
      console.log('🏷️ Enviando productGroup:', productGroup);
      
      setProcessingStage('Enviando para processamento orquestrado...');
      
      console.log(`📤 [${processingId}] Invocando edge function via supabase.functions.invoke`);
      
      const response = await Promise.race([
        supabase.functions.invoke('pdf-processing-orchestrator', {
          body: payload
        }),
        timeoutPromise
      ]) as any; // Type assertion para evitar erros TypeScript

      console.log(`📨 [${processingId}] Response:`, { 
        hasData: !!response.data, 
        hasError: !!response.error 
      });

      if (!response.error && response.data) {
        const result = response.data;
        
        if (result.success && result.data) {
          const extractedData = {
            client: result.data.formatted_data?.client_name || result.data.client_name || 'Cliente não identificado',
            proposalNumber: `PROP-${result.data.proposal_id?.slice(0, 8)}` || 'N/A',
            vendor: 'DryStore',
            items: result.data.formatted_data?.items || [], // Dados extraídos completos
            subtotal: result.data.formatted_data?.subtotal || 0,
            total: result.data.formatted_data?.valor_total || result.data.formatted_data?.total || 0,
            paymentTerms: result.data.formatted_data?.observacoes || 'A definir na revisão',
            delivery: 'A definir na revisão',
            // Dados adicionais para a revisão
            proposalId: result.data.proposal_id,
            clientId: result.data.client_id,
            needsClientEmail: !result.data.formatted_data?.client_email,
            itemsCount: result.data.items_count || 0,
            confidenceScore: result.final_confidence_score || 0
          };

          setExtractedData(extractedData);
          setIsAnalyzed(true);

          console.log(`✅ [${processingId}] Proposta criada com sucesso:`, {
            proposal_id: result.data.proposal_id,
            client_name: extractedData.client,
            items_count: result.data.items_count,
            confidence_score: result.final_confidence_score
          });

          toast({
            title: "🚀 Dados extraídos e salvos!",
            description: `Cliente: ${extractedData.client} • ${result.data.items_count} itens • Confiança: ${Math.round((result.final_confidence_score || 0) * 100)}%`,
          });
          
          return;
        } else if (result.success === false && result.processing_log) {
          // ERRO LIMPO: Não buscar dados antigos
          console.log(`❌ [${processingId}] Processamento falhou - sem fallback para dados antigos`);
          throw new Error(`Processamento falhou: ${result.processing_log?.errors?.join(', ') || 'Erro desconhecido'}`);
        }
      }

      // Se chegou aqui, há erro na resposta ou dados incompletos
      const errorMessage = response.error?.message || 'Dados incompletos na resposta';
      throw new Error(`Processamento falhou: ${errorMessage}`);

    } catch (error) {
      console.error(`❌ [${processingId}] Erro no processamento:`, error);
      
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      
      // FALLBACK BÁSICO - Dados mínimos para evitar travamento total
      if (errorMessage.includes('Timeout') || errorMessage.includes('timeout')) {
        console.log(`⏱️ [${processingId}] Timeout - Gerando dados mínimos`);
        
        const fallbackData = {
          client: 'Cliente não identificado',
          proposalNumber: 'N/A',
          vendor: 'N/A',
          items: [{
            description: 'Item não identificado - Revisar manualmente',
            quantity: 1,
            unit: 'un',
            unitPrice: 0,
            total: 0
          }],
          subtotal: 0,
          total: 0,
          paymentTerms: 'A definir',
          delivery: 'A definir'
        };

        setExtractedData(fallbackData);
        setIsAnalyzed(true);

        toast({
          title: "⚠️ Processamento com limitações",
          description: "PDF processado parcialmente. Revise os dados antes de prosseguir.",
          variant: "destructive"
        });
        
        return;
      }
      
      toast({
        title: "Erro no processamento",
        description: errorMessage,
        variant: "destructive"
      });
      
    } finally {
      // LIBERAR MUTEX SEMPRE
      console.log(`🔓 [${processingId}] Liberando mutex global`);
      setIsGloballyProcessing(false);
      setCurrentProcessingId('');
      setIsProcessing(false);
      setCanCancel(false);
      setProcessingStartTime(0);
    }
  };

  // FUNÇÕES ANTIGAS REMOVIDAS - Evita recursão completamente
  // processWithAdobeAPI e attemptLocalFallback foram eliminadas para evitar calls em cadeia

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
    setProcessingStartTime(0);
    setCanCancel(false);
    
    // LIMPAR MUTEX GLOBAL
    setIsGloballyProcessing(false);
    setCurrentProcessingId('');
  };


  // Cancelar processamento
  const cancelProcessing = () => {
    console.log(`❌ [${currentProcessingId}] Processamento cancelado manualmente pelo usuário`);
    setIsProcessing(false);
    setCanCancel(false);
    setProcessingStage('');
    setProcessingStartTime(0);
    
    // LIBERAR MUTEX GLOBAL
    setIsGloballyProcessing(false);
    setCurrentProcessingId('');
    
    toast({
      title: "Processamento cancelado",
      description: "Cancelado manualmente. Sistema pronto para novo PDF.",
    });
  };

  // REMOVIDO: Todas as funções auxiliares que causavam recursão foram eliminadas
  // O processamento agora é feito apenas pela função processFile() de forma linear

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2 text-drystore-blue" />
          Upload do PDF do ERP
        </CardTitle>
        <CardDescription>
          Sistema otimizado de extração de dados - Limite: 2MB para processamento seguro
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
              PDF com lista de quantitativos e valores do seu sistema ERP (até 2MB)
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
                   {currentProcessingId && ` • ID: ${currentProcessingId.slice(0, 8)}`}
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
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Loader2 className="animate-spin w-5 h-5 text-blue-600 mr-2" />
                    <p className="text-blue-800 font-medium">Processamento em Andamento</p>
                  </div>
                  {canCancel && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={cancelProcessing}
                      className="text-red-600 hover:text-red-700"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
                <p className="text-blue-700 text-sm">{processingStage}</p>
                <div className="mt-2 text-xs text-blue-600">
                  {processingStartTime > 0 && (
                    <div className="flex justify-between">
                      <span>Tempo decorrido: {Math.round((Date.now() - processingStartTime) / 1000)}s</span>
                      <span>Timeout em: {120 - Math.round((Date.now() - processingStartTime) / 1000)}s</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    PDFs complexos podem levar até 2 minutos para processar
                  </div>
                </div>
              </div>
            )}

            {isAnalyzed && extractedData && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                  <p className="font-medium text-green-800">Proposta Criada com Sucesso!</p>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  {extractedData.client && extractedData.client !== 'Cliente não identificado' && (
                    <p>✓ Cliente: {extractedData.client}</p>
                  )}
                  {extractedData.proposalId && (
                    <p>✓ Proposta ID: {extractedData.proposalId.slice(0, 8)}...</p>
                  )}
                  {extractedData.itemsCount !== undefined && (
                    <p>✓ {extractedData.itemsCount} itens extraídos e salvos</p>
                  )}
                  {extractedData.confidenceScore !== undefined && (
                    <p>✓ Confiança: {Math.round(extractedData.confidenceScore * 100)}%</p>
                  )}
                  {extractedData.needsClientEmail && (
                    <p className="text-amber-600">⚠️ Necessário adicionar email do cliente na revisão</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={resetUpload}
                  disabled={isProcessing}
                >
                  Enviar Outro Arquivo
                </Button>
                 
                {isGloballyProcessing && (
                  <Button 
                    variant="outline" 
                    onClick={forceReset}
                    className="text-red-600 hover:text-red-700"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Forçar Reset
                  </Button>
                )}
              </div>
              
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
