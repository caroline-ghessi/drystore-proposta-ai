
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DeliveryRegistration from '@/components/delivery/DeliveryRegistration';
import DeliveryProgress from '@/components/delivery/DeliveryProgress';
import DeliveryHistory from '@/components/delivery/DeliveryHistory';
import { DeliveryItem } from '@/types/delivery';

const DeliveryControl = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Dados mockados da proposta
  const proposalData = {
    id: proposalId,
    number: 'PROP-2024-001',
    client: 'João Silva',
    project: 'Residência Moderna',
    totalQuantity: 100,
    unit: 'placas',
    status: 'aceita'
  };

  useEffect(() => {
    // Carregar entregas do localStorage
    const savedDeliveries = JSON.parse(localStorage.getItem('proposal_deliveries') || '[]');
    const proposalDeliveries = savedDeliveries.filter((d: DeliveryItem) => d.proposalId === proposalId);
    setDeliveries(proposalDeliveries);
  }, [proposalId, refreshKey]);

  const handleDeliveryAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  const totalDelivered = deliveries.reduce((sum, delivery) => sum + delivery.quantity, 0);
  const lastDelivery = deliveries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/proposals')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Controle de Entregas</h1>
              <p className="text-gray-600 mt-1">
                {proposalData.number} - {proposalData.client}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <Calculator className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Contratado</p>
                  <p className="font-semibold">{proposalData.totalQuantity} {proposalData.unit}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna Principal - Registro de Entregas */}
          <div className="lg:col-span-2 space-y-6">
            <DeliveryRegistration 
              proposalId={proposalId!}
              onDeliveryAdded={handleDeliveryAdded}
            />
            
            <DeliveryHistory deliveries={deliveries} />
          </div>

          {/* Sidebar - Progresso */}
          <div className="space-y-6">
            <DeliveryProgress
              totalContracted={proposalData.totalQuantity}
              totalDelivered={totalDelivered}
              unit={proposalData.unit}
              lastDeliveryDate={lastDelivery?.date}
              lastDeliveryQuantity={lastDelivery?.quantity}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DeliveryControl;
