import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Phone, MessageCircle, Calendar, FileText } from 'lucide-react';
import { useProposalDetails } from '@/hooks/useProposalDetails';

const ProposalFinalThanks = () => {
  const { proposalId } = useParams<{ proposalId: string }>();
  const [searchParams] = useSearchParams();
  const { data: proposal } = useProposalDetails(proposalId || '');
  const isConfirmed = searchParams.get('confirmed') === 'true';

  const nextSteps = [
    {
      icon: Phone,
      title: 'Contato do Consultor',
      description: 'Nosso especialista entrará em contato em até 2 horas úteis',
      timeframe: 'Próximas 2 horas'
    },
    {
      icon: Calendar,
      title: 'Agendamento da Vistoria',
      description: 'Vistoria técnica gratuita para validar o projeto',
      timeframe: '2-3 dias úteis'
    },
    {
      icon: FileText,
      title: 'Documentação',
      description: 'Elaboração do projeto e solicitação na concessionária',
      timeframe: '5-7 dias úteis'
    },
    {
      icon: CheckCircle,
      title: 'Instalação',
      description: 'Instalação completa do seu sistema solar',
      timeframe: '30-45 dias'
    }
  ];

  const vendorInfo = {
    name: 'Carlos Silva',
    phone: '(11) 99999-9999',
    email: 'carlos.silva@drystore.com.br',
    whatsapp: '5511999999999'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Tudo Certo, {proposal?.clients?.nome?.split(' ')[0]}!
          </h1>
          
          <p className="text-xl text-gray-600 mb-4">
            {isConfirmed 
              ? 'Seu pedido foi confirmado com sucesso!' 
              : 'Sua proposta foi registrada com sucesso!'
            }
          </p>
          
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full inline-block">
            <span className="font-semibold">
              ⚡ Seu sistema solar está a caminho!
            </span>
          </div>
        </div>

        {/* Vendor Contact Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">
                👨‍💼 Seu Consultor Especializado
              </h2>
              <p className="text-blue-100">
                Entre em contato direto para qualquer dúvida
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-xl font-bold mb-2">{vendorInfo.name}</div>
                <div className="text-blue-100 mb-4">Especialista em Energia Solar</div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{vendorInfo.phone}</span>
                  </div>
                  <div className="text-blue-100 text-sm">{vendorInfo.email}</div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button 
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => window.open(`https://wa.me/${vendorInfo.whatsapp}`, '_blank')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Conversar no WhatsApp
                </Button>
                
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                  onClick={() => window.location.href = `tel:${vendorInfo.phone}`}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Ligar Agora
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              🗓️ Próximos Passos
            </h2>
            
            <div className="space-y-6">
              {nextSteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {step.description}
                    </p>
                    <span className="text-sm font-medium text-blue-600">
                      📅 {step.timeframe}
                    </span>
                  </div>
                  
                  <div className="text-2xl">
                    {index === 0 ? '🔄' : '⏳'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-yellow-800 mb-3">
                ⚠️ Informações Importantes
              </h3>
              
              <ul className="space-y-2 text-sm text-yellow-700">
                <li>• Mantenha seu telefone disponível para contato</li>
                <li>• Prepare a documentação do imóvel</li>
                <li>• Garanta acesso ao local para vistoria</li>
                <li>• Confirme a disponibilidade de energia da rede</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-green-800 mb-3">
                ✅ Garantias Inclusas
              </h3>
              
              <ul className="space-y-2 text-sm text-green-700">
                <li>• 25 anos de garantia dos painéis solares</li>
                <li>• 10 anos de garantia do inversor</li>
                <li>• 5 anos de garantia da instalação</li>
                <li>• Monitoramento vitalício gratuito</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Contact Options */}
        <Card className="bg-gradient-to-r from-gray-50 to-blue-50">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              📞 Precisa de Ajuda?
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <Phone className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="font-semibold text-gray-900">Central de Atendimento</div>
                <div className="text-sm text-gray-600">(11) 4000-1234</div>
                <div className="text-xs text-gray-500">24h disponível</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <MessageCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="font-semibold text-gray-900">WhatsApp</div>
                <div className="text-sm text-gray-600">(11) 99999-0000</div>
                <div className="text-xs text-gray-500">Seg-Sex 8h-18h</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <FileText className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="font-semibold text-gray-900">Portal do Cliente</div>
                <div className="text-sm text-gray-600">drystore.com.br</div>
                <div className="text-xs text-gray-500">Acesso 24h</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Message */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-lg">
            🌞 Obrigado por escolher a Drystore para seu projeto de energia solar!
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Juntos construindo um futuro mais sustentável
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProposalFinalThanks;