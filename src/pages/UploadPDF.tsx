
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Upload, FileText, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DrystoreCube from '@/components/DrystoreCube';

const UploadPDF = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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
    toast({
      title: "Arquivo carregado com sucesso!",
      description: "Agora você pode prosseguir para a análise técnica com IA.",
    });
  };

  const handleNext = () => {
    // Redireciona para análise técnica em vez de seleção de sistemas
    navigate('/technical-analysis');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <DrystoreCube size="md" />
          </div>
          <h1 className="text-3xl font-bold text-drystore-gray-dark mb-2">Upload do Projeto</h1>
          <p className="text-drystore-gray-medium">Faça upload do PDF com o projeto arquitetônico ou lista de materiais</p>
        </div>

        <Card className="border border-drystore-gray-light shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-drystore-gray-dark">
              <Upload className="w-5 h-5 mr-2 text-drystore-orange" />
              Upload de PDF
            </CardTitle>
            <CardDescription className="text-drystore-gray-medium">
              Aceita arquivos PDF de até 10MB com projetos arquitetônicos ou listas de materiais
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!uploadedFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-drystore-orange bg-orange-50' 
                    : 'border-drystore-gray-light hover:border-drystore-gray-medium'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-drystore-gray-medium mx-auto mb-4" />
                <h3 className="text-lg font-medium text-drystore-gray-dark mb-2">
                  Arraste o arquivo aqui ou clique para selecionar
                </h3>
                <p className="text-drystore-gray-medium mb-4">
                  Projetos arquitetônicos, plantas baixas ou listas de materiais em PDF
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer border-drystore-gray-medium text-drystore-gray-dark hover:bg-drystore-gray-light" asChild>
                    <span>Selecionar Arquivo</span>
                  </Button>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <FileText className="w-8 h-8 text-drystore-green-sustainable mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-drystore-gray-dark">{uploadedFile.name}</p>
                    <p className="text-sm text-drystore-gray-medium">
                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <Check className="w-5 h-5 text-drystore-green-sustainable" />
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setUploadedFile(null)}
                    className="border-drystore-gray-medium text-drystore-gray-dark hover:bg-drystore-gray-light"
                  >
                    Enviar Outro Arquivo
                  </Button>
                  
                  <Button 
                    onClick={handleNext}
                    className="bg-drystore-orange hover:bg-drystore-orange-light text-white"
                    size="lg"
                  >
                    Próximo: Análise Técnica
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

export default UploadPDF;
