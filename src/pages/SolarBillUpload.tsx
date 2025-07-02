import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, Camera, Sun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SolarBillUpload = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  
  const uploadType = location.state?.type || 'pdf';
  const isPhoto = uploadType === 'photo';

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      // TODO: Implementar upload para tabela energia_bills_uploads
      console.log('📄 Uploading energy bill:', file.name, 'Type:', uploadType);
      
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Upload realizado com sucesso!",
        description: `${isPhoto ? 'Foto' : 'PDF'} processado e dados extraídos`,
      });

      // Redirecionar para validação com dados mockados
      navigate('/create-proposal/energia-solar/validate', {
        state: {
          extractedData: {
            concessionaria: 'CEMIG',
            tarifa_kwh: 0.65,
            consumo_historico: [
              { mes: 'Janeiro', consumo: 350 },
              { mes: 'Fevereiro', consumo: 320 },
              { mes: 'Março', consumo: 380 },
              { mes: 'Abril', consumo: 340 },
              { mes: 'Maio', consumo: 360 },
              { mes: 'Junho', consumo: 290 },
              { mes: 'Julho', consumo: 310 },
              { mes: 'Agosto', consumo: 330 },
              { mes: 'Setembro', consumo: 365 },
              { mes: 'Outubro', consumo: 385 },
              { mes: 'Novembro', consumo: 395 },
              { mes: 'Dezembro', consumo: 410 }
            ],
            nome: 'João Silva',
            email: 'joao@email.com',
            endereco: 'Rua das Flores, 123 - Belo Horizonte/MG',
            uploadType
          }
        }
      });
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Erro ao processar arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/create-proposal/energia-solar/input-choice')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg mr-4">
              <Sun className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isPhoto ? 'Foto da Conta de Luz' : 'Upload PDF da Conta'}
              </h1>
              <p className="text-gray-600 mt-1">
                Envie sua conta de luz para extração automática dos dados
              </p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Passo 3 de 4</span>
            <span>75% concluído</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full transition-all duration-300" style={{ width: '75%' }}></div>
          </div>
        </div>

        {/* Upload Card */}
        <Card className="border-2 border-dashed border-gray-300 hover:border-yellow-500 transition-colors">
          <CardContent className="p-12">
            <div className="text-center">
              <div className={`${isPhoto ? 'bg-green-100' : 'bg-blue-100'} p-8 rounded-lg mx-auto mb-6 w-fit`}>
                {isPhoto ? (
                  <Camera className="w-16 h-16 text-green-600" />
                ) : (
                  <FileText className="w-16 h-16 text-blue-600" />
                )}
              </div>
              
              <h3 className="text-2xl font-semibold mb-4">
                {isPhoto ? 'Enviar Foto da Conta' : 'Fazer Upload do PDF'}
              </h3>
              
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {isPhoto 
                  ? 'Tire uma foto clara da sua conta de luz. Nossa IA irá extrair automaticamente todos os dados necessários.'
                  : 'Selecione o arquivo PDF da sua conta de luz. Nossa IA irá extrair automaticamente o histórico de consumo e tarifas.'
                }
              </p>

              <div className="space-y-4 mb-8">
                <p className="text-sm text-gray-500">O que será extraído:</p>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>• Consumo dos últimos 12 meses</div>
                  <div>• Tarifa kWh atual</div>
                  <div>• Concessionária de energia</div>
                  <div>• Dados do cliente</div>
                </div>
              </div>

              <div className="space-y-4">
                <input
                  type="file"
                  id="bill-upload"
                  accept={isPhoto ? "image/*" : ".pdf"}
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                
                <Button
                  onClick={() => document.getElementById('bill-upload')?.click()}
                  disabled={uploading}
                  size="lg"
                  className={`${isPhoto ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-8`}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      {isPhoto ? 'Enviar Foto' : 'Fazer Upload'}
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500">
                  {isPhoto 
                    ? 'Formatos aceitos: JPG, PNG, HEIC • Máximo 10MB'
                    : 'Formato aceito: PDF • Máximo 10MB'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🔒 Seus dados são processados com segurança e não são armazenados permanentemente</p>
        </div>
      </div>
    </Layout>
  );
};

export default SolarBillUpload;