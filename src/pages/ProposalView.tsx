
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, X, MessageCircle, Download, Edit, ArrowLeft, Building, Calendar, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProposalView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');

  // Dados mockados da proposta
  const proposal = {
    id: id,
    number: 'PROP-2024-001',
    clientName: 'João Silva',
    clientEmail: 'joao@email.com',
    clientPhone: '(11) 99999-9999',
    projectName: 'Residência Moderna',
    address: 'Rua das Flores, 123 - São Paulo/SP',
    date: '15/01/2024',
    validUntil: '30/01/2024',
    vendorName: 'Carlos Vendedor',
    vendorEmail: 'carlos@drystore.com',
    items: [
      {
        id: '1',
        category: 'Sistema de Cobertura',
        description: 'Telhas termoacústicas galvanizadas',
        quantity: 180,
        unit: 'm²',
        unitPrice: 85.00,
        total: 15300.00
      },
      {
        id: '2',
        category: 'Sistema de Cobertura',
        description: 'Estrutura metálica para cobertura',
        quantity: 1,
        unit: 'vb',
        unitPrice: 18500.00,
        total: 18500.00
      },
      {
        id: '3',
        category: 'Sistema de Revestimento',
        description: 'Painéis de fachada metálica',
        quantity: 120,
        unit: 'm²',
        unitPrice: 95.00,
        total: 11400.00
      },
      {
        id: '4',
        category: 'Sistema de Drenagem',
        description: 'Calhas e condutores pluviais',
        quantity: 45,
        unit: 'm',
        unitPrice: 125.00,
        total: 5625.00
      }
    ],
    observations: 'Prazo de entrega: 30 dias após confirmação do pedido.\nGarantia: 5 anos para estrutura, 2 anos para telhas.\nValores válidos por 15 dias.',
    subtotal: 50825.00,
    discount: 5,
    total: 48283.75
  };

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
      description: "O vendedor será notificado sobre sua decisão.",
    });
  };

  const handleQuestion = () => {
    toast({
      title: "Dúvida Enviada",
      description: "Sua mensagem foi enviada ao vendedor.",
    });
  };

  const groupedItems = proposal.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof proposal.items>);

  const getStatusBadge = () => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Aceita</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitada</Badge>;
      default:
        return <Badge variant="secondary">Aguardando Resposta</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-semibold gradient-text">Drystore</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {/* Proposal Header */}
          <Card className="mb-8 border-0 shadow-lg">
            <CardHeader className="gradient-bg text-white">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2">
                    Proposta Comercial #{proposal.number}
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    {proposal.projectName}
                  </CardDescription>
                </div>
                {getStatusBadge()}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    Dados do Cliente
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nome:</strong> {proposal.clientName}</p>
                    <p className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {proposal.clientEmail}
                    </p>
                    <p className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {proposal.clientPhone}
                    </p>
                    <p><strong>Endereço:</strong> {proposal.address}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Dados da Proposta
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Data:</strong> {proposal.date}</p>
                    <p><strong>Válida até:</strong> {proposal.validUntil}</p>
                    <p><strong>Vendedor:</strong> {proposal.vendorName}</p>
                    <p><strong>Email:</strong> {proposal.vendorEmail}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <div className="space-y-6 mb-8">
            {Object.entries(groupedItems).map(([category, items]) => (
              <Card key={category} className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Descrição</th>
                          <th className="text-center py-2">Qtd</th>
                          <th className="text-center py-2">Un</th>
                          <th className="text-right py-2">Preço Un.</th>
                          <th className="text-right py-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="py-3">{item.description}</td>
                            <td className="text-center py-3">{item.quantity}</td>
                            <td className="text-center py-3">{item.unit}</td>
                            <td className="text-right py-3">
                              R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="text-right py-3 font-medium">
                              R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Total */}
          <Card className="mb-8 border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex justify-end">
                <div className="w-80 space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {proposal.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Desconto ({proposal.discount}%):</span>
                    <span>- R$ {(proposal.subtotal * proposal.discount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-drystore-blue">
                      R$ {proposal.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observations */}
          {proposal.observations && (
            <Card className="mb-8 border-0 shadow-md">
              <CardHeader>
                <CardTitle>Observações e Condições</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm text-gray-600">
                  {proposal.observations}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {status === 'pending' && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Ações do Cliente</CardTitle>
                <CardDescription>
                  Escolha uma das opções abaixo para responder à proposta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleAccept}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Aceitar Proposta
                  </Button>
                  
                  <Button 
                    onClick={handleReject}
                    variant="destructive"
                    className="flex-1"
                    size="lg"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Rejeitar Proposta
                  </Button>
                  
                  <Button 
                    onClick={handleQuestion}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Enviar Dúvida
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Message */}
          {status !== 'pending' && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                {status === 'accepted' ? (
                  <div className="text-green-600">
                    <Check className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Proposta Aceita!</h3>
                    <p>O vendedor entrará em contato para finalizar o pedido.</p>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <X className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Proposta Rejeitada</h3>
                    <p>O vendedor foi notificado sobre sua decisão.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalView;
