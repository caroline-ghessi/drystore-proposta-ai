import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ProposalHeader } from '@/components/proposal/ProposalHeader';
import { ProposalBenefits } from '@/components/proposal/ProposalBenefits';
import { TechnicalDetails } from '@/components/proposal/TechnicalDetails';
import { InvestmentCard } from '@/components/proposal/InvestmentCard';
import { StatusMessage } from '@/components/proposal/StatusMessage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Phone, Clock, Star, ShoppingCart } from 'lucide-react';

const ProposalView = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [question, setQuestion] = useState('');

  // Dados mockados da proposta
  const proposal = {
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
  };

  const proposalItems = [
    { description: 'Telhas Shingle Premium - Cor Cinza Escuro', quantity: 180, unit: 'm²', unitPrice: 45.00, total: 8100.00 },
    { description: 'Estrutura de Madeira Tratada', quantity: 180, unit: 'm²', unitPrice: 25.00, total: 4500.00 },
    { description: 'Drywall 12,5mm - Placas Standard', quantity: 120, unit: 'placas', unitPrice: 62.50, total: 7500.00 },
    { description: 'Perfis Metálicos para Drywall', quantity: 1, unit: 'vb', unitPrice: 2800.00, total: 2800.00 },
    { description: 'Painéis Metálicos para Fachada', quantity: 95, unit: 'm²', unitPrice: 85.00, total: 8075.00 }
  ];

  const recommendedProducts = [
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

  const handleAccept = () => {
    setStatus('accepted');
    toast({
      title: "Proposta Aceita!",
      description: "O vendedor será notificado sobre sua decisão.",
    });
  };

  const handleReject = () => {
    setStatus('rejected');
    toast({
      title: "Proposta Rejeitada",
      description: "O vendedor foi notificado sobre sua decisão.",
    });
  };

  const handleQuestion = () => {
    if (!question.trim()) {
      toast({
        title: "Digite sua dúvida",
        description: "Por favor, escreva sua pergunta antes de enviar.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Dúvida Enviada",
      description: "Sua mensagem foi enviada ao vendedor.",
    });
    setQuestion('');
  };

  const handleWhatsApp = () => {
    toast({
      title: "Redirecionando para WhatsApp",
      description: "Você será direcionado para conversar com o vendedor.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProposalHeader proposal={proposal} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabela de Itens - Mobile Responsivo */}
            <Card>
              <CardHeader>
                <CardTitle>Itens da Proposta</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Desktop View */}
                <div className="hidden md:block">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3">Descrição</th>
                          <th className="text-center py-3">Qtd</th>
                          <th className="text-center py-3">Un</th>
                          <th className="text-right py-3">Preço Un.</th>
                          <th className="text-right py-3">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {proposalItems.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-3 font-medium">{item.description}</td>
                            <td className="py-3 text-center">{item.quantity}</td>
                            <td className="py-3 text-center">{item.unit}</td>
                            <td className="py-3 text-right">R$ {item.unitPrice.toFixed(2)}</td>
                            <td className="py-3 text-right font-semibold">
                              R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile View - Cards */}
                <div className="md:hidden space-y-4">
                  {proposalItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                      <h4 className="font-medium text-gray-900 mb-3">{item.description}</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Quantidade:</span>
                          <p className="font-medium">{item.quantity} {item.unit}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Preço Unitário:</span>
                          <p className="font-medium">R$ {item.unitPrice.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total:</span>
                          <span className="text-lg font-bold text-blue-600">
                            R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      R$ {proposal.finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Urgência */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-orange-600" />
                  <div>
                    <p className="font-semibold text-orange-800">⏰ Oferta por Tempo Limitado!</p>
                    <p className="text-sm text-orange-700">Esta proposta é válida apenas até {proposal.validUntil}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ProposalBenefits benefits={proposal.benefits} />
            
            <TechnicalDetails 
              technicalDetails={proposal.technicalDetails}
              technicalImages={proposal.technicalImages}
              solutions={proposal.solutions}
            />

            {/* Produtos Recomendados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Produtos Recomendados - Oferta Especial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {recommendedProducts.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4 bg-white">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-green-600">
                            R$ {product.price.toLocaleString('pt-BR')}
                          </span>
                          <span className="text-sm text-gray-500 line-through ml-2">
                            R$ {product.originalPrice.toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enviar Dúvida */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Tem alguma dúvida?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Digite sua pergunta ou dúvida sobre a proposta..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleQuestion} variant="outline" className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar Dúvida
                </Button>
              </CardContent>
            </Card>

            <StatusMessage status={status} />
          </div>

          {/* Sidebar - Investimento e Ações */}
          <div className="space-y-6">
            <InvestmentCard 
              proposal={proposal}
              status={status}
              onAccept={handleAccept}
              onQuestion={handleQuestion}
            />

            {/* Ações Principais */}
            {status === 'pending' && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <Button 
                    onClick={handleAccept}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    ✅ Aceitar Proposta
                  </Button>
                  
                  <Button 
                    onClick={handleWhatsApp}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                    size="lg"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Falar no WhatsApp
                  </Button>
                  
                  <Button 
                    onClick={handleReject}
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Recusar Proposta
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalView;
