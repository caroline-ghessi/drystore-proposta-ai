
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
      <div className="space-y-6 w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">🔄 Sistema de Aprovações</h1>
          <p className="text-gray-600">Workflow automatizado de aprovações</p>
        </div>

        <Tabs defaultValue="discounts" className="space-y-4 w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="discounts">Descontos</TabsTrigger>
            <TabsTrigger value="credit">Crédito</TabsTrigger>
            <TabsTrigger value="exceptions">Exceções</TabsTrigger>
            <TabsTrigger value="audit">Auditoria</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
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
    </Layout>
  );
};

export default ApprovalWorkflow;
