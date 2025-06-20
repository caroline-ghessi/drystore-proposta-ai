
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DiscountApprovals } from '@/components/workflow/DiscountApprovals';
import { CreditApprovals } from '@/components/workflow/CreditApprovals';
import { ExceptionWorkflow } from '@/components/workflow/ExceptionWorkflow';
import { AuditTrail } from '@/components/workflow/AuditTrail';
import { WorkflowNotifications } from '@/components/workflow/WorkflowNotifications';

const ApprovalWorkflow = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🔄 Sistema de Aprovações</h1>
            <p className="text-lg text-gray-600">Workflow automatizado de aprovações</p>
          </div>

          <Tabs defaultValue="discounts" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="discounts" className="text-sm">Descontos</TabsTrigger>
              <TabsTrigger value="credit" className="text-sm">Crédito</TabsTrigger>
              <TabsTrigger value="exceptions" className="text-sm">Exceções</TabsTrigger>
              <TabsTrigger value="audit" className="text-sm">Auditoria</TabsTrigger>
              <TabsTrigger value="notifications" className="text-sm">Notificações</TabsTrigger>
            </TabsList>

            <TabsContent value="discounts" className="w-full">
              <DiscountApprovals />
            </TabsContent>

            <TabsContent value="credit" className="w-full">
              <CreditApprovals />
            </TabsContent>

            <TabsContent value="exceptions" className="w-full">
              <ExceptionWorkflow />
            </TabsContent>

            <TabsContent value="audit" className="w-full">
              <AuditTrail />
            </TabsContent>

            <TabsContent value="notifications" className="w-full">
              <WorkflowNotifications />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ApprovalWorkflow;
