import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Sun, Zap, Calculator, DollarSign, TrendingUp } from 'lucide-react';
import { NumericInput } from '@/components/solar/NumericInput';
import { useToast } from '@/hooks/use-toast';
import { SolarCalculationService } from '@/services/solarCalculationService';
import { supabase } from '@/integrations/supabase/client';

interface Inversor {
  id: string;
  fabricante: string;
  modelo: string;
  potencia_kw: number;
  eficiencia: number;
  preco_unitario: number;
  faixa_potencia_min_kwp: number;
  faixa_potencia_max_kwp: number;
}

interface Painel {
  id: string;
  fabricante: string;
  modelo: string;
  potencia_wp: number;
  preco_unitario: number;
  largura_m: number;
  altura_m: number;
}

interface SistemaValidacao {
  potencia_kwp: number;
  painel_selecionado: Painel | null;
  quantidade_paineis: number;
  inversor_selecionado: Inversor | null;
  area_ocupada_m2: number;
  custos: {
    paineis: number;
    inversor: number;
    estrutura: number;
    eletrico: number;
    mao_obra: number;
    margem_comercial: number;
    total: number;
  };
  financeiro: {
    geracao_anual_kwh: number;
    economia_anual: number;
    payback_anos: number;
    economia_25_anos: number;
  };
}

