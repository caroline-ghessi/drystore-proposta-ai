
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Package, CheckCircle, Clock } from 'lucide-react';

interface DeliveryProgressProps {
  totalContracted: number;
  totalDelivered: number;
  unit: string;
  lastDeliveryDate?: string;
  lastDeliveryQuantity?: number;
}

const DeliveryProgress = ({ 
  totalContracted, 
  totalDelivered, 
  unit, 
  lastDeliveryDate, 
  lastDeliveryQuantity 
}: DeliveryProgressProps) => {
  const percentageDelivered = (totalDelivered / totalContracted) * 100;
  const remaining = totalContracted - totalDelivered;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="w-5 h-5 mr-2 text-blue-600" />
          Progresso da Entrega
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-gray-900">
              {totalDelivered} de {totalContracted} {unit}
            </h3>
            <p className="text-gray-600">
              {percentageDelivered.toFixed(1)}% do total contratado
            </p>
          </div>
          
          <Progress value={percentageDelivered} className="h-3 mb-4" />
          
          <div className="flex justify-between text-sm text-gray-500">
            <span>0 {unit}</span>
            <span>{totalContracted} {unit}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Entregue</p>
            <p className="font-semibold text-green-700">
              {totalDelivered} {unit}
            </p>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Restante</p>
            <p className="font-semibold text-orange-700">
              {remaining} {unit}
            </p>
          </div>
        </div>

        {lastDeliveryDate && (
          <div className="border-t pt-4">
            <Badge variant="secondary" className="w-full justify-center">
              Última entrega: {lastDeliveryQuantity} {unit} - {new Date(lastDeliveryDate).toLocaleDateString('pt-BR')}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveryProgress;
