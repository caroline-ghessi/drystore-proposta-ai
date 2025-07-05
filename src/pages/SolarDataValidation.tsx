import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Edit3, Sun } from 'lucide-react';
import { ConsumoHistoricoGrid } from '@/components/solar/ConsumoHistoricoGrid';
import { NumericInput } from '@/components/solar/NumericInput';
import { useToast } from '@/hooks/use-toast';
import type { DadosClienteSolar } from '@/types/solarClient';
import { SolarCalculationService } from '@/services/solarCalculationService';

const SolarDataValidation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const extractedData = location.state?.extractedData;
  const [dados, setDados] = useState<DadosClienteSolar>({
    nome: extractedData?.nome || '',
    email: extractedData?.email || '',
    telefone: extractedData?.telefone || '',
    endereco: extractedData?.endereco || '',
    empresa: extractedData?.empresa || '',
    cidade: extractedData?.cidade || 'Belo Horizonte',
    estado: extractedData?.estado || 'MG',
    concessionaria: extractedData?.concessionaria || 'CEMIG',
    tarifaKwh: extractedData?.tarifa_kwh || 0.65,
    consumoHistorico: extractedData?.consumo_historico || [],
    tipoTelhado: extractedData?.tipo_telhado || 'ceramico',
    areaDisponivel: extractedData?.area_disponivel || 100
  });

  const handleCalculate = async () => {
    setLoading(true);
    
    try {
      console.log('🌞 Prosseguindo para validação técnica com dados validados');
      
      toast({
        title: "Dados validados com sucesso!",
        description: `Prosseguindo para configuração técnica do sistema solar`,
      });

      // Redirecionar para validação técnica
      navigate('/create-proposal/energia-solar/technical-validation', {
        state: { extractedData: dados }
      });
    } catch (error) {
      console.error('❌ Erro ao processar dados:', error);
      
      toast({
        title: "Erro ao processar dados",
        description: error instanceof Error ? error.message : "Erro inesperado ao processar dados solares",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularMedia = () => {
    const total = dados.consumoHistorico.reduce((sum, item) => sum + (item.consumo || 0), 0);
    return total / 12;
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/create-proposal/energia-solar/upload')}
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
              <h1 className="text-3xl font-bold text-gray-900">Validar Dados Extraídos</h1>
              <p className="text-gray-600 mt-1">
                Confirme se os dados extraídos estão corretos antes de calcular o sistema
              </p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Passo 3 de 5</span>
            <span>60% concluído</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full transition-all duration-300" style={{ width: '60%' }}></div>
          </div>
        </div>

        {/* Status Card */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-green-800">Dados extraídos com sucesso!</h3>
                <p className="text-green-600 text-sm">
                  Fonte: {extractedData?.uploadType === 'photo' ? 'Foto da conta de luz' : 'PDF da conta de luz'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Dados do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit3 className="w-5 h-5 mr-2" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={dados.nome}
                  onChange={(e) => setDados({...dados, nome: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={dados.email}
                  onChange={(e) => setDados({...dados, email: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={dados.endereco}
                  onChange={(e) => setDados({...dados, endereco: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dados da Conta de Luz */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit3 className="w-5 h-5 mr-2" />
                Dados da Conta de Luz
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="concessionaria">Concessionária</Label>
                <Input
                  id="concessionaria"
                  value={dados.concessionaria}
                  onChange={(e) => setDados({...dados, concessionaria: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="tarifa">Tarifa kWh (R$)</Label>
                <NumericInput
                  id="tarifa"
                  value={dados.tarifaKwh}
                  onChange={(value) => setDados({...dados, tarifaKwh: value})}
                  suffix="R$/kWh"
                  decimals={3}
                  min={0.1}
                  max={2}
                />
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-2">Resumo do Consumo</p>
                <p className="text-lg font-bold text-blue-900">
                  Média: {calcularMedia().toFixed(0)} kWh/mês
                </p>
                <p className="text-sm text-blue-600">
                  Total anual: {(calcularMedia() * 12).toFixed(0)} kWh
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Histórico de Consumo */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Edit3 className="w-5 h-5 mr-2" />
              Histórico de Consumo (12 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ConsumoHistoricoGrid
              consumo={dados.consumoHistorico}
              onChange={(consumo) => setDados({...dados, consumoHistorico: consumo})}
            />
          </CardContent>
        </Card>

        {/* Botão Calcular */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleCalculate}
            disabled={loading}
            size="lg"
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-12"
          >
            {loading ? (
              <>
                <div className="animate-spin w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Calculando Sistema...
              </>
            ) : (
              <>
                <Sun className="w-5 h-5 mr-2" />
                Prosseguir para Validação Técnica
              </>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default SolarDataValidation;