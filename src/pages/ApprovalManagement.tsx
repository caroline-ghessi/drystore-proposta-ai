
import Layout from '@/components/Layout';
import PermissionGuard from '@/components/PermissionGuard';
import ApprovalWorkflow from '@/components/approval/ApprovalWorkflow';

const ApprovalManagement = () => {
  return (
    <Layout>
      <PermissionGuard 
        requiredRole={['admin', 'manager']}
        fallback={
          <div className="text-center py-12">
            <p className="text-gray-500">Acesso negado. Apenas gestores e administradores podem acessar esta área.</p>
          </div>
        }
      >
        <div className="animate-fade-in">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Aprovação de Propostas</h1>
            <p className="text-gray-600">Gerencie propostas que precisam de aprovação interna</p>
          </div>

          <ApprovalWorkflow />
        </div>
      </PermissionGuard>
    </Layout>
  );
};

export default ApprovalManagement;