const SolarSystemValidation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [calculatingCosts, setCalculatingCosts] = useState(false);
  
  const dadosCliente = location.state?.extractedData;
  const [paineis, setPaineis] = useState<Painel[]>([]);
  const [inversores, setInversores] = useState<Inversor[]>([]);
  const [sistema, setSistema] = useState<SistemaValidacao>({
    potencia_kwp: 0,
    painel_selecionado: null,
    quantidade_paineis: 0,
    inversor_selecionado: null,
    area_ocupada_m2: 0,
    custos: {
      paineis: 0,
      inversor: 0,
      estrutura: 0,
      eletrico: 0,
      mao_obra: 0,
      margem_comercial: 0,
      total: 0
    },
    financeiro: {
      geracao_anual_kwh: 0,
      economia_anual: 0,
      payback_anos: 0,
      economia_25_anos: 0
    }
  });

  useEffect(() => {
    if (!dadosCliente) {
      navigate('/create-proposal/energia-solar/validate');
      return;
    }
    
    carregarDadosIniciais();
  }, [dadosCliente]);

  const carregarDadosIniciais = async () => {
    try {
      // Calcular dimensionamento inicial
      const consumoMedio = calcularConsumoMedio();
      const dimensionamento = await SolarCalculationService.dimensionarSistema(
        consumoMedio, 
        dadosCliente.estado || 'RS'
      );

      // Carregar painéis disponíveis
      const { data: paineisData } = await supabase
        .from('paineis_solares')
        .select('*')
        .eq('ativo', true)
        .order('preco_unitario', { ascending: true });

      // Carregar inversores disponíveis
      const { data: inversoresData } = await supabase
        .from('inversores_solares')
        .select('*')
        .eq('ativo', true)
        .gte('faixa_potencia_max_kwp', dimensionamento.potencia_necessaria_kwp)
        .order('preco_unitario', { ascending: true });

      if (paineisData) setPaineis(paineisData);
      if (inversoresData) setInversores(inversoresData);

      // Selecionar painel recomendado (melhor custo-benefício)
      const painelRecomendado = paineisData?.[0];
      const inversorRecomendado = inversoresData?.[0];

      if (painelRecomendado && inversorRecomendado) {
        const quantidade = Math.ceil((dimensionamento.potencia_necessaria_kwp * 1000) / painelRecomendado.potencia_wp);
        const potenciaReal = (quantidade * painelRecomendado.potencia_wp) / 1000;
        const areaOcupada = quantidade * painelRecomendado.largura_m * painelRecomendado.altura_m;

        setSistema(prev => ({
          ...prev,
          potencia_kwp: potenciaReal,
          painel_selecionado: painelRecomendado,
          quantidade_paineis: quantidade,
          inversor_selecionado: inversorRecomendado,
          area_ocupada_m2: areaOcupada
        }));

        // Calcular custos
        await calcularCustos(painelRecomendado, inversorRecomendado, quantidade, potenciaReal);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Erro ao inicializar validação técnica",
        variant: "destructive",
      });
    }
  };

  const calcularConsumoMedio = () => {
    const total = dadosCliente.consumoHistorico?.reduce((sum: number, item: any) => sum + (item.consumo || 0), 0) || 0;
    return total / 12;
  };

  const calcularCustos = async (painel: Painel, inversor: Inversor, quantidade: number, potenciaKwp: number) => {
    setCalculatingCosts(true);
    
    try {
      const custosDetalhados = await SolarCalculationService.calcularCustosDetalhados(
        painel,
        inversor,
        quantidade,
        potenciaKwp
      );

      const consumoAnualKwh = calcularConsumoMedio() * 12;
      const financeiro = await SolarCalculationService.calcularFinanceiroSimplificado(
        custosDetalhados.total, 
        potenciaKwp, 
        custosDetalhados.geracao_anual_kwh,
        consumoAnualKwh, 
        dadosCliente.tarifaKwh
      );

      setSistema(prev => ({
        ...prev,
        custos: custosDetalhados,
        financeiro
      }));
    } catch (error) {
      console.error('❌ Erro ao calcular custos:', error);
    } finally {
      setCalculatingCosts(false);
    }
  };

  const handlePainelChange = async (painelId: string) => {
    const painel = paineis.find(p => p.id === painelId);
    if (!painel) return;

    const quantidade = Math.ceil((sistema.potencia_kwp * 1000) / painel.potencia_wp);
    const potenciaReal = (quantidade * painel.potencia_wp) / 1000;
    const areaOcupada = quantidade * painel.largura_m * painel.altura_m;

    setSistema(prev => ({
      ...prev,
      painel_selecionado: painel,
      quantidade_paineis: quantidade,
      potencia_kwp: potenciaReal,
      area_ocupada_m2: areaOcupada
    }));

    if (sistema.inversor_selecionado) {
      await calcularCustos(painel, sistema.inversor_selecionado, quantidade, potenciaReal);
    }
  };

  const handleInversorChange = async (inversorId: string) => {
    const inversor = inversores.find(i => i.id === inversorId);
    if (!inversor || !sistema.painel_selecionado) return;

    setSistema(prev => ({
      ...prev,
      inversor_selecionado: inversor
    }));

    await calcularCustos(sistema.painel_selecionado, inversor, sistema.quantidade_paineis, sistema.potencia_kwp);
  };

  const handlePotenciaChange = async (novaPotencia: number) => {
    if (!sistema.painel_selecionado || !sistema.inversor_selecionado) return;

    const quantidade = Math.ceil((novaPotencia * 1000) / sistema.painel_selecionado.potencia_wp);
    const potenciaReal = (quantidade * sistema.painel_selecionado.potencia_wp) / 1000;
    const areaOcupada = quantidade * sistema.painel_selecionado.largura_m * sistema.painel_selecionado.altura_m;

    setSistema(prev => ({
      ...prev,
      potencia_kwp: potenciaReal,
      quantidade_paineis: quantidade,
      area_ocupada_m2: areaOcupada
    }));

    await calcularCustos(sistema.painel_selecionado, sistema.inversor_selecionado, quantidade, potenciaReal);
  };

  const handleGerarProposta = async () => {
    if (!sistema.painel_selecionado || !sistema.inversor_selecionado) {
      toast({
        title: "Validação incompleta",
        description: "Selecione o painel e inversor antes de gerar a proposta",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const dadosCompletos = {
        ...dadosCliente,
        sistema_validado: sistema
      };

      const propostaSolar = await SolarCalculationService.gerarPropostaCompleta(dadosCompletos);
      
      toast({
        title: "Sistema validado com sucesso!",
        description: `Proposta gerada com sistema de ${sistema.potencia_kwp.toFixed(1)}kWp`,
      });

      navigate(`/proposal-view/${propostaSolar.proposal.id}`);
    } catch (error) {
      console.error('❌ Erro ao gerar proposta:', error);
      
      toast({
        title: "Erro ao gerar proposta",
        description: error instanceof Error ? error.message : "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!dadosCliente) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/create-proposal/energia-solar/validate')}
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
              <h1 className="text-3xl font-bold text-gray-900">Validação Técnica</h1>
              <p className="text-gray-600 mt-1">
                Revise e ajuste as especificações do sistema fotovoltaico
              </p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Passo 4 de 5</span>
            <span>80% concluído</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full transition-all duration-300" style={{ width: '80%' }}></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Dimensionamento e Componentes */}
          <div className="space-y-6">
            {/* Dimensionamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  Dimensionamento do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="potencia">Potência do Sistema (kWp)</Label>
                  <NumericInput
                    id="potencia"
                    value={sistema.potencia_kwp}
                    onChange={handlePotenciaChange}
                    suffix="kWp"
                    decimals={2}
                    min={1}
                    max={50}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Quantidade de Painéis:</span>
                    <p className="font-semibold">{sistema.quantidade_paineis} unidades</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Área Ocupada:</span>
                    <p className="font-semibold">{sistema.area_ocupada_m2.toFixed(1)} m²</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seleção de Painéis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sun className="w-5 h-5 mr-2" />
                  Painel Solar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="painel">Modelo do Painel</Label>
                  <Select value={sistema.painel_selecionado?.id} onValueChange={handlePainelChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o painel" />
                    </SelectTrigger>
                    <SelectContent>
                      {paineis.map(painel => (
                        <SelectItem key={painel.id} value={painel.id}>
                          {painel.fabricante} {painel.modelo} - {painel.potencia_wp}Wp - R$ {painel.preco_unitario.toLocaleString('pt-BR')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {sistema.painel_selecionado && (
                  <div className="bg-blue-50 p-4 rounded-lg text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>Potência: {sistema.painel_selecionado.potencia_wp}Wp</div>
                      <div>Dimensões: {sistema.painel_selecionado.largura_m}x{sistema.painel_selecionado.altura_m}m</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seleção de Inversor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Inversor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="inversor">Modelo do Inversor</Label>
                  <Select value={sistema.inversor_selecionado?.id} onValueChange={handleInversorChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o inversor" />
                    </SelectTrigger>
                    <SelectContent>
                      {inversores.map(inversor => (
                        <SelectItem key={inversor.id} value={inversor.id}>
                          {inversor.fabricante} {inversor.modelo} - {inversor.potencia_kw}kW - R$ {inversor.preco_unitario.toLocaleString('pt-BR')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {sistema.inversor_selecionado && (
                  <div className="bg-green-50 p-4 rounded-lg text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>Potência: {sistema.inversor_selecionado.potencia_kw}kW</div>
                      <div>Eficiência: {(sistema.inversor_selecionado.eficiencia * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Custos e Performance */}
          <div className="space-y-6">
            {/* Custos Detalhados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Custos Detalhados
                  {calculatingCosts && (
                    <div className="ml-2 animate-spin w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Painéis Solares:</span>
                  <span>R$ {sistema.custos.paineis.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Inversor:</span>
                  <span>R$ {sistema.custos.inversor.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Estrutura de Fixação:</span>
                  <span>R$ {sistema.custos.estrutura.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Material Elétrico:</span>
                  <span>R$ {sistema.custos.eletrico.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Mão de Obra + Instalação:</span>
                  <span>R$ {sistema.custos.mao_obra.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Margem Comercial:</span>
                  <span>R$ {sistema.custos.margem_comercial.toLocaleString('pt-BR')}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>R$ {sistema.custos.total.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Financeira */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Performance Financeira
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Geração Anual:</span>
                    <p className="font-semibold">{sistema.financeiro.geracao_anual_kwh.toLocaleString('pt-BR')} kWh</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Economia Anual:</span>
                    <p className="font-semibold text-green-600">R$ {sistema.financeiro.economia_anual.toLocaleString('pt-BR')}</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Retorno do Investimento</p>
                    <p className="text-2xl font-bold text-green-600">{sistema.financeiro.payback_anos.toFixed(1)} anos</p>
                  </div>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Economia em 25 anos</p>
                  <p className="text-xl font-bold text-yellow-600">
                    R$ {sistema.financeiro.economia_25_anos.toLocaleString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botão Gerar Proposta */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleGerarProposta}
            disabled={loading || !sistema.painel_selecionado || !sistema.inversor_selecionado}
            size="lg"
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-12"
          >
            {loading ? (
              <>
                <div className="animate-spin w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Gerando Proposta...
              </>
            ) : (
              <>
                <Sun className="w-5 h-5 mr-2" />
                Gerar Proposta Final
              </>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default SolarSystemValidation;