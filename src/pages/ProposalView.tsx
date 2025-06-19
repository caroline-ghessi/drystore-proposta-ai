
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Check, 
  X, 
  MessageCircle, 
  Download, 
  ArrowLeft, 
  Mail, 
  Calendar,
  Clock,
  Shield,
  Award,
  Wrench,
  Star,
  Phone,
  Share,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
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
    title: 'Telhas Shingle',
    subtitle: 'Proposta Exclusiva para Maria Santos',
    clientName: 'Maria Santos',
    clientEmail: 'maria.santos@email.com',
    clientPhone: '(11) 99999-9999',
    projectName: 'Cobertura residencial com telhas shingle premium cor cinza escuro',
    address: 'Rua das Flores, 123 - São Paulo/SP',
    date: '17/06/2025',
    validUntil: '19/07/2024',
    vendorName: 'Carlos Vendedor',
    vendorEmail: 'carlos@drystore.com',
    area: '180m²',
    originalPrice: 21000,
    discount: 10,
    finalPrice: 18900,
    installments: {
      times: 10,
      value: 1890
    },
    roi: '10 anos',
    economy: '+20%',
    isExpired: true,
    expirationDate: '19/07/2024',
    benefits: [
      'Resistência superior a granizo',
      'Isolamento térmico e acústico',
      'Design moderno e elegante',
      '30 anos de garantia',
      'Facilidade de manutenção'
    ],
    technicalDetails: 'Cobertura residencial com telhas shingle premium cor cinza escuro. Área total de 180m² incluindo estrutura de madeira, manta térmica e sistema de captação pluvial.'
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
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(-1)}
                className="text-gray-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              
              <div className="flex items-center space-x-3 ml-4">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">D</span>
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">Drystore</h1>
                  <p className="text-xs text-orange-500">Sua Solução Completa</p>
                </div>
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="text-orange-500 border-orange-500">
              <Share className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Alerta de Expiração */}
            {proposal.isExpired && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    <div>
                      <p className="font-medium">Proposta Expirada</p>
                      <p className="text-sm">Esta proposta expirou em {proposal.expirationDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cabeçalho da Proposta */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{proposal.title}</h1>
                    <p className="text-gray-600 mb-4">{proposal.subtitle}</p>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>{proposal.clientName}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{proposal.date}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Válido até {proposal.validUntil}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Por que escolher nossa solução */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Check className="w-5 h-5 mr-2 text-green-600" />
                  Por que escolher nossa solução?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {proposal.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detalhes Técnicos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Wrench className="w-5 h-5 mr-2" />
                  Detalhes Técnicos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{proposal.technicalDetails}</p>
              </CardContent>
            </Card>

            {/* Status Message para mobile */}
            {status !== 'pending' && (
              <Card className="lg:hidden">
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

          {/* Sidebar - Investimento e Ações */}
          <div className="space-y-6">
            {/* Card de Investimento */}
            <Card className="sticky top-8">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">Investimento Total</CardTitle>
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-block">
                  {proposal.discount}% OFF
                </div>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="mb-4">
                  <p className="text-gray-500 line-through text-lg">
                    R$ {proposal.originalPrice.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    R$ {proposal.finalPrice.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-orange-500 font-medium">
                    ou {proposal.installments.times}x R$ {proposal.installments.value.toLocaleString('pt-BR')}
                  </p>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Star className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">ROI</p>
                    <p className="font-semibold text-gray-900">{proposal.roi}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Economia</p>
                    <p className="font-semibold text-green-600">Valorização {proposal.economy}</p>
                  </div>
                </div>

                {/* Ações */}
                {status === 'pending' ? (
                  <div className="space-y-3">
                    <Button 
                      onClick={handleAccept}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Aceitar Proposta
                    </Button>
                    
                    <Button 
                      onClick={handleQuestion}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      Falar com Consultor
                    </Button>
                  </div>
                ) : status === 'accepted' ? (
                  <div className="text-green-600 py-4">
                    <Check className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-semibold">Proposta Aceita!</p>
                    <p className="text-sm text-gray-600">Aguarde o contato do vendedor</p>
                  </div>
                ) : (
                  <div className="text-red-600 py-4">
                    <X className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-semibold">Proposta Rejeitada</p>
                  </div>
                )}

                {/* Informações de Garantia */}
                <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex items-center justify-center text-xs text-gray-600">
                    <Shield className="w-4 h-4 mr-1" />
                    <span>Proposta segura e confidencial</span>
                  </div>
                  <div className="flex items-center justify-center text-xs text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Válida até {proposal.validUntil}</span>
                  </div>
                  <div className="flex items-center justify-center text-xs text-gray-600">
                    <Award className="w-4 h-4 mr-1" />
                    <span>Satisfação garantida</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalView;
