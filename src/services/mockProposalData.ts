
import { ProductGroup } from '@/types/productGroups';

export interface MockProposalData {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectName: string;
  address: string;
  area: string;
  originalPrice: number;
  discount: number;
  finalPrice: number;
  validUntil: string;
  benefits: string[];
  solutions: Array<{
    name: string;
    products: Array<{
      name: string;
      description: string;
      area: string;
      unitPrice: number;
      totalPrice: number;
    }>;
  }>;
  proposalItems: Array<{
    description: string;
    solution?: string;
  }>;
}

const generateMockData = (productGroup: ProductGroup): MockProposalData => {
  const baseData = {
    id: `mock-${productGroup}`,
    clientName: 'João Silva',
    clientEmail: 'joao.silva@email.com',
    clientPhone: '(11) 99999-9999',
    validUntil: '2025-07-15',
    address: 'Rua das Construções, 456 - São Paulo/SP',
  };

  switch (productGroup) {
    case 'light_steel_frame':
      return {
        ...baseData,
        projectName: 'Casa Moderna em Light Steel Frame',
        area: '120m²',
        originalPrice: 85000,
        discount: 5000,
        finalPrice: 80000,
        benefits: [
          'Construção 70% mais rápida',
          'Estrutura anti-sísmica',
          'Isolamento térmico superior',
          'Sustentabilidade comprovada',
          'Garantia de 25 anos'
        ],
        solutions: [{
          name: 'Sistema Estrutural Completo',
          products: [
            {
              name: 'Perfis Light Steel Frame',
              description: 'Estrutura metálica galvanizada',
              area: '120m²',
              unitPrice: 180,
              totalPrice: 21600
            },
            {
              name: 'Placas OSB Estrutural',
              description: 'Fechamento estrutural 15mm',
              area: '240m²',
              unitPrice: 45,
              totalPrice: 10800
            },
            {
              name: 'Isolamento Térmico',
              description: 'Lã de rocha 10cm',
              area: '120m²',
              unitPrice: 35,
              totalPrice: 4200
            }
          ]
        }],
        proposalItems: [
          { description: 'Estrutura completa em Light Steel Frame com perfis galvanizados' },
          { description: 'Fechamento em placas OSB estrutural 15mm' },
          { description: 'Sistema de isolamento térmico e acústico' },
          { description: 'Cobertura com telhas termoacústicas' },
          { description: 'Instalação e montagem profissional' }
        ]
      };

    case 'energia_solar':
      return {
        ...baseData,
        projectName: 'Sistema Fotovoltaico Residencial',
        area: '8,5 kWp',
        originalPrice: 42000,
        discount: 2000,
        finalPrice: 40000,
        benefits: [
          'Economia de até 95% na conta de luz',
          'Payback em 4-6 anos',
          'Valorização do imóvel em 8%',
          'Garantia de 25 anos nos painéis',
          'Monitoramento via app'
        ],
        solutions: [{
          name: 'Kit Solar Completo',
          products: [
            {
              name: 'Painéis Solares 540W',
              description: 'Módulos monocristalinos alta eficiência',
              area: '16 unidades',
              unitPrice: 890,
              totalPrice: 14240
            },
            {
              name: 'Inversor String 8kW',
              description: 'Inversor com WiFi integrado',
              area: '1 unidade',
              unitPrice: 3200,
              totalPrice: 3200
            },
            {
              name: 'Estrutura de Fixação',
              description: 'Sistema completo para telha cerâmica',
              area: '1 kit',
              unitPrice: 2800,
              totalPrice: 2800
            }
          ]
        }],
        proposalItems: [
          { description: '16 painéis solares monocristalinos de 540W cada' },
          { description: 'Inversor string 8kW com monitoramento WiFi' },
          { description: 'Estrutura de fixação para telha cerâmica' },
          { description: 'Cabeamento CC e CA completo' },
          { description: 'Instalação e comissionamento técnico' }
        ]
      };

    case 'telha_shingle':
      return {
        ...baseData,
        projectName: 'Cobertura em Telha Shingle Premium',
        area: '180m²',
        originalPrice: 28000,
        discount: 1500,
        finalPrice: 26500,
        benefits: [
          'Resistência a ventos de até 180 km/h',
          'Garantia de 30 anos contra infiltrações',
          'Isolamento térmico natural',
          'Variedade de cores disponíveis',
          'Baixa manutenção'
        ],
        solutions: [{
          name: 'Sistema de Cobertura Completo',
          products: [
            {
              name: 'Telhas Shingle Premium',
              description: 'Telhas asfálticas cor cinza ardósia',
              area: '180m²',
              unitPrice: 78,
              totalPrice: 14040
            },
            {
              name: 'Estrutura de Madeira',
              description: 'Caibros e ripas tratadas',
              area: '180m²',
              unitPrice: 35,
              totalPrice: 6300
            },
            {
              name: 'Manta Asfáltica',
              description: 'Impermeabilização 3mm',
              area: '200m²',
              unitPrice: 18,
              totalPrice: 3600
            }
          ]
        }],
        proposalItems: [
          { description: 'Telhas Shingle Premium cor cinza ardósia' },
          { description: 'Estrutura de madeira tratada (caibros e ripas)' },
          { description: 'Manta asfáltica para impermeabilização' },
          { description: 'Cumeeiras e acessórios de acabamento' },
          { description: 'Instalação profissional com garantia' }
        ]
      };

    case 'pisos_mantas_carpetes':
      return {
        ...baseData,
        projectName: 'Revestimento Corporativo Premium',
        area: '350m²',
        originalPrice: 32000,
        discount: 2500,
        finalPrice: 29500,
        benefits: [
          'Durabilidade comercial comprovada',
          'Facilidade de limpeza e manutenção',
          'Conforto acústico excepcional',
          'Variedade de padrões e cores',
          'Instalação rápida sem obras'
        ],
        solutions: [{
          name: 'Revestimento Completo',
          products: [
            {
              name: 'Carpete Modular',
              description: 'Placas 50x50cm padrão corporativo',
              area: '300m²',
              unitPrice: 68,
              totalPrice: 20400
            },
            {
              name: 'Piso Vinílico LVT',
              description: 'Réguas madeiradas para recepção',
              area: '50m²',
              unitPrice: 85,
              totalPrice: 4250
            },
            {
              name: 'Rodapés e Acabamentos',
              description: 'Sistema completo de acabamento',
              area: '1 lote',
              unitPrice: 1800,
              totalPrice: 1800
            }
          ]
        }],
        proposalItems: [
          { description: 'Carpete modular 50x50cm para áreas de trabalho' },
          { description: 'Piso vinílico LVT madeirado para recepção' },
          { description: 'Sistema de rodapés e perfis de acabamento' },
          { description: 'Cola e materiais de instalação' },
          { description: 'Instalação profissional e acabamento' }
        ]
      };

    case 'forros':
      return {
        ...baseData,
        projectName: 'Sistema de Forro Acústico',
        area: '240m²',
        originalPrice: 18500,
        discount: 1000,
        finalPrice: 17500,
        benefits: [
          'Isolamento acústico de 35dB',
          'Facilidade de acesso às instalações',
          'Acabamento profissional',
          'Resistência à umidade',
          'Instalação limpa e rápida'
        ],
        solutions: [{
          name: 'Sistema de Forro Completo',
          products: [
            {
              name: 'Placas de Forro Mineral',
              description: 'Placas 60x60cm antifúngicas',
              area: '240m²',
              unitPrice: 28,
              totalPrice: 6720
            },
            {
              name: 'Perfis de Sustentação',
              description: 'Sistema T-bar galvanizado',
              area: '1 kit',
              unitPrice: 4200,
              totalPrice: 4200
            },
            {
              name: 'Tirantes e Fixações',
              description: 'Sistema de fixação no teto',
              area: '1 kit',
              unitPrice: 1800,
              totalPrice: 1800
            }
          ]
        }],
        proposalItems: [
          { description: 'Placas de forro mineral 60x60cm antifúngicas' },
          { description: 'Sistema de perfis T-bar galvanizados' },
          { description: 'Tirantes e acessórios de fixação' },
          { description: 'Luminárias LED integradas opcionais' },
          { description: 'Instalação profissional nivelada' }
        ]
      };

    case 'divisorias':
      return {
        ...baseData,
        projectName: 'Divisórias Corporativas Modulares',
        area: '85m²',
        originalPrice: 22000,
        discount: 1200,
        finalPrice: 20800,
        benefits: [
          'Flexibilidade para reconfiguração',
          'Isolamento acústico eficiente',
          'Variedade de acabamentos',
          'Instalação sem quebra-quebra',
          'Durabilidade comercial'
        ],
        solutions: [{
          name: 'Sistema de Divisórias',
          products: [
            {
              name: 'Divisórias Eucatex',
              description: 'Painéis 35mm com isolamento',
              area: '75m²',
              unitPrice: 180,
              totalPrice: 13500
            },
            {
              name: 'Esquadrias de Alumínio',
              description: 'Portas e janelas integradas',
              area: '10m²',
              unitPrice: 320,
              totalPrice: 3200
            },
            {
              name: 'Acessórios e Ferragens',
              description: 'Fechaduras, puxadores e trilhos',
              area: '1 kit',
              unitPrice: 1800,
              totalPrice: 1800
            }
          ]
        }],
        proposalItems: [
          { description: 'Painéis divisórios 35mm com núcleo isolante' },
          { description: 'Esquadrias de alumínio para portas e janelas' },
          { description: 'Sistema de trilhos e fixações estruturais' },
          { description: 'Ferragens e acessórios de acabamento' },
          { description: 'Instalação e ajustes finais' }
        ]
      };

    case 'ferramentas':
      return {
        ...baseData,
        projectName: 'Kit Ferramentas Profissional',
        area: '1 conjunto',
        originalPrice: 15000,
        discount: 800,
        finalPrice: 14200,
        benefits: [
          'Ferramentas de qualidade industrial',
          'Garantia estendida de 3 anos',
          'Kit completo para construção',
          'Organização em maleta profissional',
          'Suporte técnico especializado'
        ],
        solutions: [{
          name: 'Kit Completo de Ferramentas',
          products: [
            {
              name: 'Furadeira de Impacto',
              description: 'Bosch 850W com maleta',
              area: '1 unidade',
              unitPrice: 580,
              totalPrice: 580
            },
            {
              name: 'Parafusadeira 18V',
              description: 'Com 2 baterias e carregador',
              area: '1 kit',
              unitPrice: 450,
              totalPrice: 450
            },
            {
              name: 'Conjunto de Brocas',
              description: '102 peças variadas',
              area: '1 conjunto',
              unitPrice: 180,
              totalPrice: 180
            }
          ]
        }],
        proposalItems: [
          { description: 'Furadeira de impacto profissional 850W' },
          { description: 'Parafusadeira 18V com baterias extras' },
          { description: 'Conjunto completo de brocas e bits' },
          { description: 'Maleta organizadora profissional' },
          { description: 'Manual técnico e certificado de garantia' }
        ]
      };

    default:
      return {
        ...baseData,
        projectName: 'Solução Personalizada',
        area: '100m²',
        originalPrice: 25000,
        discount: 1000,
        finalPrice: 24000,
        benefits: [
          'Solução personalizada',
          'Qualidade garantida',
          'Instalação profissional',
          'Suporte técnico',
          'Melhor custo-benefício'
        ],
        solutions: [{
          name: 'Solução Completa',
          products: [
            {
              name: 'Produto Principal',
              description: 'Solução adequada ao projeto',
              area: '100m²',
              unitPrice: 150,
              totalPrice: 15000
            }
          ]
        }],
        proposalItems: [
          { description: 'Solução personalizada para seu projeto' },
          { description: 'Materiais de primeira qualidade' },
          { description: 'Instalação profissional' },
          { description: 'Garantia e suporte técnico' }
        ]
      };
  }
};

export { generateMockData };
