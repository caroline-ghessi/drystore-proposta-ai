import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Gift, 
  FileText, 
  Package, 
  Calendar, 
  Star,
  Download,
  Eye
} from 'lucide-react';
import { ClientProfile, CashbackTransaction } from '@/types/client';
import { DeliveryProgress } from '@/types/delivery';

interface ClientDashboardProps {
  client: ClientProfile;
  proposalsAccepted: any[];
  cashbackHistory: CashbackTransaction[];
  deliveryProgress: DeliveryProgress[];
}

const ClientDashboard = ({ 
  client, 
  proposalsAccepted, 
  cashbackHistory, 
  deliveryProgress 
}: ClientDashboardProps) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-100 text-purple-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'Platina';
      case 'gold': return 'Ouro';
      case 'silver': return 'Prata';
      default: return 'Bronze';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header do Cliente */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Bem-vindo, {client.name}!</CardTitle>
                <p className="text-gray-600">Seu painel de acompanhamento</p>
              </div>
              <Badge className={getTierColor(client.tier)}>
                <Star className="w-3 h-3 mr-1" />
                {getTierLabel(client.tier)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  R$ {client.cashbackBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-600">Cashback Disponível</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{client.pointsBalance}</p>
                <p className="text-sm text-gray-600">Pontos Acumulados</p>
                {client.pointsExpirationDate && (
                  <p className="text-xs text-orange-600">
                    Expira em {new Date(client.pointsExpirationDate).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{proposalsAccepted.length}</p>
                <p className="text-sm text-gray-600">Propostas Aceitas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Propostas Aceitas */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Minhas Propostas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {proposalsAccepted.length > 0 ? (
              <div className="space-y-3">
                {proposalsAccepted.map((proposal) => (
                  <div key={proposal.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{proposal.project}</h4>
                      <Badge variant="secondary">{proposal.number}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Valor: R$ {proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Proposta
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-1" />
                        Baixar Contrato
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Nenhuma proposta aceita ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Acompanhamento de Entregas */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2 text-green-600" />
              Acompanhamento de Entregas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deliveryProgress.length > 0 ? (
              <div className="space-y-4">
                {deliveryProgress.map((delivery) => (
                  <div key={delivery.proposalId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Proposta {delivery.proposalId}</h4>
                      <Badge variant="outline">
                        {delivery.percentageDelivered.toFixed(1)}% entregue
                      </Badge>
                    </div>
                    
                    <Progress value={delivery.percentageDelivered} className="mb-2" />
                    
                    <div className="text-sm text-gray-600">
                      <p>
                        Entregue: {delivery.totalDelivered} de {delivery.totalContracted} {delivery.unit}
                      </p>
                      {delivery.lastDeliveryDate && (
                        <p>
                          Última entrega: {new Date(delivery.lastDeliveryDate).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    
                    <Button size="sm" className="mt-2" variant="outline">
                      Ver Detalhes da Entrega
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Nenhuma entrega em andamento
              </p>
            )}
          </CardContent>
        </Card>

        {/* Histórico de Cashback */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="w-5 h-5 mr-2 text-yellow-600" />
              Histórico de Cashback
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cashbackHistory.length > 0 ? (
              <div className="space-y-2">
                {cashbackHistory.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        transaction.type === 'earned' ? 'text-green-600' : 
                        transaction.type === 'redeemed' ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'earned' ? '+' : transaction.type === 'redeemed' ? '-' : ''}
                        R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {transaction.type === 'earned' ? 'Ganho' : 
                         transaction.type === 'redeemed' ? 'Usado' : 'Expirado'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Nenhuma transação de cashback ainda
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
