
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { PersonalAnalyticsDashboard } from '@/components/analytics/PersonalAnalyticsDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalesPerformanceChart } from '@/components/analytics/SalesPerformanceChart';
import { ConversionMetrics } from '@/components/analytics/ConversionMetrics';
import { ProductHeatmap } from '@/components/analytics/ProductHeatmap';
import { SalesPrediction } from '@/components/analytics/SalesPrediction';
import { SellerRanking } from '@/components/analytics/SellerRanking';
import { ROIAnalysis } from '@/components/analytics/ROIAnalysis';

const AnalyticsDashboard = () => {
  const { user } = useAuth();

  // Se o usuário é vendedor ou representante, mostrar dashboard pessoal
  if (user?.role === 'vendedor_interno' || user?.role === 'representante') {
    return (
      <Layout>
        <PersonalAnalyticsDashboard />
      </Layout>
    );
  }

  // Para admins, mostrar dashboard completo da empresa
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard Analítico da Empresa</h1>
          <div className="text-sm text-gray-600">
            Visão geral de todos os vendedores
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="predictions">Previsões</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ConversionMetrics />
              <SellerRanking />
            </div>
            <SalesPerformanceChart />
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SalesPerformanceChart />
              <ROIAnalysis />
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <ProductHeatmap />
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            <SalesPrediction />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AnalyticsDashboard;
