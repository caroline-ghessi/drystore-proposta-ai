export interface ConsumoMensal {
  mes: string;
  consumo: number;
}

export interface DadosClienteSolar {
  // Dados básicos (existentes)
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  empresa?: string;
  
  // Dados específicos de energia solar
  cidade: string;
  estado: string;
  concessionaria: string;
  tarifaKwh: number;
  consumoHistorico: ConsumoMensal[];
  tipoTelhado: string;
  areaDisponivel: number;
}

export const ESTADOS_BRASIL = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

export const TIPOS_TELHADO = [
  { value: 'ceramico', label: 'Cerâmico' },
  { value: 'fibrocimento', label: 'Fibrocimento' },
  { value: 'metalico', label: 'Metálico' },
  { value: 'laje', label: 'Laje' },
  { value: 'colonial', label: 'Colonial' },
  { value: 'outros', label: 'Outros' },
];

export const CONCESSIONARIAS_POR_ESTADO: Record<string, string[]> = {
  'RS': ['RGE', 'CEEE', 'ELETROCAR'],
  'SC': ['CELESC', 'COOPERALIANÇA', 'CFLO'],
  'SP': ['ENEL SP', 'CPFL Paulista', 'Elektro', 'CPFL Piratininga'],
  'RJ': ['Enel Rio', 'Light'],
  'MG': ['CEMIG', 'Energisa Minas Gerais'],
  'PR': ['Copel'],
  // Adicionar mais conforme necessário
};