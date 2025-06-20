
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Upload, FileText, Check, AlertCircle, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UploadDocument = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

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
        description: "Por favor, selecione apenas arquivos PDF.",
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
    simulateAnalysis();
  };

  const simulateAnalysis = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsAnalyzed(true);
      toast({
        title: "Documento analisado com sucesso!",
        description: "A IA identificou os elementos do projeto.",
      });
    }, 3000);
  };

  const handleNext = () => {
    navigate('/select-systems');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/proposal-upload-choice')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upload do Projeto Arquitetônico</h1>
            <p className="text-gray-600 mt-1">A IA fará a quantificação automática dos materiais</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Passo 3 de 4</span>
            <span>50% concluído</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-drystore-blue h-2 rounded-full transition-all duration-300" style={{ width: '50%' }}></div>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-drystore-blue" />
              Projeto Arquitetônico
            </CardTitle>
            <CardDescription>
              Upload de plantas baixas, projetos técnicos ou documentos arquitetônicos em PDF (até 10MB)
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
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Arraste o projeto arquitetônico aqui ou clique para selecionar
                </h3>
                <p className="text-gray-500 mb-4">
                  Plantas baixas, projetos técnicos, detalhamentos construtivos
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>Selecionar Projeto</span>
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
                      Analisando...
                    </div>
                  )}
                  {isAnalyzed && (
                    <div className="flex items-center text-green-600">
                      <Check className="w-4 h-4 mr-2" />
                      Analisado
                    </div>
                  )}
                </div>

                {isProcessing && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                      <p className="text-yellow-800">
                        Nossa IA está analisando o documento para identificar materiais e sistemas...
                      </p>
                    </div>
                  </div>
                )}

                {isAnalyzed && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Check className="w-5 h-5 text-green-600 mr-2" />
                      <p className="font-medium text-green-800">Análise Concluída!</p>
                    </div>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>✓ Área total identificada: 180m²</p>
                      <p>✓ Sistemas detectados: Cobertura, Revestimento, Isolamento</p>
                      <p>✓ 15 materiais catalogados automaticamente</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setUploadedFile(null)}
                  >
                    Enviar Outro Arquivo
                  </Button>
                  
                  <Button 
                    onClick={handleNext}
                    disabled={!isAnalyzed}
                    className="gradient-bg hover:opacity-90"
                    size="lg"
                  >
                    Próximo: Selecionar Sistemas
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UploadDocument;
