
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PersonalPerformanceCard } from './PersonalPerformanceCard';
import { PersonalConversionMetrics } from './PersonalConversionMetrics';
import { PersonalSalesChart } from './PersonalSalesChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Target, BarChart3, FileText } from 'lucide-react';

export const PersonalAnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <User className="w-8 h-8 mr-3 text-blue-600" />
          Meu Dashboard
        </h1>
        <div className="text-sm text-gray-600">
          Acompanhe sua performance individual
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="proposals" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Propostas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PersonalPerformanceCard />
            <PersonalConversionMetrics />
          </div>
          <PersonalSalesChart />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PersonalSalesChart />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PersonalPerformanceCard />
            <Card>
              <CardHeader>
                <CardTitle>Dicas para Melhorar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-900 text-sm">📈 Aumente o Follow-up</div>
                  <div className="text-blue-700 text-xs mt-1">
                    Clientes que recebem follow-up têm 50% mais chance de aceitar propostas
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-900 text-sm">💰 Trabalhe o Ticket Médio</div>
                  <div className="text-green-700 text-xs mt-1">
                    Oferece produtos complementares para aumentar o valor da venda
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-medium text-purple-900 text-sm">⏰ Tempo de Resposta</div>
                  <div className="text-purple-700 text-xs mt-1">
                    Responder propostas em até 2h aumenta em 40% as chances de aceitação
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="proposals" className="space-y-4">
          <PersonalConversionMetrics />
          <Card>
            <CardHeader>
              <CardTitle>Status das Minhas Propostas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <div>Detalhamento completo das propostas em desenvolvimento</div>
                <div className="text-sm mt-2">
                  Este módulo será expandido com lista detalhada de propostas
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
