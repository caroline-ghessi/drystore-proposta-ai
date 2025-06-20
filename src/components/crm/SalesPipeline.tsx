
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const SalesPipeline = () => {
  const pipelineStages = [
    { name: 'Leads', count: 45, value: 'R$ 2.250k', color: 'bg-blue-500' },
    { name: 'Qualificados', count: 32, value: 'R$ 1.920k', color: 'bg-yellow-500' },
    { name: 'Propostas', count: 18, value: 'R$ 1.260k', color: 'bg-orange-500' },
    { name: 'Negociação', count: 12, value: 'R$ 840k', color: 'bg-purple-500' },
    { name: 'Fechados', count: 8, value: 'R$ 560k', color: 'bg-green-500' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline de Vendas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pipelineStages.map((stage, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${stage.color}`} />
                <div>
                  <h4 className="font-medium">{stage.name}</h4>
                  <p className="text-sm text-gray-600">{stage.count} oportunidades</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{stage.value}</p>
                <Progress value={(stage.count / 45) * 100} className="w-20 h-2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
