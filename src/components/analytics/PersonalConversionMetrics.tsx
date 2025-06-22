
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, Eye, Clock, XCircle } from 'lucide-react';
import { usePersonalSalesData } from '@/hooks/usePersonalSalesData';

export const PersonalConversionMetrics = () => {
  const { data, isLoading } = usePersonalSalesData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Minhas Conversões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getConversionColor = (rate: number) => {
    if (rate >= 30) return 'text-green-600';
    if (rate >= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Minhas Conversões
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Taxa de conversão principal */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getConversionColor(data?.conversionRate || 0)}`}>
              {(data?.conversionRate || 0).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Taxa de Conversão</div>
            <div className="text-xs text-gray-500 mt-1">
              {data?.acceptedCount} de {data?.totalProposals} propostas aceitas
            </div>
          </div>
        </div>

        {/* Status das propostas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {data?.acceptedCount || 0}
              </Badge>
            </div>
            <div className="text-sm font-medium mt-2">Aceitas</div>
          </div>

          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <Eye className="w-4 h-4 text-blue-600" />
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {data?.viewedCount || 0}
              </Badge>
            </div>
            <div className="text-sm font-medium mt-2">Visualizadas</div>
          </div>

          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <Clock className="w-4 h-4 text-yellow-600" />
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {data?.sentCount || 0}
              </Badge>
            </div>
            <div className="text-sm font-medium mt-2">Enviadas</div>
          </div>

          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <XCircle className="w-4 h-4 text-red-600" />
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {data?.rejectedCount || 0}
              </Badge>
            </div>
            <div className="text-sm font-medium mt-2">Rejeitadas</div>
          </div>
        </div>

        {/* Insights */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs font-medium text-gray-700 mb-2">💡 Insights</div>
          <div className="text-xs text-gray-600 space-y-1">
            {(data?.conversionRate || 0) >= 30 && (
              <div>✅ Excelente taxa de conversão! Continue assim.</div>
            )}
            {(data?.conversionRate || 0) < 20 && (
              <div>⚠️ Taxa de conversão pode melhorar. Foque no follow-up.</div>
            )}
            {(data?.viewedCount || 0) > (data?.acceptedCount || 0) * 2 && (
              <div>📈 Muitas propostas visualizadas mas não aceitas. Revise os preços.</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
