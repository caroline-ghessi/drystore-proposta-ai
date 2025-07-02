import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Phone, Building, MapPin, Zap, Home, Calculator } from 'lucide-react';
import { ConsumoHistoricoGrid } from './ConsumoHistoricoGrid';
import { NumericInput } from './NumericInput';
import { 
  DadosClienteSolar, 
  ESTADOS_BRASIL, 
  TIPOS_TELHADO, 
  CONCESSIONARIAS_POR_ESTADO,
  ConsumoMensal 
} from '@/types/solarClient';
import { useInputValidation, commonValidationRules } from '@/hooks/useInputValidation';

interface ClienteSolarFormProps {
  dadosIniciais?: Partial<DadosClienteSolar>;
  onSubmit: (dados: DadosClienteSolar) => void;
  loading?: boolean;
}

export const ClienteSolarForm: React.FC<ClienteSolarFormProps> = ({
  dadosIniciais,
  onSubmit,
  loading = false
}) => {
  const [dados, setDados] = useState<DadosClienteSolar>({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    empresa: '',
    cidade: '',
    estado: '',
    concessionaria: '',
    tarifaKwh: 0,
    consumoHistorico: [],
    tipoTelhado: '',
    areaDisponivel: 0,
    ...dadosIniciais
  });

  const validationRules = {
    ...commonValidationRules,
    cidade: { required: true, minLength: 2, maxLength: 100 },
    estado: { required: true },
    concessionaria: { required: true },
    tarifaKwh: { 
      required: true,
      custom: (value: string) => {
        const num = parseFloat(value);
        if (isNaN(num) || num <= 0) return 'Tarifa deve ser maior que zero';
        if (num > 2) return 'Tarifa parece muito alta (máx: R$ 2,00)';
        return null;
      }
    },
    tipoTelhado: { required: true },
    areaDisponivel: {
      required: true,
      custom: (value: string) => {
        const num = parseFloat(value);
        if (isNaN(num) || num <= 0) return 'Área deve ser maior que zero';
        if (num > 10000) return 'Área parece muito grande';
        return null;
      }
    }
  };

  const { errors, validateField, validateAll } = useInputValidation(validationRules);

  const [concessionariasDisponiveis, setConcessionariasDisponiveis] = useState<string[]>([]);

  useEffect(() => {
    if (dados.estado) {
      setConcessionariasDisponiveis(CONCESSIONARIAS_POR_ESTADO[dados.estado] || []);
      if (!CONCESSIONARIAS_POR_ESTADO[dados.estado]?.includes(dados.concessionaria)) {
        setDados(prev => ({ ...prev, concessionaria: '' }));
      }
    }
  }, [dados.estado, dados.concessionaria]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar consumo histórico
    const temConsumo = dados.consumoHistorico.some(c => c.consumo > 0);
    if (!temConsumo) {
      alert('Informe o consumo de pelo menos um mês');
      return;
    }

    const formValues = {
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
      cidade: dados.cidade,
      estado: dados.estado,
      concessionaria: dados.concessionaria,
      tarifaKwh: dados.tarifaKwh.toString(),
      tipoTelhado: dados.tipoTelhado,
      areaDisponivel: dados.areaDisponivel.toString()
    };

    if (validateAll(formValues)) {
      onSubmit(dados);
    }
  };

  const updateDados = (field: keyof DadosClienteSolar, value: any) => {
    setDados(prev => ({ ...prev, [field]: value }));
  };

  const updateConsumoHistorico = (consumo: ConsumoMensal[]) => {
    setDados(prev => ({ ...prev, consumoHistorico: consumo }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Dados Pessoais */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2 text-primary" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">
                Nome *
                {errors.nome && (
                  <span className="text-destructive text-sm ml-1">({errors.nome})</span>
                )}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nome"
                  value={dados.nome}
                  onChange={(e) => {
                    updateDados('nome', e.target.value);
                    validateField('nome', e.target.value);
                  }}
                  className={`pl-10 ${errors.nome ? 'border-destructive' : ''}`}
                  placeholder="Nome completo"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email *
                {errors.email && (
                  <span className="text-destructive text-sm ml-1">({errors.email})</span>
                )}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={dados.email}
                  onChange={(e) => {
                    updateDados('email', e.target.value);
                    validateField('email', e.target.value);
                  }}
                  className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telefone"
                  value={dados.telefone}
                  onChange={(e) => updateDados('telefone', e.target.value)}
                  className="pl-10"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="empresa"
                  value={dados.empresa}
                  onChange={(e) => updateDados('empresa', e.target.value)}
                  className="pl-10"
                  placeholder="Nome da empresa"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={dados.endereco}
                onChange={(e) => updateDados('endereco', e.target.value)}
                placeholder="Endereço completo"
              />
            </div>
          </CardContent>
        </Card>

        {/* Dados Energéticos */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-primary" />
              Dados Energéticos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estado">
                  Estado *
                  {errors.estado && (
                    <span className="text-destructive text-sm ml-1">({errors.estado})</span>
                  )}
                </Label>
                <Select 
                  value={dados.estado} 
                  onValueChange={(value) => {
                    updateDados('estado', value);
                    validateField('estado', value);
                  }}
                >
                  <SelectTrigger className={errors.estado ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_BRASIL.map(estado => (
                      <SelectItem key={estado.value} value={estado.value}>
                        {estado.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">
                  Cidade *
                  {errors.cidade && (
                    <span className="text-destructive text-sm ml-1">({errors.cidade})</span>
                  )}
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cidade"
                    value={dados.cidade}
                    onChange={(e) => {
                      updateDados('cidade', e.target.value);
                      validateField('cidade', e.target.value);
                    }}
                    className={`pl-10 ${errors.cidade ? 'border-destructive' : ''}`}
                    placeholder="Nome da cidade"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="concessionaria">
                Concessionária *
                {errors.concessionaria && (
                  <span className="text-destructive text-sm ml-1">({errors.concessionaria})</span>
                )}
              </Label>
              <Select 
                value={dados.concessionaria} 
                onValueChange={(value) => {
                  updateDados('concessionaria', value);
                  validateField('concessionaria', value);
                }}
                disabled={!dados.estado}
              >
                <SelectTrigger className={errors.concessionaria ? 'border-destructive' : ''}>
                  <SelectValue placeholder={dados.estado ? "Selecione a concessionária" : "Primeiro selecione o estado"} />
                </SelectTrigger>
                <SelectContent>
                  {concessionariasDisponiveis.map(concessionaria => (
                    <SelectItem key={concessionaria} value={concessionaria}>
                      {concessionaria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tarifaKwh">
                Tarifa kWh (R$) *
                {errors.tarifaKwh && (
                  <span className="text-destructive text-sm ml-1">({errors.tarifaKwh})</span>
                )}
              </Label>
              <NumericInput
                id="tarifaKwh"
                value={dados.tarifaKwh}
                onChange={(value) => {
                  updateDados('tarifaKwh', value);
                  validateField('tarifaKwh', value.toString());
                }}
                suffix="R$/kWh"
                decimals={3}
                min={0}
                max={2}
                placeholder="0,000"
                className={errors.tarifaKwh ? 'border-destructive' : ''}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consumo Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="w-5 h-5 mr-2 text-primary" />
            Consumo dos Últimos 12 Meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ConsumoHistoricoGrid 
            consumo={dados.consumoHistorico}
            onChange={updateConsumoHistorico}
          />
        </CardContent>
      </Card>

      {/* Dados Técnicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Home className="w-5 h-5 mr-2 text-primary" />
            Informações da Instalação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipoTelhado">
                Tipo de Telhado *
                {errors.tipoTelhado && (
                  <span className="text-destructive text-sm ml-1">({errors.tipoTelhado})</span>
                )}
              </Label>
              <Select 
                value={dados.tipoTelhado} 
                onValueChange={(value) => {
                  updateDados('tipoTelhado', value);
                  validateField('tipoTelhado', value);
                }}
              >
                <SelectTrigger className={errors.tipoTelhado ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Selecione o tipo de telhado" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_TELHADO.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="areaDisponivel">
                Área Disponível (m²) *
                {errors.areaDisponivel && (
                  <span className="text-destructive text-sm ml-1">({errors.areaDisponivel})</span>
                )}
              </Label>
              <NumericInput
                id="areaDisponivel"
                value={dados.areaDisponivel}
                onChange={(value) => {
                  updateDados('areaDisponivel', value);
                  validateField('areaDisponivel', value.toString());
                }}
                suffix="m²"
                decimals={1}
                min={0}
                max={10000}
                placeholder="0"
                className={errors.areaDisponivel ? 'border-destructive' : ''}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? 'Calculando...' : 'Calcular Sistema Solar'}
        </Button>
      </div>
    </form>
  );
};