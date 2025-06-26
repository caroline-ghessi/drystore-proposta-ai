
export type ProductGroup = 
  | 'light_steel_frame'
  | 'telha_shingle'
  | 'energia_solar'
  | 'pisos_mantas_carpetes'
  | 'forros'
  | 'divisorias'
  | 'ferramentas';

export interface ProductGroupOption {
  id: ProductGroup;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const PRODUCT_GROUPS: ProductGroupOption[] = [
  {
    id: 'light_steel_frame',
    name: 'Construção em Light Steel Frame',
    description: 'Sistema construtivo moderno e sustentável com estrutura metálica leve',
    icon: '🏗️',
    color: 'bg-blue-50 border-blue-200 hover:border-blue-300'
  },
  {
    id: 'telha_shingle',
    name: 'Telha Shingle',
    description: 'Telhas asfálticas de alta qualidade e durabilidade',
    icon: '🏠',
    color: 'bg-green-50 border-green-200 hover:border-green-300'
  },
  {
    id: 'energia_solar',
    name: 'Energia Solar',
    description: 'Sistemas fotovoltaicos para geração de energia limpa',
    icon: '☀️',
    color: 'bg-yellow-50 border-yellow-200 hover:border-yellow-300'
  },
  {
    id: 'pisos_mantas_carpetes',
    name: 'Pisos, Mantas e Carpetes',
    description: 'Revestimentos de piso de alta qualidade para todos os ambientes',
    icon: '🏢',
    color: 'bg-purple-50 border-purple-200 hover:border-purple-300'
  },
  {
    id: 'forros',
    name: 'Forros',
    description: 'Sistemas de forro para acabamento e isolamento acústico',
    icon: '📐',
    color: 'bg-indigo-50 border-indigo-200 hover:border-indigo-300'
  },
  {
    id: 'divisorias',
    name: 'Divisórias',
    description: 'Sistemas de divisórias para otimização de espaços',
    icon: '🚪',
    color: 'bg-orange-50 border-orange-200 hover:border-orange-300'
  },
  {
    id: 'ferramentas',
    name: 'Ferramentas',
    description: 'Ferramentas profissionais para construção e montagem',
    icon: '🔧',
    color: 'bg-red-50 border-red-200 hover:border-red-300'
  }
];
