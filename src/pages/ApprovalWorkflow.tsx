
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">🔄 Sistema de Aprovações</h1>
          <p className="text-gray-600">Workflow automatizado de aprovações</p>
        </div>

        <Tabs defaultValue="discounts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="discounts">Descontos</TabsTrigger>
            <TabsTrigger value="credit">Crédito</TabsTrigger>
            <TabsTrigger value="exceptions">Exceções</TabsTrigger>
            <TabsTrigger value="audit">Auditoria</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
          </TabsList>

          <TabsContent value="discounts">
            <DiscountApprovals />
          </TabsContent>

          <TabsContent value="credit">
            <CreditApprovals />
          </TabsContent>

          <TabsContent value="exceptions">
            <ExceptionWorkflow />
          </TabsContent>

          <TabsContent value="audit">
            <AuditTrail />
          </TabsContent>

          <TabsContent value="notifications">
            <WorkflowNotifications />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ApprovalWorkflow;
