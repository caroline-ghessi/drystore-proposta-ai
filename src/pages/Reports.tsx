
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomReports } from '@/components/reports/CustomReports';
import { ExecutiveDashboard } from '@/components/reports/ExecutiveDashboard';
import { KPIAlerts } from '@/components/reports/KPIAlerts';
import { PredictiveAnalysis } from '@/components/reports/PredictiveAnalysis';
import { AutoExport } from '@/components/reports/AutoExport';

const Reports = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">📊 Relatórios e BI</h1>
          <p className="text-gray-600">Business Intelligence avançado</p>
        </div>

        <Tabs defaultValue="custom" className="space-y-4">
          <TabsList>
            <TabsTrigger value="custom">Relatórios Customizáveis</TabsTrigger>
            <TabsTrigger value="executive">Dashboard Executivo</TabsTrigger>
            <TabsTrigger value="alerts">Alertas de KPIs</TabsTrigger>
            <TabsTrigger value="predictive">Análise Preditiva</TabsTrigger>
            <TabsTrigger value="export">Exportação Automática</TabsTrigger>
          </TabsList>

          <TabsContent value="custom">
            <CustomReports />
          </TabsContent>

          <TabsContent value="executive">
            <ExecutiveDashboard />
          </TabsContent>

          <TabsContent value="alerts">
            <KPIAlerts />
          </TabsContent>

          <TabsContent value="predictive">
            <PredictiveAnalysis />
          </TabsContent>

          <TabsContent value="export">
            <AutoExport />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reports;
