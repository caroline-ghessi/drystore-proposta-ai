import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Upload, Camera, Sun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SolarBillUpload = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  
  // Sempre será foto agora (não há mais opção de PDF)
  const uploadType = 'photo';

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      console.log('📄 Uploading energy bill:', file.name, 'Type:', uploadType);
      
      // Upload do arquivo para o storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('energy-bills')
        .upload(fileName, file);

      if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      console.log('✅ File uploaded to storage:', fileName);

      // Criar registro na tabela energia_bills_uploads
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: billRecord, error: insertError } = await supabase
        .from('energia_bills_uploads')
        .insert({
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          extraction_status: 'pending',
          user_id: user?.id
        })
        .select()
        .single();

      if (insertError || !billRecord) {
        throw new Error(`Erro ao criar registro: ${insertError?.message}`);
      }

      console.log('✅ Bill record created:', billRecord.id);

      // Processar via edge function
      const { data: processingResult, error: processingError } = await supabase.functions
        .invoke('process-energy-bill', {
          body: { billId: billRecord.id }
        });

      if (processingError || !processingResult?.success) {
        throw new Error(`Erro no processamento: ${processingError?.message || 'Processamento falhou'}`);
      }

      toast({
        title: "Upload realizado com sucesso!",
        description: "Foto processada e dados extraídos com sucesso",
      });

      console.log('✅ Processing completed:', processingResult.extractedData);

      // Processar histórico de consumo para estrutura esperada
      const mesesMap: { [key: string]: number } = {
        'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3,
        'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7,
        'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
      };

      const consumoHistoricoProcessado = Array(12).fill(0).map((_, index) => ({
        mes: Object.keys(mesesMap)[index],
        consumo: 0
      }));

      // Mapear dados extraídos para os meses corretos
      if (processingResult.extractedData.consumo_historico && Array.isArray(processingResult.extractedData.consumo_historico)) {
        processingResult.extractedData.consumo_historico.forEach((item: any) => {
          const mesNormalizado = item.mes?.toLowerCase();
          const mesIndex = mesesMap[mesNormalizado];
          if (mesIndex !== undefined && item.consumo > 0) {
            consumoHistoricoProcessado[mesIndex] = {
              mes: Object.keys(mesesMap)[mesIndex],
              consumo: item.consumo
            };
          }
        });
      }

      // Redirecionar para validação com dados reais extraídos
      navigate('/create-proposal/energia-solar/validate', {
        state: {
          extractedData: {
            concessionaria: processingResult.extractedData.concessionaria || 'CEEE',
            tarifa_kwh: processingResult.extractedData.tarifa_kwh || 0.75,
            consumo_historico: consumoHistoricoProcessado,
            nome: processingResult.extractedData.nome_cliente || '',
            email: processingResult.extractedData.email || '',
            endereco: processingResult.extractedData.endereco || '',
            cidade: processingResult.extractedData.cidade || 'PORTO ALEGRE',
            estado: processingResult.extractedData.estado || 'RS',
            uploadType,
            billId: billRecord.id
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
                Foto da Conta de Luz
              </h1>
              <p className="text-gray-600 mt-1">
                Envie uma foto da sua conta de luz para extração automática dos dados
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
              <div className="bg-green-100 p-8 rounded-lg mx-auto mb-6 w-fit">
                <Camera className="w-16 h-16 text-green-600" />
              </div>
              
              <h3 className="text-2xl font-semibold mb-4">
                Enviar Foto da Conta de Luz
              </h3>
              
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Tire uma foto clara da sua conta de luz. Nossa IA irá extrair automaticamente todos os dados necessários como consumo histórico, tarifas e informações da concessionária.
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
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                
                <Button
                  onClick={() => document.getElementById('bill-upload')?.click()}
                  disabled={uploading}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Processando foto...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Enviar Foto
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500">
                  Formatos aceitos: JPG, PNG, HEIC • Máximo 5MB
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