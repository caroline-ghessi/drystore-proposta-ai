import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, RefreshCw, AlertCircle, DollarSign, Settings2, Calculator } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SolarConfig {
  id: string;
  custo_instalacao_wp: number;
  custo_inversor_wp: number;
  custo_estrutura_wp: number;
  custo_eletrico_wp: number;
  custo_mao_obra_wp: number;
  margem_comercial: number;
  margem_adicional_equipamentos: number;
  fator_seguranca: number;
  fator_perdas_sistema: number;
  ativo: boolean;
}

export const SolarConfigManager = () => {
  const [config, setConfig] = useState<SolarConfig | null>(null);
  const [originalConfig, setOriginalConfig] = useState<SolarConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (config && originalConfig) {
      const changed = JSON.stringify(config) !== JSON.stringify(originalConfig);
      setHasChanges(changed);
    }
  }, [config, originalConfig]);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('energia_solar_configuracoes')
        .select('*')
        .eq('ativo', true)
        .single();

      if (error) throw error;
      
      setConfig(data);
      setOriginalConfig(data);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações do sistema",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('energia_solar_configuracoes')
        .update({
          custo_instalacao_wp: config.custo_instalacao_wp,
          custo_inversor_wp: config.custo_inversor_wp,
          custo_estrutura_wp: config.custo_estrutura_wp,
          custo_eletrico_wp: config.custo_eletrico_wp,
          custo_mao_obra_wp: config.custo_mao_obra_wp,
          margem_comercial: config.margem_comercial,
          margem_adicional_equipamentos: config.margem_adicional_equipamentos,
          fator_seguranca: config.fator_seguranca,
          fator_perdas_sistema: config.fator_perdas_sistema
        })
        .eq('id', config.id);

      if (error) throw error;

      setOriginalConfig({ ...config });
      setHasChanges(false);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações foram atualizadas com sucesso",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (originalConfig) {
      setConfig({ ...originalConfig });
    }
  };

  const updateConfig = (field: keyof SolarConfig, value: number) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  const calculateExampleSystem = () => {
    if (!config) return null;
    
    const potenciaExemplo = 5; // 5kWp
    const custoPaineis = potenciaExemplo * 1000 * 3.5; // R$ 3,50/Wp exemplo
    const custoInversor = potenciaExemplo * 1000 * config.custo_inversor_wp;
    const custoEstrutura = potenciaExemplo * 1000 * config.custo_estrutura_wp;
    const custoEletrico = potenciaExemplo * 1000 * config.custo_eletrico_wp;
    const custoMaoObra = potenciaExemplo * 1000 * config.custo_mao_obra_wp;
    
    const subtotal = custoPaineis + custoInversor + custoEstrutura + custoEletrico + custoMaoObra;
    const margem = subtotal * config.margem_comercial;
    const total = subtotal + margem;
    
    return {
      potencia: potenciaExemplo,
      custoPaineis,
      custoInversor,
      custoEstrutura,
      custoEletrico,
      custoMaoObra,
      subtotal,
      margem,
      total
    };
  };

  const example = calculateExampleSystem();

  if (loading) {
    return <div className="flex justify-center p-8">Carregando configurações...</div>;
  }

  if (!config) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Nenhuma configuração encontrada. Por favor, entre em contato com o suporte.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Configurações do Sistema Solar</h3>
          <p className="text-sm text-gray-600">
            Ajuste os custos, margens e fatores de cálculo do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Resetar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você tem alterações não salvas. Clique em "Salvar Alterações" para aplicá-las.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Configurações de Custos */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Custos por Wp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="custo_inversor">Custo Inversor (R$/Wp)</Label>
                <Input
                  id="custo_inversor"
                  type="number"
                  step="0.01"
                  value={config.custo_inversor_wp}
                  onChange={(e) => updateConfig('custo_inversor_wp', Number(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="custo_estrutura">Custo Estrutura (R$/Wp)</Label>
                <Input
                  id="custo_estrutura"
                  type="number"
                  step="0.01"
                  value={config.custo_estrutura_wp}
                  onChange={(e) => updateConfig('custo_estrutura_wp', Number(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="custo_eletrico">Custo Material Elétrico (R$/Wp)</Label>
                <Input
                  id="custo_eletrico"
                  type="number"
                  step="0.01"
                  value={config.custo_eletrico_wp}
                  onChange={(e) => updateConfig('custo_eletrico_wp', Number(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="custo_mao_obra">Custo Mão de Obra (R$/Wp)</Label>
                <Input
                  id="custo_mao_obra"
                  type="number"
                  step="0.01"
                  value={config.custo_mao_obra_wp}
                  onChange={(e) => updateConfig('custo_mao_obra_wp', Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                Margens e Fatores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="margem_comercial">Margem Comercial (%)</Label>
                <Input
                  id="margem_comercial"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={config.margem_comercial}
                  onChange={(e) => updateConfig('margem_comercial', Number(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Valor entre 0 e 1 (ex: 0.25 = 25%)
                </p>
              </div>
              
              <div>
                <Label htmlFor="margem_equipamentos">Margem Adicional Equipamentos (%)</Label>
                <Input
                  id="margem_equipamentos"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={config.margem_adicional_equipamentos}
                  onChange={(e) => updateConfig('margem_adicional_equipamentos', Number(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="fator_seguranca">Fator de Segurança</Label>
                <Input
                  id="fator_seguranca"
                  type="number"
                  step="0.1"
                  value={config.fator_seguranca}
                  onChange={(e) => updateConfig('fator_seguranca', Number(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="fator_perdas">Fator de Perdas do Sistema</Label>
                <Input
                  id="fator_perdas"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={config.fator_perdas_sistema}
                  onChange={(e) => updateConfig('fator_perdas_sistema', Number(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Valor entre 0 e 1 (ex: 0.8 = 80% de eficiência)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview de Cálculo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Preview de Cálculo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {example && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Sistema Exemplo: {example.potencia}kWp
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Painéis Solares:</span>
                      <span>R$ {example.custoPaineis.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Inversor:</span>
                      <span>R$ {example.custoInversor.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estrutura:</span>
                      <span>R$ {example.custoEstrutura.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Material Elétrico:</span>
                      <span>R$ {example.custoEletrico.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mão de Obra:</span>
                      <span>R$ {example.custoMaoObra.toLocaleString('pt-BR')}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-medium">
                      <span>Subtotal:</span>
                      <span>R$ {example.subtotal.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Margem Comercial ({(config.margem_comercial * 100).toFixed(0)}%):</span>
                      <span>R$ {example.margem.toLocaleString('pt-BR')}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-bold text-lg text-green-700">
                      <span>Total:</span>
                      <span>R$ {example.total.toLocaleString('pt-BR')}</span>
                    </div>
                    
                    <div className="text-xs text-gray-600 mt-2">
                      * Preço por Wp: R$ {(example.total / (example.potencia * 1000)).toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Este é um cálculo de exemplo baseado nas configurações atuais. 
                    O preço dos painéis varia conforme o modelo selecionado.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};