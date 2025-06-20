
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalesPipeline } from '@/components/crm/SalesPipeline';
import { LeadScoring } from '@/components/crm/LeadScoring';
import { CustomerSegmentation } from '@/components/crm/CustomerSegmentation';
import { InteractionHistory } from '@/components/crm/InteractionHistory';
import { OpportunityAlerts } from '@/components/crm/OpportunityAlerts';

const CRMDashboard = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Sistema CRM</h1>
        </div>

        <Tabs defaultValue="pipeline" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="interactions">Interações</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline">
            <SalesPipeline />
          </TabsContent>

          <TabsContent value="leads">
            <LeadScoring />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerSegmentation />
          </TabsContent>

          <TabsContent value="interactions">
            <InteractionHistory />
          </TabsContent>

          <TabsContent value="alerts">
            <OpportunityAlerts />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CRMDashboard;
