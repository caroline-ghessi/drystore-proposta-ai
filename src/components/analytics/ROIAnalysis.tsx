
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, Target } from 'lucide-react';

export const ROIAnalysis = () => {
  const clients = [
    { name: 'João Silva Construções', invested: 15000, returned: 45000, roi: 200 },
    { name: 'Maria Santos Arquitetura', invested: 23500, returned: 78000, roi: 232 },
    { name: 'Carlos Oliveira', invested: 12000, returned: 32000, roi: 167 },
    { name: 'Ana Costa', invested: 18000, returned: 56000, roi: 211 },
  ];

  const getROIColor = (roi: number) => {
    if (roi >= 200) return 'text-green-600';
    if (roi >= 150) return 'text-blue-600';
    return 'text-orange-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Análise de ROI por Cliente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clients.map((client, index) => (
            <div key={index} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{client.name}</h4>
                <span className={`font-bold ${getROIColor(client.roi)}`}>
                  {client.roi}% ROI
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3 text-xs text-gray-600">
                <div>
                  <span>Investido: </span>
                  <span className="font-medium">
                    R$ {client.invested.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div>
                  <span>Retorno: </span>
                  <span className="font-medium">
                    R$ {client.returned.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
              
              <Progress value={Math.min(client.roi, 300) / 3} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
