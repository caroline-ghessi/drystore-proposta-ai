import { supabase } from '@/integrations/supabase/client';
import type { DadosClienteSolar, ConsumoMensal } from '@/types/solarClient';
import type { CreateProposalRequest, ClientData } from '@/types/proposalCreation';
import { ClientService } from './clientService';
import { ProposalService } from './proposalService';

export interface DimensionamentoResult {
  potencia_necessaria_kwp: number;
  irradiacao_local: number;
  geracao_estimada_anual: number;
}

export interface PainelOpcao {
  id: string;
  fabricante: string;
  modelo: string;
  quantidade: number;
  potencia_total_kwp: number;
  area_ocupada_m2: number;
  preco_total: number;
}

export interface PaineisResult {
  opcoes: PainelOpcao[];
  recomendado: PainelOpcao;
}

export interface FinanceiroResult {
  custo_equipamentos: number;
  custo_instalacao: number;
  custo_total: number;
  economia_anual: number;
  payback_anos: number;
  economia_25_anos: number;
}

export interface PropostaSolarCompleta {
  dimensionamento: DimensionamentoResult;
  paineis: PaineisResult;
  financeiro: FinanceiroResult;
  client: any;
  proposal: any;
}

// Cache simples em memória para configurações solares
const cache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export class SolarCalculationService {
  /**
   * Calcula o consumo médio mensal dos últimos 12 meses
   */
  static calcularConsumoMedio(consumoHistorico: ConsumoMensal[]): number {
    if (!consumoHistorico || consumoHistorico.length === 0) {
      throw new Error('Histórico de consumo é obrigatório');
    }

    const consumosValidos = consumoHistorico.filter(item => item.consumo > 0);
    if (consumosValidos.length === 0) {
      throw new Error('Pelo menos um mês de consumo deve ser informado');
    }

    const total = consumosValidos.reduce((sum, item) => sum + item.consumo, 0);
    const media = total / consumosValidos.length;
    
    console.log('📊 Consumo médio calculado:', {
      mesesComDados: consumosValidos.length,
      totalConsumo: total,
      mediaMensal: media
    });

    return media;
  }

  /**
   * Valida os dados de entrada para cálculos solares
   */
  static validarDadosEntrada(dados: DadosClienteSolar): void {
    const erros: string[] = [];

    if (!dados.nome?.trim()) erros.push('Nome é obrigatório');
    if (!dados.email?.trim()) erros.push('Email é obrigatório');
    if (!dados.estado?.trim()) erros.push('Estado é obrigatório');
    if (!dados.cidade?.trim()) erros.push('Cidade é obrigatória');
    if (!dados.concessionaria?.trim()) erros.push('Concessionária é obrigatória');
    if (!dados.tipoTelhado?.trim()) erros.push('Tipo de telhado é obrigatório');
    
    if (!dados.tarifaKwh || dados.tarifaKwh <= 0) {
      erros.push('Tarifa kWh deve ser maior que zero');
    }
    if (dados.tarifaKwh && dados.tarifaKwh > 2) {
      erros.push('Tarifa kWh parece muito alta (máximo R$ 2,00)');
    }
    
    if (!dados.areaDisponivel || dados.areaDisponivel <= 0) {
      erros.push('Área disponível deve ser maior que zero');
    }
    if (dados.areaDisponivel && dados.areaDisponivel > 10000) {
      erros.push('Área disponível parece muito grande');
    }

    if (!dados.consumoHistorico || dados.consumoHistorico.length === 0) {
      erros.push('Histórico de consumo é obrigatório');
    }

    if (erros.length > 0) {
      throw new Error(`Dados inválidos: ${erros.join(', ')}`);
    }
  }

  /**
   * Dimensiona o sistema solar com base no consumo e estado
   */
  static async dimensionarSistema(consumoMedio: number, estado: string): Promise<DimensionamentoResult> {
    console.log('🔆 Dimensionando sistema solar:', { consumoMedio, estado });

    const cacheKey = `dimensionamento_${consumoMedio}_${estado}`;
    const cached = cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log('⚡ Usando dimensionamento em cache');
      return cached.data;
    }

    try {
      const { data, error } = await supabase.rpc('dimensionar_sistema_solar', {
        p_consumo_medio_kwh: consumoMedio,
        p_estado: estado
      });

      if (error) {
        console.error('❌ Erro ao dimensionar sistema:', error);
        throw new Error(`Erro no dimensionamento: ${error.message}`);
      }

      console.log('✅ Sistema dimensionado:', data);
      
      // Armazenar no cache
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data as unknown as DimensionamentoResult;
    } catch (error) {
      console.error('❌ Erro no dimensionamento solar:', error);
      throw error;
    }
  }

  /**
   * Seleciona os melhores painéis solares para o sistema
   */
  static async selecionarPaineis(potenciaKwp: number, tipoTelhado: string): Promise<PaineisResult> {
    console.log('🔧 Selecionando painéis solares:', { potenciaKwp, tipoTelhado });

    const cacheKey = `paineis_${potenciaKwp}_${tipoTelhado}`;
    const cached = cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log('⚡ Usando seleção de painéis em cache');
      return cached.data;
    }

    try {
      const { data, error } = await supabase.rpc('selecionar_paineis_solares', {
        p_potencia_kwp: potenciaKwp,
        p_tipo_telhado: tipoTelhado
      });

      if (error) {
        console.error('❌ Erro ao selecionar painéis:', error);
        throw new Error(`Erro na seleção de painéis: ${error.message}`);
      }

      console.log('✅ Painéis selecionados:', data);
      
      // Armazenar no cache
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data as unknown as PaineisResult;
    } catch (error) {
      console.error('❌ Erro na seleção de painéis:', error);
      throw error;
    }
  }

  /**
   * Calcula a análise financeira do sistema solar
   */
  static async calcularFinanceiro(params: {
    p_custo_equipamentos: number;
    p_potencia_kwp: number;
    p_geracao_anual_kwh: number;
    p_consumo_anual_kwh: number;
    p_tarifa_kwh: number;
  }): Promise<FinanceiroResult> {
    console.log('💰 Calculando análise financeira:', params);

    try {
      const { data, error } = await supabase.rpc('calcular_financeiro_solar', params);

      if (error) {
        console.error('❌ Erro no cálculo financeiro:', error);
        throw new Error(`Erro no cálculo financeiro: ${error.message}`);
      }

      console.log('✅ Análise financeira calculada:', data);
      return data as unknown as FinanceiroResult;
    } catch (error) {
      console.error('❌ Erro no cálculo financeiro:', error);
      throw error;
    }
  }

  /**
   * Salva o cliente com dados específicos de energia solar
   */
  static async salvarClienteComDadosSolares(dados: DadosClienteSolar): Promise<any> {
    console.log('💾 Salvando cliente com dados solares:', dados.nome);

    this.validarDadosEntrada(dados);

    try {
      // Preparar dados do cliente no formato ClientData
      const clientData: ClientData = {
        name: dados.nome,
        email: dados.email,
        phone: dados.telefone || '',
        company: dados.empresa || '',
        address: dados.endereco || ''
      };

      // Criar cliente básico primeiro
      const client = await ClientService.createOrRetrieveClient(clientData);
      
      // Atualizar com dados específicos de energia solar
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          cidade: dados.cidade,
          estado: dados.estado,
          concessionaria: dados.concessionaria,
          consumo_historico: dados.consumoHistorico as any,
          tarifa_kwh: dados.tarifaKwh,
          tipo_telhado: dados.tipoTelhado,
          area_disponivel_m2: dados.areaDisponivel,
          origem_dados: 'solar_form'
        })
        .eq('id', client.id);

      if (updateError) {
        console.error('⚠️ Erro ao atualizar dados solares do cliente:', updateError);
      }
      console.log('✅ Cliente solar salvo:', client.id);
      
      return client;
    } catch (error) {
      console.error('❌ Erro ao salvar cliente solar:', error);
      throw error;
    }
  }

  /**
   * Gera uma proposta completa de energia solar
   */
  static async gerarPropostaCompleta(dados: DadosClienteSolar): Promise<PropostaSolarCompleta> {
    console.log('🌞 Gerando proposta solar completa para:', dados.nome);

    try {
      this.validarDadosEntrada(dados);

      // 1. Calcular consumo médio
      const consumoMedio = this.calcularConsumoMedio(dados.consumoHistorico);
      const consumoAnual = consumoMedio * 12;

      // 2. Dimensionar sistema
      const dimensionamento = await this.dimensionarSistema(consumoMedio, dados.estado);

      // 3. Selecionar painéis
      const paineis = await this.selecionarPaineis(
        dimensionamento.potencia_necessaria_kwp,
        dados.tipoTelhado
      );

      // 4. Calcular financeiro
      const financeiro = await this.calcularFinanceiro({
        p_custo_equipamentos: paineis.recomendado.preco_total,
        p_potencia_kwp: dimensionamento.potencia_necessaria_kwp,
        p_geracao_anual_kwh: dimensionamento.geracao_estimada_anual,
        p_consumo_anual_kwh: consumoAnual,
        p_tarifa_kwh: dados.tarifaKwh
      });

      // 5. Salvar cliente
      const client = await this.salvarClienteComDadosSolares(dados);

      // 6. Criar proposta
      const proposalData: CreateProposalRequest = {
        clientData: {
          name: dados.nome,
          email: dados.email,
          phone: dados.telefone || '',
          company: dados.empresa || '',
          address: dados.endereco || ''
        },
        items: [{
          id: 'sistema-solar',
          category: 'Sistema Fotovoltaico',
          description: `Sistema Solar ${dimensionamento.potencia_necessaria_kwp}kWp - ${paineis.recomendado.fabricante} ${paineis.recomendado.modelo}`,
          quantity: 1,
          unit: 'UN',
          unitPrice: financeiro.custo_total,
          total: financeiro.custo_total
        }],
        observations: `Economia estimada: R$ ${financeiro.economia_anual.toFixed(2)}/ano | Payback: ${financeiro.payback_anos} anos`,
        validityDays: 30,
        subtotal: financeiro.custo_total,
        discount: 0,
        productGroup: 'energia_solar' as any,
        selectedPaymentConditions: [],
        includeVideo: false,
        videoUrl: '',
        includeTechnicalDetails: true,
        selectedSolutions: [],
        selectedRecommendedProducts: []
      };

      const proposal = await ProposalService.createProposal(client, proposalData);

      // Atualizar proposta com dados específicos de energia solar
      const { error: updateError } = await supabase
        .from('proposals')
        .update({
          tipo_sistema: 'fotovoltaico',
          potencia_sistema_kwp: dimensionamento.potencia_necessaria_kwp,
          painel_selecionado_id: paineis.recomendado.id,
          quantidade_paineis: paineis.recomendado.quantidade,
          geracao_estimada_anual_kwh: dimensionamento.geracao_estimada_anual,
          economia_anual_estimada: financeiro.economia_anual,
          payback_simples_anos: financeiro.payback_anos,
          area_ocupada_m2: paineis.recomendado.area_ocupada_m2
        })
        .eq('id', proposal.id);

      if (updateError) {
        console.error('⚠️ Erro ao atualizar dados solares da proposta:', updateError);
      }

      console.log('🎉 Proposta solar completa gerada:', proposal.id);

      return {
        dimensionamento,
        paineis,
        financeiro,
        client,
        proposal
      };
    } catch (error) {
      console.error('❌ Erro ao gerar proposta solar completa:', error);
      throw error;
    }
  }

  /**
   * Limpa o cache (útil para testes ou atualizações)
   */
  static limparCache(): void {
    cache.clear();
    console.log('🧹 Cache do serviço solar limpo');
  }
}