
export const getMockProposal = (id: string) => ({
  id: id,
  number: 'PROP-2024-001',
  title: 'Proposta Personalizada',
  subtitle: 'Solução completa para sua obra',
  clientName: 'João Silva',
  clientEmail: 'joao.silva@email.com',
  clientPhone: '(11) 99999-9999',
  projectName: 'Residência Moderna - Sistemas Integrados',
  address: 'Rua das Construções, 456 - São Paulo/SP',
  date: '19/06/2025',
  validUntil: '26/06/2025',
  vendorName: 'Carlos Vendedor',
  vendorEmail: 'carlos@drystore.com',
  area: '180m²',
  originalPrice: 30975,
  discount: 0,
  finalPrice: 30975,
  installments: {
    times: 12,
    value: 2581
  },
  roi: '15 anos',
  economy: '+25%',
  isExpired: false,
  expirationDate: '26/06/2025',
  benefits: [
    'Materiais de alta qualidade',
    'Garantia estendida',
    'Instalação profissional',
    'Suporte técnico especializado',
    'Melhor custo-benefício'
  ],
  technicalDetails: 'Solução completa integrando sistemas de cobertura, revestimento e acabamento. Todos os materiais são de primeira linha com garantia estendida.',
  technicalImages: [
    {
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=300&fit=crop',
      description: 'Exemplo de aplicação de telhas shingle'
    },
    {
      url: 'https://images.unsplash.com/photo-1439337153520-7082a56a81f4?w=500&h=300&fit=crop',
      description: 'Sistema de drywall instalado'
    }
  ],
  solutions: [
    {
      name: 'Sistema de Cobertura',
      products: [
        {
          name: 'Telhas Shingle Premium',
          description: 'Telhas asfálticas cor cinza escuro',
          area: '180m²',
          unitPrice: 45,
          totalPrice: 8100
        },
        {
          name: 'Estrutura de Madeira',
          description: 'Caibros e ripas tratadas',
          area: '180m²',
          unitPrice: 25,
          totalPrice: 4500
        }
      ]
    },
    {
      name: 'Sistema Drywall',
      products: [
        {
          name: 'Placas Drywall 12,5mm',
          description: 'Placas standard para forro',
          area: '120 placas',
          unitPrice: 62.5,
          totalPrice: 7500
        },
        {
          name: 'Perfis Metálicos',
          description: 'Sistema completo de fixação',
          area: '1 vb',
          unitPrice: 2800,
          totalPrice: 2800
        }
      ]
    },
    {
      name: 'Revestimento Externo',
      products: [
        {
          name: 'Painéis de Fachada',
          description: 'Painéis metálicos cor branca',
          area: '95m²',
          unitPrice: 85,
          totalPrice: 8075
        }
      ]
    }
  ]
});

export const getMockProposalItems = () => [
  { description: 'Telhas Shingle Premium - Cor Cinza Escuro', quantity: 180, unit: 'm²', unitPrice: 45.00, total: 8100.00 },
  { description: 'Estrutura de Madeira Tratada', quantity: 180, unit: 'm²', unitPrice: 25.00, total: 4500.00 },
  { description: 'Drywall 12,5mm - Placas Standard', quantity: 120, unit: 'placas', unitPrice: 62.50, total: 7500.00 },
  { description: 'Perfis Metálicos para Drywall', quantity: 1, unit: 'vb', unitPrice: 2800.00, total: 2800.00 },
  { description: 'Painéis Metálicos para Fachada', quantity: 95, unit: 'm²', unitPrice: 85.00, total: 8075.00 }
];

export const getMockRecommendedProducts = () => [
  {
    id: 1,
    name: 'Kit Isolamento Térmico',
    description: 'Melhore o conforto térmico da sua obra',
    price: 3500,
    originalPrice: 4200,
    image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=200&fit=crop'
  },
  {
    id: 2,
    name: 'Sistema de Iluminação LED',
    description: 'Economia de até 80% na conta de luz',
    price: 2800,
    originalPrice: 3500,
    image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=300&h=200&fit=crop'
  }
];

export const getMockClientQuestions = () => [
  'Qual a garantia dos materiais?',
  'É possível parcelar em mais vezes?',
  'Vocês fazem a instalação?'
];
